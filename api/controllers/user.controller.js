import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

// ✅ GET ALL USERS (supports ?search=username)
export const getUsers = async (req, res) => {
  const { search } = req.query;
  try {
    const users = await prisma.user.findMany({
      where: search ? { username: { contains: search, mode: "insensitive" } } : undefined,
      select: { id: true, username: true, avatar: true, email: true },
    });
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get users!" });
  }
};

// ✅ GET SINGLE USER BY ID
export const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get user!" });
  }
};

// ✅ UPDATE USER PROFILE
export const updateUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.user.id;
  const { password, avatar, ...inputs } = req.body;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  try {
    let updatedPassword = null;
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...inputs,
        ...(updatedPassword && { password: updatedPassword }),
        ...(avatar && { avatar }),
      },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.status(200).json(userWithoutPassword);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user!" });
  }
};

// ✅ DELETE USER
export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.user.id;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  try {
    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user!" });
  }
};

// ✅ SAVE / UNSAVE A POST
export const savePost = async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.user.id;

  try {
    const existing = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: tokenUserId,
          postId,
        },
      },
    });

    if (existing) {
      await prisma.savedPost.delete({ where: { id: existing.id } });
      return res.status(200).json({ message: "Post removed from saved list" });
    } else {
      await prisma.savedPost.create({
        data: { userId: tokenUserId, postId },
      });
      return res.status(200).json({ message: "Post saved" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save/unsave post!" });
  }
};

// ✅ GET USER'S OWN POSTS AND SAVED POSTS
export const profilePosts = async (req, res) => {
  const tokenUserId = req.user?.id;

  try {
    const userPosts = await prisma.post.findMany({
      where: { userId: tokenUserId },
    });

    const saved = await prisma.savedPost.findMany({
      where: { userId: tokenUserId },
      include: { post: true },
    });

    // ✅ Filter out savedPosts that point to deleted posts
    const savedPosts = saved
      .filter((item) => item.post !== null)
      .map((item) => item.post);

    res.status(200).json({ userPosts, savedPosts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get profile posts!" });
  }
};

// ✅ NOTIFICATION COUNT FOR UNSEEN CHATS
export const getNotificationNumber = async (req, res) => {
  const tokenUserId = req.user.id;

  try {
    const count = await prisma.chat.count({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
        NOT: {
          seenBy: {
            hasSome: [tokenUserId],
          },
        },
      },
    });

    res.status(200).json(count);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get notifications!" });
  }
};
