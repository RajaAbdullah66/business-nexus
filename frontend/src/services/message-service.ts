import { apiClient } from "@/lib/api-client"

export interface Message {
  id: string
  sender: {
    id: string
    name: string
    email: string
    role: string
  }
  receiver: {
    id: string
    name: string
    email: string
    role: string
  }
  content: string
  read: boolean
  createdAt: string
}

export interface Conversation {
  id: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  lastMessage: {
    content: string
    createdAt: string
    sender: string
  }
  unreadCount: number
}

export async function sendMessage(receiverId: string, content: string): Promise<Message> {
  const response = await apiClient<{ data: any }>("/messages", {
    method: "POST",
    body: { receiverId, content },
  })

  return transformMessageData(response.data)
}

export async function getConversations(): Promise<Conversation[]> {
  const response = await apiClient<{ data: any[] }>("/messages/conversations")

  return response.data.map((conversation) => ({
    id: conversation._id,
    user: {
      id: conversation.user._id,
      name: conversation.user.name,
      email: conversation.user.email,
      role: conversation.user.role,
    },
    lastMessage: {
      content: conversation.lastMessage.content,
      createdAt: conversation.lastMessage.createdAt,
      sender: conversation.lastMessage.sender,
    },
    unreadCount: conversation.unreadCount,
  }))
}

export async function getConversation(userId: string): Promise<Message[]> {
  const response = await apiClient<{ data: any[] }>(`/messages/conversations/${userId}`)

  return response.data.map(transformMessageData)
}

// Helper function to transform message data
function transformMessageData(message: any): Message {
  return {
    id: message._id,
    sender: {
      id: message.sender._id,
      name: message.sender.name,
      email: message.sender.email,
      role: message.sender.role,
    },
    receiver: {
      id: message.receiver._id,
      name: message.receiver.name,
      email: message.receiver.email,
      role: message.receiver.role,
    },
    content: message.content,
    read: message.read,
    createdAt: message.createdAt,
  }
}
