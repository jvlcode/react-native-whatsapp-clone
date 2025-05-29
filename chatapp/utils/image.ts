import Constants from "expo-constants"
const BASE_URL = Constants.expoConfig?.extra?.BASE_URL; 

export const getImageUrl = (relativePath: string) => {
    if(!relativePath) return DEFAULT_USER_IMAGE;
    const baseUrl = BASE_URL; // or process.env.REACT_APP_API_URL
    return `${baseUrl}${relativePath}`;
};

export const DEFAULT_USER_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png?20200919003010"