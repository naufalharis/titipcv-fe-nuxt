// composables/useJobCategories.ts
import { useAuth } from './useAuth'

// Export interfaces agar bisa digunakan di komponen lain
export interface JobCategoryTranslation {
  id?: string
  categoryId?: string
  localeId: string
  name: string
  description?: string
  createdAt?: number
  updatedAt?: number
}

export interface JobCategory {
  id: string
  slug: string
  parentId: string | null
  isActive: boolean
  translations: JobCategoryTranslation[]
  createdAt: number
  updatedAt: number
  deletedAt?: number | null
  createdBy?: string | null
  updatedBy?: string | null
  deletedBy?: string | null
}

export interface JobCategoriesResponse {
  status: string
  message: string
  data: {
    categories: JobCategory[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export const useJobCategories = () => {
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

  // Get all job categories (active)
  const getJobCategories = async (): Promise<JobCategoriesResponse> => {
    try {
      const headers = getHeaders()
      const response = await $fetch<JobCategoriesResponse>(`${baseURL}/job-categories`, {
        headers
      })
      return response
    } catch (error) {
      console.error('Error fetching job categories:', error)
      throw error
    }
  }

  // Get deleted job categories
  const getDeletedJobCategories = async (): Promise<JobCategoriesResponse> => {
    try {
      const headers = getHeaders()
      const response = await $fetch<JobCategoriesResponse>(`${baseURL}/job-categories/deleted`, {
        headers
      })
      return response
    } catch (error) {
      console.error('Error fetching deleted job categories:', error)
      throw error
    }
  }

  // Search job categories by name or slug
  const searchJobCategories = async (query: string): Promise<JobCategoriesResponse> => {
    try {
      const headers = getHeaders()
      const response = await $fetch<JobCategoriesResponse>(`${baseURL}/job-categories/search`, {
        headers,
        params: {
          q: query
        }
      })
      return response
    } catch (error) {
      console.error('Error searching job categories:', error)
      throw error
    }
  }

  // Get job categories by parent ID
  const getJobCategoriesByParent = async (parentId: string): Promise<JobCategoriesResponse> => {
    try {
      const headers = getHeaders()
      const response = await $fetch<JobCategoriesResponse>(`${baseURL}/job-categories/parent/${parentId}`, {
        headers
      })
      return response
    } catch (error) {
      console.error('Error fetching job categories by parent:', error)
      throw error
    }
  }

  // Get job category by ID
  const getJobCategoryById = async (id: string): Promise<JobCategory> => {
    try {
      const headers = getHeaders()
      const response = await $fetch<{ status: string; data: JobCategory }>(`${baseURL}/job-categories/${id}`, {
        headers
      })
      return response.data
    } catch (error) {
      console.error('Error fetching job category:', error)
      throw error
    }
  }

  // Create job category - SESUAIKAN DENGAN CONTOH REQUEST
  const createJobCategory = async (categoryData: {
    name: string
    slug: string
    parentId?: string | null
    isActive?: boolean
    translations: {
      localeId: string
      name: string
      description?: string
    }[]
  }): Promise<JobCategory> => {
    try {
      const headers = getHeaders()
      console.log('Creating job category with data:', categoryData)
      
      const response = await $fetch<{ status: string; data: JobCategory }>(`${baseURL}/job-categories`, {
        method: 'POST',
        headers,
        body: categoryData
      })
      return response.data
    } catch (error) {
      console.error('Error creating job category:', error)
      throw error
    }
  }

  // Update job category
  const updateJobCategory = async (id: string, categoryData: {
    name?: string  // Tambahkan name
    slug?: string
    parentId?: string | null
    isActive?: boolean
    translations?: {
      localeId: string
      name: string
      description?: string
    }[]
  }): Promise<JobCategory> => {
    try {
      const headers = getHeaders()
      console.log('Updating job category with data:', categoryData)
      
      const response = await $fetch<{ status: string; data: JobCategory }>(`${baseURL}/job-categories/${id}`, {
        method: 'PATCH',
        headers,
        body: categoryData
      })
      return response.data
    } catch (error) {
      console.error('Error updating job category:', error)
      throw error
    }
  }

  // Delete job category (soft delete)
  const deleteJobCategory = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      console.log('Soft deleting job category:', id)
      
      await $fetch(`${baseURL}/job-categories/${id}`, {
        method: 'DELETE',
        headers
      })
      console.log('Job category soft deleted successfully')
    } catch (error) {
      console.error('Error deleting job category:', error)
      throw error
    }
  }

  // Restore job category
  const restoreJobCategory = async (id: string): Promise<JobCategory> => {
    try {
      const headers = getHeaders()
      const response = await $fetch<{ status: string; data: JobCategory }>(`${baseURL}/job-categories/${id}/restore`, {
        method: 'PATCH',
        headers
      })
      return response.data
    } catch (error) {
      console.error('Error restoring job category:', error)
      throw error
    }
  }

  // Get all job categories including deleted
  const getAllJobCategoriesWithDeleted = async (): Promise<JobCategoriesResponse> => {
    try {
      const headers = getHeaders()
      const response = await $fetch<JobCategoriesResponse>(`${baseURL}/job-categories/with-deleted`, {
        headers
      })
      return response
    } catch (error) {
      console.error('Error fetching all job categories with deleted:', error)
      throw error
    }
  }

  return {
    getJobCategories,
    getDeletedJobCategories,
    searchJobCategories,
    getJobCategoriesByParent,
    getJobCategoryById,
    createJobCategory,
    updateJobCategory,
    deleteJobCategory,
    restoreJobCategory,
    getAllJobCategoriesWithDeleted
  }
}