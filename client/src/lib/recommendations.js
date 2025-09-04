// Smart recommendation algorithms

export const calculatePropertySimilarity = (property1, property2) => {
  let score = 0;
  let factors = 0;

  // Price similarity (normalized to 0-1 scale)
  if (property1.price && property2.price) {
    const priceDiff = Math.abs(property1.price - property2.price);
    const avgPrice = (property1.price + property2.price) / 2;
    const priceScore = Math.max(0, 1 - (priceDiff / avgPrice));
    score += priceScore * 0.3; // 30% weight
    factors += 0.3;
  }

  // Location similarity (same city)
  if (property1.city && property2.city) {
    const locationScore = property1.city.toLowerCase() === property2.city.toLowerCase() ? 1 : 0;
    score += locationScore * 0.25; // 25% weight
    factors += 0.25;
  }

  // Property type similarity
  if (property1.property && property2.property) {
    const typeScore = property1.property === property2.property ? 1 : 0;
    score += typeScore * 0.2; // 20% weight
    factors += 0.2;
  }

  // Bedroom similarity
  if (property1.bedroom && property2.bedroom) {
    const bedroomDiff = Math.abs(property1.bedroom - property2.bedroom);
    const bedroomScore = Math.max(0, 1 - (bedroomDiff / 3)); // Max 3 bedroom difference
    score += bedroomScore * 0.15; // 15% weight
    factors += 0.15;
  }

  // Bathroom similarity
  if (property1.bathroom && property2.bathroom) {
    const bathroomDiff = Math.abs(property1.bathroom - property2.bathroom);
    const bathroomScore = Math.max(0, 1 - (bathroomDiff / 2)); // Max 2 bathroom difference
    score += bathroomScore * 0.1; // 10% weight
    factors += 0.1;
  }

  return factors > 0 ? score / factors : 0;
};

export const getSimilarProperties = (targetProperty, allProperties, limit = 4) => {
  if (!targetProperty || !allProperties) return [];

  const similarities = allProperties
    .filter(prop => prop.id !== targetProperty.id) // Exclude the target property itself
    .map(property => ({
      ...property,
      similarity: calculatePropertySimilarity(targetProperty, property)
    }))
    .sort((a, b) => b.similarity - a.similarity) // Sort by highest similarity
    .slice(0, limit);

  return similarities;
};

export const getRecommendationsBasedOnHistory = (viewedProperties, favoriteProperties, allProperties, limit = 6) => {
  if (!allProperties || allProperties.length === 0) return [];

  const userProperties = [...(viewedProperties || []), ...(favoriteProperties || [])];
  if (userProperties.length === 0) {
    // Return popular properties if no history
    return allProperties
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  }

  // Calculate average user preferences
  const avgPrice = userProperties.reduce((sum, prop) => sum + (prop.price || 0), 0) / userProperties.length;
  const avgBedrooms = userProperties.reduce((sum, prop) => sum + (prop.bedroom || 0), 0) / userProperties.length;
  const avgBathrooms = userProperties.reduce((sum, prop) => sum + (prop.bathroom || 0), 0) / userProperties.length;

  // Get most viewed cities and property types
  const cityFreq = {};
  const typeFreq = {};
  
  userProperties.forEach(prop => {
    if (prop.city) cityFreq[prop.city] = (cityFreq[prop.city] || 0) + 1;
    if (prop.property) typeFreq[prop.property] = (typeFreq[prop.property] || 0) + 1;
  });

  const preferredCities = Object.keys(cityFreq).sort((a, b) => cityFreq[b] - cityFreq[a]);
  const preferredTypes = Object.keys(typeFreq).sort((a, b) => typeFreq[b] - typeFreq[a]);

  // Score all properties based on user preferences
  const recommendations = allProperties
    .filter(prop => !userProperties.find(up => up.id === prop.id)) // Exclude already seen
    .map(property => {
      let score = 0;

      // Price preference
      const priceDiff = Math.abs((property.price || 0) - avgPrice);
      const priceScore = Math.max(0, 1 - (priceDiff / (avgPrice * 0.5))); // Within 50% of avg
      score += priceScore * 0.3;

      // City preference
      const cityScore = preferredCities.includes(property.city) ? 
        (cityFreq[property.city] / userProperties.length) : 0;
      score += cityScore * 0.25;

      // Type preference
      const typeScore = preferredTypes.includes(property.property) ? 
        (typeFreq[property.property] / userProperties.length) : 0;
      score += typeScore * 0.2;

      // Bedroom preference
      const bedroomDiff = Math.abs((property.bedroom || 0) - avgBedrooms);
      const bedroomScore = Math.max(0, 1 - (bedroomDiff / 2));
      score += bedroomScore * 0.15;

      // Bathroom preference
      const bathroomDiff = Math.abs((property.bathroom || 0) - avgBathrooms);
      const bathroomScore = Math.max(0, 1 - (bathroomDiff / 2));
      score += bathroomScore * 0.1;

      return { ...property, recommendationScore: score };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);

  return recommendations;
};

export const detectPriceDrops = (currentProperties, previousProperties) => {
  if (!currentProperties || !previousProperties) return [];

  const priceDrops = [];
  
  currentProperties.forEach(current => {
    const previous = previousProperties.find(prev => prev.id === current.id);
    if (previous && current.price < previous.price) {
      const drop = previous.price - current.price;
      const dropPercentage = (drop / previous.price) * 100;
      
      priceDrops.push({
        ...current,
        previousPrice: previous.price,
        priceDrop: drop,
        dropPercentage: dropPercentage.toFixed(1)
      });
    }
  });

  return priceDrops.sort((a, b) => b.dropPercentage - a.dropPercentage);
};

export const getNewListings = (allProperties, daysSince = 7) => {
  if (!allProperties) return [];

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysSince);

  return allProperties
    .filter(property => {
      const createdDate = new Date(property.createdAt || property.dateAdded || Date.now());
      return createdDate >= cutoffDate;
    })
    .sort((a, b) => new Date(b.createdAt || b.dateAdded) - new Date(a.createdAt || a.dateAdded));
};

export const getRecommendationReasons = (targetProperty, recommendedProperty) => {
  const reasons = [];

  // Price similarity
  if (targetProperty.price && recommendedProperty.price) {
    const priceDiff = Math.abs(targetProperty.price - recommendedProperty.price);
    const avgPrice = (targetProperty.price + recommendedProperty.price) / 2;
    if (priceDiff / avgPrice < 0.2) { // Within 20%
      reasons.push(`Similar price range ($${recommendedProperty.price.toLocaleString()})`);
    }
  }

  // Same location
  if (targetProperty.city && recommendedProperty.city && 
      targetProperty.city.toLowerCase() === recommendedProperty.city.toLowerCase()) {
    reasons.push(`Same location (${recommendedProperty.city})`);
  }

  // Same property type
  if (targetProperty.property && recommendedProperty.property && 
      targetProperty.property === recommendedProperty.property) {
    reasons.push(`Same property type (${recommendedProperty.property})`);
  }

  // Similar size
  if (targetProperty.bedroom === recommendedProperty.bedroom) {
    reasons.push(`Same number of bedrooms (${recommendedProperty.bedroom})`);
  }

  if (targetProperty.bathroom === recommendedProperty.bathroom) {
    reasons.push(`Same number of bathrooms (${recommendedProperty.bathroom})`);
  }

  return reasons.length > 0 ? reasons : ['Similar features and location'];
};