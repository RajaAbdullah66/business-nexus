import { apiClient } from "@/lib/api-client"

export interface ConnectionRequest {
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
  status: "pending" | "accepted" | "rejected"
  message: string
  createdAt: string
}

export async function sendConnectionRequest(receiverId: string, message = ""): Promise<ConnectionRequest> {
  const response = await apiClient<{ data: any }>("/connections", {
    method: "POST",
    body: { receiverId, message },
  })

  return transformConnectionData(response.data)
}

export async function getConnectionRequests(): Promise<{
  received: ConnectionRequest[]
  sent: ConnectionRequest[]
}> {
  const response = await apiClient<{
    data: {
      received: any[]
      sent: any[]
    }
  }>("/connections")

  return {
    received: response.data.received.map(transformConnectionData),
    sent: response.data.sent.map(transformConnectionData),
  }
}

export async function updateConnectionStatus(
  connectionId: string,
  status: "accepted" | "rejected",
): Promise<ConnectionRequest> {
  const response = await apiClient<{ data: any }>(`/connections/${connectionId}`, {
    method: "PATCH",
    body: { status },
  })

  return transformConnectionData(response.data)
}

// Helper function to transform connection data
function transformConnectionData(connection: any): ConnectionRequest {
  return {
    id: connection._id,
    sender: {
      id: connection.sender._id,
      name: connection.sender.name,
      email: connection.sender.email,
      role: connection.sender.role,
    },
    receiver: {
      id: connection.receiver._id,
      name: connection.receiver.name,
      email: connection.receiver.email,
      role: connection.receiver.role,
    },
    status: connection.status,
    message: connection.message,
    createdAt: connection.createdAt,
  }
}
