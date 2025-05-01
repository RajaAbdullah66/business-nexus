"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { initializeSocket, getSocket, disconnectSocket } from "@/socket/socket-client"
import type { Message } from "@/services/message-service"

interface ChatContextType {
  onlineUsers: Set<string>
  typingUsers: Map<string, boolean>
  sendMessage: (content: string, receiverId: string) => void
  setTyping: (receiverId: string, isTyping: boolean) => void
  addMessageListener: (callback: (message: Message) => void) => void
  removeMessageListener: (callback: (message: Message) => void) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map())
  const [messageListeners, setMessageListeners] = useState<((message: Message) => void)[]>([])

  useEffect(() => {
    if (user?.id) {
      const socket = initializeSocket(user.id)

      socket.on("online", ({ userId, isOnline }) => {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev)
          if (isOnline) {
            newSet.add(userId)
          } else {
            newSet.delete(userId)
          }
          return newSet
        })
      })

      socket.on("typing", ({ userId, isTyping }) => {
        setTypingUsers((prev) => {
          const newMap = new Map(prev)
          newMap.set(userId, isTyping)
          return newMap
        })
      })

      socket.on("message", (message) => {
        messageListeners.forEach((listener) => listener(message as Message))
      })

      return () => {
        disconnectSocket()
      }
    }
  }, [user?.id, messageListeners])

  const sendMessage = (content: string, receiverId: string) => {
    const socket = getSocket()
    if (socket) {
      socket.emit("message", { content, receiverId })
    }
  }

  const setTyping = (receiverId: string, isTyping: boolean) => {
    const socket = getSocket()
    if (socket) {
      socket.emit("typing", { receiverId, isTyping })
    }
  }

  const addMessageListener = (callback: (message: Message) => void) => {
    setMessageListeners((prev) => [...prev, callback])
  }

  const removeMessageListener = (callback: (message: Message) => void) => {
    setMessageListeners((prev) => prev.filter((listener) => listener !== callback))
  }

  return (
    <ChatContext.Provider
      value={{
        onlineUsers,
        typingUsers,
        sendMessage,
        setTyping,
        addMessageListener,
        removeMessageListener,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
