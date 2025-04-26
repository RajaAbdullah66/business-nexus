"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ("entrepreneur" | "investor")[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard if user doesn't have permission
      router.push(user.role === "entrepreneur" ? "/dashboard/entrepreneur" : "/dashboard/investor")
    }
  }, [user, isLoading, router, allowedRoles])

  // Show loading state
  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  // If roles are specified and user doesn't have permission, don't render children
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null
  }

  // User is authenticated and authorized
  return <>{children}</>
}
