import { useAuth } from './useAuth'

// Export interfaces
export interface WorkPlaceTranslation {
  id?: string
  workPlaceId?: string
  localeId?: string
  localeCode?: string
  name: string
  description?: string | null
  createdAt?: number
  updatedAt?: number
  locale?: {
    id: string
    code: string
    name: string
  }
}

export interface WorkPlace {
  id: string
  slug: string
  isActive: boolean
  translations?: WorkPlaceTranslation[]
  createdAt: number
  updatedAt: number
  deletedAt?: number | null
  createdBy?: string | null
  updatedBy?: string | null
  deletedBy?: string | null
}

export type WorkPlacesResponse = WorkPlace[]

export interface WorkPlaceResponse {
  data: WorkPlace
}

export const useWorkPlaces = () => {
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

  // GET ALL ACTIVE WORK PLACES - PAKAI TRAILING SLASH
  const getWorkPlaces = async (params?: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    isActive?: boolean
    locale?: string
  }): Promise<WorkPlacesResponse> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString())
      if (params?.locale) queryParams.append('locale', params.locale)
      
      // PAKAI TRAILING SLASH
      const url = queryParams.toString() 
        ? `${baseURL}/work-places/?${queryParams.toString()}`
        : `${baseURL}/work-places/`
      
      console.log('Fetching work places from:', url)
      
      const response = await $fetch<WorkPlacesResponse>(url, {
        headers
      })
      return response
    } catch (error) {
      console.error('Error fetching work places:', error)
      throw error
    }
  }

  // GET DELETED WORK PLACES - PAKAI TRAILING SLASH
  const getDeletedWorkPlaces = async (params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<WorkPlacesResponse> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      
      // PAKAI TRAILING SLASH
      const url = queryParams.toString() 
        ? `${baseURL}/work-places/deleted/?${queryParams.toString()}`
        : `${baseURL}/work-places/deleted/`
      
      console.log('Fetching deleted work places from:', url)
      
      const response = await $fetch<WorkPlacesResponse>(url, {
        headers
      })
      return response
    } catch (error) {
      console.error('Error fetching deleted work places:', error)
      throw error
    }
  }

  // GET WORK PLACE BY ID - TANPA TRAILING SLASH
  const getWorkPlaceById = async (id: string, includeTranslations: boolean = true): Promise<WorkPlace> => {
    try {
      const headers = getHeaders()
      
      // UNTUK ENDPOINT DENGAN ID, TANPA TRAILING SLASH
      const endpoint = includeTranslations 
        ? `${baseURL}/work-places/${id}/all-translations`
        : `${baseURL}/work-places/${id}`
      
      console.log('Fetching work place by ID from:', endpoint)
      
      const response = await $fetch<WorkPlaceResponse>(endpoint, {
        headers
      })
      return response.data
    } catch (error) {
      console.error('Error fetching work place:', error)
      throw error
    }
  }

  // SEARCH WORK PLACES - Perbaiki parameter dan return type
const searchWorkPlaces = async (params: {
  q: string
  locale?: string
  page?: number
  limit?: number
}): Promise<WorkPlacesResponse> => {
  try {
    const headers = getHeaders()
    const queryParams = new URLSearchParams()
    
    queryParams.append('q', params.q)
    if (params.locale) queryParams.append('locale', params.locale)
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    
    // PAKAI TRAILING SLASH SESUAI KONSISTENSI ANDA
    const url = `${baseURL}/work-places/search/?${queryParams.toString()}`
    
    console.log('Searching work places from:', url)
    
    const response = await $fetch<WorkPlacesResponse>(url, {
      headers
    })
    return response
  } catch (error) {
    console.error('Error searching work places:', error)
    throw error
  }
}
  // CREATE WORK PLACE - PAKAI TRAILING SLASH
  const createWorkPlace = async (workPlaceData: {
    slug: string
    translations: {
      localeCode: string
      name: string
      description?: string | null
    }[]
  }): Promise<WorkPlace> => {
    try {
      const headers = getHeaders()
      console.log('Creating work place with data:', workPlaceData)
      
      // PAKAI TRAILING SLASH
      const response = await $fetch<WorkPlaceResponse>(`${baseURL}/work-places/`, {
        method: 'POST',
        headers,
        body: workPlaceData
      })
      return response.data
    } catch (error) {
      console.error('Error creating work place:', error)
      throw error
    }
  }

  // UPDATE WORK PLACE - TANPA TRAILING SLASH
  const updateWorkPlace = async (id: string, workPlaceData: {
    slug?: string
    isActive?: boolean
    translations?: {
      id?: string
      localeCode: string
      name: string
      description?: string | null
    }[]
  }): Promise<WorkPlace> => {
    try {
      const headers = getHeaders()
      console.log('Updating work place with data:', workPlaceData)
      
      // TANPA TRAILING SLASH UNTUK ENDPOINT DENGAN ID
      const response = await $fetch<WorkPlaceResponse>(`${baseURL}/work-places/${id}`, {
        method: 'PATCH',
        headers,
        body: workPlaceData
      })
      return response.data
    } catch (error) {
      console.error('Error updating work place:', error)
      throw error
    }
  }

  // DELETE WORK PLACE - TANPA TRAILING SLASH
  const deleteWorkPlace = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      console.log('Soft deleting work place:', id)
      
      // TANPA TRAILING SLASH UNTUK ENDPOINT DENGAN ID
      await $fetch(`${baseURL}/work-places/${id}`, {
        method: 'DELETE',
        headers
      })
      console.log('Work place soft deleted successfully')
    } catch (error) {
      console.error('Error deleting work place:', error)
      throw error
    }
  }

  // RESTORE WORK PLACE - TANPA TRAILING SLASH
  const restoreWorkPlace = async (id: string): Promise<WorkPlace> => {
    try {
      const headers = getHeaders()
      console.log('Restoring work place:', id)
      
      // TANPA TRAILING SLASH UNTUK ENDPOINT DENGAN ID
      const response = await $fetch<WorkPlaceResponse>(`${baseURL}/work-places/${id}/restore`, {
        method: 'PATCH',
        headers
      })
      return response.data
    } catch (error) {
      console.error('Error restoring work place:', error)
      throw error
    }
  }

  return {
    getWorkPlaces,
    getDeletedWorkPlaces,
    searchWorkPlaces,
    getWorkPlaceById,
    createWorkPlace,
    updateWorkPlace,
    deleteWorkPlace,
    restoreWorkPlace
  }
}