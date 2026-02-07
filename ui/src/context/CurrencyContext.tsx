import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Currency = 'ARS' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  toggleCurrency: () => void;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('ARS');
  // In a real app we might load this from storage
  const [isLoading] = useState(false);

  const toggleCurrency = () => {
    console.log('toggleCurrency');
    setCurrency((prev) => (prev === 'ARS' ? 'USD' : 'ARS'));
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
