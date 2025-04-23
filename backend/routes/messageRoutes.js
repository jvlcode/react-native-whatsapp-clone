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

// 📌 DELETE Multiple Messages by IDs
router.delete("/", async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "messageIds must be a non-empty array." });
        }

        const result = await Message.deleteMany({ _id: { $in: ids } });

        res.json({
            success: true,
            deletedCount: result.deletedCount,
            message: `${result.deletedCount} message(s) deleted.`,
        });
    } catch (error) {
        console.error("❌ Error deleting messages:", error);
        res.status(500).json({ error: error.message });
    }
});


export default router
