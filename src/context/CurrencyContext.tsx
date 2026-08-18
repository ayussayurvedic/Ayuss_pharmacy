'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedCurrency = 'INR' | 'USD' | 'EUR' | 'AED';

interface CurrencyRates {
  USD: number;
  EUR: number;
  AED: number;
}

interface CurrencyContextType {
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  formatPrice: (amountInInr: number | undefined | null) => string;
  rates: CurrencyRates;
  currencySymbol: string;
}

const DEFAULT_RATES: CurrencyRates = {
  USD: 0.0118,
  EUR: 0.0110,
  AED: 0.0433,
};

const SYMBOLS: Record<SupportedCurrency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  AED: 'AED ',
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'INR',
  setCurrency: () => {},
  formatPrice: (amount) => `₹${(amount || 0).toLocaleString('en-IN')}`,
  rates: DEFAULT_RATES,
  currencySymbol: '₹',
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>('INR');
  const [rates, setRates] = useState<CurrencyRates>(DEFAULT_RATES);

  useEffect(() => {
    // 1. Load saved currency preference from localStorage
    try {
      const saved = localStorage.getItem('ssp_currency') as SupportedCurrency | null;
      if (saved && SYMBOLS[saved]) {
        setCurrencyState(saved);
      }
    } catch {
      // Ignore
    }

    // 2. Fetch live European Central Bank exchange rates from Frankfurter API
    async function fetchLiveRates() {
      try {
        const res = await fetch('https://api.frankfurter.app/latest?from=INR&to=USD,EUR');
        if (res.ok) {
          const data = await res.json();
          if (data && data.rates) {
            const usdRate = data.rates.USD || DEFAULT_RATES.USD;
            const eurRate = data.rates.EUR || DEFAULT_RATES.EUR;
            // AED is pegged to USD at 3.6725
            const aedRate = usdRate * 3.6725;
            setRates({
              USD: usdRate,
              EUR: eurRate,
              AED: aedRate,
            });
          }
        }
      } catch {
        // Fallback to DEFAULT_RATES if offline
      }
    }

    fetchLiveRates();
  }, []);

  const setCurrency = (c: SupportedCurrency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('ssp_currency', c);
    } catch {
      // Ignore
    }
  };

  const formatPrice = (amountInInr: number | undefined | null): string => {
    const base = amountInInr || 0;
    if (currency === 'INR') {
      return `₹${base.toLocaleString('en-IN')}`;
    }

    const rate = rates[currency] || DEFAULT_RATES[currency] || 0.012;
    const converted = base * rate;

    if (currency === 'USD') {
      return `$${converted.toFixed(2)}`;
    }
    if (currency === 'EUR') {
      return `€${converted.toFixed(2)}`;
    }
    if (currency === 'AED') {
      return `AED ${converted.toFixed(2)}`;
    }

    return `₹${base.toLocaleString('en-IN')}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        rates,
        currencySymbol: SYMBOLS[currency],
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
