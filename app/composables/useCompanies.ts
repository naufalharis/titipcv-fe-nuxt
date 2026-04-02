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
  companyLogo?: Asset | null
  activeJobsCount?: number
  totalJobsCount?: number
  createdAt: number
  updatedAt: number
  deletedAt?: number | null
  createdBy?: string | null
  updatedBy?: string | null
  deletedBy?: string | null
}

export interface Asset {
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
  status?: string | null
  userId?: string | null
}

export interface UpdateCompanyRequest {
  name?: string
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
  status?: string | null
}

export interface Country {
  id: string
  name: string
  code?: string
  phoneCode?: string
}

export interface CompanyCheckResponse {
  hasCompany: boolean
  company?: Company
}

export interface CompanyValidateEmailResponse {
  available: boolean
  message?: string
}

export interface ApiResponse<T> {
  status: string
  message: string
  data: T
}

export interface CompaniesData {
  companies: Company[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type CompaniesResponse = Company[]

export const useCompanies = () => {
  const { accessToken } = useAuth()
  const runtimeConfig = useRuntimeConfig()
  const baseURL = runtimeConfig.public.apiBaseUrl

  // Helper untuk mendapatkan headers dengan token
  const getHeaders = () => {
    if (!accessToken.value) {
      throw new Error('No access token available')
    }
    
    return {
      'Authorization': `Bearer ${accessToken.value}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  // GET COUNTRIES
  const getCountries = async (): Promise<Country[]> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/countries/`  // PAKAI SLASH
      
      console.log('Fetching countries from:', url)
      
      const response = await $fetch<any>(url, { headers })
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data
      } else if (Array.isArray(response)) {
        return response
      }
      return []
    } catch (error) {
      console.error('Error fetching countries:', error)
      return []
    }
  }

  // GET ALL COMPANIES WITH DELETED
  const getAllCompaniesWithDeleted = async (params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<CompaniesResponse> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      
      const url = queryParams.toString() 
        ? `${baseURL}/companies/with-deleted?${queryParams.toString()}`
        : `${baseURL}/companies/with-deleted`
      
      console.log('Fetching companies from:', url)
      
      const response = await $fetch<any>(url, { headers })
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data
      } else if (Array.isArray(response)) {
        return response
      }
      return []
    } catch (error) {
      console.error('Error fetching companies:', error)
      throw error
    }
  }

  // GET COMPANY BY ID
  const getCompanyById = async (id: string): Promise<Company> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/companies/${id}`
      
      console.log('Fetching company by ID from:', url)
      
      const response = await $fetch<any>(url, { headers })
      
      return response?.data || response
    } catch (error) {
      console.error('Error fetching company:', error)
      throw error
    }
  }

  // CREATE COMPANY - TAMBAH SLASH UNTUK POST
  const createCompany = async (data: CreateCompanyRequest): Promise<Company> => {
    try {
      const headers = getHeaders()
      // TAMBAH SLASH DI AKHIR UNTUK POST
      const url = `${baseURL}/companies/`
      
      console.log('=== CREATE COMPANY ===')
      console.log('URL:', url)
      console.log('Request data:', JSON.stringify(data, null, 2))
      
      const response = await $fetch<any>(url, {
        method: 'POST',
        headers,
        body: data
      })
      
      console.log('Create company response:', response)
      return response?.data || response
    } catch (error) {
      console.error('=== CREATE COMPANY ERROR ===')
      console.error('Error:', error)
      throw error
    }
  }

  // UPDATE COMPANY
  const updateCompany = async (id: string, data: UpdateCompanyRequest): Promise<Company> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/companies/${id}`
      
      console.log('=== UPDATE COMPANY ===')
      console.log('URL:', url)
      console.log('Request data:', JSON.stringify(data, null, 2))
      
      const response = await $fetch<any>(url, {
        method: 'PATCH',
        headers,
        body: data
      })
      
      console.log('Update company response:', response)
      return response?.data || response
    } catch (error) {
      console.error('=== UPDATE COMPANY ERROR ===')
      console.error('Error:', error)
      throw error
    }
  }

  // CREATE MY COMPANY - TAMBAH SLASH UNTUK POST
  const createMyCompany = async (data: CreateCompanyRequest): Promise<Company> => {
    try {
      const headers = getHeaders()
      // TAMBAH SLASH DI AKHIR UNTUK POST
      const url = `${baseURL}/companies/my-company/`
      
      console.log('=== CREATE MY COMPANY ===')
      console.log('URL:', url)
      console.log('Data:', data)
      
      const response = await $fetch<any>(url, {
        method: 'POST',
        headers,
        body: data
      })
      
      return response?.data || response
    } catch (error) {
      console.error('Error creating my company:', error)
      throw error
    }
  }

  // UPDATE MY COMPANY
  const updateMyCompany = async (data: UpdateCompanyRequest): Promise<Company> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/companies/my-company`
      
      console.log('=== UPDATE MY COMPANY ===')
      console.log('URL:', url)
      console.log('Data:', data)
      
      const response = await $fetch<any>(url, {
        method: 'PATCH',
        headers,
        body: data
      })
      
      return response?.data || response
    } catch (error) {
      console.error('Error updating my company:', error)
      throw error
    }
  }

  // DELETE COMPANY
  const deleteCompany = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/companies/${id}`
      
      console.log('=== DELETE COMPANY ===')
      console.log('URL:', url)
      
      await $fetch(url, {
        method: 'DELETE',
        headers
      })
    } catch (error) {
      console.error('Error deleting company:', error)
      throw error
    }
  }

  // RESTORE COMPANY
  const restoreCompany = async (id: string): Promise<Company> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/companies/${id}/restore`
      
      console.log('=== RESTORE COMPANY ===')
      console.log('URL:', url)
      
      const response = await $fetch<any>(url, {
        method: 'PATCH',
        headers
      })
      
      return response?.data || response
    } catch (error) {
      console.error('Error restoring company:', error)
      throw error
    }
  }

  // GET MY COMPANY
  const getMyCompany = async (): Promise<Company | null> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/companies/my-company`
      
      console.log('Fetching my company from:', url)
      
      const response = await $fetch<any>(url, { headers })
      return response?.data || response
    } catch (error) {
      console.error('Error fetching my company:', error)
      return null
    }
  }

  // UPLOAD LOGO
  const uploadLogo = async (id: string, file: File): Promise<Asset> => {
    try {
      const headers = {
        'Authorization': `Bearer ${accessToken.value}`,
        'Accept': 'application/json'
      }
      
      const formData = new FormData()
      formData.append('file', file)
      
      const url = `${baseURL}/companies/${id}/logo`
      
      console.log('=== UPLOAD LOGO ===')
      console.log('URL:', url)
      console.log('File:', file.name)
      
      const response = await $fetch<any>(url, {
        method: 'POST',
        headers,
        body: formData,
        timeout: 30000
      })
      
      return response?.data || response
    } catch (error) {
      console.error('Error uploading logo:', error)
      throw error
    }
  }

  // REMOVE LOGO
  const removeLogo = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/companies/${id}/logo`
      
      console.log('=== REMOVE LOGO ===')
      console.log('URL:', url)
      
      await $fetch(url, {
        method: 'DELETE',
        headers
      })
    } catch (error) {
      console.error('Error removing logo:', error)
      throw error
    }
  }

  // CHECK USER COMPANY
  const checkUserCompany = async (userId: string): Promise<CompanyCheckResponse> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/companies/check/${userId}`
      
      console.log('Checking user company from:', url)
      
      const response = await $fetch<any>(url, { headers })
      return response?.data || response
    } catch (error) {
      console.error('Error checking user company:', error)
      throw error
    }
  }

  // VALIDATE EMAIL
  const validateEmail = async (email: string): Promise<CompanyValidateEmailResponse> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/companies/validate-email?email=${encodeURIComponent(email)}`
      
      console.log('Validating email from:', url)
      
      const response = await $fetch<any>(url, { headers })
      return response?.data || response
    } catch (error) {
      console.error('Error validating email:', error)
      throw error
    }
  }

  return {
    getCompanies: getAllCompaniesWithDeleted,
    getDeletedCompanies: async (params?: any) => {
      try {
        const headers = getHeaders()
        const queryParams = new URLSearchParams()
        if (params?.page) queryParams.append('page', params.page.toString())
        if (params?.limit) queryParams.append('limit', params.limit.toString())
        if (params?.search) queryParams.append('search', params.search)
        
        const url = queryParams.toString() 
          ? `${baseURL}/companies/deleted?${queryParams.toString()}`
          : `${baseURL}/companies/deleted`
        
        const response = await $fetch<any>(url, { headers })
        return response?.data?.companies || []
      } catch (error) {
        console.error('Error fetching deleted companies:', error)
        return []
      }
    },
    getAllCompaniesWithDeleted,
    getMyCompany,
    createMyCompany,
    updateMyCompany,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
    restoreCompany,
    uploadLogo,
    removeLogo,
    checkUserCompany,
    validateEmail,
    getCountries
  }
}