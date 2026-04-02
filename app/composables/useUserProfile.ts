import { useAuth } from './useAuth'

export interface UserProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  gender?: string
  experience?: number
  birthDate?: string
  birthPlace?: string
  countryId?: string
  province?: string
  district?: string
  city?: string
  latitude?: number
  longitude?: number
  summary?: string
  isReadyToWork: boolean
  photoAssetId?: string
  cv?: string
  createdAt: number
  updatedAt: number
  updatedBy?: string
  user?: {
    id: string
    email: string
    username: string
    role: string
    isActive: boolean
    isVerified: boolean
  }
  country?: {
    id: string
    name: string
    code?: string
  }
  photo?: {
    id: string
    url: string
    type: string
  }
}

export interface UserSkill {
  id: string
  userId: string
  skillId: string
  proficiencyLevel?: number
  skill?: {
    id: string
    name: string
    category?: string
  }
  createdAt: number
  updatedAt: number
}

export interface UserLanguage {
  id: string
  userId: string
  languageId: string
  proficiencyLevel: string
  language?: {
    id: string
    name: string
    code?: string
  }
  createdAt: number
  updatedAt: number
}

export const useUserProfile = () => {
  const { accessToken, user } = useAuth()
  const runtimeConfig = useRuntimeConfig()
  const baseURL = runtimeConfig.public.apiBaseUrl || 'http://localhost:3335/api/v1'

  const getHeaders = (contentType = true) => {
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    }
    
    if (accessToken.value) {
      headers['Authorization'] = `Bearer ${accessToken.value}`
    }
    
    if (contentType) {
      headers['Content-Type'] = 'application/json'
    }
    
    return headers
  }

  // ==================== USER PROFILE ====================
  
  const getUserProfile = async (userId: string): Promise<UserProfile> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/users/${userId}/profile`
      
      console.log('🔍 GET user profile:', url)
      const response = await $fetch<any>(url, { headers })
      
      if (response?.data) {
        return response.data as UserProfile
      }
      return response as UserProfile
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  }

  const getMyProfile = async (): Promise<UserProfile> => {
    try {
      const userId = user.value?.id
      if (!userId) {
        throw new Error('User ID not found')
      }
      
      console.log('🔍 Getting profile for user ID:', userId)
      return await getUserProfile(userId)
    } catch (error) {
      console.error('Error fetching my profile:', error)
      throw error
    }
  }

  const updateUserProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const userId = user.value?.id
      if (!userId) {
        throw new Error('User ID not found')
      }
      
      const headers = getHeaders()
      const url = `${baseURL}/users/${userId}/profile`
      
      console.log('🔍 PATCH update user profile:', url)
      const response = await $fetch<any>(url, {
        method: 'PATCH',
        headers,
        body: data
      })
      
      return response?.data || response
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  const uploadProfilePhoto = async (file: File): Promise<{ url: string; assetId: string }> => {
    try {
      const headers = getHeaders(false)
      const formData = new FormData()
      formData.append('file', file)
      
      const url = `${baseURL}/userprofile/avatar`
      
      console.log('🔍 POST upload avatar:', url)
      const response = await $fetch<any>(url, {
        method: 'POST',
        headers,
        body: formData
      })
      
      return {
        url: response?.data?.url || response?.url,
        assetId: response?.data?.assetId || response?.assetId
      }
    } catch (error) {
      console.error('Error uploading profile photo:', error)
      throw error
    }
  }

  const uploadCV = async (file: File): Promise<{ url: string; assetId: string }> => {
    try {
      const headers = getHeaders(false)
      const formData = new FormData()
      formData.append('file', file)
      
      const url = `${baseURL}/userprofile/cv`
      
      console.log('🔍 POST upload CV:', url)
      const response = await $fetch<any>(url, {
        method: 'POST',
        headers,
        body: formData
      })
      
      return {
        url: response?.data?.url || response?.url,
        assetId: response?.data?.assetId || response?.assetId
      }
    } catch (error) {
      console.error('Error uploading CV:', error)
      throw error
    }
  }

  // ==================== SKILLS ====================
  
  const getUserSkills = async (userId: string): Promise<UserSkill[]> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/user-skills/user/${userId}`
      
      console.log('🔍 GET user skills:', url)
      const response = await $fetch<any>(url, { headers })
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data
      }
      if (Array.isArray(response)) {
        return response
      }
      return []
    } catch (error) {
      console.error('Error fetching skills:', error)
      return []
    }
  }

  const getAllSkills = async (): Promise<{ id: string; name: string; category?: string }[]> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/skills`
      
      console.log('🔍 GET all skills:', url)
      const response = await $fetch<any>(url, { headers })
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data
      }
      if (Array.isArray(response)) {
        return response
      }
      return []
    } catch (error) {
      console.error('Error fetching skills:', error)
      return []
    }
  }

  const addUserSkill = async (skillId: string, proficiencyLevel?: number): Promise<UserSkill> => {
    try {
      const userId = user.value?.id
      if (!userId) {
        throw new Error('User ID not found')
      }

      const headers = getHeaders()
      const url = `${baseURL}/user-skills`
      
      console.log('🔍 POST add user skill:', url)
      const payload: any = { userId, skillId }
      if (proficiencyLevel !== undefined) {
        payload.proficiencyLevel = proficiencyLevel
      }

      const response = await $fetch<any>(url, {
        method: 'POST',
        headers,
        body: payload
      })
      
      return response?.data || response
    } catch (error) {
      console.error('Error adding skill:', error)
      throw error
    }
  }

  const deleteUserSkill = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/user-skills/${id}`
      
      console.log('🔍 DELETE user skill:', url)
      await $fetch(url, {
        method: 'DELETE',
        headers
      })
    } catch (error) {
      console.error('Error deleting skill:', error)
      throw error
    }
  }

  // ==================== LANGUAGES ====================
  
  const getUserLanguages = async (userId: string): Promise<UserLanguage[]> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/user-languages/user/${userId}`
      
      console.log('🔍 GET user languages:', url)
      const response = await $fetch<any>(url, { headers })
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data
      }
      if (Array.isArray(response)) {
        return response
      }
      return []
    } catch (error) {
      console.error('Error fetching languages:', error)
      return []
    }
  }

  const addUserLanguage = async (languageId: string, proficiencyLevel: string): Promise<UserLanguage> => {
    try {
      const userId = user.value?.id
      if (!userId) {
        throw new Error('User ID not found')
      }

      const headers = getHeaders()
      const url = `${baseURL}/user-languages`
      
      console.log('🔍 POST add user language:', url)
      const response = await $fetch<any>(url, {
        method: 'POST',
        headers,
        body: { userId, languageId, proficiencyLevel }
      })
      
      return response?.data || response
    } catch (error) {
      console.error('Error adding language:', error)
      throw error
    }
  }

  const deleteUserLanguage = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/user-languages/${id}`
      
      console.log('🔍 DELETE user language:', url)
      await $fetch(url, {
        method: 'DELETE',
        headers
      })
    } catch (error) {
      console.error('Error deleting language:', error)
      throw error
    }
  }

  return {
    getUserProfile,
    getMyProfile,
    updateUserProfile,
    uploadProfilePhoto,
    uploadCV,
    getUserSkills,
    getAllSkills,
    addUserSkill,
    deleteUserSkill,
    getUserLanguages,
    addUserLanguage,
    deleteUserLanguage
  }
}