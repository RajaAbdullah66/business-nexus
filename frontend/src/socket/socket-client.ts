import { io, type Socket } from "socket.io-client"
import { API_BASE_URL } from "@/lib/config"

// Use API_BASE_URL instead of API_URL, removing the '/api' suffix if present
const SOCKET_URL = API_BASE_URL.replace('/api', '')

interface ServerToClientEvents {
  message: (data: {
    id: string
    content: string
    sender: {
      id: string
      name: string
    }
    receiver: {
      id: string
      name: string
    }
    createdAt: string
  }) => void
  typing: (data: { userId: string; isTyping: boolean }) => void
  online: (data: { userId: string; isOnline: boolean }) => void
}

interface ClientToServerEvents {
  message: (data: { content: string; receiverId: string }) => void
  typing: (data: { receiverId: string; isTyping: boolean }) => void
  join: (userId: string) => void
  leave: () => void
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

export const initializeSocket = (userId: string): Socket<ServerToClientEvents, ClientToServerEvents> => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: {
        userId,
      },
      transports: ["websocket"],
      autoConnect: true,
    })

    socket.on("connect", () => {
      console.log("Socket connected")
      socket?.emit("join", userId)
    })

    socket.on("disconnect", () => {
      console.log("Socket disconnected")
    })

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
    })
  }

  return socket
}

export const getSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> | null => {
  return socket
}

export const disconnectSocket = (): void => {
  if (socket) {
    socket.emit("leave")
    socket.disconnect()
    socket = null
  }
}