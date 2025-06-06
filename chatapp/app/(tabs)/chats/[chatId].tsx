import {
  Feather,
  Ionicons,
  MaterialIcons,
  Entypo,
} from "@expo/vector-icons";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { deleteMessages, fetchMessages } from "@/utils/api";
import { useUserStore } from "@/stores/userStore";
import { useChatStore } from "@/stores/chatStore";
import { connectSocket, getSocket } from "@/utils/socket";
import { getOtherUser } from "@/utils/chats";
import { DEFAULT_USER_IMAGE, getImageUrl } from "@/utils/image";

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams(); // optional for dynamic routing
  const [replyTo, setReplyTo] = useState(null);
  const [otherParticipant, setOtherParticipant] = useState(null);
  const [inputText, setInputText] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);  // Whether we are in selection mode
  const [selectedMessages, setSelectedMessages] = useState([]); // array to hold selected messages
  const [messages, setMessages] = useState([]);
  const [formattedMessages, setFormattedMessages] = useState([]);
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const chat = useChatStore((s) => s.currentChat);
  const flatListRef = useRef<FlatList>(null);

  // if (!chat) return null

  const handleLongPress = (item) => {
    if (!selectionMode) {
      // First time long press, activate selection mode
      setSelectionMode(true);
      setSelectedMessages([item]);  // Select this message initially
    } else {
      // If already in selection mode, toggle selection of the message
      setSelectedMessages((prev) =>
        prev.some((msg) => msg._id === item._id)
          ? prev.filter((msg) => msg._id !== item._id)
          : [...prev, item]
      );
    }
  };

  const handleTapSelect = (item) => {
    if (selectionMode) {
      // If selection mode is on, toggle the selection of the tapped message
      setSelectedMessages((prev) =>
        prev.some((msg) => msg._id === item._id)
          ? prev.filter((msg) => msg._id !== item._id)
          : [...prev, item]
      );
    }
  };

  useEffect(() => {
    setFormattedMessages(messages.map(msg => formatMessage(msg))); // assuming latest last
  }, [messages])

  // Inside your component
  useFocusEffect(() => {

    if (!user?._id || !chat) return;

    if (!otherParticipant)
      setOtherParticipant(getOtherUser(chat, user._id));

    const loadMessages = async () => {
      const messages = await fetchMessages(chatId);
      setMessages(messages); // assuming latest last
    };

    if (chatId) {
      loadMessages();
    }

  });

  useFocusEffect(() => {
    if (!user?._id) return;

    const socket = getSocket();
    if (!socket?.connected) {
      connectSocket(user._id);
      return;
    }

    const handler = ({ message }) => {
      setMessages(state => [...state, message]);
      socket.emit("focus-conversation", chat._id);
      useChatStore.getState().focusChat(chat._id);
      updateLastMessage(message)
    }
    socket.on("receive-message", handler)
    return () => {
      console.log("TEST")
      socket.off("receive-message", handler); // Cleanup when screen is unfocused/unmounted
    };
  })


  function formatMessage(message) {

    return {
      ...message,
      status: "delivered",
      sender: message.senderId == user._id ? "me" : message.senderId["phone"],
      time: new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  }

  const handleSend = () => {
    if (!inputText.trim()) return;
    const socket = getSocket();
    if (!user?._id || !socket) return;


    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      senderId: user._id,
      createdAt: new Date(),
      replyTo: replyTo
        ? {
          id: replyTo._id,
          text: replyTo.text,
          sender: replyTo.sender,
        }
        : null,
    };

    

    // ✅ Emit to backend
    socket.emit("send-message", {
      text: inputText,
      otherUserId:otherParticipant? otherParticipant._id : chatId
    });

    setMessages((prev) => [...prev, newMessage]);
    updateLastMessage(newMessage)
    setInputText("");
    setReplyTo(null);
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === "me";
    return (
      <TouchableOpacity onLongPress={() => handleLongPress(item)} onPress={() => handleTapSelect(item)}>
        <View className="relative">
          <View className={`px-3 py-2 my-1 mx-2 rounded-xl ${isMe ? "bg-[#dcf8c6] self-end" : "bg-white self-start"}  max-w-[80%]`}>
            {item.replyTo && (
              <View className="border-l-4 border-green-500 pl-2 mb-1">
                <Text className="text-gray-500 text-xs font-medium">
                  {item.replyTo.sender === "me" ? "You" : item.replyTo.sender}
                </Text>
                <Text className="text-gray-700 text-sm italic" numberOfLines={1}>
                  {item.replyTo.text}
                </Text>
              </View>
            )}
            <Text className="text-[15px] text-black">{item.text}</Text>
            <View className="flex-row items-center justify-end mt-1">
              <Text className="text-[10px] text-gray-500 mr-1">{item.time}</Text>
              {isMe &&
                (item.status === "delivered" ? (
                  <MaterialIcons name="done-all" size={14} color="#4fc3f7" />
                ) : (
                  <MaterialIcons name="done" size={14} color="gray" />
                ))}
            </View>
          </View>
          {/* Transparent overlay if selected */}
          {selectedMessages.some((msg) => msg._id === item._id) && (
            <View className="absolute top-0 left-0 right-0 bottom-0 bg-blue-500/20 " />
          )}
        </View>
      </TouchableOpacity>

    );
  };

  const resetSelection = () => {
    setSelectedMessages([]);
    setSelectionMode(false)
  }

  function updateLastMessage(lastMessage) {
    const prevChats = useChatStore.getState().chats;
    const updatedChats = prevChats.map((c) => c._id == chat._id ? { ...chat, lastMessage } : chat)
    useChatStore.getState().setChats(updatedChats)
  }

  const deleteSelectedMessages = async () => {
    const selectedIds = selectedMessages.map((el) => el._id);
    const { chat: updatedChat } = await deleteMessages(chat._id, selectedIds)
    setMessages((prev) => prev.filter((msg) => !selectedIds.includes(msg._id)));
    setSelectedMessages([]);

    //update chat
    updateLastMessage(updatedChat.lastMessage);
  }

  return (
    <>
      {/* Hide Tabs */}
      <Stack.Screen options={{ tabBarStyle: { display: "none" } }} />

      <View className="flex-1 bg-[#e5ddd5]">
        {/* Header */}
        {/* Default Header OR Action Bar */}
        {selectedMessages.length > 0 ? (
          // Action Mode Header
          <View className="flex-row items-center px-3 py-2 bg-white">
            <TouchableOpacity onPress={resetSelection}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <View className="flex-1 pl-4">
              <Text className="text-base font-semibold text-black">{selectedMessages.length} selected</Text>
            </View>
            {selectedMessages.length === 1 && (
              <TouchableOpacity
                className="mx-2"
                onPress={() => {
                  setReplyTo(selectedMessages[0]);
                  setSelectedMessages([]);  // Reset selected messages after replying
                }}
              >
                <Ionicons name="return-down-back" size={22} color="black" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="mx-2"
              onPress={deleteSelectedMessages}
            >
              <MaterialIcons name="delete" size={22} color="black" />
            </TouchableOpacity>

            {/* Optional: Info icon */}
            {/* <TouchableOpacity className="mx-2">
        <Feather name="info" size={22} color="black" />
      </TouchableOpacity> */}
          </View>
        ) : (
          // Normal Chat Header
          <View className="flex-row items-center px-2 py-2 bg-white">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Image
              source={{
                uri: otherParticipant?.profileImage ? getImageUrl(otherParticipant?.profileImage) : DEFAULT_USER_IMAGE,
              }}
              className="w-10 h-10 rounded-full mx-2"
            />
            <View className="flex-1">
              <Text className="text-black font-semibold text-[16px]">{otherParticipant && otherParticipant.phone}</Text>
              <Text className="text-gray-500 text-xs">online</Text>
            </View>
            <TouchableOpacity className="mx-1">
              <Ionicons name="videocam" size={22} color="black" />
            </TouchableOpacity>
            <TouchableOpacity className="mx-1">
              <Ionicons name="call" size={22} color="black" />
            </TouchableOpacity>
            <TouchableOpacity className="mx-1">
              <Feather name="more-vertical" size={22} color="black" />
            </TouchableOpacity>
          </View>
        )}


        {/* Messages */}
        <FlatList
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ref={flatListRef}
          data={formattedMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'flex-end', // Push messages to the bottom
            paddingBottom: 10, // Leave space for input
            paddingHorizontal: 10,
          }}
        />

        {replyTo && (
          <View className="flex-row items-center bg-white mx-4 px-3 py-2 rounded-t-xl border-l-4 border-green-600">
            <View className="flex-1">
              <Text className="text-xs text-gray-500">
                Replying to {replyTo.sender === "me" ? "You" : "Other"}
              </Text>
              <Text className="text-sm text-black" numberOfLines={1}>
                {replyTo.text}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Ionicons name="close" size={20} color="gray" />
            </TouchableOpacity>
          </View>
        )}

        {/* Message Input */}
        <View className="flex-row ">

          <View className="flex-1 justify-between flex-row bg-white items-center rounded-full my-3">
            <View className="flex-row flex-1 items-center p-2 gap-2">
              <TouchableOpacity >
                <Entypo name="emoji-happy" size={24} color="gray" />
              </TouchableOpacity>
              <TextInput
                placeholder="Message"
                placeholderTextColor="gray"
                className="outline-none text-lg w-full"
                value={inputText}
                onChangeText={setInputText}
              />

            </View>
            <TouchableOpacity className="p-2">
              <Feather name="paperclip" size={24} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2">
              <Ionicons name="camera-outline" size={24} color="gray" />
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center">
            {!inputText.trim() ? <TouchableOpacity className="p-3 bg-green-600 rounded-full ml-1">
              <Ionicons name="mic" size={22} color="white" />
            </TouchableOpacity>
              : <TouchableOpacity className="p-3 bg-green-600 rounded-full ml-1" onPress={handleSend}>
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>}
          </View>
        </View>
      </View>
    </>
  );
}