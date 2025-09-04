import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./card.scss";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import apiRequest from "../../lib/apiRequest";
import { ChatContext } from "../../context/ChatContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useCurrency } from "../../context/CurrencyContext";
import PropertyImage from "../PropertyImage/PropertyImage";

function Card({ item }) {
  const { t } = useTranslation();
  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  
  const { setChat, unreadChats } = useContext(ChatContext);
  const { isFavorite, toggleFavorite, isInCompare, toggleCompare, shareProperty } = useFavorites();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      await apiRequest.post("/users/save", { postId: item.id });
      alert(t('common.saveSuccess'));
    } catch (err) {
      console.error("Failed to save post:", err);
    }
  };

  const handleMessage = async () => {
    try {
      if (!item.userId || item.userId === currentUser?.id) return;

      const res = await apiRequest.post("/chats", {
        receiverId: item.userId,
      });

      const chatId = res.data.id;
      const chatRes = await apiRequest("/chats/" + chatId);

      setChat({
        ...chatRes.data,
        receiver: {
          id: item.userId,
          username: item.user?.username,
          avatar: item.user?.avatar || "/noavatar.jpg",
        },
      });

      socket.emit("sendMessage", {
        receiverId: item.userId,
        data: { text: "👋", chatId },
      });
    } catch (err) {
      console.error("❌ Failed to send message:", err);
    }
  };

  const handleEdit = () => {
    navigate(`/edit/${item.id}`); // ✅ Navigates to edit page
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(t('common.confirmDelete'));
    if (!confirmDelete) return;

    try {
      await apiRequest.delete(`/posts/${item.id}`); // ✅ Deletes from backend
      alert(t('common.deleteSuccess'));
      window.location.reload(); // Or use state to remove item from DOM dynamically
    } catch (err) {
      console.error("Failed to delete listing:", err);
      alert(t('common.deleteError'));
    }
  };

  const showBadge = unreadChats?.some(
    (c) => c.userIDs?.includes(item.userId) && item.userId !== currentUser?.id
  );

  return (
    <div className="card">
      <Link to={`/property/${item.id}`} className="imageContainer">
        <PropertyImage
          src={item.images?.[0]}
          alt={item.title || "Property"}
          className="card-image"
        />
        {item.isNew && <div className="tag">{t('property.new')}</div>}
      </Link>

      <div className="textContainer">
        <h2 className="title">
          <Link to={`/property/${item.id}`}>{item.title}</Link>
        </h2>

        <p className="address">
          <img src="/pin.png" alt="pin" />
          <span>{item.address}</span>
        </p>

        <p className="price">{formatPrice(item.price)}</p>

        <div className="bottom">
          <div className="features">
            <div className="feature">
              <img src="/bed.png" alt="bed" />
              <span>{item.bedroom} {item.bedroom === 1 ? t('search.bedroom') : t('search.bedrooms')}</span>
            </div>
            <div className="feature">
              <img src="/bath.png" alt="bath" />
              <span>{item.bathroom} {item.bathroom === 1 ? t('search.bathroom') : t('search.bathrooms')}</span>
            </div>
          </div>

          <div className="icons">
            {item.userId === currentUser?.id ? (
              <>
                <div className="icon" onClick={handleEdit}>
                  <img src="/edit.png" alt="edit" />
                </div>
                <div className="icon" onClick={handleDelete}>
                  <img src="/delete.png" alt="delete" />
                </div>
              </>
            ) : (
              <div className="icon messageIcon" onClick={handleMessage}>
                <img src="/chat.png" alt="chat" />
                {showBadge && <div className="redDot"></div>}
              </div>
            )}

            <div 
              className={`icon ${isFavorite(item.id) ? 'favorited' : ''}`} 
              onClick={() => toggleFavorite(item)}
              title={t('common.addToFavorites')}
            >
              <img src="/save.png" alt="favorite" />
            </div>

            <div 
              className={`icon ${isInCompare(item.id) ? 'comparing' : ''}`} 
              onClick={() => toggleCompare(item)}
              title={t('common.addToCompare')}
            >
              <span className="compare-icon">⚖️</span>
            </div>

            <div 
              className="icon" 
              onClick={() => shareProperty(item)}
              title={t('common.shareProperty')}
            >
              <span className="share-icon">📤</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
