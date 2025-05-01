"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useChat } from "@/contexts/chat-context"
import type { Message } from "@/services/message-service"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { markMessagesAsRead } from "@/services/chat-service"

interface ChatWindowProps {
  roomId: string
  recipient: {
    id: string
    name: string
    email?: string
  }
  initialMessages: Message[]
}

export function ChatWindow({ roomId, recipient, initialMessages }: ChatWindowProps) {
  const { user } = useAuth()
  const { sendMessage, addMessageListener, removeMessageListener, typingUsers, setTyping } = useChat()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (
        (message.sender.id === recipient.id && message.receiver.id === user?.id) ||
        (message.sender.id === user?.id && message.receiver.id === recipient.id)
      ) {
        setMessages((prev) => [...prev, message])

        // Mark message as read if it's from the recipient
        if (message.sender.id === recipient.id) {
          markMessagesAsRead(roomId).catch(console.error)
        }
      }
    }

    addMessageListener(handleNewMessage)

    return () => {
      removeMessageListener(handleNewMessage)
    }
  }, [addMessageListener, removeMessageListener, recipient.id, roomId, user?.id])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Mark all messages as read when the chat window is opened
    markMessagesAsRead(roomId).catch(console.error)
  }, [roomId])

  useEffect(() => {
    // Check if recipient is typing
    setIsTyping(typingUsers.get(recipient.id) || false)
  }, [typingUsers, recipient.id])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    sendMessage(inputValue, recipient.id)
    setInputValue("")

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
    setTyping(recipient.id, false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)

    // Handle typing indicator
    if (!typingTimeoutRef.current) {
      setTyping(recipient.id, true)
    } else {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(recipient.id, false)
      typingTimeoutRef.current = null
    }, 2000)
  }

  // Get initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${message.sender.id === user?.id ? "justify-end" : ""}`}
          >
            {message.sender.id !== user?.id && (
              <Avatar>
                <AvatarImage src="/placeholder.svg" alt={message.sender.name} />
                <AvatarFallback>{getInitials(message.sender.name)}</AvatarFallback>
              </Avatar>
            )}
            <div className={`flex flex-col max-w-[70%] ${message.sender.id === user?.id ? "items-end" : ""}`}>
              {message.sender.id !== user?.id && <p className="text-xs text-muted-foreground">{message.sender.name}</p>}
              <div
                className={`px-3 py-2 rounded-lg ${
                  message.sender.id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            {message.sender.id === user?.id && (
              <Avatar>
                <AvatarImage src="/placeholder.svg" alt={message.sender.name} />
                <AvatarFallback>{getInitials(message.sender.name)}</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg" alt={recipient.name} />
              <AvatarFallback>{getInitials(recipient.name)}</AvatarFallback>
            </Avatar>
            <div className="bg-muted px-3 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "200ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "400ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t flex items-center gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage()
            }
          }}
        />
        <Button onClick={handleSendMessage} disabled={!inputValue.trim()} size="icon" className="rounded-full">
          <Send className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  )
}
