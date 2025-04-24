// This is a mock service for authentication
// In a real application, this would make API calls to your backend

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
  
  // Mock user database
  const users: User[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "entrepreneur",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "investor",
    },
  ]
  
  export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
  
    // In a real app, this would be a fetch request to your API
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(credentials),
    // });
    // return response.json();
  
    // Mock implementation
    const user = users.find((u) => u.email === credentials.email)
  
    if (!user) {
      throw new Error("Invalid credentials")
    }
  
    // In a real app, you would verify the password here
    // For demo purposes, we'll accept any password
  
    return {
      token: "mock-jwt-token",
      user,
    }
  }
  
  export async function registerUser(data: RegisterData): Promise<AuthResponse> {
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
  
    // In a real app, this would be a fetch request to your API
    // const response = await fetch('/api/auth/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
    // return response.json();
  
    // Mock implementation
    // Check if user already exists
    if (users.some((u) => u.email === data.email)) {
      throw new Error("User already exists")
    }
  
    // Create new user
    const newUser: User = {
      id: (users.length + 1).toString(),
      name: data.name,
      email: data.email,
      role: data.role,
    }
  
    // In a real app, you would save this user to your database
    users.push(newUser)
  
    return {
      token: "mock-jwt-token",
      user: newUser,
    }
  }
  
  export async function getCurrentUser(): Promise<User | null> {
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 500))
  
    // In a real app, this would be a fetch request to your API
    // const response = await fetch('/api/auth/me', {
    //   headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    // });
    // if (response.ok) {
    //   return response.json();
    // }
    // return null;
  
    // Mock implementation
    // For demo purposes, we'll return the first user
    return users[0]
  }
  
  export function logout(): void {
    // In a real app, you might want to invalidate the token on the server
    localStorage.removeItem("token")
  }