import { useEffect, useState, useContext } from "react";
import "./ChatList.scss";
import ChatItem from "../ChatItem/ChatItem";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import { useChatContext } from "../../context/ChatContext";
import { useNavigate } from "react-router-dom";

function ChatList() {
  const [chats, setChats] = useState([]);
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

  const handleSelect = async (chat) => {
    try {
      const res = await apiRequest.get(`/chats/${chat.id}`);

      const fullChat = {
        ...res.data,
        receiver: chat.receiver,
      };

      setChat(fullChat);
      navigate("/");
    } catch (err) {
      console.error("❌ Failed to select chat", err);
    }
  };

  return (
    <div className="chatList">
      <h2>Your Conversations</h2>
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          currentUserId={currentUser.id}
          onSelect={() => handleSelect(chat)}
        />
      ))}
    </div>
  );
}

export default ChatList;
