import { createContext, useContext, useEffect, useState } from "react";

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedSearches, setSavedSearches] = useState(() => {
    const saved = localStorage.getItem('savedSearches');
    return saved ? JSON.parse(saved) : [];
  });

  const [compareList, setCompareList] = useState(() => {
    const saved = localStorage.getItem('compareList');
    return saved ? JSON.parse(saved) : [];
  });

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save searches to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
  }, [savedSearches]);

  // Save compare list to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  const addToFavorites = (property) => {
    setFavorites(prev => {
      if (prev.find(fav => fav.id === property.id)) {
        return prev; // Already in favorites
      }
      return [...prev, { ...property, dateAdded: new Date().toISOString() }];
    });
  };

  const removeFromFavorites = (propertyId) => {
    setFavorites(prev => prev.filter(fav => fav.id !== propertyId));
  };

  const isFavorite = (propertyId) => {
    return favorites.some(fav => fav.id === propertyId);
  };

  const toggleFavorite = (property) => {
    if (isFavorite(property.id)) {
      removeFromFavorites(property.id);
    } else {
      addToFavorites(property);
    }
  };

  const saveSearch = (searchParams, searchName) => {
    const search = {
      id: Date.now(),
      name: searchName,
      params: searchParams,
      dateCreated: new Date().toISOString(),
      resultCount: 0 // Can be updated later
    };
    setSavedSearches(prev => [...prev, search]);
  };

  const removeSavedSearch = (searchId) => {
    setSavedSearches(prev => prev.filter(search => search.id !== searchId));
  };

  const addToCompare = (property) => {
    setCompareList(prev => {
      if (prev.length >= 3) {
        alert('You can compare maximum 3 properties');
        return prev;
      }
      if (prev.find(item => item.id === property.id)) {
        return prev; // Already in compare list
      }
      return [...prev, property];
    });
  };

  const removeFromCompare = (propertyId) => {
    setCompareList(prev => prev.filter(item => item.id !== propertyId));
  };

  const isInCompare = (propertyId) => {
    return compareList.some(item => item.id === propertyId);
  };

  const toggleCompare = (property) => {
    if (isInCompare(property.id)) {
      removeFromCompare(property.id);
    } else {
      addToCompare(property);
    }
  };

  const clearCompareList = () => {
    setCompareList([]);
  };

  const shareProperty = (property) => {
    const shareUrl = `${window.location.origin}/property/${property.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this property: ${property.title}`,
        url: shareUrl
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Property link copied to clipboard!');
      }).catch(() => {
        alert(`Share this property: ${shareUrl}`);
      });
    }
  };

  const value = {
    // Favorites
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    
    // Saved Searches
    savedSearches,
    saveSearch,
    removeSavedSearch,
    
    // Compare
    compareList,
    addToCompare,
    removeFromCompare,
    isInCompare,
    toggleCompare,
    clearCompareList,
    
    // Utils
    shareProperty
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};