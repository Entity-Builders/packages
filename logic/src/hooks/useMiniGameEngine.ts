import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'won' | 'lost';

export interface GameMetrics {
  elapsedSeconds: number;
  clicks: number;
  hintsUsed: number;
}

export interface GameEngineConfig {
  /** The type of game (e.g. 'puzzle', 'stamp_hunt', 'find_objects') */
  gameType: string;
  /** The current user's ID for saving metrics */
  userId?: string;
  /** Custom win condition evaluated every tick or on action */
  winCondition?: (metrics: GameMetrics) => boolean;
  /** Custom lose condition */
  loseCondition?: (metrics: GameMetrics) => boolean;
  /** Auto-start the timer when engine starts? Defaults to true */
  autoStartTimer?: boolean;
}

export interface PlayerMetrics {
  gamesPlayed: number;
  totalWins: number;
  bestTimeS: number | null;
  bestClicks: number | null;
  /** Calculated overall level (e.g. 1 level every 3 plays) */
  level: number;
}

export function useMiniGameEngine({
  gameType,
  userId,
  winCondition,
  loseCondition,
  autoStartTimer = true
}: GameEngineConfig) {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [metrics, setMetrics] = useState<GameMetrics>({ elapsedSeconds: 0, clicks: 0, hintsUsed: 0 });
  const [playerInfo, setPlayerInfo] = useState<PlayerMetrics | null>(null);

  // Timer refs
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load player metrics on mount ──
  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('postalpeek_player_metrics')
        .select('*')
        .eq('user_id', userId)
        .eq('game_type', gameType)
        .maybeSingle();

      if (isMounted) {
        if (data && !error) {
          const gamesPlayed = data.games_played ?? 0;
          setPlayerInfo({
            gamesPlayed,
            totalWins: data.total_wins ?? 0,
            bestTimeS: data.best_time_s,
            bestClicks: data.best_clicks,
            level: Math.floor(gamesPlayed / 3) + 1 // Level up every 3 plays
          });
        } else {
          setPlayerInfo({
            gamesPlayed: 0,
            totalWins: 0,
            bestTimeS: null,
            bestClicks: null,
            level: 1
          });
        }
      }
    })();
    return () => { isMounted = false; };
  }, [userId, gameType]);

  // ── State Evaluation ──
  const evaluateState = useCallback((currentMetrics: GameMetrics) => {
    if (status !== 'playing') return;
    
    if (winCondition && winCondition(currentMetrics)) {
      handleWin(currentMetrics);
    } else if (loseCondition && loseCondition(currentMetrics)) {
      handleLose(currentMetrics);
    }
  }, [status, winCondition, loseCondition]);

  // ── Engine Actions ──
  const start = useCallback(() => {
    setStatus('playing');
    setMetrics({ elapsedSeconds: 0, clicks: 0, hintsUsed: 0 });
    if (autoStartTimer) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setMetrics(prev => {
          const next = { ...prev, elapsedSeconds: Math.round((Date.now() - startTimeRef.current) / 1000) };
          evaluateState(next);
          return next;
        });
      }, 1000);
    }
  }, [autoStartTimer, evaluateState]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const registerClick = useCallback(() => {
    if (status !== 'playing') return;
    setMetrics(prev => {
      const next = { ...prev, clicks: prev.clicks + 1 };
      evaluateState(next);
      return next;
    });
  }, [status, evaluateState]);

  const useHint = useCallback(() => {
    if (status !== 'playing') return;
    setMetrics(prev => {
      const next = { ...prev, hintsUsed: prev.hintsUsed + 1 };
      evaluateState(next);
      return next;
    });
  }, [status, evaluateState]);

  // ── Persistence ──
  const saveMetrics = useCallback(async (finalStatus: 'won' | 'lost', finalMetrics: GameMetrics) => {
    if (!userId) return;
    
    // Optimistic UI update
    setPlayerInfo(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        totalWins: prev.totalWins + (finalStatus === 'won' ? 1 : 0),
        bestTimeS: finalStatus === 'won' ? Math.min(prev.bestTimeS ?? Infinity, finalMetrics.elapsedSeconds) : prev.bestTimeS,
        bestClicks: finalStatus === 'won' ? Math.min(prev.bestClicks ?? Infinity, finalMetrics.clicks) : prev.bestClicks
      };
    });

    const isWin = finalStatus === 'won';
    
    // Fetch latest to avoid race conditions easily, then upsert
    const { data: current } = await supabase
        .from('postalpeek_player_metrics')
        .select('*')
        .eq('user_id', userId)
        .eq('game_type', gameType)
        .maybeSingle();

    const gamesPlayed = (current?.games_played ?? 0) + 1;
    const totalWins = (current?.total_wins ?? 0) + (isWin ? 1 : 0);
    
    let bestTime = current?.best_time_s;
    if (isWin) bestTime = bestTime == null ? finalMetrics.elapsedSeconds : Math.min(bestTime, finalMetrics.elapsedSeconds);
    
    let bestClicks = current?.best_clicks;
    if (isWin) bestClicks = bestClicks == null ? finalMetrics.clicks : Math.min(bestClicks, finalMetrics.clicks);

    await supabase.from('postalpeek_player_metrics').upsert({
      user_id: userId,
      game_type: gameType,
      games_played: gamesPlayed,
      total_wins: totalWins,
      best_time_s: bestTime,
      best_clicks: bestClicks,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, game_type' });

  }, [userId, gameType]);

  const handleWin = useCallback((currentMetrics: GameMetrics = metrics) => {
    setStatus('won');
    stopTimer();
    saveMetrics('won', currentMetrics);
  }, [metrics, stopTimer, saveMetrics]);

  const handleLose = useCallback((currentMetrics: GameMetrics = metrics) => {
    setStatus('lost');
    stopTimer();
    saveMetrics('lost', currentMetrics);
  }, [metrics, stopTimer, saveMetrics]);

  useEffect(() => {
    return stopTimer;
  }, [stopTimer]);

  return {
    status,
    metrics,
    playerInfo,
    start,
    registerClick,
    useHint,
    win: handleWin,
    lose: handleLose,
    pause: () => { setStatus('paused'); stopTimer(); },
    resume: () => {
      if (status === 'paused') {
        setStatus('playing');
        startTimeRef.current = Date.now() - (metrics.elapsedSeconds * 1000);
        timerRef.current = setInterval(() => {
          setMetrics(prev => {
            const next = { ...prev, elapsedSeconds: Math.round((Date.now() - startTimeRef.current) / 1000) };
            evaluateState(next);
            return next;
          });
        }, 1000);
      }
    }
  };
}
