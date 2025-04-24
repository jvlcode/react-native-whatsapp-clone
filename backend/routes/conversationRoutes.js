import express from "express";
import Conversation from "../models/Conversation.js";
import mongoose from "mongoose";

const router = express.Router();

// GET All Conversation for a user
// /conversations/:userId
router.get("/:userId", async (req, res) => {
    try {
        let conversations  = await Conversation.find({
            participants: req.params.userId
        })
        .populate("participants")
        .populate("lastMessage")
        .sort({updateAt:-1})

        // conversations = conversations.map( conv => {
        //     conv.participants.map((user) => {
        //         user.profileImage =   user.profileImage ? `${req.protocol}://${req.get('host')}${user.profileImage}`:null
        //         return user;
        //     })
        //     return conv;
        // })

        


        res.json(conversations);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

// DELETE /conversations
router.delete("/", async (req, res) => {
    const { ids } = req.body
    if(!Array.isArray(ids)) {
        return  res.status(400).json({message: "IDs should be array"});
    }

    try {
        const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
        await Conversation.deleteMany({ _id: { $in : objectIds }})
        res.status(200).json({message: "Conversations Deleted Successfully"});
        
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

export default router;