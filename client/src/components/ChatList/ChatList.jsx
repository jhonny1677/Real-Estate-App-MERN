import { useEffect, useState, useContext } from "react";
import "./ChatList.scss";
import ChatItem from "../ChatItem/ChatItem";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import { useChatContext } from "../../context/ChatContext";
import { useNavigate } from "react-router-dom";

function ChatList() {
  const [chats, setChats] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const { setChat } = useChatContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await apiRequest.get("/chats");
        setChats(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch chats", err);
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timeout = setTimeout(async () => {
      try {
        const res = await apiRequest.get(`/users?search=${searchQuery}`);
        setSearchResults(res.data.filter(u => u.id !== currentUser.id));
      } catch (err) {
        console.error("Search failed", err);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSelect = async (chat) => {
    try {
      const res = await apiRequest.get(`/chats/${chat.id}`);
      setChat({ ...res.data, receiver: chat.receiver });
      navigate("/");
    } catch (err) {
      console.error("❌ Failed to select chat", err);
    }
  };

  const handleStartChat = async (user) => {
    try {
      const res = await apiRequest.post("/chats", { receiverId: user.id });
      setChat({ ...res.data, messages: res.data.messages || [], receiver: user });
      setShowSearch(false);
      setSearchQuery("");
      navigate("/");
    } catch (err) {
      console.error("❌ Failed to start chat", err);
    }
  };

  return (
    <div className="chatList">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>Your Conversations</h2>
        <button
          onClick={() => setShowSearch(!showSearch)}
          style={{ background: "#667eea", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "13px" }}
        >
          + New Chat
        </button>
      </div>

      {showSearch && (
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e9ecef", fontSize: "13px", boxSizing: "border-box" }}
          />
          {searchResults.length > 0 && (
            <div style={{ border: "1px solid #e9ecef", borderRadius: "8px", marginTop: "6px", overflow: "hidden" }}>
              {searchResults.map(user => (
                <div
                  key={user.id}
                  onClick={() => handleStartChat(user)}
                  style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f0f0f0" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8f9fa"}
                  onMouseLeave={e => e.currentTarget.style.background = ""}
                >
                  <img src={user.avatar || "/noavatar.jpg"} alt="" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                  <span style={{ fontSize: "14px", fontWeight: 500 }}>{user.username}</span>
                </div>
              ))}
            </div>
          )}
          {searchQuery && searchResults.length === 0 && (
            <p style={{ fontSize: "13px", color: "#888", marginTop: "8px", textAlign: "center" }}>No users found</p>
          )}
        </div>
      )}

      {chats.length === 0 && !showSearch ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
          <p>No conversations yet.</p>
          <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
            Click <strong>"+ New Chat"</strong> to message someone, or open a property listing and click <strong>"Send a Message"</strong>.
          </p>
        </div>
      ) : (
        chats.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            currentUserId={currentUser.id}
            onSelect={() => handleSelect(chat)}
          />
        ))
      )}
    </div>
  );
}

export default ChatList;
