import { normalizeTranslationText } from './dedupe';
import { selectRecentUniqueActiveTranslations } from './practice';
import type {
  ExpressionMode,
  LearningSituation,
  LearningSituationCandidate,
  TranslationRecord,
} from './types';

export const LEARNING_SITUATION_CATALOG_VERSION =
  'flowtranslate:learning-situations:v1';

export const LEARNING_HISTORY_PERSONALIZATION_THRESHOLD = 3;

export const STARTER_LEARNING_SITUATIONS: LearningSituation[] = [
  {
    id: 'delay-update',
    catalogVersion: LEARNING_SITUATION_CATALOG_VERSION,
    category: 'delay_update',
    title: 'Avisar una demora sin sonar defensivo',
    description:
      'Explica que algo toma mas tiempo, mantiene confianza y deja claro el siguiente paso.',
    outcome: 'Comunicar demora, responsabilidad y proximo envio.',
    samplePhrases: [
      'The report is taking a bit longer than expected.',
      'We are already reviewing the data.',
      'I will send you a clean version tomorrow.',
    ],
    detectionHints: {
      modes: ['translate_to_english', 'improve_english'],
      keywords: [
        'delay',
        'delayed',
        'tomorrow',
        'report',
        'taking longer',
        'longer than expected',
        'demora',
        'demorar',
        'manana',
        'reporte',
        'version',
        'revisando',
      ],
    },
    priority: 10,
  },
  {
    id: 'professional-interest',
    catalogVersion: LEARNING_SITUATION_CATALOG_VERSION,
    category: 'professional_interest',
    title: 'Responder con interes profesional',
    description:
      'Agradece el contacto, muestra interes y abre una conversacion sin sonar exagerado.',
    outcome: 'Contestar propuestas o contactos con calidez profesional.',
    samplePhrases: [
      'Thanks for reaching out.',
      'The proposal sounds really interesting.',
      'I would be happy to schedule a quick call.',
    ],
    detectionHints: {
      modes: ['translate_to_english', 'improve_english'],
      keywords: [
        'thanks',
        'thank',
        'reaching out',
        'proposal',
        'interesting',
        'interesa',
        'propuesta',
        'gracias',
        'escribir',
        'contacto',
      ],
    },
    priority: 9,
  },
  {
    id: 'schedule-call',
    catalogVersion: LEARNING_SITUATION_CATALOG_VERSION,
    category: 'schedule_call',
    title: 'Coordinar una llamada corta',
    description:
      'Propone una llamada clara, breve y facil de aceptar.',
    outcome: 'Convertir interes o dudas en una proxima conversacion.',
    samplePhrases: [
      'Could we schedule a quick call next week?',
      'I would be happy to talk through it.',
      'Let me know what time works best for you.',
    ],
    detectionHints: {
      modes: ['translate_to_english', 'improve_english'],
      keywords: [
        'call',
        'quick call',
        'schedule',
        'next week',
        'coordinar',
        'llamada',
        'semanal',
        'semana que viene',
        'charlar',
        'reunion',
      ],
    },
    priority: 8,
  },
  {
    id: 'polite-rejection',
    catalogVersion: LEARNING_SITUATION_CATALOG_VERSION,
    category: 'polite_rejection',
    title: 'Rechazar sin sonar cortante',
    description:
      'Marca un limite o rechaza una propuesta con respeto y claridad.',
    outcome: 'Decir que no sin cerrar puertas innecesariamente.',
    samplePhrases: [
      'I do not think I can take this on right now.',
      'Thanks for thinking of me.',
      'I hope we can find another chance to work together.',
    ],
    detectionHints: {
      modes: ['translate_to_english', 'improve_english'],
      keywords: [
        'cannot',
        "can't",
        'decline',
        'not available',
        'take this on',
        'no puedo',
        'rechazar',
        'cortante',
        'aceptar',
        'tomar este trabajo',
      ],
    },
    priority: 8,
  },
  {
    id: 'ask-context',
    catalogVersion: LEARNING_SITUATION_CATALOG_VERSION,
    category: 'ask_context',
    title: 'Pedir mas contexto sin sonar inseguro',
    description:
      'Pide informacion adicional de forma especifica y profesional.',
    outcome: 'Desbloquear una tarea sin parecer perdido.',
    samplePhrases: [
      'Could you share a bit more context?',
      'It would help to understand the goal behind this.',
      'Do you have an example of what you have in mind?',
    ],
    detectionHints: {
      keywords: [
        'context',
        'details',
        'example',
        'goal',
        'more information',
        'contexto',
        'detalle',
        'ejemplo',
        'objetivo',
        'entender mejor',
      ],
    },
    priority: 7,
  },
  {
    id: 'follow-up',
    catalogVersion: LEARNING_SITUATION_CATALOG_VERSION,
    category: 'follow_up',
    title: 'Hacer follow-up sin presionar',
    description:
      'Recuerda un tema pendiente con un tono amable y concreto.',
    outcome: 'Pedir una actualizacion sin sonar intenso.',
    samplePhrases: [
      'Just following up on this.',
      'Wanted to check if you had any updates.',
      'No rush, but let me know when you can.',
    ],
    detectionHints: {
      keywords: [
        'follow up',
        'following up',
        'update',
        'checking',
        'pending',
        'seguimiento',
        'actualizacion',
        'pendiente',
        'novedades',
        'retomar',
      ],
    },
    priority: 7,
  },
  {
    id: 'thank-and-close',
    catalogVersion: LEARNING_SITUATION_CATALOG_VERSION,
    category: 'thank_and_close',
    title: 'Agradecer y cerrar bien',
    description:
      'Cierra una conversacion con gratitud y una proxima accion clara.',
    outcome: 'Dejar una buena impresion al terminar un intercambio.',
    samplePhrases: [
      'Thanks again for your help.',
      'I appreciate the context.',
      'I will take it from here.',
    ],
    detectionHints: {
      keywords: [
        'thanks again',
        'appreciate',
        'thank you',
        'gracias de nuevo',
        'agradezco',
        'cierro',
        'quedo atento',
      ],
    },
    priority: 6,
  },
  {
    id: 'scope-timing',
    catalogVersion: LEARNING_SITUATION_CATALOG_VERSION,
    category: 'scope_timing',
    title: 'Negociar alcance o tiempos',
    description:
      'Ajusta alcance, prioridad o fechas sin sonar evasivo.',
    outcome: 'Ordenar expectativas antes de comprometerte.',
    samplePhrases: [
      'We may need to adjust the scope slightly.',
      'I can prioritize this if we move the other task.',
      'Could we align on timing before I confirm?',
    ],
    detectionHints: {
      keywords: [
        'scope',
        'timeline',
        'priority',
        'deadline',
        'adjust',
        'alcance',
        'tiempos',
        'prioridad',
        'fecha',
        'confirmar',
      ],
    },
    priority: 6,
  },
];

export const selectStarterLearningSituations = (
  limit = 3,
  catalog = STARTER_LEARNING_SITUATIONS,
) => catalog.slice(0, Math.max(0, limit));

export const getLearningSituationById = (
  situationId: string,
  catalog = STARTER_LEARNING_SITUATIONS,
) => catalog.find((situation) => situation.id === situationId) || null;

const recordModeMatches = (
  mode: ExpressionMode | undefined,
  situation: LearningSituation,
) =>
  !situation.detectionHints.modes ||
  !mode ||
  situation.detectionHints.modes.includes(mode);

const uniquePush = (values: string[], value: string) => {
  if (!values.includes(value)) values.push(value);
};

export const rankLearningSituationsFromHistory = (
  history: TranslationRecord[],
  options: {
    catalog?: LearningSituation[];
    limit?: number;
    historyLimit?: number;
  } = {},
): LearningSituationCandidate[] => {
  const catalog = options.catalog || STARTER_LEARNING_SITUATIONS;
  const selectedHistory = selectRecentUniqueActiveTranslations(
    history,
    options.historyLimit || 20,
  );
  const candidates = new Map<string, LearningSituationCandidate>();

  selectedHistory.forEach((record, index) => {
    const text = normalizeTranslationText(
      [record.sourceText, record.translatedText].join(' '),
    );
    const recencyScore = Math.max(1, 8 - Math.floor(index / 3));

    for (const situation of catalog) {
      if (!recordModeMatches(record.mode, situation)) continue;

      const matchedKeywords = situation.detectionHints.keywords.filter((keyword) =>
        text.includes(normalizeTranslationText(keyword)),
      );

      if (matchedKeywords.length === 0) continue;

      const existing =
        candidates.get(situation.id) ||
        {
          situation,
          score: 0,
          sourceRecordIds: [],
          matchedSignals: [],
        };

      existing.score +=
        situation.priority + recencyScore + matchedKeywords.length * 3;
      uniquePush(existing.sourceRecordIds, record.id);
      matchedKeywords.forEach((keyword) =>
        uniquePush(existing.matchedSignals, keyword),
      );
      candidates.set(situation.id, existing);
    }
  });

  return Array.from(candidates.values())
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.situation.priority - a.situation.priority;
    })
    .slice(0, options.limit || 4);
};

export const chooseRecommendedLearningSituation = (
  history: TranslationRecord[],
  options: {
    catalog?: LearningSituation[];
    minimumPersonalizedRecords?: number;
  } = {},
) => {
  const catalog = options.catalog || STARTER_LEARNING_SITUATIONS;
  const selectedHistory = selectRecentUniqueActiveTranslations(history, 20);

  if (
    selectedHistory.length <
    (options.minimumPersonalizedRecords ||
      LEARNING_HISTORY_PERSONALIZATION_THRESHOLD)
  ) {
    return {
      personalized: false,
      recommended: catalog[0],
      candidates: selectStarterLearningSituations(3, catalog).map((situation) => ({
        situation,
        score: situation.priority,
        sourceRecordIds: [],
        matchedSignals: [],
      })),
    };
  }

  const candidates = rankLearningSituationsFromHistory(selectedHistory, {
    catalog,
    limit: 4,
  });

  if (candidates.length === 0) {
    return {
      personalized: false,
      recommended: catalog[0],
      candidates: selectStarterLearningSituations(3, catalog).map((situation) => ({
        situation,
        score: situation.priority,
        sourceRecordIds: [],
        matchedSignals: [],
      })),
    };
  }

  return {
    personalized: true,
    recommended: candidates[0].situation,
    candidates,
  };
};
