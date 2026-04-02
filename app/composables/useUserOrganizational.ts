import { useAuth } from './useAuth'

export interface UserOrganizationalExperience {
  id: string
  userId: string
  organizationName: string
  role: string
  type: 'ORGANIZATION' | 'COMMITTEE' | 'VOLUNTEER'
  monthStart?: number | null
  yearStart?: number | null
  monthFinish?: number | null
  yearFinish?: number | null
  isCurrent: boolean
  description?: string | null
  createdAt: number
  updatedAt: number
  deletedAt?: number | null
  createdBy?: string | null
  updatedBy?: string | null
  deletedBy?: string | null
}

export interface CreateOrganizationalRequest {
  userId: string
  organizationName: string
  role: string
  type: 'ORGANIZATION' | 'COMMITTEE' | 'VOLUNTEER'
  monthStart?: number | null
  yearStart?: number | null
  monthFinish?: number | null
  yearFinish?: number | null
  isCurrent?: boolean
  description?: string | null
}

export interface UpdateOrganizationalRequest {
  organizationName?: string
  role?: string
  type?: 'ORGANIZATION' | 'COMMITTEE' | 'VOLUNTEER'
  monthStart?: number | null
  yearStart?: number | null
  monthFinish?: number | null
  yearFinish?: number | null
  isCurrent?: boolean
  description?: string | null
}

export const useUserOrganizational = () => {
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

  // Get all organizational experiences for a user
  const getUserOrganizationalExperiences = async (userId: string): Promise<UserOrganizationalExperience[]> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/user-organizational-experiences/user/${userId}`
      
      console.log('🔍 GET organizational experiences - URL:', url)
      console.log('🔍 GET organizational experiences - User ID:', userId)
      
      const response = await $fetch<any>(url, { headers })
      
      console.log('📦 GET organizational experiences - Raw response:', response)
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data
      }
      if (Array.isArray(response)) {
        return response
      }
      
      return []
    } catch (error: any) {
      console.error('❌ Error fetching organizational experiences:', error?.message)
      return []
    }
  }

  // Create organizational experience
  const createOrganizationalExperience = async (data: CreateOrganizationalRequest): Promise<UserOrganizationalExperience> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/user-organizational-experiences`
      
      const payload = {
        userId: data.userId,
        organizationName: data.organizationName,
        role: data.role,
        type: data.type,
        monthStart: data.monthStart || null,
        yearStart: data.yearStart || null,
        monthFinish: data.monthFinish || null,
        yearFinish: data.yearFinish || null,
        isCurrent: data.isCurrent || false,
        description: data.description || null
      }
      
      console.log('🔍 POST create organizational experience:', url, payload)
      
      const response = await $fetch<any>(url, {
        method: 'POST',
        headers,
        body: payload
      })
      
      console.log('📦 POST create organizational experience - Response:', response)
      
      return response?.data || response
    } catch (error: any) {
      console.error('❌ Error creating organizational experience:', error?.message)
      throw error
    }
  }

  // Update organizational experience
  const updateOrganizationalExperience = async (id: string, data: UpdateOrganizationalRequest): Promise<UserOrganizationalExperience> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/user-organizational-experiences/${id}`
      
      const payload: any = {}
      if (data.organizationName !== undefined) payload.organizationName = data.organizationName
      if (data.role !== undefined) payload.role = data.role
      if (data.type !== undefined) payload.type = data.type
      if (data.monthStart !== undefined) payload.monthStart = data.monthStart
      if (data.yearStart !== undefined) payload.yearStart = data.yearStart
      if (data.monthFinish !== undefined) payload.monthFinish = data.monthFinish
      if (data.yearFinish !== undefined) payload.yearFinish = data.yearFinish
      if (data.isCurrent !== undefined) payload.isCurrent = data.isCurrent
      if (data.description !== undefined) payload.description = data.description
      
      console.log('🔍 PATCH update organizational experience:', url, payload)
      
      const response = await $fetch<any>(url, {
        method: 'PATCH',
        headers,
        body: payload
      })
      
      return response?.data || response
    } catch (error: any) {
      console.error('❌ Error updating organizational experience:', error?.message)
      throw error
    }
  }

  // Delete organizational experience
  const deleteOrganizationalExperience = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/user-organizational-experiences/${id}`
      
      console.log('🔍 DELETE organizational experience:', url)
      await $fetch(url, {
        method: 'DELETE',
        headers
      })
    } catch (error) {
      console.error('Error deleting organizational experience:', error)
      throw error
    }
  }

  // Get all organizational experiences (admin)
  const getAllOrganizationalExperiences = async (params?: {
    page?: number
    limit?: number
  }): Promise<{ experiences: UserOrganizationalExperience[]; total: number }> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      
      const url = queryParams.toString() 
        ? `${baseURL}/user-organizational-experiences?${queryParams.toString()}`
        : `${baseURL}/user-organizational-experiences`
      
      const response = await $fetch<any>(url, { headers })
      
      if (response?.data) {
        return {
          experiences: response.data,
          total: response.total || response.data.length
        }
      }
      if (Array.isArray(response)) {
        return {
          experiences: response,
          total: response.length
        }
      }
      return { experiences: [], total: 0 }
    } catch (error) {
      console.error('Error fetching all organizational experiences:', error)
      return { experiences: [], total: 0 }
    }
  }

  return {
    getUserOrganizationalExperiences,
    createOrganizationalExperience,
    updateOrganizationalExperience,
    deleteOrganizationalExperience,
    getAllOrganizationalExperiences
  }
}