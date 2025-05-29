import Constants from "expo-constants";
import { io, Socket } from "socket.io-client";

const SERVER_URL =  Constants.expoConfig?.extra?.BASE_URL; 
// use your LAN IP

let socket : Socket | null  = null;

export const connectSocket = (userId:string, onConnect?:() => void) => {
    console.log("connecting socket...");
    if(socket && socket.connected) {
        console.log("Already connected");
        return
    }

    socket = io(SERVER_URL, {
        auth: {userId},
        transports: ["websocket"],
        forceNew: true,
        reconnection: true
    })

    socket.on("connect", () => {
        console.log("Socket connected", socket.id);
        socket?.emit("join", userId);
        onConnect?.()
    })

    socket.on("connect_error", (err) => {
        console.log("socket connection error:", err)
    })

}

export const getSocket = () : Socket | null => socket