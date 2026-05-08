import "./chat.scss";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState, useContext } from "react";
import { useChatContext } from "../../context/ChatContext";
import { format } from "timeago.js";
import { AuthContext } from "../../context/AuthContext";
import { IoMdClose, IoMdAttach, IoMdSend, IoMdImage, IoMdDocument } from "react-icons/io";
import { FiMinimize2, FiMaximize2, FiMic, FiMicOff } from "react-icons/fi";
import apiRequest from "../../lib/apiRequest";

function Chat() {
  const { chat, setChat } = useChatContext();
  const { currentUser } = useContext(AuthContext);

  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji.emoji);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setShowAttachments(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim() && !selectedFile) return;

    try {
      let messageData = { text };

      // Handle file upload if there's a selected file
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('text', text);

        const res = await apiRequest.post(`/messages/${chat.id}/with-file`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const updatedChat = {
          ...chat,
          messages: [...chat.messages, res.data],
        };
        setChat(updatedChat);
      } else {
        const res = await apiRequest.post(`/messages/${chat.id}`, messageData);

        const updatedChat = {
          ...chat,
          messages: [...chat.messages, res.data],
        };
        setChat(updatedChat);
      }

      setText("");
      setSelectedFile(null);
      setShowEmoji(false);
    } catch (err) {
      console.error("Message send failed", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSend();
    }
  };


  return (
    <div className={`chatBox ${isMinimized ? 'minimized' : ''}`}>
      <div className="chatHeader">
        <div className="headerLeft">
          <div className="userInfo">
            <img 
              src={chat?.receiver?.avatar || "/noavatar.jpg"} 
              alt="Avatar" 
              className="userAvatar"
            />
            <div className="userDetails">
              <span className="chatUsername">{chat?.receiver?.username}</span>
              <span className="userStatus">online</span>
            </div>
          </div>
        </div>
        <div className="headerActions">
          <button 
            className="minimizeBtn" 
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <FiMaximize2 /> : <FiMinimize2 />}
          </button>
          <button className="closeBtn" onClick={() => setChat(null)}>
            <IoMdClose />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="chatMessages">
            {chat?.messages?.map((message) => (
              <div
                key={message.id}
                className={`message ${message.userId === currentUser.id ? "own" : ""}`}
              >
                <div className="messageContent">
                  {message.fileUrl && (
                    <div className="messageFile">
                      {message.fileType?.startsWith('image') ? (
                        <img src={message.fileUrl} alt="Shared image" className="sharedImage" />
                      ) : (
                        <div className="fileAttachment">
                          <IoMdDocument />
                          <span>{message.fileName || 'File'}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {message.text && <div className="text">{message.text}</div>}
                  <div className="time">{format(message.createdAt)}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatInput">
            {selectedFile && (
              <div className="selectedFile">
                <span className="fileName">{selectedFile.name}</span>
                <button onClick={() => setSelectedFile(null)}>×</button>
              </div>
            )}

            <div className="inputRow">
              <button
                className="attachBtn"
                onClick={() => setShowAttachments(!showAttachments)}
              >
                <IoMdAttach />
              </button>

              <button
                className="emojiToggle"
                onClick={() => setShowEmoji((prev) => !prev)}
              >
                😊
              </button>

              <input
                type="text"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <button 
                className="voiceBtn"
                onClick={() => setIsRecording(!isRecording)}
              >
                {isRecording ? <FiMicOff /> : <FiMic />}
              </button>

              <button 
                className="sendBtn chat-send-button" 
                onClick={handleSend} 
                title="Send message"
                type="button"
              >
                <IoMdSend />
              </button>
            </div>

            {showAttachments && (
              <div className="attachmentOptions">
                <button onClick={() => imageInputRef.current?.click()}>
                  <IoMdImage /> Photo
                </button>
                <button onClick={() => fileInputRef.current?.click()}>
                  <IoMdDocument /> File
                </button>
              </div>
            )}

            {showEmoji && (
              <div className="emojiPickerContainer">
                <EmojiPicker theme="auto" onEmojiClick={handleEmojiClick} />
              </div>
            )}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default Chat;
