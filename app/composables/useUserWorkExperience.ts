import { useAuth } from './useAuth'

export interface UserWorkExperience {
  id: string
  userId: string
  companyName?: string | null
  position?: string | null
  workTypeId?: string | null
  monthStart?: number | null
  yearStart?: number | null
  monthFinish?: number | null
  yearFinish?: number | null
  description?: string | null
  location?: string | null
  workPlaceId?: string | null
  isCurrent: boolean
  createdAt: number
  updatedAt: number
  deletedAt?: number | null
  createdBy?: string | null
  updatedBy?: string | null
  deletedBy?: string | null
  
  // Relations
  workType?: {
    id: string
    slug: string
    name: string
    isActive: boolean
  }
  workPlace?: {
    id: string
    slug: string
    name: string
    isActive: boolean
  }
  userSkills?: any[]
}

export interface CreateWorkExperienceRequest {
  userId: string
  companyName?: string | null
  position?: string | null
  workTypeId?: string | null
  monthStart?: number | null
  yearStart?: number | null
  monthFinish?: number | null
  yearFinish?: number | null
  description?: string | null
  location?: string | null
  workPlaceId?: string | null
  isCurrent?: boolean
}

export const useUserWorkExperience = () => {
  const { accessToken } = useAuth()
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

  // Get user work experiences - menggunakan endpoint yang benar dengan path parameter
  const getUserWorkExperiences = async (userId: string): Promise<UserWorkExperience[]> => {
    try {
      const headers = getHeaders()
      // Gunakan endpoint dengan path parameter, BUKAN query string
      const url = `${baseURL}/user-work-experiences/user/${userId}`
      
      console.log('🔍 GET work experiences - URL:', url)
      console.log('🔍 GET work experiences - User ID:', userId)
      
      const response = await $fetch<any>(url, { headers })
      
      console.log('📦 GET work experiences - Raw response:', response)
      
      // Response memiliki struktur { data: [...], pagination: {...} }
      if (response?.data && Array.isArray(response.data)) {
        console.log('✅ Found data array, length:', response.data.length)
        return response.data
      }
      
      // Fallback jika response langsung array
      if (Array.isArray(response)) {
        console.log('✅ Response is array, length:', response.length)
        return response
      }
      
      console.log('⚠️ No work experiences found, returning empty array')
      return []
    } catch (error: any) {
      console.error('❌ Error fetching work experiences:', error?.message)
      return []
    }
  }

  // Create work experience
  const createWorkExperience = async (data: CreateWorkExperienceRequest): Promise<UserWorkExperience> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/user-work-experiences`
      
      const payload = {
        userId: data.userId,
        companyName: data.companyName || null,
        position: data.position || null,
        workTypeId: data.workTypeId || null,
        monthStart: data.monthStart || null,
        yearStart: data.yearStart || null,
        monthFinish: data.monthFinish || null,
        yearFinish: data.yearFinish || null,
        description: data.description || null,
        location: data.location || null,
        workPlaceId: data.workPlaceId || null,
        isCurrent: data.isCurrent || false
      }
      
      console.log('🔍 POST create work experience:', url, payload)
      
      const response = await $fetch<any>(url, {
        method: 'POST',
        headers,
        body: payload
      })
      
      console.log('📦 POST create work experience - Response:', response)
      
      return response?.data || response
    } catch (error: any) {
      console.error('❌ Error creating work experience:', error?.message)
      throw error
    }
  }

  // Delete work experience
  const deleteWorkExperience = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/user-work-experiences/${id}`
      
      console.log('🔍 DELETE work experience:', url)
      await $fetch(url, {
        method: 'DELETE',
        headers
      })
    } catch (error) {
      console.error('Error deleting work experience:', error)
      throw error
    }
  }

  // Update work experience
  const updateWorkExperience = async (id: string, data: Partial<CreateWorkExperienceRequest>): Promise<UserWorkExperience> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/user-work-experiences/${id}`
      
      const payload: any = {}
      if (data.companyName !== undefined) payload.companyName = data.companyName
      if (data.position !== undefined) payload.position = data.position
      if (data.workTypeId !== undefined) payload.workTypeId = data.workTypeId
      if (data.monthStart !== undefined) payload.monthStart = data.monthStart
      if (data.yearStart !== undefined) payload.yearStart = data.yearStart
      if (data.monthFinish !== undefined) payload.monthFinish = data.monthFinish
      if (data.yearFinish !== undefined) payload.yearFinish = data.yearFinish
      if (data.description !== undefined) payload.description = data.description
      if (data.location !== undefined) payload.location = data.location
      if (data.workPlaceId !== undefined) payload.workPlaceId = data.workPlaceId
      if (data.isCurrent !== undefined) payload.isCurrent = data.isCurrent
      
      console.log('🔍 PATCH update work experience:', url, payload)
      
      const response = await $fetch<any>(url, {
        method: 'PATCH',
        headers,
        body: payload
      })
      
      return response?.data || response
    } catch (error: any) {
      console.error('❌ Error updating work experience:', error?.message)
      throw error
    }
  }

  return {
    getUserWorkExperiences,
    createWorkExperience,
    updateWorkExperience,
    deleteWorkExperience
  }
}