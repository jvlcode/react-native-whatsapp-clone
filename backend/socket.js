import Conversation from "./models/Conversation.js";
import Message from "./models/Message.js";
export default function registerSocketHandlers(io) {
    console.log("Socket Handlers called");

    io.on("connection", (socket) => {
        const userId = socket.handshake.auth.userId || socket.handshake.query.userId;

        console.log("Socket connected", socket.id);

        if(userId) {
            socket.join(userId); //joins their Personal room 
            console.log(`User ${userId} joins a personal room`)
        }

        socket.on("join", (otherUserId) => {
            socket.join(otherUserId);
            console.log(`User ${userId} joined a chat with ${otherUserId} `)
        })

        socket.on("send-message", async (data) => {
            const {otherUserId, text} = data;

            try {
                // Find or create conversation

                let conversation = await Conversation.findOne({
                    participants: { $all: [userId, otherUserId]}
                }).populate("participants");

                let isNew=false;

                if (!conversation) {
                    isNew = true
                    conversation = new Conversation({
                        participants: [userId, otherUserId]
                    })

                    await conversation.populate("participants")
                    
                }
                // save Message
                const message = new Message({
                    conversationId: conversation._id,
                    senderId: userId,
                    text
                })

                await message.save();

                // Update Unread Count
                const currentUnread = conversation.unreadCounts.get(otherUserId.toString()) || 0;
                conversation.unreadCounts.set(otherUserId.toString(), currentUnread + 1)

                // Update Last Activity
                conversation.lastMessage = message;


                await conversation.save();
                conversation.participants = conversation.participants.map((user) => {
                    user.profileImage =   user.profileImage ? `http://192.168.29.32:5000${user.profileImage}`:null
                    return user;
                })
                socket.to(otherUserId).emit("receive-message", {
                    message,
                    conversation,
                    isNew
                })
            } catch (error) {
                console.log("Send Message", error )
            }

            
        })

        socket.on("focus-conversation", async(conversationId) => {
            try {
                const conversation = await Conversation.findById(conversationId);
                if (!conversation) {
                    return
                }
                conversation.unreadCounts.set(userId, 0); 
                await conversation.save();
            } catch (error) {
                console.log("Focus conversation error", error)
            }
        })


    })
}