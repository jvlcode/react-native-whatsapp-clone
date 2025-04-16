import { getUser } from "@/util/storage";
import { Ionicons, Feather, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, FlatList, Image } from "react-native";
import { TextInput } from "react-native";

export default function ChatsScreen() {

    const router = useRouter()
    const logout = async () => {
        await AsyncStorage.removeItem("user");
        //redirect to welcome screen
        router.push("/")
    }

    const getUserData = async () => {
        const userdata = await getUser();
        console.log(userdata, 'userdata')
    }

    useEffect(() => {
        getUserData();
    })



    return <>
        <Header />

        <ChatList />
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
    return (
        <View className="mx-4 mb-3 flex-row items-center bg-gray-200 rounded-full px-4 py-2">
            <Ionicons name="search" size={20} color="gray" />
            <TextInput className="ml-2 flex-1 text-md" placeholder="Ask Meta AI or Search" placeholderTextColor="gray" />
        </View>
    )
}

function CategoryTabs() {
    const categories = ["All", "Unread", "Favorities", "Groups"];
    const [activeCategory, setActiveCategory] = useState("All")
    {/* Category Tabs */ }
    return (
        <View className="flex-row px-4 mb-3 gap-5">

            {
                categories.map((c, i) => (<TouchableOpacity key={i} onPress={() => setActiveCategory(c)} className={`text-sm ${activeCategory == c ? 'bg-green-200' : "bg-gray-200"} bg-gray-200 px-3 py-1 rounded-full`}><Text >{c}</Text></TouchableOpacity>))
            }

        </View>
    )
}

function ChatList() {
    const dummyChats = [
        {
            _id: 1,
            name: "John Doe",
            message: "Hi how are u?",
            avatar: "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png?20200919003010",
            createdAt: "10:45 AM",
            unread: 2
        },
        {
            _id: 2,
            name: "Jane Smith",
            message:"Let's go for movie",
            avatar: "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png?20200919003010",
            createdAt: "09:20 AM",
            unread: 3
        },
        {
            _id: 3,
            name: "Alice",
            message:"Finished the Assignment?Finished the Assignment?Finished the Assignment?Finished the Assignment?",
            avatar: "https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg?20240301091138",
            createdAt: "02:45 PM",
            unread: 0
        },
        {
            _id: 5,
            name: "John Doe",
            message: "Hi how are u?",
            avatar: "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png?20200919003010",
            createdAt: "10:45 AM",
            unread: 2
        },
        {
            _id: 6,
            name: "Jane Smith",
            message:"Let's go for movie",
            avatar: "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png?20200919003010",
            createdAt: "09:20 AM",
            unread: 3
        },
        {
            _id: 7,
            name: "Alice",
            message:"Finished the Assignment?Finished the Assignment?Finished the Assignment?Finished the Assignment?",
            avatar: "https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg?20240301091138",
            createdAt: "02:45 PM",
            unread: 0
        },
        {
            _id: 8,
            name: "John Doe",
            message: "Hi how are u?",
            avatar: "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png?20200919003010",
            createdAt: "10:45 AM",
            unread: 2
        },
        {
            _id: 9,
            name: "Jane Smith",
            message:"Let's go for movie",
            avatar: "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png?20200919003010",
            createdAt: "09:20 AM",
            unread: 3
        },
        {
            _id: 10,
            name: "Alice",
            message:"Finished the Assignment?Finished the Assignment?Finished the Assignment?Finished the Assignment?",
            avatar: "https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg?20240301091138",
            createdAt: "02:45 PM",
            unread: 0
        },
        {
            _id: 11,
            name: "John Doe",
            message: "Hi how are u?",
            avatar: "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png?20200919003010",
            createdAt: "10:45 AM",
            unread: 2
        },
        {
            _id: 12,
            name: "Jane Smith",
            message:"Let's go for movie",
            avatar: "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png?20200919003010",
            createdAt: "09:20 AM",
            unread: 3
        },
        {
            _id: 13,
            name: "Alice",
            message:"Finished the Assignment?Finished the Assignment?Finished the Assignment?Finished the Assignment?",
            avatar: "https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg?20240301091138",
            createdAt: "02:45 PM",
            unread: 0
        },
    ];

    return  <View className="bg-white"> 
        {dummyChats.length > 0 ? <FlatList
       contentContainerStyle={{
        paddingBottom:100
       }}
        ListHeaderComponent={() => (<>
          <SearchBar />
          <CategoryTabs />
        </>)}

        ListFooterComponent={() => (
            <View className="py-6 items-center justify-center">
                <MaterialCommunityIcons name="lock-outline" size={16} color={"gray"} />
                <Text className="text-gray-500 text-xs mt-2">Your Personal messages are not end to end encrypted</Text>
            </View>
        )}
        data={dummyChats}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
            <TouchableOpacity className="flex-row items-center px-4 py-3">
                <Image className="h-12 w-12 rounded-full" source={{ uri: item.avatar }} />
                <View className="flex-1 ml-4">
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
    />: <EmptyChats/>}
    </View> 
}


function EmptyChats() {
    return (
        <View className="flex-1 items-center justify-center bg-white p-6">
            <MaterialIcons name="chat-bubble-outline" size={100} /> 
            <Text  className="text-xl font-semibold mt-6">Start Chatting on ChatApp</Text>
            <Text  className="text-center text-gray-500 mt-2">Tap the message icon below to start a new conversation</Text>
            <TouchableOpacity className="absolute bottom-6 right-6 bg-green-500 rounded-full p-4">
                <MaterialIcons name="message" size={28}  color={"white"}/>
            </TouchableOpacity>
        </View>
    )
}