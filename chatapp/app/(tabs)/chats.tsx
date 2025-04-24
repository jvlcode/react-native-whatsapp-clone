import { useChatStore } from "@/stores/chatStore";
import { deleteChat, fetchChats } from "@/utils/api";
import { getOtherUser } from "@/utils/chats";
import { connectSocket, getSocket } from "@/utils/socket";
import { getUser } from "@/utils/storage";
import { Ionicons, Feather, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, FlatList, Image } from "react-native";
import { TextInput } from "react-native";
import { showErrorToast } from '@/utils/toast';
import { DEFAULT_USER_IMAGE, getImageUrl } from "@/utils/image";




export default function ChatsScreen() {
    // const [chats, setChats] = useState([]);
    const setChats = useChatStore(state => state.setChats);
    const chats = useChatStore(state => state.chats);
    const {
        activeCategory,
        setActiveCategory,
        filteredChats,
        setFilteredChats,
        query,
        setQuery,
        isSearchActive,
        setIsSearchActive,
        selectionMode
    } = useChatStore(state => state);


    // const [activeCategory, setActiveCategory] = useState("All")
    // const [filteredChats, setFilteredChats] = useState([])
    // const [query, setQuery] = useState("");
    // const [isSearchActive, setIsSearchActive] = useState(false);

    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const router = useRouter()
    const logout = async () => {
        await AsyncStorage.removeItem("user");
        //redirect to welcome screen
        router.push("/")
    }

    const getUserData = async () => {
        const userdata = await getUser();
        setUser(userdata);
    }

    useEffect(() => {
        getUserData();
    }, [])

    const loadChats = async () => {
        try {
            const response_data = await fetchChats(user._id);
            setChats(response_data);
        } catch (error) {
            setError(error.message);
            showErrorToast("Unable to Fetch Chats. Please Try again.");

        }
    }

    const applyFilters = () => {
        if (!user?._id) return;

        let filtered = Array.isArray(chats) ? [...chats] : []; //Clone

        if (activeCategory == "Unread") {
            filtered = filtered.filter(chat => Object.values(chat.unreadCounts).reduce((acc, val) => (acc + val), 0) > 0)
        }



        if (query.trim()) {
            filtered = filtered.filter(chat => getOtherUser(chat, user._id)?.phone.includes(query))
        }

        setFilteredChats(filtered);
    }

    useEffect(() => {
        if (!user?._id) return;

        loadChats();

        if (getSocket()?.connected) {
            return;
        }

        connectSocket(user._id, () => {
            const socket = getSocket();
            if (!socket) return;

            socket.on("receive-message", ({ message, conversation, isNew }) => {
                const prevChats = useChatStore.getState().chats || [];
                const exists = prevChats.some(c => c._id == conversation._id)

                if (exists) {
                    const formattedChats = prevChats.map(chat => {
                        if (chat._id == conversation._id) {
                            return conversation;
                        }
                        return chat;
                    })
                    useChatStore.getState().setChats(formattedChats)
                } else {
                    useChatStore.getState().setChats([...chats, conversation])
                }
            })
        })

    }, [user]);

    useEffect(() => {
        applyFilters();
    }, [chats, activeCategory, query])

    const onCancel = () => {
        setIsSearchActive(false)
        setQuery("")
    }

    const onSearch = (text) => {
        setQuery(text)
    }



    return <>
        {selectionMode ? <ChatActionBar /> : (isSearchActive ? <ActiveSearchBar onSearch={onSearch} onCancel={onCancel} /> : <Header />)}
        <ChatList user={user} />
        {error && <Text style={{ color: 'red' }}>{error}</Text>}  {/* Display the error message */}
    </>
}

function Header() {
    return (
        <View className="flex-row justify-between bg-white pt-10 items-center ">
            <Text className="text-2xl font-bold text-green-700 px-4">ChatApp</Text>
            <View className="flex-row gap-5 mb-4">
                <TouchableOpacity>
                    <Ionicons size={24} name="qr-code-outline" />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Feather size={24} name="more-vertical" />
                </TouchableOpacity>

            </View>
        </View>
    )
}

function SearchBar() {
    {/* Search Bar */ }
    const { setIsSearchActive, isSearchActive } = useChatStore(state => state);


    if (isSearchActive) return;
    return (
        <View className="mx-4 mb-3 flex-row items-center bg-gray-200 rounded-full px-4 py-2">
            <Ionicons name="search" size={20} color="gray" />
            <TextInput onPress={() => setIsSearchActive(true)} className="ml-2 flex-1 text-md" placeholder="Ask Meta AI or Search" placeholderTextColor="gray" />
        </View>
    )
}

function CategoryTabs() {
    const { activeCategory, setActiveCategory } = useChatStore(state => state);

    const categories = ["All", "Unread", "Favorities", "Groups"];

    {/* Category Tabs */ }
    return (
        <View className="flex-row px-4 mb-3 gap-5">

            {
                categories.map((c, i) => (<TouchableOpacity key={i} onPress={() => setActiveCategory(c)} className={`text-sm ${activeCategory == c ? 'bg-green-200' : "bg-gray-200"} bg-gray-200 px-3 py-1 rounded-full`}><Text >{c}</Text></TouchableOpacity>))
            }

        </View>
    )
}

function ChatList({ user }) {
    const { filteredChats, setSelectionMode, selectionMode, selectedChats, setSelectedChats } = useChatStore(state => state)

    useEffect(() => {
        if (!(selectedChats.length > 0)) {
            setSelectionMode(false)
        }
    }, [selectedChats])



    if (!user) return;

    const focusConversation = (chat, focused) => {
        const socket = getSocket();
        if (!socket || !user._id) return;

        if (focused) {
            socket.emit("focus-conversation", chat._id);
            useChatStore.getState().focusChat(chat._id);
        }

        router.push(`/chats/${chat._id}`)
    }

    const formatChat = (conv) => {
        if (!conv || !user) return;
        const otherUser = getOtherUser(conv, user._id)

        return {
            ...conv,
            name: otherUser?.phone,
            message: conv?.lastMessage?.text,
            unread: conv?.unreadCounts[user._id],
            createdAt: new Date(conv?.lastMessage?.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            }),
            avatar: otherUser?.profileImage ? getImageUrl(otherUser?.profileImage) : DEFAULT_USER_IMAGE
        }
    }

    const formattedData = filteredChats.map(chat => formatChat(chat))

    function selectChat(chat) {
        if (!selectionMode) {
            setSelectionMode(true)
        }

        const prevChats = selectedChats;
        const exists = prevChats.some(c => c._id == chat._id);
        if (!exists) {
            setSelectedChats([...prevChats, chat])
        }
    }

    function tapChat(chat) {
        if (selectionMode) {
            const prevChats = selectedChats;
            const exists = prevChats.some(c => c._id == chat._id);
            if (exists) {
                const filteredSelectedChats = prevChats.filter(c => c._id !== chat._id);
                setSelectedChats(filteredSelectedChats)
            } else {
                setSelectedChats([...prevChats, chat])
            }
        } else {
            focusConversation(chat, true)
        }
    }

    function isChatSelected(chat) {
        return selectedChats.some(c => c._id == chat._id);
    }





    return <View className="bg-white flex-1">
        {formattedData.length > 0 ? <FlatList
            contentContainerStyle={{
                paddingBottom: 100
            }}
            ListHeaderComponent={() => (<>
                <SearchBar />
                <CategoryTabs />
            </>)}

            ListFooterComponent={() => (
                <View className="py-6 items-center justify-center">
                    <MaterialCommunityIcons name="lock-outline" size={16} color={"gray"} />
                    <Text className="text-gray-500 text-xs mt-">Your Personal messages are not end to end encrypted</Text>
                </View>
            )}
            data={formattedData}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => (
                <TouchableOpacity
                    onLongPress={() => selectChat(item)}
                    onPress={() => tapChat(item)}
                    className={`flex-row items-center px-4 py-3 ${selectionMode && isChatSelected(item) ? 'bg-green-200' : ""}`}>
                    <Image className="h-12 w-12 rounded-full" source={{ uri: item.avatar }} />
                    <View className="flex-1 ml-4 ">
                        <View className="flex-row justify-between">
                            <Text className="text-lg font-semibold text-black ">{item.name}</Text>
                            <Text className="text-xs text-gray-500">{item.createdAt}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text numberOfLines={1} className="text-md text-gray-500 flex-1">{item.message}</Text>
                            {item.unread > 0 && <View className="bg-green-600 min-w-[20px] rounded-full items-center justify-center px-2 ml-2">
                                <Text className="text-white text-xs font-bold">{item.unread}</Text>
                            </View>}
                        </View>
                    </View>
                </TouchableOpacity>
            )}
        /> : <>
            <SearchBar />
            <CategoryTabs />
            <EmptyChats />
        </>}
    </View>
}


function EmptyChats() {
    return (
        <View className=" flex-1 items-center justify-center bg-white p-6">
            <MaterialIcons name="chat-bubble-outline" size={100} />
            <Text className="text-xl font-semibold mt-6">Start Chatting on ChatApp</Text>
            <Text className="text-center text-gray-500 mt-2">Tap the message icon below to start a new conversation</Text>
            <TouchableOpacity className="absolute bottom-6 right-6 bg-green-500 rounded-full p-4">
                <MaterialIcons name="message" size={28} color={"white"} />
            </TouchableOpacity>
        </View>
    )
}

function ActiveSearchBar({ onSearch, onCancel }) {
    return <View className="bg-white">
        <View className="flex-row items-center bg-gray-200 rounded-full px-4 mx-4 py-2 my-3">
            <TouchableOpacity onPress={() => onCancel()}>
                <Ionicons name="arrow-back" size={24} color="gray" />
            </TouchableOpacity>
            <TextInput
                onChangeText={text => onSearch(text)}
                autoFocus
                placeholder="Search..."
                className="ml-3 flex-1 text-base text-black outline-none"
            />
        </View>
    </View>

}

function ChatActionBar() {

    const { selectionMode, setSelectionMode, setSelectedChats, selectedChats, chats, setChats } = useChatStore(state => state);

    const deleteSelectedChats = async () => {
        const ids = selectedChats.map(chat => chat._id);
        await deleteChat(ids);
        setSelectedChats([]);
        setSelectionMode(false);
        const filteredChats = chats.filter(c => !ids.includes(c._id));
        setChats(filteredChats)
    }
    return <View className="bg-white">
        <View className="flex-row justify-between p-3 bg-gray-200 mb-4">
            <View>
                <TouchableOpacity onPress={() => { setSelectionMode(false); setSelectedChats([]); }}  >
                    <Ionicons name="arrow-back" size={24} />
                </TouchableOpacity>
            </View>
            <View className="flex-row gap-3">
                <TouchableOpacity onPress={deleteSelectedChats} >
                    <Ionicons name="trash-outline" size={24} />
                </TouchableOpacity>
                <TouchableOpacity >
                    <Feather size={24} name="more-vertical" />
                </TouchableOpacity>
            </View>
        </View>
    </View>
}