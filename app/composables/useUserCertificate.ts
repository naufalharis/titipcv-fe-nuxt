import { useAuth } from './useAuth'

export interface UserCertificate {
  id: string
  userId: string
  name: string
  organization?: string | null
  issueMonthStart?: number | null
  issueYearStart?: number | null
  issueMonthFinish?: number | null
  issueYearFinish?: number | null
  credentialId?: string | null
  credentialUrl?: string | null
  createdAt: number
  updatedAt: number
  deletedAt?: number | null
  createdBy?: string | null
  updatedBy?: string | null
  deletedBy?: string | null
}

export interface CreateCertificateRequest {
  userId: string
  name: string
  organization?: string | null
  issueMonthStart?: number | null
  issueYearStart?: number | null
  issueMonthFinish?: number | null
  issueYearFinish?: number | null
  credentialId?: string | null
  credentialUrl?: string | null
}

export interface UpdateCertificateRequest {
  name?: string
  organization?: string | null
  issueMonthStart?: number | null
  issueYearStart?: number | null
  issueMonthFinish?: number | null
  issueYearFinish?: number | null
  credentialId?: string | null
  credentialUrl?: string | null
}

export const useUserCertificate = () => {
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

  // Get all certificates for a user
  const getUserCertificates = async (userId: string): Promise<UserCertificate[]> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/user-certificates/user/${userId}`
      
      console.log('🔍 GET certificates - URL:', url)
      console.log('🔍 GET certificates - User ID:', userId)
      
      const response = await $fetch<any>(url, { headers })
      
      console.log('📦 GET certificates - Raw response:', response)
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data
      }
      if (Array.isArray(response)) {
        return response
      }
      
      return []
    } catch (error: any) {
      console.error('❌ Error fetching certificates:', error?.message)
      return []
    }
  }

  // Create certificate
  const createCertificate = async (data: CreateCertificateRequest): Promise<UserCertificate> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/user-certificates`
      
      const payload = {
        userId: data.userId,
        name: data.name,
        organization: data.organization || null,
        issueMonthStart: data.issueMonthStart || null,
        issueYearStart: data.issueYearStart || null,
        issueMonthFinish: data.issueMonthFinish || null,
        issueYearFinish: data.issueYearFinish || null,
        credentialId: data.credentialId || null,
        credentialUrl: data.credentialUrl || null
      }
      
      console.log('🔍 POST create certificate:', url, payload)
      
      const response = await $fetch<any>(url, {
        method: 'POST',
        headers,
        body: payload
      })
      
      console.log('📦 POST create certificate - Response:', response)
      
      return response?.data || response
    } catch (error: any) {
      console.error('❌ Error creating certificate:', error?.message)
      throw error
    }
  }

  // Update certificate
  const updateCertificate = async (id: string, data: UpdateCertificateRequest): Promise<UserCertificate> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/user-certificates/${id}`
      
      const payload: any = {}
      if (data.name !== undefined) payload.name = data.name
      if (data.organization !== undefined) payload.organization = data.organization
      if (data.issueMonthStart !== undefined) payload.issueMonthStart = data.issueMonthStart
      if (data.issueYearStart !== undefined) payload.issueYearStart = data.issueYearStart
      if (data.issueMonthFinish !== undefined) payload.issueMonthFinish = data.issueMonthFinish
      if (data.issueYearFinish !== undefined) payload.issueYearFinish = data.issueYearFinish
      if (data.credentialId !== undefined) payload.credentialId = data.credentialId
      if (data.credentialUrl !== undefined) payload.credentialUrl = data.credentialUrl
      
      console.log('🔍 PATCH update certificate:', url, payload)
      
      const response = await $fetch<any>(url, {
        method: 'PATCH',
        headers,
        body: payload
      })
      
      return response?.data || response
    } catch (error: any) {
      console.error('❌ Error updating certificate:', error?.message)
      throw error
    }
  }

  // Delete certificate
  const deleteCertificate = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/user-certificates/${id}`
      
      console.log('🔍 DELETE certificate:', url)
      await $fetch(url, {
        method: 'DELETE',
        headers
      })
    } catch (error) {
      console.error('Error deleting certificate:', error)
      throw error
    }
  }

  // Get all certificates (admin)
  const getAllCertificates = async (params?: {
    page?: number
    limit?: number
  }): Promise<{ certificates: UserCertificate[]; total: number }> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      
      const url = queryParams.toString() 
        ? `${baseURL}/user-certificates?${queryParams.toString()}`
        : `${baseURL}/user-certificates`
      
      const response = await $fetch<any>(url, { headers })
      
      if (response?.data) {
        return {
          certificates: response.data,
          total: response.total || response.data.length
        }
      }
      if (Array.isArray(response)) {
        return {
          certificates: response,
          total: response.length
        }
      }
      return { certificates: [], total: 0 }
    } catch (error) {
      console.error('Error fetching all certificates:', error)
      return { certificates: [], total: 0 }
    }
  }

  return {
    getUserCertificates,
    createCertificate,
    updateCertificate,
    deleteCertificate,
    getAllCertificates
  }
}