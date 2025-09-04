import "./favoritesPage.scss";
import { useFavorites } from "../../context/FavoritesContext";
import Card from "../../components/card/Card";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div className="favorites-page">
        <div className="container">
          <div className="login-prompt">
            <h1>Please Login</h1>
            <p>You need to login to view your favorite properties.</p>
            <button onClick={() => navigate("/login")} className="login-btn">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="container">
        <div className="title">
          <h1>❤️ My Favorite Properties</h1>
          <p>Properties you've saved for later</p>
        </div>

        {favorites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💔</div>
            <h2>No favorites yet</h2>
            <p>Start browsing properties and add them to your favorites by clicking the heart icon!</p>
            <button onClick={() => navigate("/list")} className="browse-btn">
              Browse Properties
            </button>
          </div>
        ) : (
          <>
            <div className="stats">
              <span className="count">{favorites.length} favorite properties</span>
            </div>
            
            <div className="favorites-list">
              {favorites.map((property) => (
                <div key={property.id} className="favorite-item">
                  <Card item={property} />
                  <button 
                    className="remove-favorite"
                    onClick={() => toggleFavorite(property)}
                    title="Remove from favorites"
                  >
                    💔 Remove
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage;