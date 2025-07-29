import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import mongoose from "mongoose";

export const sendMessage = async (req, res) => {
  try {
    const { receiver, chatId, content } = req.body;
    const sender = req.user.id;

    if (!content || (!receiver && !chatId)) {
      return res.status(400).json({
        status: "fail",
        message: "Either receiver or chatId and content are required.",
      });
    }

    let newMessage;

    // 1-to-1 Chat Handling
    if (receiver && !chatId) {
      let oneToOneChat = await Chat.findOne({
        isGroupChat: false,
        participants: { $all: [sender, receiver] },
      });

      if (!oneToOneChat) {
        oneToOneChat = await Chat.create({
          isGroupChat: false,
          participants: [sender, receiver],
        });
      }

      newMessage = await Message.create({
        sender,
        receiver,
        chat: oneToOneChat._id,
        content,
        seen: false,
      });

      oneToOneChat.lastMessage = newMessage._id;
      await oneToOneChat.save();

      global.io.to(receiver).emit("new-message", newMessage);
    }

    // Group Chat
    if (chatId) {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res
          .status(404)
          .json({ status: "fail", message: "Chat not found" });
      }

      newMessage = await Message.create({
        sender,
        chat: chatId,
        content,
        seen: false,
      });

      chat.lastMessage = newMessage._id;
      await chat.save();

      chat.participants.forEach((userId) => {
        if (userId.toString() !== sender.toString()) {
          global.io.to(userId.toString()).emit("new-message", newMessage);
        }
      });
    }

    // Populate before sending
    const fullMessage = await Message.findById(newMessage._id)
      .populate("sender", "username avatar")
      .populate("chat");

    res.status(201).json({
      status: "success",
      data: fullMessage,
    });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ status: "error", message: "Send failed" });
  }
};

// Get conversation messages between logged in user and other user
export const getReceivedMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = new mongoose.Types.ObjectId(req.params.id);

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    })
      .populate("sender", "username email")
      .populate("receiver", "username email")
      .sort({ createdAt: 1 });

    if (!messages || messages.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No conversation history found between users.",
        data: [],
      });
    }

    res.status(200).json({
      status: "success",
      results: messages.length,
      data: messages,
    });
  } catch (err) {
    console.error("Error fetching conversation:", err);
    res.status(400).json({
      status: "error",
      message: "Failed to get messages",
    });
  }
};

export const getMessages = async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    return res.status(400).json({
      status: "fail",
      message: "chatId is required in params",
    });
  }

  try {
    // Get messages for this chat only
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar")
      .sort({ createdAt: 1 });

    if (!messages || messages.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No messages found for this chat",
      });
    }

    res.status(200).json({
      status: "success",
      results: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch messages",
    });
  }
};

// Mark message as seen and emit event
export const markMessageAsSeen = async (req, res) => {
  try {
    const messageId = req.params.id;

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { seen: true },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Emit seen update to sender room
    global.io.to(updatedMessage.sender.toString()).emit("message-seen", {
      messageId,
      seenBy: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Message marked as seen",
      data: updatedMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
