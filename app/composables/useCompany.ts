// composables/useCompany.ts
import { useAuth } from './useAuth'

export interface Company {
  id: string
  name: string
  about?: string | null
  industry?: string | null
  size?: string | null
  website?: string | null
  email?: string | null
  phone?: string | null
  pic_name?: string | null
  pic_position?: string | null
  pic_whatsapp?: string | null
  pic_email?: string | null
  countryId?: string | null
  address?: string | null
  province?: string | null
  district?: string | null
  city?: string | null
  videoUrl?: string | null
  status: string
  userId?: string | null
  companyLogoId?: string | null
  companyLogo?: {
    id: string
    originalName: string
    fileName: string
    location: string
    mimeType: string
    url: string
    size: number
    createdAt: number
    updatedAt: number
  } | null
  activeJobsCount: number
  totalJobsCount: number
  createdAt: number
  updatedAt: number
  deletedAt?: number | null
  user?: any
}

export interface CreateCompanyRequest {
  name: string
  about?: string | null
  industry?: string | null
  size?: string | null
  website?: string | null
  email?: string | null
  phone?: string | null
  pic_name?: string | null
  pic_position?: string | null
  pic_whatsapp?: string | null
  pic_email?: string | null
  countryId?: string | null
  address?: string | null
  province?: string | null
  district?: string | null
  city?: string | null
  videoUrl?: string | null
}

export interface UpdateCompanyRequest {
  name?: string | null
  about?: string | null
  industry?: string | null
  size?: string | null
  website?: string | null
  email?: string | null
  phone?: string | null
  pic_name?: string | null
  pic_position?: string | null
  pic_whatsapp?: string | null
  pic_email?: string | null
  countryId?: string | null
  address?: string | null
  province?: string | null
  district?: string | null
  city?: string | null
  videoUrl?: string | null
}

export interface UploadLogoResponse {
  id: string
  originalName: string
  fileName: string
  location: string
  mimeType: string
  url: string
  size: number
  createdAt: number
  updatedAt: number
}

export const useCompany = () => {
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

  const handleResponse = <T>(response: any): T => {
    if (response?.status === 'success' && response?.data) {
      return response.data as T
    }
    if (response?.data) {
      return response.data as T
    }
    return response as T
  }

  const getMyCompany = async (): Promise<Company | null> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/companies/my-company`
      
      const response = await $fetch<any>(url, { headers })
      
      let companyData: Company | null = null
      
      if (response?.status === 'success' && response?.data) {
        companyData = response.data
      } else if (response?.data) {
        companyData = response.data
      } else if (response?.id && response?.name) {
        companyData = response
      }
      
      return companyData
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null
      }
      console.error('Error fetching my company:', error)
      throw error
    }
  }

  const createMyCompany = async (data: CreateCompanyRequest): Promise<Company> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/companies/my-company`
      
      const response = await $fetch<any>(url, {
        method: 'POST',
        headers,
        body: data
      })
      
      return handleResponse<Company>(response)
    } catch (error) {
      console.error('Error creating company:', error)
      throw error
    }
  }

  const updateMyCompany = async (data: UpdateCompanyRequest): Promise<Company> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/companies/my-company`
      
      const response = await $fetch<any>(url, {
        method: 'PATCH',
        headers,
        body: data
      })
      
      return handleResponse<Company>(response)
    } catch (error) {
      console.error('Error updating company:', error)
      throw error
    }
  }

  // ============= UPLOAD COMPANY LOGO - Menggunakan fetch biasa untuk debugging =============
  const uploadLogo = async (companyId: string, file: File): Promise<UploadLogoResponse> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const url = `${baseURL}/companies/${companyId}/logo`
      
      console.log('📡 UPLOAD LOGO DETAILS:')
      console.log('  URL:', url)
      console.log('  File name:', file.name)
      console.log('  File size:', file.size, 'bytes')
      console.log('  File type:', file.type)
      console.log('  Token available:', !!accessToken.value)
      
      // Log FormData entries
      console.log('  FormData entries:')
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`    ${pair[0]}: ${pair[1].name} (${pair[1].size} bytes, ${pair[1].type})`)
        } else {
          console.log(`    ${pair[0]}: ${pair[1]}`)
        }
      }
      
      // Gunakan fetch biasa untuk debugging yang lebih baik
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.value}`
          // Jangan set Content-Type, biar browser yang set dengan boundary
        },
        body: formData
      })
      
      const data = await response.json()
      console.log('📥 Response status:', response.status)
      console.log('📥 Response data:', data)
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Upload failed')
      }
      
      // Response bisa dalam format { status: 'success', data: {...} } atau langsung {...}
      if (data?.status === 'success' && data?.data) {
        return data.data as UploadLogoResponse
      }
      
      return data as UploadLogoResponse
    } catch (error: any) {
      console.error('❌ Upload error:', error)
      throw error
    }
  }

  // ============= REMOVE COMPANY LOGO =============
  const removeLogo = async (companyId: string): Promise<void> => {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      }
      
      if (accessToken.value) {
        headers['Authorization'] = `Bearer ${accessToken.value}`
      }
      
      const url = `${baseURL}/companies/${companyId}/logo`
      
      console.log('📡 REMOVE LOGO:', url)
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers
      })
      
      console.log('📥 Remove response status:', response.status)
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Remove failed')
      }
      
      console.log('✅ Logo removed')
    } catch (error: any) {
      console.error('❌ Remove error:', error)
      throw error
    }
  }

  const getCompanyById = async (id: string): Promise<Company> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/companies/${id}`
      
      const response = await $fetch<any>(url, { headers })
      
      return handleResponse<Company>(response)
    } catch (error) {
      console.error('Error fetching company:', error)
      throw error
    }
  }

  const checkUserCompany = async (userId: string): Promise<{ hasCompany: boolean; company?: Company }> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/companies/check/${userId}`
      
      const response = await $fetch<any>(url, { headers })
      
      return handleResponse<{ hasCompany: boolean; company?: Company }>(response)
    } catch (error) {
      console.error('Error checking user company:', error)
      throw error
    }
  }

  return {
    getMyCompany,
    createMyCompany,
    updateMyCompany,
    uploadLogo,
    removeLogo,
    getCompanyById,
    checkUserCompany
  }
}