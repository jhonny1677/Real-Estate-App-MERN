import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./searchBar.scss";
import { Link, useLocation } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";

const types = ["buy", "rent"];

function SearchBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [query, setQuery] = useState({
    type: "buy",
    city: "",
    minPrice: "",
    maxPrice: "",
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery({
      type: params.get("type") || "buy",
      city: params.get("city") || "",
      minPrice: params.get("minPrice") || "",
      maxPrice: params.get("maxPrice") || "",
    });
  }, [location.search]);

  const fetchCities = (q) => {
    clearTimeout(debounceRef.current);
    if (!q) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await apiRequest.get(`/posts/cities?q=${encodeURIComponent(q)}`);
        setSuggestions(res.data || []);
        setShowSuggestions((res.data || []).length > 0);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 250);
  };

  const switchType = (val) => {
    setQuery((prev) => ({ ...prev, type: val }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuery((prev) => ({ ...prev, [name]: value }));
    if (name === "city") fetchCities(value);
  };

  const handleFocus = () => {
    if (query.city) fetchCities(query.city);
  };

  const selectSuggestion = (city) => {
    setQuery(prev => ({ ...prev, city }));
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="searchBar">
      <div className="type">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => switchType(type)}
            className={query.type === type ? "active" : ""}
          >
            {t(`property.${type === 'buy' ? 'forSale' : 'forRent'}`)}
          </button>
        ))}
      </div>
      <form>
        <div className="city-input-container">
          <input
            type="text"
            name="city"
            placeholder={t('search.location')}
            value={query.city}
            onChange={handleChange}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onFocus={handleFocus}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((city, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => selectSuggestion(city)}
                >
                  <span className="city-icon">📍</span>
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>
        <input
          type="number"
          name="minPrice"
          min={0}
          max={10000000}
          placeholder={t('search.minPrice')}
          value={query.minPrice === 0 ? "" : query.minPrice}
          onChange={handleChange}
        />
        <input
          type="number"
          name="maxPrice"
          min={0}
          max={10000000}
          placeholder={t('search.maxPrice')}
          value={query.maxPrice === 0 ? "" : query.maxPrice}
          onChange={handleChange}
        />
        <Link
          to={`/list?type=${query.type}&city=${encodeURIComponent(query.city)}&minPrice=${query.minPrice}&maxPrice=${query.maxPrice}`}
        >
          <button type="button">
            <img src="/search.png" alt={t('common.search')} />
          </button>
        </Link>
      </form>
    </div>
  );
}

export default SearchBar;

