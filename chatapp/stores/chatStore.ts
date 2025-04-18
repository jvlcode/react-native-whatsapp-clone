import { create } from "zustand"

interface Chat {
    _id:string,
    participants: [],
    lastMessage: Object,
    unreadCounts: Object
}

interface ChatState {
    chats: Chat[],
    setChats: (chats: Chat[]) => void,
    getUnreadChatCount: () => number,
    focusChat: (chatId:string) => void,
    activeCategory: string,
    setActiveCategory: (category:string) => void,
    filteredChats: Chat[],
    setFilteredChats: (chats:Chat[]) => void,
    query:string,
    setQuery: (query:string) => void,
    isSearchActive: boolean,
    setIsSearchActive: (active: boolean) => void,
    selectionMode: boolean,
    setSelectionMode: (selectionMode:boolean) => void,
    selectedChats: Chat[],
    setSelectedChats: (chats:Chat[]) => void
}

function isUnread(unreadCounts:Object) {
    return Object.values(unreadCounts).some(val => val > 0)
}

export const useChatStore = create<ChatState>((set, get) => ({
    focusChat: (chatId:string) => { 
        const prevChats = get().chats
        const formattedChats = prevChats.map(chat => {
           if ( chat._id == chatId ) {
                return { ...chat, unreadCounts: {}}
           }
           return chat;
        })
        set({chats: formattedChats})
    }, 
    chats: [],
    setChats: (chats:Chat[]) => set({chats}),
    getUnreadChatCount: () => get().chats.filter(c => isUnread(c.unreadCounts)).length,
    activeCategory: "All",
    setActiveCategory: (activeCategory) => set({activeCategory}) ,
    filteredChats: [],
    setFilteredChats: (filteredChats:Chat[]) => set({filteredChats}),
    query: "",
    setQuery: (query) => set({query}),
    isSearchActive: false,
    setIsSearchActive: (isSearchActive) => set({isSearchActive}),
    selectionMode: false,
    setSelectionMode: (selectionMode) => set({selectionMode}),
    selectedChats: [],
    setSelectedChats: (selectedChats) => set({selectedChats})

}))