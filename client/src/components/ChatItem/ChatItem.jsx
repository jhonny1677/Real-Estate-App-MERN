import "./chatItem.scss";
import { format } from "timeago.js";

function ChatItem({ chat, currentUserId, onSelect }) {
  const { receiver, lastMessage, updatedAt, seenBy } = chat;

  const isSeen = seenBy.includes(currentUserId);

  const initials = receiver.username
    ? receiver.username.slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className={`chatItem ${isSeen ? "seen" : "unseen"}`} onClick={onSelect}>
      <div className="avatar-initials" title={receiver.username}>
        {initials}
      </div>
      <div className="textContainer">
        <span className="username">{receiver.username}</span>
        <span className="message">{lastMessage || "No messages yet..."}</span>
      </div>
      <div className="info">
        <span className="time">{format(updatedAt)}</span>
        {!isSeen && <div className="dot"></div>}
      </div>
    </div>
  );
}

export default ChatItem;
