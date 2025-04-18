import axios from 'axios'
import Constants from "expo-constants"

const API_URL = Constants.expoConfig?.extra?.API_URL || "http://192.168.29.32:5000/api"; 

export const fetchUser = async (phone) => {
    try {
        const response = await axios.get(`${API_URL}/users/${phone}`)
        return response.data
    } catch (error) {
        console.log("fetchUser API error", error)
    }
}

export const updateUser = async (id, formData) => {
    try {
        const response = await axios.put(`${API_URL}/users/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data"}
        })
        return response.data
    } catch (error) {
        console.log("updateUser API error",error)
    }
}

export const saveUser = async (formData) => {
    try {
        const response = await axios.post(`${API_URL}/users`, formData, {
            headers: { "Content-Type": "multipart/form-data"}
        })
        return response.data
    } catch (error) {
        console.log("saveUser API error",error)
    }
}

export const fetchChats = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/conversations/${userId}`)
        return response.data
    } catch (error) {
        console.log(error,'response_data')
        console.log("fetchUser API error", error)
    }
}

export const deleteChat = async (ids) => {
    try {
        const response = await axios.delete(`${API_URL}/conversations`, {
            data: { ids }
        })
        return response.data
    } catch (error) {
        console.log(error,'response_data')
        console.log("deleteChat  API error", error)
    }
}