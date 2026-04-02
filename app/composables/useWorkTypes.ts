// composables/useWorkTypes.ts
import { useAuth } from './useAuth'

// Export interfaces agar bisa digunakan di komponen lain
export interface WorkTypeTranslation {
  id?: string
  workTypeId?: string
  localeId: string
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

export interface WorkType {
  id: string
  slug: string
  isActive: boolean
  translations?: WorkTypeTranslation[]  // Optional karena ada yang tidak punya translations
  createdAt: number
  updatedAt: number
  deletedAt?: number | null
  createdBy?: string | null
  updatedBy?: string | null
  deletedBy?: string | null
}

// Response langsung array, tanpa wrapper
export type WorkTypesResponse = WorkType[]

export interface WorkTypeResponse {
  data: WorkType
}

export const useWorkTypes = () => {
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
      'Content-Type': 'application/json'
    }
  }

  // Get all work types (active)
  const getWorkTypes = async (params?: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    isActive?: boolean
    locale?: string
  }): Promise<WorkTypesResponse> => {
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
      
      const url = queryParams.toString() 
        ? `${baseURL}/work-types/?${queryParams.toString()}`
        : `${baseURL}/work-types/`
      
      const response = await $fetch<WorkTypesResponse>(url, {
        headers
      })
      return response // Langsung return array
    } catch (error) {
      console.error('Error fetching work types:', error)
      throw error
    }
  }

  // Get deleted work types
 const getDeletedWorkTypes = async (params?: {
  page?: number
  limit?: number
  search?: string
}): Promise<WorkTypesResponse> => {
  try {
    const headers = getHeaders()
    const queryParams = new URLSearchParams()
    
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    
    // Hapus trailing slash di URL
    const url = queryParams.toString() 
      ? `${baseURL}/work-types/deleted?${queryParams.toString()}`
      : `${baseURL}/work-types/deleted`
    
    console.log('Fetching deleted work types from:', url)
    
    const response = await $fetch<WorkTypesResponse>(url, {
      headers,
      // Tambahkan option untuk mengikuti redirect
      redirect: 'follow'
    })
    return response
  } catch (error) {
    console.error('Error fetching deleted work types:', error)
    throw error
  }
}

  // Get all work types including deleted
  const getAllWorkTypesWithDeleted = async (params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<WorkTypesResponse> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      
      const url = queryParams.toString() 
        ? `${baseURL}/work-types/with-deleted/?${queryParams.toString()}`
        : `${baseURL}/work-types/with-deleted/`
      
      const response = await $fetch<WorkTypesResponse>(url, {
        headers
      })
      return response
    } catch (error) {
      console.error('Error fetching all work types with deleted:', error)
      throw error
    }
  }

  // Search work types
  const searchWorkTypes = async (query: string, locale?: string): Promise<WorkType[]> => {
    try {
      const headers = getHeaders()
      const params = new URLSearchParams()
      params.append('q', query)
      if (locale) params.append('locale', locale)
      
      const response = await $fetch<WorkType[]>(`${baseURL}/work-types/search/?${params.toString()}`, {
        headers
      })
      return response
    } catch (error) {
      console.error('Error searching work types:', error)
      throw error
    }
  }

  // Get work type by ID
  const getWorkTypeById = async (id: string, includeTranslations: boolean = true): Promise<WorkType> => {
    try {
      const headers = getHeaders()
      const endpoint = includeTranslations 
        ? `${baseURL}/work-types/${id}/all-translations/`
        : `${baseURL}/work-types/${id}/`
      
      const response = await $fetch<WorkTypeResponse>(endpoint, {
        headers
      })
      return response.data
    } catch (error) {
      console.error('Error fetching work type:', error)
      throw error
    }
  }

  // Create work type
  const createWorkType = async (workTypeData: {
    slug: string
    translations: {
      localeCode: string
      name: string
      description?: string | null
    }[]
  }): Promise<WorkType> => {
    try {
      const headers = getHeaders()
      console.log('Creating work type with data:', workTypeData)
      
      const response = await $fetch<WorkTypeResponse>(`${baseURL}/work-types/`, {
        method: 'POST',
        headers,
        body: workTypeData
      })
      return response.data
    } catch (error) {
      console.error('Error creating work type:', error)
      throw error
    }
  }

  // Update work type
const updateWorkType = async (id: string, workTypeData: {
  slug?: string
  isActive?: boolean
  translations?: {
    id?: string
    localeCode: string
    name: string
    description?: string | null
  }[]
}): Promise<WorkType> => {
  try {
    const headers = getHeaders()
    console.log('Updating work type with data:', workTypeData)
    
    // Hapus trailing slash untuk endpoint PATCH
    const response = await $fetch<WorkTypeResponse>(`${baseURL}/work-types/${id}`, {
      method: 'PATCH',
      headers,
      body: workTypeData
    })
    return response.data
  } catch (error) {
    console.error('Error updating work type:', error)
    throw error
  }
}

// Delete work type (soft delete)
const deleteWorkType = async (id: string): Promise<void> => {
  try {
    const headers = getHeaders()
    console.log('Soft deleting work type:', id)
    
    // Hapus trailing slash untuk endpoint DELETE
    await $fetch(`${baseURL}/work-types/${id}`, {
      method: 'DELETE',
      headers
    })
    console.log('Work type soft deleted successfully')
  } catch (error) {
    console.error('Error deleting work type:', error)
    throw error
  }
}

// Restore work type
const restoreWorkType = async (id: string): Promise<WorkType> => {
  try {
    const headers = getHeaders()
    // Hapus trailing slash untuk endpoint restore
    const response = await $fetch<WorkTypeResponse>(`${baseURL}/work-types/${id}/restore`, {
      method: 'PATCH',
      headers
    })
    return response.data
  } catch (error) {
    console.error('Error restoring work type:', error)
    throw error
  }
}

  // Reindex work types
  const reindexWorkTypes = async (): Promise<void> => {
    try {
      const headers = getHeaders()
      await $fetch(`${baseURL}/work-types/reindex/`, {
        method: 'POST',
        headers
      })
      console.log('Work types reindexed successfully')
    } catch (error) {
      console.error('Error reindexing work types:', error)
      throw error
    }
  }

  return {
    getWorkTypes,
    getDeletedWorkTypes,
    getAllWorkTypesWithDeleted,
    searchWorkTypes,
    getWorkTypeById,
    createWorkType,
    updateWorkType,
    deleteWorkType,
    restoreWorkType,
    reindexWorkTypes
  }
}