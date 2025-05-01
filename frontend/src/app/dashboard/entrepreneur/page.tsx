"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Check, MessageSquare, Users, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { getConnectionRequests, updateConnectionStatus, type ConnectionRequest } from "@/services/connection-service"
import { createChatRoom } from "@/services/chat-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function EntrepreneurDashboard() {
  const router = useRouter()
  const [requests, setRequests] = useState<ConnectionRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getConnectionRequests()
        // Filter only pending requests for the dashboard
        setRequests(data.received.filter((req) => req.status === "pending"))
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch requests:", error)
        setError("Failed to load connection requests")
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [])

  const handleAccept = async (requestId: string) => {
    try {
      await updateConnectionStatus(requestId, "accepted")

      // Update local state
      setRequests(requests.filter((req) => req.id !== requestId))

      setSuccess("Connection request accepted")
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Failed to accept connection:", error)
      setError("Failed to accept connection request")
      setTimeout(() => setError(""), 3000)
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      await updateConnectionStatus(requestId, "rejected")

      // Update local state
      setRequests(requests.filter((req) => req.id !== requestId))

      setSuccess("Connection request rejected")
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Failed to reject connection:", error)
      setError("Failed to reject connection request")
      setTimeout(() => setError(""), 3000)
    }
  }

  const handleMessage = async (userId: string) => {
    try {
      // Create or get existing chat room
      await createChatRoom(userId)

      // Navigate to messages page
      router.push("/dashboard/entrepreneur/message")
    } catch (error) {
      console.error("Failed to start conversation:", error)
      setError("Failed to start conversation")
      setTimeout(() => setError(""), 3000)
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
    <DashboardLayout userRole="entrepreneur">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Entrepreneur Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here are your collaboration requests from investors.</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
              <p className="text-xs text-muted-foreground">Collaboration requests from investors</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
              <p className="text-xs text-muted-foreground">Requests awaiting your response</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Unread messages</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Collaboration Requests</h2>
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/entrepreneur/connections")}>
              View All
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {isLoading ? (
              Array(2)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-muted"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                          <div className="h-3 w-32 animate-pulse rounded bg-muted"></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-2">
                        <div className="h-3 w-full animate-pulse rounded bg-muted"></div>
                        <div className="h-3 w-full animate-pulse rounded bg-muted"></div>
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <div className="h-9 w-24 animate-pulse rounded bg-muted"></div>
                        <div className="h-9 w-24 animate-pulse rounded bg-muted"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : requests.length > 0 ? (
              requests.map((request) => (
                <Card key={request.id}>
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" alt={request.sender.name} />
                        <AvatarFallback>{getInitials(request.sender.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{request.sender.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          Investor
                          <Badge variant="outline" className="ml-2">
                            Pending
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {request.message && <p className="text-sm text-muted-foreground mb-4">{request.message}</p>}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Request received: {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleReject(request.id)}>
                          <X className="mr-2 h-4 w-4" />
                          Decline
                        </Button>
                        <Button size="sm" onClick={() => handleAccept(request.id)}>
                          <Check className="mr-2 h-4 w-4" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <Users className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No Requests Yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You haven't received any collaboration requests from investors yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
