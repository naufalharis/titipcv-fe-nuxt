import { useAuth } from './useAuth'

export interface JobFair {
  id: string
  title: string
  shortDescription?: string | null
  description?: string | null
  start?: number | null
  finish?: number | null
  status?: string | null
  bannerId?: string | null
  banner?: Asset | null
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

export interface CreateJobFairRequest {
  title: string
  shortDescription?: string | null
  description?: string | null
  start?: number | null
  finish?: number | null
  status?: string | null
}

export interface UpdateJobFairRequest {
  title?: string
  shortDescription?: string | null
  description?: string | null
  start?: number | null
  finish?: number | null
  status?: string | null
}

export interface ApiResponse<T> {
  status: string
  message: string
  data: T
}

export interface JobFairsData {
  jobFairs: JobFair[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type JobFairsResponse = JobFair[]

export const useJobFairs = () => {
  const { accessToken } = useAuth()
  const runtimeConfig = useRuntimeConfig()
  
  // Gunakan baseURL dari runtimeConfig
  const baseURL = runtimeConfig.public.apiBaseUrl

  // Helper untuk mendapatkan headers dengan token
  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
    
    if (accessToken.value) {
      headers['Authorization'] = `Bearer ${accessToken.value}`
    }
    
    return headers
  }

  // CREATE JOB FAIR (protected)
  const createJobFair = async (data: CreateJobFairRequest): Promise<JobFair> => {
    try {
      const headers = getHeaders()
      
      // PERBAIKAN: Hapus trailing slash
      const url = `${baseURL}/job-fair`
      
      console.log('=== CREATE JOB FAIR ===')
      console.log('URL:', url)
      console.log('Data:', JSON.stringify(data, null, 2))
      
      const response = await $fetch<ApiResponse<JobFair>>(url, {
        method: 'POST',
        headers,
        body: data
      })
      
      console.log('Create response:', response)
      return response.data
    } catch (error) {
      console.error('Error creating job fair:', error)
      throw error
    }
  }

  // GET ALL JOB FAIRS (public - no auth required)
  const getJobFairs = async (params?: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    status?: string
    fromDate?: number
    toDate?: number
  }): Promise<JobFairsResponse> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
      if (params?.status) queryParams.append('status', params.status)
      if (params?.fromDate) queryParams.append('fromDate', params.fromDate.toString())
      if (params?.toDate) queryParams.append('toDate', params.toDate.toString())
      
      // PERBAIKAN: Hapus trailing slash dan gunakan format yang benar
      const url = queryParams.toString() 
        ? `${baseURL}/job-fair?${queryParams.toString()}`
        : `${baseURL}/job-fair`
      
      console.log('Fetching job fairs from:', url)
      
      const response = await $fetch<ApiResponse<JobFairsData>>(url, {
        method: 'GET',
        headers
      })
      
      if (response?.data?.jobFairs && Array.isArray(response.data.jobFairs)) {
        return response.data.jobFairs
      } else {
        console.warn('Unexpected response structure:', response)
        return []
      }
    } catch (error) {
      console.error('Error fetching job fairs:', error)
      throw error
    }
  }

  // GET ALL JOB FAIRS WITH DELETED (protected - requires auth)
  const getAllJobFairsWithDeleted = async (params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<JobFairsResponse> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      
      // PERBAIKAN: Hapus trailing slash
      const url = queryParams.toString() 
        ? `${baseURL}/job-fair/with-deleted?${queryParams.toString()}`
        : `${baseURL}/job-fair/with-deleted`
      
      console.log('Fetching all job fairs with deleted from:', url)
      
      const response = await $fetch<ApiResponse<JobFairsData>>(url, {
        method: 'GET',
        headers
      })
      
      if (response?.data?.jobFairs && Array.isArray(response.data.jobFairs)) {
        return response.data.jobFairs
      } else {
        console.warn('Unexpected response structure:', response)
        return []
      }
    } catch (error) {
      console.error('Error fetching all job fairs:', error)
      throw error
    }
  }

  // GET ACTIVE JOB FAIRS (public)
  const getActiveJobFairs = async (params?: {
    page?: number
    limit?: number
  }): Promise<JobFairsResponse> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      
      // PERBAIKAN: Hapus trailing slash
      const url = queryParams.toString() 
        ? `${baseURL}/job-fair/active?${queryParams.toString()}`
        : `${baseURL}/job-fair/active`
      
      console.log('Fetching active job fairs from:', url)
      
      const response = await $fetch<ApiResponse<JobFairsData>>(url, {
        method: 'GET',
        headers
      })
      
      if (response?.data?.jobFairs && Array.isArray(response.data.jobFairs)) {
        return response.data.jobFairs
      } else {
        return []
      }
    } catch (error) {
      console.error('Error fetching active job fairs:', error)
      throw error
    }
  }

  // GET NEAREST JOB FAIRS (public)
  const getNearestJobFairs = async (params?: {
    limit?: number
  }): Promise<JobFairsResponse> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()
      
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      
      // PERBAIKAN: Hapus trailing slash
      const url = queryParams.toString() 
        ? `${baseURL}/job-fair/nearest?${queryParams.toString()}`
        : `${baseURL}/job-fair/nearest`
      
      console.log('Fetching nearest job fairs from:', url)
      
      const response = await $fetch<ApiResponse<JobFairsData>>(url, {
        method: 'GET',
        headers
      })
      
      if (response?.data?.jobFairs && Array.isArray(response.data.jobFairs)) {
        return response.data.jobFairs
      } else {
        return []
      }
    } catch (error) {
      console.error('Error fetching nearest job fairs:', error)
      throw error
    }
  }

  // SEARCH JOB FAIRS (public)
  const searchJobFairs = async (params: {
    q: string
    page?: number
    limit?: number
  }): Promise<JobFairsResponse> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()
      
      queryParams.append('q', params.q)
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      
      // PERBAIKAN: Hapus trailing slash
      const url = `${baseURL}/job-fair/search?${queryParams.toString()}`
      
      console.log('Searching job fairs from:', url)
      
      const response = await $fetch<ApiResponse<JobFairsData>>(url, {
        method: 'GET',
        headers
      })
      
      if (response?.data?.jobFairs && Array.isArray(response.data.jobFairs)) {
        return response.data.jobFairs
      } else {
        return []
      }
    } catch (error) {
      console.error('Error searching job fairs:', error)
      throw error
    }
  }

  // GET JOB FAIR STATS (public)
  const getJobFairStats = async (): Promise<any> => {
    try {
      const headers = getHeaders()
      // PERBAIKAN: Hapus trailing slash
      const url = `${baseURL}/job-fair/stats`
      
      console.log('Fetching job fair stats from:', url)
      
      const response = await $fetch<ApiResponse<any>>(url, {
        method: 'GET',
        headers
      })
      return response.data
    } catch (error) {
      console.error('Error fetching job fair stats:', error)
      throw error
    }
  }

  // GET JOB FAIR BY ID (public)
  const getJobFairById = async (id: string): Promise<JobFair> => {
    try {
      const headers = getHeaders()
      // PERBAIKAN: Hapus trailing slash
      const url = `${baseURL}/job-fair/${id}`
      
      console.log('Fetching job fair by ID from:', url)
      
      const response = await $fetch<ApiResponse<JobFair>>(url, {
        method: 'GET',
        headers
      })
      return response.data
    } catch (error) {
      console.error('Error fetching job fair:', error)
      throw error
    }
  }

  // UPDATE JOB FAIR (protected)
  const updateJobFair = async (id: string, data: UpdateJobFairRequest): Promise<JobFair> => {
    try {
      const headers = getHeaders()
      // PERBAIKAN: Hapus trailing slash
      const url = `${baseURL}/job-fair/${id}`
      
      console.log('=== UPDATE JOB FAIR ===')
      console.log('URL:', url)
      console.log('Data:', JSON.stringify(data, null, 2))
      
      const response = await $fetch<ApiResponse<JobFair>>(url, {
        method: 'PATCH',
        headers,
        body: data
      })
      
      console.log('Update response:', response)
      return response.data
    } catch (error) {
      console.error('Error updating job fair:', error)
      throw error
    }
  }

  // DELETE JOB FAIR (soft delete) (protected)
  const deleteJobFair = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      // PERBAIKAN: Hapus trailing slash
      const url = `${baseURL}/job-fair/${id}`
      
      console.log('=== DELETE JOB FAIR ===')
      console.log('URL:', url)
      
      await $fetch(url, {
        method: 'DELETE',
        headers
      })
      
      console.log('Job fair deleted successfully')
    } catch (error) {
      console.error('Error deleting job fair:', error)
      throw error
    }
  }

  // RESTORE JOB FAIR (protected)
  const restoreJobFair = async (id: string): Promise<JobFair> => {
    try {
      const headers = getHeaders()
      // PERBAIKAN: Hapus trailing slash
      const url = `${baseURL}/job-fair/${id}/restore`
      
      console.log('=== RESTORE JOB FAIR ===')
      console.log('URL:', url)
      
      const response = await $fetch<ApiResponse<JobFair>>(url, {
        method: 'PATCH',
        headers
      })
      
      console.log('Restore response:', response)
      return response.data
    } catch (error) {
      console.error('Error restoring job fair:', error)
      throw error
    }
  }

  // UPLOAD BANNER (protected)
const uploadBanner = async (id: string, file: File): Promise<Asset> => {
  try {
    // Validasi file
    if (!file) {
      throw new Error('No file provided')
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (!allowedTypes.includes(file.type) || !['jpg', 'jpeg', 'png', 'gif'].includes(fileExt || '')) {
      throw new Error('Invalid file type. Only JPG, JPEG, PNG, GIF are allowed')
    }

    // Validasi ukuran file (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB')
    }

    const formData = new FormData()
    // PERBAIKAN: Gunakan key 'file' sesuai dengan backend
    formData.append('file', file)
    
    const url = `${baseURL}/job-fair/${id}/banner`
    
    console.log('=== UPLOAD BANNER ===')
    console.log('URL:', url)
    console.log('File name:', file.name)
    console.log('File type:', file.type)
    console.log('File size:', file.size, 'bytes')
    
    const response = await $fetch<ApiResponse<Asset>>(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.value}`
        // Jangan set Content-Type untuk FormData
      },
      body: formData
    })
    
    console.log('Upload success:', response)
    return response.data
    
  } catch (error: any) {
    console.error('Error uploading banner:', error)
    
    // Tampilkan pesan error dari backend jika ada
    if (error.data?.message) {
      throw new Error(error.data.message)
    }
    throw error
  }
}

  // REMOVE BANNER (protected)
  const removeBanner = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      // PERBAIKAN: Hapus trailing slash
      const url = `${baseURL}/job-fair/${id}/banner`
      
      console.log('=== REMOVE BANNER ===')
      console.log('URL:', url)
      
      await $fetch(url, {
        method: 'DELETE',
        headers
      })
      
      console.log('Banner removed successfully')
    } catch (error) {
      console.error('Error removing banner:', error)
      throw error
    }
  }

  return {
    getJobFairs,
    getAllJobFairsWithDeleted,
    getActiveJobFairs,
    getNearestJobFairs,
    searchJobFairs,
    getJobFairStats,
    getJobFairById,
    createJobFair,
    updateJobFair,
    deleteJobFair,
    restoreJobFair,
    uploadBanner,
    removeBanner
  }
}