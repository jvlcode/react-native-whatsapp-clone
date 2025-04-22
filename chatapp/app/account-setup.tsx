import { useEffect, useState } from "react";
import * as ImagePicker  from "expo-image-picker";
import { View, Text, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, BackHandler } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchUser, saveUser as saveUserAPI, updateUser } from "@/utils/api";
import { saveUser as saveUserStorage } from "@/utils/storage";

export default function AccountSetupScreen() {
    const [name, setName] = useState("");
    const [id, setId] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const {phone} = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const loadUser = async () => {
        try {
            const data = await fetchUser(phone)

            if (data) {
                setName(data.name || "");
                setId(data._id)
                setProfileImage(data.profileImage);
            }
        } catch (error) {
            console.log("No User Found", error)
        }
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1,1],
            quality: 1
        })

        if(!result.canceled) {
            setProfileImage(result.assets[0].uri)
        }
    }

    // Save or Update Profile
    const saveProfile = async () => {
        if(!name.trim()) {
            Alert.alert("Name Required", "Please enter your name before proceeding");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("phone", phone);
            formData.append("name", name);

            if (profileImage && profileImage.startsWith("file://")) {
                formData.append("profileImage", {
                    uri: profileImage,
                    type: "image/jpeg",
                    name: 'profile.jpg'
                })
            }
            setLoading(true);
            let response;

            if(id) {
                response = await updateUser(id, formData)
            }else {
                response = await saveUserAPI(formData);
            }

            if(response) {
                // Success
                await saveUserStorage(response)
                router.push("/chats")
            } else {
                Alert.alert("Error", "Something went wrong while saving your profile")
            }


        } catch (error) {
            console.log("Error saving profile", error.message)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUser();

        const handleBackPress = () => {
            router.replace("/");
            return true; 
        }
        // Listen back button press
        BackHandler.addEventListener("hardwareBackPress",handleBackPress )
    }, [])
    
   if(loading) return  <ActivityIndicator size="large" color="green" className="flex-1 justify-center" />

    return <View className=" flex-1 bg-white items-center p-6">
        <Text className="text-3xl font-bold mb-4">Set up your Profile</Text>

        {/* Profile Image */}
        <TouchableOpacity className="mb-6" onPress={pickImage}>
            {
            profileImage ? 
            <Image  className="w-32 h-32 rounded-full border-2 border-gray-300" source={{ uri: profileImage}} /> :
            <View className="w-32 h-32 bg-gray-200 rounded-full justify-center items-center border-2 border-gray-400">
                <Text>Add Photo</Text>
            </View>
        
        }
        </TouchableOpacity>

        {/* Name Input */}
        <TextInput
            className="border border-gray-300 rounded-lg p-4 w-full text-lg mb-4"
            placeholder="Enter Your Name"
            value={name}
            onChangeText={setName}
        />

        {/* Save Button */}
        <TouchableOpacity className="p-4 w-full rounded-full bg-green-500" onPress={saveProfile}>
            <Text className="text-white text-center font-bold text-lg">Save & Continue</Text>
        </TouchableOpacity>
    </View>
}