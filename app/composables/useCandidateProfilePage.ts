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
  isReadyToWork?: boolean
  photoAssetId?: string
  cv?: string
  createdAt: number
  updatedAt: number
  updatedBy?: string
}

export interface Company {
  id: string
  name: string
  logo?: string
  website?: string
}

export interface Recruiter {
  id: string
  username: string
  email: string
  role: string
  isActive: boolean
  isVerified: boolean
  isWhatsappVerified: boolean
  createdAt: number
  updatedAt: number
  deletedAt?: number | null
  createdBy?: string | null
  updatedBy?: string | null
  deletedBy?: string | null
}

export interface CandidateProfilePage {
  id: string
  userProfileId: string
  companyId: string
  recruiterId: string
  urlIdentifier: string
  passcode: string
  createdAt: number
  updatedAt: number
  userProfile?: UserProfile
  company?: Company
  recruiter?: Recruiter
}

export interface CreateCandidateProfilePageRequest {
  userProfileId: string
  companyId: string
  passcode: string
}

export interface ValidateCandidateProfilePageRequest {
  urlIdentifier: string
  passcode: string
}

export interface ValidationData {
  id: string
  userProfileId: string
  companyId: string
  recruiterId: string
  urlIdentifier: string
  userProfile?: UserProfile
  company?: Company
  recruiter?: Recruiter
}

export interface ValidationResponse {
  valid: boolean
  message?: string
  data?: ValidationData
}

export interface CandidateProfilePageListResponse {
  pages: CandidateProfilePage[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export const useCandidateProfilePage = () => {
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
    if (response?.data) {
      return response.data as T
    }
    return response as T
  }

  // Create new candidate profile page
  const createCandidateProfilePage = async (data: CreateCandidateProfilePageRequest): Promise<CandidateProfilePage> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/candidate-profile-pages`
      
      const response = await $fetch<any>(url, {
        method: 'POST',
        headers,
        body: data
      })
      
      return handleResponse<CandidateProfilePage>(response)
    } catch (error) {
      console.error('Error creating candidate profile page:', error)
      throw error
    }
  }

  // Get all candidate profile pages
  const getAllCandidateProfilePages = async (params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<CandidateProfilePageListResponse> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      
      const url = queryParams.toString() 
        ? `${baseURL}/candidate-profile-pages?${queryParams.toString()}`
        : `${baseURL}/candidate-profile-pages`
      
      const response = await $fetch<any>(url, { headers })
      
      if (response?.data) {
        return response.data as CandidateProfilePageListResponse
      }
      
      if (response?.pages) {
        return {
          pages: response.pages,
          total: response.total || response.pages.length,
          page: response.page || 1,
          pageSize: response.pageSize || 10,
          totalPages: response.totalPages || 1
        }
      }
      
      return { pages: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }
    } catch (error) {
      console.error('Error fetching candidate profile pages:', error)
      return { pages: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }
    }
  }

  // Get candidate profile pages by company
  const getCandidateProfilePagesByCompany = async (companyId: string, params?: {
    page?: number
    limit?: number
  }): Promise<CandidateProfilePage[]> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      
      const url = queryParams.toString() 
        ? `${baseURL}/candidate-profile-pages/company/${companyId}?${queryParams.toString()}`
        : `${baseURL}/candidate-profile-pages/company/${companyId}`
      
      console.log('🔍 GET CANDIDATE PROFILES - URL:', url)
      
      const response = await $fetch<any>(url, { headers })
      
      console.log('📦 Raw response from API:', response)
      
      // Response is directly an array of profiles
      if (Array.isArray(response)) {
        return response
      }
      
      // Response has data property that is an array
      if (response?.data && Array.isArray(response.data)) {
        return response.data
      }
      
      // Response has pages property
      if (response?.pages && Array.isArray(response.pages)) {
        return response.pages
      }
      
      return []
    } catch (error: any) {
      console.error('❌ Error fetching candidate profile pages by company:')
      console.error('  Status:', error?.response?.status)
      console.error('  Response:', error?.response?._data)
      return []
    }
  }

  // Get candidate profile pages by recruiter
  const getCandidateProfilePagesByRecruiter = async (recruiterId: string, params?: {
    page?: number
    limit?: number
  }): Promise<CandidateProfilePage[]> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      
      const url = queryParams.toString() 
        ? `${baseURL}/candidate-profile-pages/recruiter/${recruiterId}?${queryParams.toString()}`
        : `${baseURL}/candidate-profile-pages/recruiter/${recruiterId}`
      
      const response = await $fetch<any>(url, { headers })
      
      if (Array.isArray(response)) {
        return response
      }
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data
      }
      
      if (response?.pages && Array.isArray(response.pages)) {
        return response.pages
      }
      
      return []
    } catch (error) {
      console.error('Error fetching candidate profile pages by recruiter:', error)
      return []
    }
  }

  // Get candidate profile page by ID
  const getCandidateProfilePageById = async (id: string): Promise<CandidateProfilePage> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/candidate-profile-pages/${id}`
      
      const response = await $fetch<any>(url, { headers })
      
      return handleResponse<CandidateProfilePage>(response)
    } catch (error) {
      console.error('Error fetching candidate profile page:', error)
      throw error
    }
  }

  // Get candidate profile pages by user profile
  const getCandidateProfilePagesByUserProfile = async (userProfileId: string): Promise<CandidateProfilePage[]> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/candidate-profile-pages/user/${userProfileId}`
      
      const response = await $fetch<any>(url, { headers })
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data
      }
      
      if (Array.isArray(response)) {
        return response
      }
      
      return []
    } catch (error) {
      console.error('Error fetching candidate profile pages by user profile:', error)
      return []
    }
  }

  // Validate candidate profile page (public endpoint)
  const validateCandidateProfilePage = async (data: ValidateCandidateProfilePageRequest): Promise<ValidationResponse> => {
    try {
      const headers = { 'Accept': 'application/json' }
      const url = `${baseURL}/candidate-profile-pages/validate`
      
      console.log('🔍 Validating with URL:', url)
      console.log('🔍 Data:', data)
      
      const response = await $fetch<any>(url, {
        method: 'POST',
        headers,
        body: data
      })
      
      console.log('📦 Validation response:', response)
      
      return handleResponse<ValidationResponse>(response)
    } catch (error: any) {
      console.error('Error validating candidate profile page:', error)
      return {
        valid: false,
        message: error?.message || 'Validation failed'
      }
    }
  }

  // Delete candidate profile page
  const deleteCandidateProfilePage = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/candidate-profile-pages/${id}`
      
      await $fetch(url, {
        method: 'DELETE',
        headers
      })
    } catch (error) {
      console.error('Error deleting candidate profile page:', error)
      throw error
    }
  }

  return {
    createCandidateProfilePage,
    getAllCandidateProfilePages,
    getCandidateProfilePagesByCompany,
    getCandidateProfilePagesByRecruiter,
    getCandidateProfilePageById,
    getCandidateProfilePagesByUserProfile,
    validateCandidateProfilePage,
    deleteCandidateProfilePage
  }
}