import { API_BASE_URL } from "@/lib/config"

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: "entrepreneur" | "investor"
}

interface User {
  id: string
  name: string
  email: string
  role: "entrepreneur" | "investor"
}

interface AuthResponse {
  token: string
  user: User
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Login failed")
  }

  const data = await response.json()
  return {
    token: data.token,
    user: {
      id: data.user._id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
    },
  }
}

export async function registerUser(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Registration failed")
  }

  const responseData = await response.json()
  return {
    token: responseData.token,
    user: {
      id: responseData.user._id,
      name: responseData.user.name,
      email: responseData.user.email,
      role: responseData.user.role,
    },
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem("token")

  if (!token) {
    return null
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user")
    }

    const data = await response.json()
    return {
      id: data.user._id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
    }
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}

export function logout(): void {
  localStorage.removeItem("token")
}
