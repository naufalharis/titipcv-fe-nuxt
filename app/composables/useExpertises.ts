import { useAuth } from './useAuth'

export interface Expertise {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  deletedAt?: number | null
  createdBy?: string | null
  updatedBy?: string | null
  deletedBy?: string | null
}

export interface ExpertisesApiResponse {
  status: string
  message: string
  data: {
    expertises: Expertise[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export const useExpertises = () => {
  const { accessToken } = useAuth()
  const runtimeConfig = useRuntimeConfig()
  // `apiBaseUrl` can be an absolute URL (e.g. http://localhost:3335/api/v1) or a
  // path on the same origin (e.g. /api/v1). the latter is useful when we proxy
  // requests through the Nuxt server (see nuxt.config.ts `devProxy` section).
  const rawBaseURL = runtimeConfig.public.apiBaseUrl || ''
  const baseURL = rawBaseURL.replace(/\/+$/g, '') // strip trailing slashes for safety

  console.log('useExpertises initialized with baseURL:', baseURL)
  console.log('Access token available:', !!accessToken.value)

  // Helper untuk mendapatkan headers (semua endpoint memerlukan auth)
  const getAuthHeaders = () => {
    if (!accessToken.value) {
      console.error('No access token available')
      throw new Error('No access token available')
    }
    
    console.log('Using token:', accessToken.value.substring(0, 20) + '...')
    
    return {
      'Authorization': `Bearer ${accessToken.value}`,
      'Content-Type': 'application/json'
    }
  }

  // Helper untuk mengekstrak expertises dari response
  const extractExpertises = (response: any): Expertise[] => {
    console.log('Extracting expertises from:', response)
    
    // Format response dari backend: { status, message, data: { expertises, total, page, pageSize, totalPages } }
    if (response?.data?.expertises && Array.isArray(response.data.expertises)) {
      console.log('Found expertises in data.expertises, count:', response.data.expertises.length)
      return response.data.expertises
    }
    
    // Fallback: jika response langsung array
    if (Array.isArray(response)) {
      console.log('Response is array, count:', response.length)
      return response
    }
    
    // Fallback: jika response punya property 'expertises' langsung
    if (response?.expertises && Array.isArray(response.expertises)) {
      console.log('Found expertises in response.expertises, count:', response.expertises.length)
      return response.expertises
    }
    
    // Fallback: jika response punya property 'data' yang berisi array
    if (response?.data && Array.isArray(response.data)) {
      console.log('Found data array, count:', response.data.length)
      return response.data
    }
    
    console.warn('No expertises array found in response:', response)
    return []
  }

  // utility that joins the configured base URL with a path fragment
  const buildUrl = (path: string) => {
    const trimmed = path.replace(/^\/+/, '')
    // if baseURL is empty we just return the path so caller can decide
    return baseURL ? `${baseURL}/${trimmed}` : `/${trimmed}`
  }

  // List all active expertises
 // List all active expertises
const getExpertises = async (): Promise<Expertise[]> => {
  try {
    const headers = getAuthHeaders()
    // TAMBAHKAN TRAILING SLASH
    const url = `${baseURL}/expertises/`
    console.log('Fetching expertises from:', url)
    
    const response = await $fetch<ExpertisesApiResponse>(url, {
      headers,
      retry: 1,
      timeout: 10000,
      // Opsional: Ikuti redirect secara manual
      onResponse({ response }) {
        console.log('Response status:', response.status)
        console.log('Response URL:', response.url)
      }
    })
    
    console.log('getExpertises response:', response)
    return extractExpertises(response)
  } catch (error: any) {
    console.error('Error fetching expertises:', error)
    throw error
  }
}
  // Search expertises by name
  const searchExpertises = async (query: string): Promise<Expertise[]> => {
    try {
      const headers = getAuthHeaders()
      const url = `${buildUrl('expertises/search')}?q=${encodeURIComponent(query)}`
      console.log('Searching expertises at:', url)
      
      const response = await $fetch<ExpertisesApiResponse>(url, {
        headers,
        timeout: 10000
      })
      
      console.log('searchExpertises response:', response)
      return extractExpertises(response)
    } catch (error) {
      console.error('Error searching expertises:', error)
      throw error
    }
  }

  // Get expertise by ID
  const getExpertiseById = async (id: string): Promise<Expertise> => {
    try {
      const headers = getAuthHeaders()
      const url = buildUrl(`expertises/${id}`)
      console.log('Fetching expertise by ID:', url)
      
      const response = await $fetch<{ status: string, data: Expertise }>(url, {
        headers,
        timeout: 10000
      })
      
      console.log('getExpertiseById response:', response)
      return response.data
    } catch (error) {
      console.error('Error fetching expertise:', error)
      throw error
    }
  }

  // Get deleted expertises
  const getDeletedExpertises = async (search?: string): Promise<Expertise[]> => {
    try {
      const headers = getAuthHeaders()
      
      const url = search
        ? `${buildUrl('expertises/deleted')}?search=${encodeURIComponent(search)}`
        : buildUrl('expertises/deleted')
      
      console.log('Fetching deleted expertises from:', url)
      
      const response = await $fetch<ExpertisesApiResponse>(url, { 
        headers,
        timeout: 10000 
      })
      
      console.log('getDeletedExpertises response:', response)
      return extractExpertises(response)
    } catch (error) {
      console.error('Error fetching deleted expertises:', error)
      throw error
    }
  }

  // Create expertise
  const createExpertise = async (data: {
    name: string
  }): Promise<Expertise> => {
    try {
      const headers = getAuthHeaders()
      const url = buildUrl('expertises')
      console.log('Creating expertise at:', url, 'with data:', data)
      
      const response = await $fetch<{ status: string, data: Expertise }>(url, {
        method: "POST",
        headers,
        body: {
          name: data.name
        },
        timeout: 10000
      })
      
      console.log('createExpertise response:', response)
      return response.data
    } catch (error) {
      console.error('Error creating expertise:', error)
      throw error
    }
  }

  // Update expertise
  const updateExpertise = async (id: string, data: Partial<Expertise>): Promise<Expertise> => {
    try {
      const headers = getAuthHeaders()
      console.log('Updating expertise at:', `${baseURL}/expertises/${id}`, 'with data:', data)
      
      const response = await $fetch<{ status: string, data: Expertise }>(`${baseURL}/expertises/${id}`, {
        method: "PATCH",
        headers,
        body: data,
        timeout: 10000
      })
      
      console.log('updateExpertise response:', response)
      return response.data
    } catch (error) {
      console.error('Error updating expertise:', error)
      throw error
    }
  }

  // Delete expertise (soft delete)
  const deleteExpertise = async (id: string): Promise<void> => {
    try {
      const headers = getAuthHeaders()
      console.log('Deleting expertise at:', `${baseURL}/expertises/${id}`)
      
      await $fetch(`${baseURL}/expertises/${id}`, {
        method: "DELETE",
        headers,
        timeout: 10000
      })
      
      console.log('deleteExpertise successful')
    } catch (error) {
      console.error('Error deleting expertise:', error)
      throw error
    }
  }

  // Restore soft-deleted expertise
  const restoreExpertise = async (id: string): Promise<Expertise> => {
    try {
      const headers = getAuthHeaders()
      console.log('Restoring expertise at:', `${baseURL}/expertises/${id}/restore`)
      
      const response = await $fetch<{ status: string, data: Expertise }>(`${baseURL}/expertises/${id}/restore`, {
        method: "PATCH",
        headers,
        timeout: 10000
      })
      
      console.log('restoreExpertise response:', response)
      return response.data
    } catch (error) {
      console.error('Error restoring expertise:', error)
      throw error
    }
  }

  return {
    getExpertises,
    searchExpertises,
    getExpertiseById,
    getDeletedExpertises,
    createExpertise,
    updateExpertise,
    deleteExpertise,
    restoreExpertise
  }
}