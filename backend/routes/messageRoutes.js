import express from "express";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

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
router.delete("/:conversationId", async (req, res) => {
    try {
        const { ids } = req.body;
        const { conversationId } = req.params;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "messageIds must be a non-empty array." });
        }

        const result = await Message.deleteMany({ _id: { $in: ids } });

        const latestMessage = await Message.findOne({ conversationId })
                .sort({ createdAt: -1 }); // assuming messages have createdAt
       
     
        if(latestMessage) {
            await Conversation.updateOne({ _id: conversationId }, {lastMessage: latestMessage._id});
        } 
        let chat = await Conversation.findById(conversationId).populate("lastMessage").populate("participants"); 


        res.json({
            success: true,
            chat,
            message: `${result.deletedCount} message(s) deleted.`,
        });
    } catch (error) {
        console.error("❌ Error deleting messages:", error);
        res.status(500).json({ error: error.message });
    }
});


export default router
