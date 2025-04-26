"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import { getProfile, updateProfile, type ProfileData } from "@/services/profile-service"
import { useAuth } from "@/contexts/auth-context"

export default function EntrepreneurProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    bio: "",
    location: "",
    startup: "",
    startupDescription: "",
    industry: "",
    fundingNeeded: "",
    foundedYear: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<ProfileData>({ name: "" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile()
        setProfile(data)
        setFormData(data)
      } catch (error) {
        console.error("Failed to fetch profile:", error)
        setError("Failed to load profile data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const updatedProfile = await updateProfile(formData)
      setProfile(updatedProfile)
      setIsEditing(false)
      setSuccess("Profile updated successfully")

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
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

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["entrepreneur"]}>
        <DashboardLayout userRole="entrepreneur">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
              <p className="mt-4 text-lg">Loading profile...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["entrepreneur"]}>
      <DashboardLayout userRole="entrepreneur">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            {!isEditing && <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="startup">Startup</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your public profile information visible to investors</CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src="/placeholder.svg" alt={profile.name} />
                          <AvatarFallback className="text-lg">{getInitials(profile.name)}</AvatarFallback>
                        </Avatar>
                        <Button variant="outline" type="button">
                          Change Avatar
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" name="email" type="email" value={user?.email || ""} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            name="location"
                            value={formData.location || ""}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="industry">Industry</Label>
                          <Input
                            id="industry"
                            name="industry"
                            value={formData.industry || ""}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea id="bio" name="bio" value={formData.bio || ""} onChange={handleChange} rows={4} />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setFormData(profile)
                            setIsEditing(false)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src="/placeholder.svg" alt={profile.name} />
                          <AvatarFallback className="text-lg">{getInitials(profile.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-semibold">{profile.name}</h3>
                          <p className="text-muted-foreground">{profile.startup || "No startup name provided"}</p>
                          <p className="text-sm text-muted-foreground">{profile.location || "No location provided"}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium">Bio</h4>
                        <p className="mt-1 text-muted-foreground">{profile.bio || "No bio provided"}</p>
                      </div>

                      <div>
                        <h4 className="font-medium">Industry</h4>
                        <p className="mt-1 text-muted-foreground">{profile.industry || "No industry provided"}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="startup" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Startup Information</CardTitle>
                  <CardDescription>Information about your startup visible to investors</CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="startup">Startup Name</Label>
                          <Input id="startup" name="startup" value={formData.startup || ""} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="foundedYear">Founded Year</Label>
                          <Input
                            id="foundedYear"
                            name="foundedYear"
                            value={formData.foundedYear || ""}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="startupDescription">Startup Description</Label>
                          <Textarea
                            id="startupDescription"
                            name="startupDescription"
                            value={formData.startupDescription || ""}
                            onChange={handleChange}
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fundingNeeded">Funding Needed</Label>
                          <Input
                            id="fundingNeeded"
                            name="fundingNeeded"
                            value={formData.fundingNeeded || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Pitch Deck</Label>
                        <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
                          <div className="flex flex-col items-center space-y-2 text-center">
                            <Upload className="h-10 w-10 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">Upload Pitch Deck</h3>
                            <p className="text-sm text-muted-foreground">
                              Drag and drop your pitch deck PDF or click to browse
                            </p>
                            <Button variant="outline" size="sm">
                              Browse Files
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setFormData(profile)
                            setIsEditing(false)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold">{profile.startup || "No startup name provided"}</h3>
                        <p className="text-sm text-muted-foreground">
                          Founded in {profile.foundedYear || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium">Description</h4>
                        <p className="mt-1 text-muted-foreground">
                          {profile.startupDescription || "No description provided"}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium">Funding Needed</h4>
                        <p className="mt-1 text-muted-foreground">{profile.fundingNeeded || "Not specified"}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Pitch Deck</h4>
                        <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
                          <div className="flex flex-col items-center space-y-2 text-center">
                            <Upload className="h-10 w-10 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">No Pitch Deck Uploaded</h3>
                            <p className="text-sm text-muted-foreground">
                              Upload your pitch deck to share with potential investors
                            </p>
                            <Button variant="outline" size="sm">
                              Upload Pitch Deck
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account settings and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">Configure your email notification preferences</p>
                    <Button variant="outline">Manage Notifications</Button>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Password</h3>
                    <p className="text-sm text-muted-foreground">Change your password</p>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-destructive">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground">Delete your account and all your data</p>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
