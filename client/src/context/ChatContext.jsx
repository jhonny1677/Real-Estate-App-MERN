import { createContext, useContext, useEffect, useState } from "react";
import apiRequest from "../lib/apiRequest";
import { AuthContext } from "./AuthContext"; // ✅ Correct import

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext); // ✅ FIXED here

  const [chat, setChat] = useState(null);           // Selected chat
  const [chats, setChats] = useState([]);           // All user chats
  const [unseenCount, setUnseenCount] = useState(0); // For notification dot

  // Fetch all chats on login
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await apiRequest.get("/chats");
        setChats(res.data || []);

        const unseen = res.data?.filter(
          (c) => !c.seenBy.includes(currentUser.id)
        ).length;

        setUnseenCount(unseen);
      } catch (err) {
        console.error("Failed to fetch chats", err);
      }
    };

    if (currentUser) {
      fetchChats();
    }
  }, [currentUser]);

  const markChatAsRead = async (chatId) => {
    try {
      await apiRequest.put("/chats/read/" + chatId);
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? { ...c, seenBy: [...c.seenBy, currentUser.id] }
            : c
        )
      );
      setUnseenCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Failed to mark chat as read", err);
    }
  };

  // Auto-mark chat as read when it's opened
  useEffect(() => {
    if (chat && chat.id && !chat.seenBy?.includes(currentUser?.id)) {
      markChatAsRead(chat.id);
    }
  }, [chat, currentUser]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        setChat,
        chats,
        setChats,
        unseenCount,
        setUnseenCount,
        markChatAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Hook for easier access
export const useChatContext = () => useContext(ChatContext);
