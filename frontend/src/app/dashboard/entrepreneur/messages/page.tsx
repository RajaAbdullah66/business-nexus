"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import ProtectedRoute from "@/components/protected-route"
import { getConversations, getConversation, type Conversation, type Message } from "@/services/message-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ChatProvider } from "@/contexts/chat-context"
import { ChatWindow } from "@/components/chat/chat-window"
import { ChatContact } from "@/components/chat/chat-contact"

export default function EntrepreneurMessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

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

  // Get initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const selectedUser = conversations.find((conv) => conv.user.id === selectedConversation)?.user

  return (
    <ProtectedRoute allowedRoles={["entrepreneur"]}>
      <DashboardLayout userRole="entrepreneur">
        <ChatProvider>
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
                        <ChatContact
                          key={conversation.id}
                          contact={{
                            id: conversation.user.id,
                            name: conversation.user.name,
                            lastMessage: conversation.lastMessage,
                            unreadCount: conversation.unreadCount,
                          }}
                          isSelected={selectedConversation === conversation.user.id}
                          onClick={() => setSelectedConversation(conversation.user.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                      <p className="text-muted-foreground">No conversations yet</p>
                      <p className="text-sm text-muted-foreground">Connect with investors to start messaging</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Messages */}
              <Card className="md:col-span-2 flex flex-col h-[calc(80vh-8rem)]">
                {selectedConversation && selectedUser ? (
                  <ChatWindow
                    roomId={conversations.find((conv) => conv.user.id === selectedConversation)?.id || ""}
                    recipient={selectedUser}
                    initialMessages={messages}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                    <p className="text-muted-foreground">Select a conversation to start messaging</p>
                    <p className="text-sm text-muted-foreground">Click on a conversation from the list</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </ChatProvider>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
