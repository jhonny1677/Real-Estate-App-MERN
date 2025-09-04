import { useEffect, useState } from "react";
import { useRecommendations } from "../../context/RecommendationsContext";
import { useFavorites } from "../../context/FavoritesContext";
import Card from "../card/Card";
import "./recommendations.scss";

function Recommendations({ currentProperty, allProperties = [] }) {
  const { getSimilarPropertiesFor, getPersonalizedRecommendations } = useRecommendations();
  const { favorites } = useFavorites();
  const [similarProperties, setSimilarProperties] = useState([]);
  const [personalizedProperties, setPersonalizedProperties] = useState([]);

  useEffect(() => {
    if (currentProperty && allProperties.length > 0) {
      // Get similar properties (reduced from 4 to 3)
      const similar = getSimilarPropertiesFor(currentProperty, allProperties, 3);
      setSimilarProperties(similar);

      // Get personalized recommendations (reduced from 6 to 4)
      const personalized = getPersonalizedRecommendations(allProperties, favorites, 4);
      setPersonalizedProperties(personalized);
    }
  }, [currentProperty, allProperties, favorites, getSimilarPropertiesFor, getPersonalizedRecommendations]);

  if (similarProperties.length === 0 && personalizedProperties.length === 0) {
    return null;
  }

  return (
    <div className="recommendations">
      {similarProperties.length > 0 && (
        <div className="recommendation-section">
          <h2>🔍 Similar Properties</h2>
          <p className="section-subtitle">Properties similar to {currentProperty?.title}</p>
          <div className="properties-grid">
            {similarProperties.map((property) => (
              <div key={property.id} className="recommendation-item">
                <Card item={property} />
                <div className="similarity-info">
                  <div className="similarity-score">
                    <span className="score-label">Match:</span>
                    <div className="score-bar">
                      <div 
                        className="score-fill" 
                        style={{width: `${(property.similarity * 100).toFixed(0)}%`}}
                      ></div>
                    </div>
                    <span className="score-text">{(property.similarity * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {personalizedProperties.length > 0 && (
        <div className="recommendation-section">
          <h2>✨ Recommended for You</h2>
          <p className="section-subtitle">Based on your viewing history and preferences</p>
          <div className="properties-grid">
            {personalizedProperties.map((property) => (
              <div key={property.id} className="recommendation-item">
                <Card item={property} />
                <div className="recommendation-info">
                  <div className="recommendation-score">
                    <span className="score-label">Recommended:</span>
                    <div className="score-bar">
                      <div 
                        className="score-fill recommended" 
                        style={{width: `${(property.recommendationScore * 100).toFixed(0)}%`}}
                      ></div>
                    </div>
                    <span className="score-text">{(property.recommendationScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Recommendations;