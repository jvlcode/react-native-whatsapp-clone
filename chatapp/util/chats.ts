export function getOtherUser(conv, userId) {
    return conv && conv.participants.find(u => u._id !== userId)
}