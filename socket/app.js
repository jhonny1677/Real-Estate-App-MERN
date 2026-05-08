import { createServer } from "http";
import { Server } from "socket.io";

// Create HTTP server (needed to log startup)
const httpServer = createServer();

const ALLOWED_ORIGINS = (process.env.CLIENT_URL || "http://localhost:5174").split(",");

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"]
  }
});

// Track connected users
let onlineUser = [];

const addUser = (userId, socketId) => {
  const exists = onlineUser.find((user) => user.userId === userId);
  if (!exists) {
    onlineUser.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUser.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
    console.log("✅ User added:", userId);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", data);
      console.log(`📨 Message sent to user ${receiverId}:`, data);
    } else {
      console.log("❌ Receiver not online");
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 Disconnected:", socket.id);
    removeUser(socket.id);
  });
});

// ✅ Start the socket server
httpServer.listen(4000, () => {
  console.log("✅ Socket server is running on port 4000");
});
