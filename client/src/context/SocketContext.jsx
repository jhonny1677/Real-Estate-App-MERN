import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import notificationService from "../lib/notificationService";

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";
    setSocket(io(socketUrl));
  }, []);

  useEffect(() => {
    if (currentUser && socket) {
      socket.emit("newUser", currentUser.id);

      // Listen for new messages
      socket.on("getMessage", (data) => {
        // Show notification if chat is not currently open
        if (notificationService.isNotificationEnabled('chatMessages')) {
          notificationService.showChatMessageAlert(
            { text: data.text, chatId: data.chatId },
            { id: data.senderId, username: data.senderName || 'Agent', avatar: data.senderAvatar }
          );
        }
      });

      // Listen for property alerts
      socket.on("propertyAlert", (data) => {
        switch (data.type) {
          case 'price-drop':
            if (notificationService.isNotificationEnabled('priceDrops')) {
              notificationService.showPriceDropAlert(data.property, data.oldPrice, data.newPrice);
            }
            break;
          case 'new-listing':
            if (notificationService.isNotificationEnabled('newListings')) {
              notificationService.showNewListingAlert(data.count, data.properties);
            }
            break;
        }
      });

      return () => {
        socket.off("getMessage");
        socket.off("propertyAlert");
      };
    }
  }, [currentUser, socket]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
