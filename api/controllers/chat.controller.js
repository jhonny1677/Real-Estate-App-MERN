import prisma from "../lib/prisma.js";

// ✅ GET ALL CHATS FOR LOGGED-IN USER
export const getChats = async (req, res) => {
  const tokenUserId = req.user?.id;

  if (!tokenUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const chats = await prisma.chat.findMany({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const enrichedChats = await Promise.all(
      chats.map(async (chat) => {
        const receiverId = chat.userIDs.find((id) => id !== tokenUserId);

        const receiver = await prisma.user.findUnique({
          where: { id: receiverId },
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        });

        return {
          ...chat,
          receiver,
          isSeen: chat.seenBy.includes(tokenUserId),
        };
      })
    );

    res.status(200).json(enrichedChats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get chats!" });
  }
};

// ✅ GET A SINGLE CHAT WITH MESSAGES
export const getChat = async (req, res) => {
  const tokenUserId = req.user?.id;
  const chatId = req.params.id;

  if (!tokenUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!chat || !chat.userIDs.includes(tokenUserId)) {
      return res.status(404).json({ message: "Chat not found or unauthorized!" });
    }

    if (!chat.seenBy.includes(tokenUserId)) {
      await prisma.chat.update({
        where: { id: chatId },
        data: {
          seenBy: {
            push: tokenUserId,
          },
        },
      });
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get chat!" });
  }
};

// ✅ CREATE A NEW CHAT
export const addChat = async (req, res) => {
  const tokenUserId = req.user?.id;
  const receiverId = req.body.receiverId;

  if (!tokenUserId || !receiverId || receiverId === tokenUserId) {
    return res.status(400).json({ message: "Invalid user info" });
  }

  try {
    const existingChat = await prisma.chat.findFirst({
      where: {
        userIDs: {
          hasEvery: [tokenUserId, receiverId],
        },
      },
    });

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    const newChat = await prisma.chat.create({
      data: {
        userIDs: [tokenUserId, receiverId],
        seenBy: [tokenUserId],
      },
    });

    res.status(201).json(newChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create chat!" });
  }
};

// ✅ MARK CHAT AS READ (SEEN)
export const readChat = async (req, res) => {
  const tokenUserId = req.user?.id;
  const chatId = req.params.id;

  if (!tokenUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat || !chat.userIDs.includes(tokenUserId)) {
      return res.status(403).json({ message: "Not authorized!" });
    }

    if (!chat.seenBy.includes(tokenUserId)) {
      await prisma.chat.update({
        where: { id: chatId },
        data: {
          seenBy: {
            push: tokenUserId,
          },
        },
      });
    }

    res.status(200).json({ message: "Chat marked as read." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark chat as read!" });
  }
};
