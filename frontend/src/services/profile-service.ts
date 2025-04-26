import { apiClient } from "@/lib/api-client"

export interface ProfileData {
  name: string
  bio?: string
  location?: string
  // Entrepreneur specific fields
  startup?: string
  startupDescription?: string
  industry?: string
  fundingNeeded?: string
  foundedYear?: string
  // Investor specific fields
  company?: string
  investmentInterests?: string
  investmentRange?: string
}

export async function getProfile(): Promise<ProfileData> {
  const response = await apiClient<{ data: any }>("/profile/me")
  return response.data
}

export async function updateProfile(data: Partial<ProfileData>): Promise<ProfileData> {
  const response = await apiClient<{ data: any }>("/profile/update", {
    method: "PATCH",
    body: data,
  })
  return response.data
}
