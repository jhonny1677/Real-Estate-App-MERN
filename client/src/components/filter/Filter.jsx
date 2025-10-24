import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./filter.scss";
import { useSearchParams } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";

function Filter() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const cityDebounce = useRef(null);
  const [query, setQuery] = useState({
    type: searchParams.get("type") || "",
    city: searchParams.get("city") || "",
    property: searchParams.get("property") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bedroom: searchParams.get("bedroom") || "",
    bathroom: searchParams.get("bathroom") || "",
    minSize: searchParams.get("minSize") || "",
    maxSize: searchParams.get("maxSize") || "",
    utilities: searchParams.get("utilities") || "",
    pet: searchParams.get("pet") || "",
    income: searchParams.get("income") || "",
    nearSchool: searchParams.get("nearSchool") || "",
    nearBus: searchParams.get("nearBus") || "",
    nearRestaurant: searchParams.get("nearRestaurant") || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuery({ ...query, [name]: value });
    if (name === "city") {
      clearTimeout(cityDebounce.current);
      if (!value) { setCitySuggestions([]); setShowCitySuggestions(false); return; }
      cityDebounce.current = setTimeout(async () => {
        try {
          const res = await apiRequest.get(`/posts/cities?q=${encodeURIComponent(value)}`);
          setCitySuggestions(res.data || []);
          setShowCitySuggestions((res.data || []).length > 0);
        } catch { setCitySuggestions([]); }
      }, 250);
    }
  };

  const handleFilter = () => {
    // Filter out empty values to keep URL clean
    const filteredQuery = Object.fromEntries(
      Object.entries(query).filter(([key, value]) => value !== "")
    );
    setSearchParams(filteredQuery);
  };

  const clearFilters = () => {
    setQuery({
      type: "",
      city: "",
      property: "",
      minPrice: "",
      maxPrice: "",
      bedroom: "",
      bathroom: "",
      minSize: "",
      maxSize: "",
      utilities: "",
      pet: "",
      income: "",
      nearSchool: "",
      nearBus: "",
      nearRestaurant: "",
    });
    setSearchParams({});
  };

  return (
    <div className="filter">
      <h1>Search Filters</h1>
      
      <div className="top">
        <div className="item" style={{ position: "relative" }}>
          <label htmlFor="city">{t('search.location')}</label>
          <input
            type="text"
            id="city"
            name="city"
            placeholder={t('search.cityLocation')}
            onChange={handleChange}
            value={query.city}
            onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
            autoComplete="off"
          />
          {showCitySuggestions && citySuggestions.length > 0 && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0,
              background: "white", border: "1px solid #e5e5e5", borderRadius: "8px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 999, overflow: "hidden"
            }}>
              {citySuggestions.map(city => (
                <div
                  key={city}
                  onMouseDown={() => { setQuery(q => ({ ...q, city })); setShowCitySuggestions(false); }}
                  style={{
                    padding: "9px 14px", cursor: "pointer", fontSize: "14px",
                    display: "flex", alignItems: "center", gap: "8px", color: "#444",
                    borderBottom: "1px solid #f5f5f5"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8f8f8"}
                  onMouseLeave={e => e.currentTarget.style.background = "white"}
                >
                  <span style={{ fontSize: "12px", opacity: 0.6 }}>📍</span>{city}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bottom">
        <div className="item">
          <label htmlFor="type">{t('search.type')}</label>
          <select
            name="type"
            id="type"
            onChange={handleChange}
            value={query.type}
          >
            <option value="">{t('search.any')}</option>
            <option value="buy">{t('property.forSale')}</option>
            <option value="rent">{t('property.forRent')}</option>
          </select>
        </div>

        <div className="item">
          <label htmlFor="property">{t('search.propertyType')}</label>
          <select
            name="property"
            id="property"
            onChange={handleChange}
            value={query.property}
          >
            <option value="">{t('search.any')}</option>
            <option value="apartment">{t('property.apartment')}</option>
            <option value="house">{t('property.house')}</option>
            <option value="condo">{t('property.condo')}</option>
            <option value="land">{t('property.land')}</option>
            <option value="villa">{t('property.villa')}</option>
          </select>
        </div>

        <div className="item">
          <label htmlFor="minPrice">{t('search.minPrice')}</label>
          <input
            type="number"
            id="minPrice"
            name="minPrice"
            placeholder={t('search.any')}
            onChange={handleChange}
            value={query.minPrice}
          />
        </div>

        <div className="item">
          <label htmlFor="maxPrice">{t('search.maxPrice')}</label>
          <input
            type="number"
            id="maxPrice"
            name="maxPrice"
            placeholder={t('search.any')}
            onChange={handleChange}
            value={query.maxPrice}
          />
        </div>

        <div className="item">
          <label htmlFor="bedroom">{t('search.bedrooms')}</label>
          <select
            name="bedroom"
            id="bedroom"
            onChange={handleChange}
            value={query.bedroom}
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>

        <div className="item">
          <label htmlFor="bathroom">{t('search.bathrooms')}</label>
          <select
            name="bathroom"
            id="bathroom"
            onChange={handleChange}
            value={query.bathroom}
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>

        <div className="filter-actions">
          <button className="toggle-advanced" onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? "Hide" : "Show"} Advanced Filters
          </button>
          <button className="clear-filters" onClick={clearFilters}>
            Clear All
          </button>
          <button className="search-button" onClick={handleFilter}>
            <img src="/search.png" alt="Search" />
            Search
          </button>
        </div>
      </div>

      {showAdvanced && (
        <div className="advanced-filters">
          <h3>Advanced Filters</h3>
          
          <div className="advanced-row">
            <div className="item">
              <label htmlFor="minSize">Min Size (sq ft)</label>
              <input
                type="number"
                id="minSize"
                name="minSize"
                placeholder="Any"
                onChange={handleChange}
                value={query.minSize}
              />
            </div>

            <div className="item">
              <label htmlFor="maxSize">Max Size (sq ft)</label>
              <input
                type="number"
                id="maxSize"
                name="maxSize"
                placeholder="Any"
                onChange={handleChange}
                value={query.maxSize}
              />
            </div>
          </div>

          <div className="advanced-row">
            <div className="item">
              <label htmlFor="utilities">Utilities</label>
              <select
                name="utilities"
                id="utilities"
                onChange={handleChange}
                value={query.utilities}
              >
                <option value="">Any</option>
                <option value="included">Included</option>
                <option value="tenant">Tenant Pays</option>
                <option value="shared">Shared</option>
              </select>
            </div>

            <div className="item">
              <label htmlFor="pet">Pet Policy</label>
              <select
                name="pet"
                id="pet"
                onChange={handleChange}
                value={query.pet}
              >
                <option value="">Any</option>
                <option value="allowed">Pets Allowed</option>
                <option value="cats">Cats Only</option>
                <option value="dogs">Dogs Only</option>
                <option value="none">No Pets</option>
              </select>
            </div>
          </div>

          <div className="advanced-row">
            <div className="item">
              <label htmlFor="income">Income Requirement</label>
              <select
                name="income"
                id="income"
                onChange={handleChange}
                value={query.income}
              >
                <option value="">Any</option>
                <option value="none">No Requirement</option>
                <option value="2x">2x Rent</option>
                <option value="3x">3x Rent</option>
                <option value="4x">4x Rent</option>
              </select>
            </div>
          </div>

          <div className="proximity-filters">
            <h4>Nearby Amenities (Walking Distance)</h4>
            <div className="advanced-row">
              <div className="item">
                <label htmlFor="nearSchool">Near School</label>
                <select
                  name="nearSchool"
                  id="nearSchool"
                  onChange={handleChange}
                  value={query.nearSchool}
                >
                  <option value="">Any</option>
                  <option value="1">Within 0.5 miles</option>
                  <option value="2">Within 1 mile</option>
                  <option value="3">Within 2 miles</option>
                </select>
              </div>

              <div className="item">
                <label htmlFor="nearBus">Near Public Transport</label>
                <select
                  name="nearBus"
                  id="nearBus"
                  onChange={handleChange}
                  value={query.nearBus}
                >
                  <option value="">Any</option>
                  <option value="1">Within 0.2 miles</option>
                  <option value="2">Within 0.5 miles</option>
                  <option value="3">Within 1 mile</option>
                </select>
              </div>

              <div className="item">
                <label htmlFor="nearRestaurant">Near Restaurants</label>
                <select
                  name="nearRestaurant"
                  id="nearRestaurant"
                  onChange={handleChange}
                  value={query.nearRestaurant}
                >
                  <option value="">Any</option>
                  <option value="1">Within 0.2 miles</option>
                  <option value="2">Within 0.5 miles</option>
                  <option value="3">Within 1 mile</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Filter;
