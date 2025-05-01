import { get, post } from "@/lib/api-client"
import type { Message } from "@/services/message-service"

export interface ChatRoom {
  id: string
  participants: {
    id: string
    name: string
    email: string
    role: string
  }[]
  lastMessage: {
    content: string
    createdAt: string
    sender: string
  }
  unreadCount: number
}

export const getChatRooms = async (): Promise<ChatRoom[]> => {
  try {
    const response = await get<{ data: ChatRoom[] }>("/chat/rooms")
    return response.data
  } catch (error) {
    console.error("Error fetching chat rooms:", error)
    throw new Error("Failed to fetch chat rooms")
  }
}

export const getChatHistory = async (roomId: string): Promise<Message[]> => {
  try {
    const response = await get<{ data: Message[] }>(`/chat/rooms/${roomId}/messages`)
    return response.data
  } catch (error) {
    console.error("Error fetching chat history:", error)
    throw new Error("Failed to fetch chat history")
  }
}

export const markMessagesAsRead = async (roomId: string): Promise<void> => {
  try {
    await post<void>(`/chat/rooms/${roomId}/read`, {})
  } catch (error) {
    console.error("Error marking messages as read:", error)
    throw new Error("Failed to mark messages as read")
  }
}

export const createChatRoom = async (participantId: string): Promise<ChatRoom> => {
  try {
    const response = await post<{ data: ChatRoom }>("/chat/rooms", { participantId })
    return response.data
  } catch (error) {
    console.error("Error creating chat room:", error)
    throw new Error("Failed to create chat room")
  }
}