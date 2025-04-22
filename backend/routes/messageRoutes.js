import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

// 📌 GET All Messages in a Conversation
router.get("/:conversationId", async (req, res) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId,
        })
            .sort({ createdAt: 1 }) // oldest to newest

        res.json(messages);
    } catch (error) {
        console.error("❌ Error fetching messages:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router
