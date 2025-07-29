import Chats from "../models/chat.model.js";
import message from "../models/message.model.js";
import mongoose from "mongoose";

// Create chat (one-to-one or group)
export const createChats = async (req, res) => {
  try {
    const { participants, chatName, isGroupChat } = req.body;
    const loggedInUserId = req.user.id;

    if (!participants || participants.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "Participants are required",
      });
    }

    if (!isGroupChat) {
      if (participants.length !== 1) {
        return res.status(400).json({
          status: "fail",
          message: "One-to-one chat must have exactly one other participant",
        });
      }

      // Check if chat already exists
      const existingChat = await Chats.findOne({
        isGroupChat: false,
        participants: {
          $all: [loggedInUserId, participants[0]],
          $size: 2,
        },
      })
        .populate("participants", "username email avatar")
        .populate({
          path: "lastMessage",
          populate: { path: "sender", select: "username email avatar" },
        });

      if (existingChat) {
        return res.status(200).json({
          status: "success",
          chat: existingChat,
        });
      }

      // Create new one-to-one chat
      const newChat = await Chats.create({
        chatName: null,
        isGroupChat: false,
        participants: [loggedInUserId, participants[0]],
      });

      const newFullChat = await Chats.findById(newChat._id)
        .populate("participants", "username email avatar")
        .populate({
          path: "lastMessage",
          populate: { path: "sender", select: "username email avatar" },
        });

      // Emit chat creation event to participants
      [loggedInUserId, participants[0]].forEach((userId) => {
        global.io.to(userId).emit("chat:created", newFullChat);
      });

      return res.status(201).json({
        status: "success",
        chat: newFullChat,
      });
    }

    if (isGroupChat) {
      if (!chatName) {
        return res.status(400).json({
          status: "fail",
          message: "Group chat must have a name",
        });
      }

      if (!participants.includes(loggedInUserId)) {
        participants.push(loggedInUserId);
      }

      const newGroupChat = await Chats.create({
        chatName,
        isGroupChat: true,
        participants,
        groupAdmin: loggedInUserId,
      });

      const fullGroupChat = await Chats.findById(newGroupChat._id)
        .populate("participants", "username email avatar")
        .populate("groupAdmin", "username email avatar")
        .populate({
          path: "lastMessage",
          populate: { path: "sender", select: "username email avatar" },
        });

      participants.forEach((userId) => {
        global.io.to(userId).emit("chat:created", fullGroupChat);
      });

      return res.status(201).json({
        status: "success",
        chat: fullGroupChat,
      });
    }
  } catch (error) {
    console.error("Create chat error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

// Get all chats for logged in user with populated fields
export const getUserChats = async (req, res) => {
  try {
    const chats = await Chats.find({
      participants: { $in: [req.user.id] },
    })
      .populate("participants", "username email avatar")
      .populate("groupAdmin", "username email avatar")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "username email avatar",
        },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({ status: "success", data: chats });
  } catch (error) {
    console.error("Get user chats error:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// Rename group chat
export const renameGroup = async (req, res) => {
  const { chatId, newName } = req.body;
  try {
    const updatedChat = await Chats.findByIdAndUpdate(
      chatId,
      { chatName: newName },
      { new: true }
    )
      .populate("participants", "username email avatar")
      .populate("groupAdmin", "username email avatar")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "username email avatar" },
      });

    if (!updatedChat) {
      return res
        .status(404)
        .json({ status: "fail", message: "Chat not found" });
    }

    updatedChat.participants.forEach((user) => {
      global.io.to(user._id.toString()).emit("chat:renamed", updatedChat);
    });

    res.status(200).json({ status: "success", chat: updatedChat });
  } catch (error) {
    console.error("Rename group error:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// Middleware: Only group admin allowed
export const checkAdminOnly = async (req, res, next) => {
  try {
    const { chatId } = req.body;
    const chat = await Chats.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    if (chat.groupAdmin.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only group admin can perform this action." });
    }

    req.chat = chat;
    next();
  } catch (error) {
    console.error("Admin check failed:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add user to group chat
export const addUserToGroup = async (req, res) => {
  try {
    const { userId } = req.body;
    const chatgroup = req.chat;

    if (!chatgroup.isGroupChat) {
      return res
        .status(400)
        .json({ status: "fail", message: "Not a chat group" });
    }

    if (chatgroup.participants.includes(userId)) {
      return res
        .status(400)
        .json({ status: "fail", message: "User already in group" });
    }

    chatgroup.participants.push(userId);
    await chatgroup.save();

    chatgroup.participants.forEach((participant) => {
      global.io.to(participant.toString()).emit("group:user-added", {
        chatId: chatgroup._id,
        userId,
      });
    });

    res.status(200).json({
      status: "success",
      message: "User added to group",
      data: chatgroup,
    });
  } catch (error) {
    console.error("Add user to group error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User leaves group chat
export const userleaveGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.body;
    const chat = await Chats.findById(chatId);

    if (!chat)
      return res
        .status(404)
        .json({ status: "fail", message: "Chat not found" });
    if (!chat.isGroupChat)
      return res
        .status(400)
        .json({ status: "fail", message: "Not a group chat" });
    if (!chat.participants.includes(userId))
      return res.status(400).json({
        status: "fail",
        message: "You are not a member of this group",
      });

    chat.participants = chat.participants.filter(
      (participantId) => participantId.toString() !== userId
    );

    if (chat.groupAdmin.toString() === userId && chat.participants.length > 0) {
      chat.groupAdmin = chat.participants[0];
    }

    await chat.save();

    chat.participants.forEach((participant) => {
      global.io.to(participant.toString()).emit("group:user-left", {
        chatId: chat._id,
        userId,
      });
    });

    res.status(200).json({
      status: "success",
      message: "You have left the group",
      chat,
    });
  } catch (error) {
    console.error("Leave group error:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// Remove group if only one participant left
export const groupRemove = async (req, res) => {
  try {
    const chat = req.chat;

    if (!chat) {
      return res.status(400).json({
        status: "fail",
        message: "Chat object not found in request",
      });
    }

    if (chat.participants.length === 1) {
      const notifyUser = chat.participants[0];
      await chat.deleteOne();

      global.io.to(notifyUser.toString()).emit("group:deleted", {
        chatId: chat._id,
      });

      return res.status(200).json({
        status: "success",
        message: "Group deleted because it has only one participant",
      });
    } else {
      return res.status(400).json({
        status: "fail",
        message: "Group has more than one participant, cannot delete",
      });
    }
  } catch (error) {
    console.error("Remove group error:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};
