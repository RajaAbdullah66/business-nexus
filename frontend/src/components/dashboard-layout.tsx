"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Building2, ChevronDown, Home, LogOut, MessageSquare, Moon, Settings, Sun, User, Users } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useTheme } from "next-themes"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: "investor" | "entrepreneur"
}

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john@example.com",
    role: userRole,
    initials: "JD",
  })

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    // TODO: Fetch user data from API
    // For now, we'll use mock data
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  const investorMenuItems = [
    { name: "Dashboard", href: "/dashboard/investor", icon: Home },
    { name: "Entrepreneurs", href: "/dashboard/investor/entrepreneurs", icon: Users },
    { name: "Messages", href: "/dashboard/investor/messages", icon: MessageSquare },
    { name: "Profile", href: "/dashboard/investor/profile", icon: User },
    { name: "Settings", href: "/dashboard/investor/settings", icon: Settings },
  ]

  const entrepreneurMenuItems = [
    { name: "Dashboard", href: "/dashboard/entrepreneur", icon: Home },
    { name: "Investors", href: "/dashboard/entrepreneur/investors", icon: Building2 },
    { name: "Messages", href: "/dashboard/entrepreneur/messages", icon: MessageSquare },
    { name: "Profile", href: "/dashboard/entrepreneur/profile", icon: User },
    { name: "Settings", href: "/dashboard/entrepreneur/settings", icon: Settings },
  ]

  const menuItems = userRole === "investor" ? investorMenuItems : entrepreneurMenuItems

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full" style={{ backgroundColor: "hsl(var(--background))" }}>
        <Sidebar className="border-r" style={{ borderColor: "hsl(var(--border))" }}>
          <SidebarHeader className="border-b px-6 py-4" style={{ borderColor: "hsl(var(--border))" }}>
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md flex items-center justify-center" style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6Z" />
                  <path d="M12 13v8" />
                  <path d="M5 13v6a2 2 0 0 0 2 2h8" />
                </svg>
              </div>
              <span className="text-xl font-bold">Business Nexus</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-2">
            <div className="mb-2 mt-4 px-4 text-xs font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>
              MAIN NAVIGATION
            </div>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href} 
                    tooltip={item.name}
                    className="hover:bg-accent/50"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4" style={{ borderColor: "hsl(var(--border))" }}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 hover:bg-accent/50">
                  <Avatar className="h-6 w-6 border" style={{ borderColor: "hsl(var(--border))" }}>
                    <AvatarImage src="/placeholder.svg" alt={user.name} />
                    <AvatarFallback style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>{user.initials}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-left">{user.name}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/${userRole}/profile`}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/${userRole}/settings`}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b px-6 shadow-sm" 
            style={{ 
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))" 
            }}>
            <SidebarTrigger />
            <div className="flex-1" />
            <nav className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" alt={user.name} />
                      <AvatarFallback style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>{user.initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/${userRole}/profile`}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/${userRole}/settings`}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </header>
          <main className="flex-1 overflow-auto p-6" style={{ backgroundColor: "hsl(var(--background))" }}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}