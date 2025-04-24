"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Users } from "lucide-react"

// Mock data for entrepreneurs
const mockEntrepreneurs = [
  {
    id: "1",
    name: "Sarah Johnson",
    startup: "EcoTech Solutions",
    pitch: "Developing sustainable technology solutions for reducing carbon footprint in urban areas.",
    initials: "SJ",
  },
  {
    id: "2",
    name: "Michael Chen",
    startup: "HealthAI",
    pitch: "AI-powered healthcare diagnostics platform for early disease detection.",
    initials: "MC",
  },
  {
    id: "3",
    name: "Jessica Williams",
    startup: "FinLedger",
    pitch: "Blockchain-based financial management system for small businesses.",
    initials: "JW",
  },
]

export default function InvestorDashboard() {
  const [entrepreneurs, setEntrepreneurs] = useState(mockEntrepreneurs)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchEntrepreneurs = async () => {
      // In a real app, you would fetch data from your API
      // const response = await fetch('/api/entrepreneurs');
      // const data = await response.json();
      // setEntrepreneurs(data);

      // Using mock data for now
      setTimeout(() => {
        setEntrepreneurs(mockEntrepreneurs)
        setIsLoading(false)
      }, 1000)
    }

    fetchEntrepreneurs()
  }, [])

  return (
    <DashboardLayout userRole="investor">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investor Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's a list of entrepreneurs looking for investment.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entrepreneurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{entrepreneurs.length}</div>
              <p className="text-xs text-muted-foreground">Entrepreneurs looking for investment</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collaboration Requests</CardTitle>
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
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Active collaboration requests</p>
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
            <h2 className="text-xl font-bold">Entrepreneurs</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array(3)
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
                          <div className="h-3 w-2/3 animate-pulse rounded bg-muted"></div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          <div className="h-9 w-24 animate-pulse rounded bg-muted"></div>
                          <div className="h-9 w-24 animate-pulse rounded bg-muted"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              : entrepreneurs.map((entrepreneur) => (
                  <Card key={entrepreneur.id}>
                    <CardHeader className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src="/placeholder.svg" alt={entrepreneur.name} />
                          <AvatarFallback>{entrepreneur.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{entrepreneur.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            {entrepreneur.startup}
                            <Badge variant="outline" className="ml-2">
                              Startup
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground">{entrepreneur.pitch}</p>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Message
                        </Button>
                        <Button size="sm">Connect</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
