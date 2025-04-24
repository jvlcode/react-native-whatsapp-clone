import Constants from "expo-constants"
const BASE_URL = Constants.expoConfig?.extra?.BASE_URL; 

export const getImageUrl = (relativePath: string) => {
    console.log(BASE_URL,'BASE_URL')
    const baseUrl = BASE_URL; // or process.env.REACT_APP_API_URL
    return `${baseUrl}${relativePath}`;
};