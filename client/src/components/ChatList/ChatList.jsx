import { useEffect, useState, useContext } from "react";
import "./ChatList.scss";
import ChatItem from "../ChatItem/ChatItem";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import { useChatContext } from "../../context/ChatContext";
import { useNavigate } from "react-router-dom";
import Avatar from "../Avatar/Avatar";

function ChatList() {
  const [chats, setChats] = useState([]);
  const [filterQuery, setFilterQuery] = useState("");
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
        console.error("Failed to fetch chats", err);
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
      console.error("Failed to select chat", err);
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
      console.error("Failed to start chat", err);
    }
  };

  const filteredChats = filterQuery.trim()
    ? chats.filter(c => c.receiver?.username?.toLowerCase().includes(filterQuery.toLowerCase()))
    : chats;

  return (
    <div className="chatList">
      <div className="chatList-header">
        <h2>Conversations</h2>
        <button className="new-chat-btn" onClick={() => setShowSearch(!showSearch)}>
          + New
        </button>
      </div>

      <div className="chatList-filter">
        <input
          type="text"
          className="filter-input"
          placeholder="Filter conversations..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
        />
      </div>

      {showSearch && (
        <div className="user-search">
          <input
            type="text"
            className="search-input"
            placeholder="Search users to message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map(user => (
                <div key={user.id} className="search-result-item" onClick={() => handleStartChat(user)}>
                  <Avatar src={user.avatar} username={user.username} size={32} />
                  <span>{user.username}</span>
                </div>
              ))}
            </div>
          )}
          {searchQuery && searchResults.length === 0 && (
            <p className="no-results">No users found</p>
          )}
        </div>
      )}

      {filteredChats.length === 0 && !showSearch ? (
        <div className="chatList-empty">
          <p>No conversations yet.</p>
          <p>Click <strong>+ New</strong> to message someone.</p>
        </div>
      ) : (
        filteredChats.map((chat) => (
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
