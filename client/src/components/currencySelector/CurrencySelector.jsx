import { useState, useRef, useEffect } from "react";
import { useCurrency } from "../../context/CurrencyContext";
import "./currencySelector.scss";

function CurrencySelector({ showFullName = false, className = "" }) {
  const { 
    currentCurrency, 
    changeCurrency, 
    getCurrencySymbol, 
    getCurrencyName,
    getAvailableCurrencies 
  } = useCurrency();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const availableCurrencies = getAvailableCurrencies();
  
  // Filter currencies based on search term
  const filteredCurrencies = availableCurrencies.filter(currency =>
    currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCurrencySelect = (currencyCode) => {
    changeCurrency(currencyCode);
    setIsOpen(false);
    setSearchTerm("");
  };

  const currentCurrencyData = availableCurrencies.find(c => c.code === currentCurrency);

  return (
    <div className={`currency-selector ${className}`} ref={dropdownRef}>
      <button 
        className="currency-button"
        onClick={() => setIsOpen(!isOpen)}
        title={`Current currency: ${getCurrencyName()}`}
      >
        <span className="currency-symbol">{getCurrencySymbol()}</span>
        {showFullName && (
          <span className="currency-name">{currentCurrency}</span>
        )}
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="currency-dropdown">
          <div className="dropdown-header">
            <h3>Select Currency</h3>
            <input
              type="text"
              placeholder="Search currencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="currency-search"
            />
          </div>

          <div className="currency-list">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((currency) => (
                <div
                  key={currency.code}
                  className={`currency-item ${currency.code === currentCurrency ? 'selected' : ''}`}
                  onClick={() => handleCurrencySelect(currency.code)}
                >
                  <div className="currency-info">
                    <span className="currency-symbol">{currency.symbol}</span>
                    <div className="currency-details">
                      <span className="currency-code">{currency.code}</span>
                      <span className="currency-name">{currency.name}</span>
                    </div>
                  </div>
                  <div className="exchange-rate">
                    {currency.code !== 'USD' && (
                      <span className="rate">
                        1 USD = {currency.rate.toFixed(currency.code === 'JPY' || currency.code === 'KRW' ? 0 : 2)} {currency.code}
                      </span>
                    )}
                    {currency.code === 'USD' && (
                      <span className="rate">Base currency</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                No currencies found matching "{searchTerm}"
              </div>
            )}
          </div>

          <div className="dropdown-footer">
            <small>Exchange rates update every 5 minutes</small>
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrencySelector;