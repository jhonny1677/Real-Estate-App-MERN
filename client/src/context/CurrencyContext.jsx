import { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Currency data with exchange rates (in real app, this would come from an API)
const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', rate: 1 },
  EUR: { symbol: '€', name: 'Euro', rate: 0.85 },
  GBP: { symbol: '£', name: 'British Pound', rate: 0.73 },
  JPY: { symbol: '¥', name: 'Japanese Yen', rate: 110 },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', rate: 1.25 },
  AUD: { symbol: 'A$', name: 'Australian Dollar', rate: 1.35 },
  INR: { symbol: '₹', name: 'Indian Rupee', rate: 75 },
  CNY: { symbol: '¥', name: 'Chinese Yuan', rate: 6.5 },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', rate: 0.92 },
  SEK: { symbol: 'kr', name: 'Swedish Krona', rate: 8.5 },
  NOK: { symbol: 'kr', name: 'Norwegian Krone', rate: 8.8 },
  DKK: { symbol: 'kr', name: 'Danish Krone', rate: 6.3 },
  PLN: { symbol: 'zł', name: 'Polish Zloty', rate: 3.9 },
  CZK: { symbol: 'Kč', name: 'Czech Koruna', rate: 22 },
  HUF: { symbol: 'Ft', name: 'Hungarian Forint', rate: 300 },
  RUB: { symbol: '₽', name: 'Russian Ruble', rate: 74 },
  BRL: { symbol: 'R$', name: 'Brazilian Real', rate: 5.2 },
  MXN: { symbol: '$', name: 'Mexican Peso', rate: 20 },
  ZAR: { symbol: 'R', name: 'South African Rand', rate: 14.5 },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', rate: 1.35 },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', rate: 7.8 },
  KRW: { symbol: '₩', name: 'South Korean Won', rate: 1180 },
  THB: { symbol: '฿', name: 'Thai Baht', rate: 33 },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', rate: 3.67 },
  SAR: { symbol: '﷼', name: 'Saudi Riyal', rate: 3.75 },
  ILS: { symbol: '₪', name: 'Israeli Shekel', rate: 3.2 },
  TRY: { symbol: '₺', name: 'Turkish Lira', rate: 8.5 },
  EGP: { symbol: '£', name: 'Egyptian Pound', rate: 15.7 },
  QAR: { symbol: '﷼', name: 'Qatari Riyal', rate: 3.64 }
};

export const CurrencyProvider = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState(() => {
    const saved = localStorage.getItem('selectedCurrency');
    return saved || 'USD';
  });

  const [exchangeRates, setExchangeRates] = useState(CURRENCIES);

  // Save currency preference to localStorage
  useEffect(() => {
    localStorage.setItem('selectedCurrency', currentCurrency);
  }, [currentCurrency]);

  // In a real app, you would fetch exchange rates from an API
  useEffect(() => {
    const updateExchangeRates = async () => {
      try {
        // Simulate API call - in real app, fetch from something like exchangerate-api.com
        console.log('Exchange rates updated (simulated)');
        
        // Add some random fluctuation for demo
        const updatedRates = { ...CURRENCIES };
        Object.keys(updatedRates).forEach(currency => {
          if (currency !== 'USD') {
            const fluctuation = (Math.random() - 0.5) * 0.02; // ±1% fluctuation
            updatedRates[currency].rate *= (1 + fluctuation);
          }
        });
        
        setExchangeRates(updatedRates);
      } catch (error) {
        console.error('Failed to update exchange rates:', error);
      }
    };

    // Update rates every 5 minutes in a real app
    const interval = setInterval(updateExchangeRates, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const convertPrice = (priceInUSD, toCurrency = currentCurrency) => {
    const rate = exchangeRates[toCurrency]?.rate || 1;
    return priceInUSD * rate;
  };

  const formatPrice = (priceInUSD, toCurrency = currentCurrency, showCurrency = true) => {
    const convertedPrice = convertPrice(priceInUSD, toCurrency);
    const currency = exchangeRates[toCurrency];
    
    if (!currency) return `$${priceInUSD.toLocaleString()}`;

    const formattedPrice = convertedPrice.toLocaleString(undefined, {
      minimumFractionDigits: toCurrency === 'JPY' || toCurrency === 'KRW' ? 0 : 2,
      maximumFractionDigits: toCurrency === 'JPY' || toCurrency === 'KRW' ? 0 : 2
    });

    if (!showCurrency) return formattedPrice;

    return `${currency.symbol}${formattedPrice}`;
  };

  const changeCurrency = (newCurrency) => {
    if (exchangeRates[newCurrency]) {
      setCurrentCurrency(newCurrency);
    }
  };

  const getCurrencySymbol = (currency = currentCurrency) => {
    return exchangeRates[currency]?.symbol || '$';
  };

  const getCurrencyName = (currency = currentCurrency) => {
    return exchangeRates[currency]?.name || 'US Dollar';
  };

  const getAvailableCurrencies = () => {
    return Object.keys(exchangeRates).map(code => ({
      code,
      symbol: exchangeRates[code].symbol,
      name: exchangeRates[code].name,
      rate: exchangeRates[code].rate
    }));
  };

  const getExchangeRate = (fromCurrency = 'USD', toCurrency = currentCurrency) => {
    const fromRate = exchangeRates[fromCurrency]?.rate || 1;
    const toRate = exchangeRates[toCurrency]?.rate || 1;
    return toRate / fromRate;
  };

  const value = {
    currentCurrency,
    exchangeRates,
    convertPrice,
    formatPrice,
    changeCurrency,
    getCurrencySymbol,
    getCurrencyName,
    getAvailableCurrencies,
    getExchangeRate
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;