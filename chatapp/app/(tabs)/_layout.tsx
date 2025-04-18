import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { Text, View } from "react-native";
import { useChatStore } from "@/stores/chatStore";

export default function TabLayout() {
    const unreadCount = useChatStore(state  => state.getUnreadChatCount())


    return <Tabs
       screenOptions={({route})  =>({
            headerShown: false, 
          tabBarStyle: {
            height: 80
          } , 
          tabBarLabel: () => null,
          tabBarIconStyle: {
            flex:1
          },
          tabBarLabelStyle: {
            fontSize: 12,
            color: "black"
          },
         tabBarIcon: ({focused, color}) => {
            let iconName;
            let title;
            let IconComponent=Ionicons;

            switch (route.name) {
                case "chats":
                    iconName = "chatbubble"
                    title = "Chats"
                    break;
                case "updates":
                    IconComponent=MaterialCommunityIcons
                    iconName = "update"
                    title = "Updates"
                    break;
                case "communities":
                    iconName = "people"
                    title = "Communities"
                    break;
                case "calls":
                    iconName = "call"
                    title = "Calls"
                    break;
            
                default:
                    title = "Home"
                    iconName = "home"
                    break;
            }

            const iconColor = focused ? "#075E54" : "black";

            return <View className=" w-[100px] h-[58px] items-center justify-center" >
                <View className={`${focused ? "bg-green-200" : "bg-transparent"}  px-5 py-1.5 rounded-full relative`}>
                    <IconComponent size={18}  name={iconName} color={iconColor} />
                    
                    {/* Show Badges */}
                    {route.name == "chats" && unreadCount > 0 && <View className="absolute top-0 -right-0 bg-green-600 rounded-full px-1.5">
                        <Text className="text-white font-bold text-xs">{unreadCount}</Text>
                        </View>}
                    {/* Show Badges */}
                    {route.name == "updates" && <View className="absolute top-0 -right-0 bg-green-600 rounded-full  w-2 h-2 ">
                       
                        </View>}
                </View>
                <View >
                    <Text className={`${focused ? "font-semibold" : "font-normal"} `}>{title}</Text>
                </View>

               
            </View>
         }
       })}
    >
        <Tabs.Screen name="chats"/>
        <Tabs.Screen name="updates"/>
        <Tabs.Screen name="communities" />
        <Tabs.Screen name="calls" />
    </Tabs>
}