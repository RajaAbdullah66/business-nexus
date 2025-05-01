"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useChat } from "@/contexts/chat-context"

interface ChatContactProps {
  contact: {
    id: string
    name: string
    lastMessage?: {
      content: string
      createdAt: string
      sender: string
    }
    unreadCount?: number
  }
  isSelected: boolean
  onClick: () => void
}

export function ChatContact({ contact, isSelected, onClick }: ChatContactProps) {
  const { onlineUsers } = useChat()
  const isOnline = onlineUsers.has(contact.id)

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
    <div
      className={`flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer relative ${
        isSelected ? "bg-muted" : ""
      }`}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar>
          <AvatarImage src="/placeholder.svg" alt={contact.name} />
          <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
        </Avatar>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium truncate">{contact.name}</h3>
          {contact.lastMessage && (
            <span className="text-xs text-muted-foreground">
              {new Date(contact.lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
        {contact.lastMessage && <p className="text-sm text-muted-foreground truncate">{contact.lastMessage.content}</p>}
      </div>
      {(contact.unreadCount ?? 0) > 0 && (
        <Badge variant="success" className="ml-2">
          {contact.unreadCount}
        </Badge>
      )}
    </div>
  )
}
