import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { fetchUsers } from '@/utils/api';
import { DEFAULT_USER_IMAGE, getImageUrl } from '@/utils/image';



export default function SelectContactScreen() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formattedContacts, setFormattedContacts] = useState([]);

    async function loadUsers() {
        const users = await fetchUsers()
        setContacts(users)
    }
    useEffect(() => {
        loadUsers();
    }, []);
    useEffect(() => {
        setFormattedContacts(contacts.map( contact => ({
            ...contact,
            avatar: contact.profileImage ? getImageUrl(contact.profileImage) : DEFAULT_USER_IMAGE
        })) );
    }, [contacts]);

    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-4 pt-4 pb-2">
                <Text className="text-xl font-bold text-gray-900">Select Contact</Text>
                <Text className="text-sm text-gray-500">{contacts.length} contacts</Text>
            </View>

            <FlatList
                data={formattedContacts}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="flex-row items-center px-4 py-3 border-b border-gray-100"
                        onPress={() => router.push(`/chats/${item._id}`)}
                    >
                        <Image
                            source={{ uri: item.avatar }}
                            className="w-12 h-12 rounded-full mr-4"
                        />
                        <View>
                            <Text className="text-base font-medium text-gray-900">{item.name}</Text>
                            <Text className="text-sm text-gray-500">{item.status}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}
