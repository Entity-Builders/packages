import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import {
  FixedExpense,
  getFixedExpenses,
  createFixedExpense,
  updateFixedExpense,
  deleteFixedExpense,
  supabase,
} from '@eb-packages/logic';

interface ExpensesContextType {
  expenses: FixedExpense[];
  addExpense: (expense: Omit<FixedExpense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<FixedExpense>) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  isLoading: boolean;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(
  undefined,
);

export const ExpensesProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from Supabase on mount
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        setIsLoading(true);

        // Ensure anonymous session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          console.log(
            '[ExpensesContext] No session found, signing in anonymously...',
          );
          const { error: authError } = await supabase.auth.signInAnonymously();
          if (authError) {
            console.error(
              '[ExpensesContext] Anonymous auth failed:',
              authError,
            );
          } else {
            console.log('[ExpensesContext] Signed in anonymously');
          }
        }

        const data = await getFixedExpenses();
        setExpenses(data);
      } catch (e) {
        console.error('Failed to load expenses', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadExpenses();
  }, []);

  const addExpense = async (expense: Omit<FixedExpense, 'id'>) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log(
        '[ExpensesContext] addExpense called. Session exists?',
        !!session,
        'User ID:',
        session?.user?.id,
      );

      const newExpense = await createFixedExpense(expense);
      setExpenses((prev) => [...prev, newExpense]);
    } catch (e) {
      console.error('Failed to add expense', e);
      throw e;
    }
  };

  const updateExpense = async (id: string, updates: Partial<FixedExpense>) => {
    try {
      const updated = await updateFixedExpense(id, updates);
      setExpenses((prev) => prev.map((exp) => (exp.id === id ? updated : exp)));
    } catch (e) {
      console.error('Failed to update expense', e);
      throw e;
    }
  };

  const removeExpense = async (id: string) => {
    try {
      await deleteFixedExpense(id);
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (e) {
      console.error('Failed to remove expense', e);
      throw e;
    }
  };

  return (
    <ExpensesContext.Provider
      value={{ expenses, addExpense, updateExpense, removeExpense, isLoading }}
    >
      {children}
    </ExpensesContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpensesContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpensesProvider');
  }
  return context;
};
