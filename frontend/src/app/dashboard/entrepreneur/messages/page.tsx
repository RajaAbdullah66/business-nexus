"use client"

import { useEffect, useState, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import ProtectedRoute from "@/components/protected-route"
import {
  getConversations,
  getConversation,
  sendMessage,
  type Conversation,
  type Message,
} from "@/services/message-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function EntrepreneurMessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations()
        setConversations(data)
        
        // Select the first conversation by default if available
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0].user.id)
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error)
        setError("Failed to load conversations")
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
    
    // Poll for new messages every 10 seconds
    const intervalId = setInterval(fetchConversations, 10000)
    
    return () => clearInterval(intervalId)
  }, [selectedConversation])

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return
      
      try {
        const data = await getConversation(selectedConversation)
        setMessages(data)
      } catch (error) {
        console.error("Failed to fetch messages:", error)
        setError("Failed to load messages")
      }
    }

    fetchMessages()
  }, [selectedConversation])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return
    
    try {
      const message = await sendMessage(selectedConversation, newMessage)
      setMessages([...messages, message])
      setNewMessage("")
      
      // Update the conversation list
      const updatedConversations = conversations.map(conv => {
        if (conv.user.id === selectedConversation) {
          return {
            ...conv,
            lastMessage: {
              content: newMessage,
              createdAt: new Date().toISOString(),
              sender: user?.id || "",
            },
          }
        }
        return conv
      })
      
      setConversations(updatedConversations)
    } catch (error) {
      console.error("Failed to send message:", error)
      setError("Failed to send message")
    }
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
    <ProtectedRoute allowedRoles={["entrepreneur"]}>
      <DashboardLayout userRole="entrepreneur">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground">Communicate with your connections</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conversations List */}
            <Card className="md:col-span-1 overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Conversations</h2>
              </div>
              <div className="h-[calc(80vh-13rem)] overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 space-y-4">
                    {Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="h-10 w-10 animate-pulse rounded-full bg-muted"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                            <div className="h-3 w-32 animate-pulse rounded bg-muted"></div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : conversations.length > 0 ? (
                  <div>
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer ${
                          selectedConversation === conversation.user.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedConversation(conversation.user.id)}
                      >
                        <Avatar>
                          <AvatarImage src="/placeholder.svg" alt={conversation.user.name} />
                          <AvatarFallback>{getInitials(conversation.user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium truncate">{conversation.user.name}</h3>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="success" className="ml-2">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                    <p className="text-muted-foreground">No conversations yet</p>
                    <p className="text-sm text-muted-foreground">
                      Connect with investors to start messaging
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Messages */}
            <Card className="md:col-span-2 flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b">
                    {conversations.find((c) => c.user.id === selectedConversation) && (
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src="/placeholder.svg"
                            alt={
                              conversations.find((c) => c.user.id === selectedConversation)?.user.name ||
                              ""
                            }
                          />
                          <AvatarFallback>
                            {getInitials(
                              conversations.find((c) => c.user.id === selectedConversation)?.user.name || ""
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {conversations.find((c) => c.user.id === selectedConversation)?.user.name}
                          </h3>
                          <p className="text\
