"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Check, MessageSquare, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProtectedRoute from "@/components/protected-route"
import { getConnectionRequests, updateConnectionStatus, type ConnectionRequest } from "@/services/connection-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function EntrepreneurConnectionsPage() {
  const [connections, setConnections] = useState<{
    received: ConnectionRequest[]
    sent: ConnectionRequest[]
  }>({
    received: [],
    sent: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const data = await getConnectionRequests()
        setConnections(data)
      } catch (error) {
        console.error("Failed to fetch connections:", error)
        setError("Failed to load connection requests")
      } finally {
        setIsLoading(false)
      }
    }

    fetchConnections()
  }, [])

  const handleAccept = async (connectionId: string) => {
    try {
      await updateConnectionStatus(connectionId, "accepted")

      // Update local state
      setConnections((prev) => ({
        ...prev,
        received: prev.received.map((conn) => (conn.id === connectionId ? { ...conn, status: "accepted" } : conn)),
      }))

      setSuccess("Connection request accepted")
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Failed to accept connection:", error)
      setError("Failed to accept connection request")
      setTimeout(() => setError(""), 3000)
    }
  }

  const handleReject = async (connectionId: string) => {
    try {
      await updateConnectionStatus(connectionId, "rejected")

      // Update local state
      setConnections((prev) => ({
        ...prev,
        received: prev.received.map((conn) => (conn.id === connectionId ? { ...conn, status: "rejected" } : conn)),
      }))

      setSuccess("Connection request rejected")
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Failed to reject connection:", error)
      setError("Failed to reject connection request")
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
    <ProtectedRoute allowedRoles={["entrepreneur"]}>
      <DashboardLayout userRole="entrepreneur">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Connection Requests</h1>
            <p className="text-muted-foreground">Manage your connection requests with investors</p>
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

          <Tabs defaultValue="received">
            <TabsList>
              <TabsTrigger value="received">Received Requests</TabsTrigger>
              <TabsTrigger value="sent">Sent Requests</TabsTrigger>
            </TabsList>
            <TabsContent value="received" className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {Array(2)
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
                    ))}
                </div>
              ) : connections.received.length > 0 ? (
                <div className="space-y-4">
                  {connections.received.map((connection) => (
                    <Card key={connection.id}>
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src="/placeholder.svg" alt={connection.sender.name} />
                            <AvatarFallback>{getInitials(connection.sender.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{connection.sender.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              Investor
                              <Badge
                                variant={
                                  connection.status === "accepted"
                                    ? "success"
                                    : connection.status === "rejected"
                                      ? "destructive"
                                      : "outline"
                                }
                                className="ml-2"
                              >
                                {connection.status === "pending"
                                  ? "Pending"
                                  : connection.status === "accepted"
                                    ? "Accepted"
                                    : "Rejected"}
                              </Badge>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {connection.message && (
                          <p className="text-sm text-muted-foreground mb-4">{connection.message}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Request received: {new Date(connection.createdAt).toLocaleDateString()}
                          </p>
                          {connection.status === "pending" && (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleReject(connection.id)}>
                                <X className="mr-2 h-4 w-4" />
                                Decline
                              </Button>
                              <Button size="sm" onClick={() => handleAccept(connection.id)}>
                                <Check className="mr-2 h-4 w-4" />
                                Accept
                              </Button>
                            </div>
                          )}
                          {connection.status === "accepted" && (
                            <Button size="sm">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Message
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-10 w-10 text-muted-foreground"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No Connection Requests</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You haven't received any connection requests from investors yet.
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="sent" className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {Array(2)
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
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : connections.sent.length > 0 ? (
                <div className="space-y-4">
                  {connections.sent.map((connection) => (
                    <Card key={connection.id}>
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src="/placeholder.svg" alt={connection.receiver.name} />
                            <AvatarFallback>{getInitials(connection.receiver.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{connection.receiver.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              Investor
                              <Badge
                                variant={
                                  connection.status === "accepted"
                                    ? "success"
                                    : connection.status === "rejected"
                                      ? "destructive"
                                      : "outline"
                                }
                                className="ml-2"
                              >
                                {connection.status === "pending"
                                  ? "Pending"
                                  : connection.status === "accepted"
                                    ? "Accepted"
                                    : "Rejected"}
                              </Badge>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {connection.message && (
                          <p className="text-sm text-muted-foreground mb-4">{connection.message}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Request sent: {new Date(connection.createdAt).toLocaleDateString()}
                          </p>
                          {connection.status === "accepted" && (
                            <Button size="sm">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Message
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-10 w-10 text-muted-foreground"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No Sent Requests</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You haven't sent any connection requests to investors yet.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
