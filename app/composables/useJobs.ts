// composables/useJobs.ts
import { useAuth } from './useAuth'

export interface Job {
  id: string
  title: string
  slug: string
  description: string
  summary?: string | null
  qualification?: string | null
  benefits?: string | null
  companyId?: string | null
  categoryId?: string | null
  countryId?: string | null
  workTypeId?: string | null
  payTypeId?: string | null
  currencyId?: string | null
  workPlaceId?: string | null
  city?: string | null
  payFrom?: string | null
  payTo?: string | null
  videoUrl?: string | null
  showSalary: boolean
  isPrivate: boolean
  status: string
  publishedAt?: number | null
  expiresAt?: number | null
  createdAt: number
  updatedAt: number
  deletedAt?: number | null
  createdBy?: string | null
  updatedBy?: string | null
  deletedBy?: string | null
  
  // Nested objects
  company?: CompanyResponse | null
  category?: JobCategoryResponse | null
  country?: CountryResponse | null
  workType?: WorkTypeResponse | null
  payType?: PayTypeResponse | null
  currency?: CurrencyResponse | null
  workPlace?: WorkPlaceResponse | null
  creator?: CreatorResponse | null
  
  // Relations
  jobApplications?: any[]
  screeningQuestions?: ScreeningQuestion[]
}

export interface CompanyResponse {
  id: string
  name: string
  logo?: string
}

export interface JobCategoryResponse {
  id: string
  name: string
  slug?: string
}

export interface CountryResponse {
  id: string
  name: string
  code?: string
}

export interface WorkTypeResponse {
  id: string
  name: string
}

export interface PayTypeResponse {
  id: string
  name: string
}

export interface CurrencyResponse {
  id: string
  code: string
  name: string
  symbol?: string
}

export interface WorkPlaceResponse {
  id: string
  name: string
}

export interface CreatorResponse {
  id: string
  name: string
  email: string
}

export interface ScreeningQuestion {
  id: string
  jobId: string
  question: string
  answerType: string
  options?: string[]
  isRequired: boolean
  order: number
  createdAt: number
  updatedAt: number
}

export interface CreateScreeningQuestionRequest {
  question: string
  answerType: string
  options?: string[]
  isRequired: boolean
  order?: number
}

export interface CreateJobRequest {
  companyId: string
  title: string
  slug?: string | null
  description: string
  summary?: string | null
  qualification?: string | null
  benefits?: string | null
  categoryId?: string | null
  countryId?: string | null
  workTypeId?: string | null
  payTypeId?: string | null
  currencyId?: string | null
  workPlaceId?: string | null
  city?: string | null
  payFrom?: number | null
  payTo?: number | null
  videoUrl?: string | null
  showSalary?: boolean | null
  isPrivate?: boolean | null
  publishedAt?: number | null
  expiresAt?: number | null
  screeningQuestions?: CreateScreeningQuestionRequest[]
}

export interface UpdateJobRequest {
  title?: string | null
  slug?: string | null
  description?: string | null
  summary?: string | null
  qualification?: string | null
  benefits?: string | null
  categoryId?: string | null
  countryId?: string | null
  workTypeId?: string | null
  payTypeId?: string | null
  currencyId?: string | null
  workPlaceId?: string | null
  city?: string | null
  payFrom?: number | null
  payTo?: number | null
  videoUrl?: string | null
  showSalary?: boolean | null
  isPrivate?: boolean | null
  publishedAt?: number | null
  expiresAt?: number | null
}

export interface UpdateJobStatusRequest {
  status: string
}

export interface JobStatusResponse {
  id: string
  status: string
  updatedAt: number
  updatedBy: string
}

export interface JobListResponse {
  jobs: Job[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface JobStats {
  total: number
  active: number
  draft: number
  closed: number
  pending: number
  rejected: number
  byCompany?: Record<string, number>
  byCategory?: Record<string, number>
  byCountry?: Record<string, number>
}

export const useJobs = () => {
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

  // ============= JOB CATEGORIES =============
  const getJobCategories = async (): Promise<JobCategoryResponse[]> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/job-categories`
      
      const response = await $fetch<any>(url, { 
        headers,
        retry: 1,
        retryDelay: 1000
      })
      
      if (response?.status === 'success' && response?.data?.categories) {
        const categories = response.data.categories
        return categories.map((cat: any) => {
          let name = cat.slug || 'Unknown'
          if (cat.translations && cat.translations.length > 0) {
            name = cat.translations[0].name || cat.slug
          }
          return {
            id: cat.id,
            name: name,
            slug: cat.slug
          }
        })
      }
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data.map((cat: any) => ({
          id: cat.id,
          name: cat.translations?.[0]?.name || cat.slug || 'Unknown',
          slug: cat.slug
        }))
      }
      
      if (Array.isArray(response)) {
        return response.map((cat: any) => ({
          id: cat.id,
          name: cat.translations?.[0]?.name || cat.slug || 'Unknown',
          slug: cat.slug
        }))
      }
      
      return []
    } catch (error) {
      console.error('Error fetching job categories:', error)
      return []
    }
  }

  // ============= WORK TYPES =============
  const getWorkTypes = async (): Promise<WorkTypeResponse[]> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/work-types/`
      
      const response = await $fetch<any>(url, { 
        headers,
        retry: 1,
        retryDelay: 1000
      })
      
      if (response?.status === 'success' && response?.data) {
        const data = response.data
        if (Array.isArray(data)) return data
        if (data.workTypes && Array.isArray(data.workTypes)) return data.workTypes
        if (data.data && Array.isArray(data.data)) return data.data
      }
      
      if (response?.data && Array.isArray(response.data)) return response.data
      if (Array.isArray(response)) return response
      
      return []
    } catch (error) {
      console.error('Error fetching work types:', error)
      return []
    }
  }

  // ============= PAY TYPES =============
  const getPayTypes = async (): Promise<PayTypeResponse[]> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/pay-types/`
      
      const response = await $fetch<any>(url, { 
        headers,
        retry: 1,
        retryDelay: 1000
      })
      
      if (response?.status === 'success' && response?.data) {
        const data = response.data
        if (Array.isArray(data)) return data
        if (data.payTypes && Array.isArray(data.payTypes)) return data.payTypes
        if (data.data && Array.isArray(data.data)) return data.data
      }
      
      if (response?.data && Array.isArray(response.data)) return response.data
      if (Array.isArray(response)) return response
      
      return []
    } catch (error) {
      console.error('Error fetching pay types:', error)
      return []
    }
  }

  // ============= CURRENCIES =============
  const getCurrencies = async (): Promise<CurrencyResponse[]> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/currencies/`
      
      const response = await $fetch<any>(url, { 
        headers,
        retry: 1,
        retryDelay: 1000
      })
      
      if (response?.status === 'success' && response?.data) {
        const data = response.data
        if (Array.isArray(data)) return data
        if (data.currencies && Array.isArray(data.currencies)) return data.currencies
        if (data.data && Array.isArray(data.data)) return data.data
      }
      
      if (response?.data && Array.isArray(response.data)) return response.data
      if (Array.isArray(response)) return response
      
      return []
    } catch (error) {
      console.error('Error fetching currencies:', error)
      return []
    }
  }

  // ============= WORK PLACES =============
  const getWorkPlaces = async (): Promise<WorkPlaceResponse[]> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/work-places/`
      
      const response = await $fetch<any>(url, { 
        headers,
        retry: 1,
        retryDelay: 1000
      })
      
      if (response?.status === 'success' && response?.data) {
        const data = response.data
        if (Array.isArray(data)) return data
        if (data.workPlaces && Array.isArray(data.workPlaces)) return data.workPlaces
        if (data.data && Array.isArray(data.data)) return data.data
      }
      
      if (response?.data && Array.isArray(response.data)) return response.data
      if (Array.isArray(response)) return response
      
      return []
    } catch (error) {
      console.error('Error fetching work places:', error)
      return []
    }
  }

  // ============= LIST JOBS =============
  const listJobs = async (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    companyId?: string
    categoryId?: string
    workTypeId?: string
    countryId?: string
    city?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<JobListResponse> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.status) queryParams.append('status', params.status)
      if (params?.companyId) queryParams.append('companyId', params.companyId)
      if (params?.categoryId) queryParams.append('categoryId', params.categoryId)
      if (params?.workTypeId) queryParams.append('workTypeId', params.workTypeId)
      if (params?.countryId) queryParams.append('countryId', params.countryId)
      if (params?.city) queryParams.append('city', params.city)
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
      
      const url = queryParams.toString() 
        ? `${baseURL}/jobs?${queryParams.toString()}`
        : `${baseURL}/jobs/`
      
      const response = await $fetch<any>(url, { headers })
      
      if (response?.data) {
        return response.data as JobListResponse
      } else if (response?.jobs) {
        return response as JobListResponse
      }
      return { jobs: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      throw error
    }
  }

  // ============= SEARCH JOBS =============
  const searchJobs = async (params: {
    q: string
    page?: number
    limit?: number
    filters?: Record<string, any>
  }): Promise<JobListResponse> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()
      
      queryParams.append('q', params.q)
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value.toString())
        })
      }
      
      const url = `${baseURL}/jobs/search?${queryParams.toString()}`
      
      const response = await $fetch<any>(url, { headers })
      
      if (response?.data) {
        return response.data as JobListResponse
      } else if (response?.jobs) {
        return response as JobListResponse
      }
      return { jobs: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }
    } catch (error) {
      console.error('Error searching jobs:', error)
      throw error
    }
  }

  // ============= GET JOB STATS =============
  const getJobStats = async (): Promise<JobStats> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs/stats`
      
      const response = await $fetch<any>(url, { 
        headers,
        ignoreResponseError: true 
      })
      
      if (response?.status === 'success' && response?.data) {
        const data = response.data
        return {
          total: data.totalJobs || 0,
          active: data.activeJobs || 0,
          pending: data.pendingJobs || 0,
          draft: data.draftJobs || 0,
          closed: data.expiredJobs || 0,
          rejected: data.rejectedJobs || 0,
          byCompany: data.jobsByCompany,
          byCategory: data.jobsByCategory,
          byCountry: data.jobsByCountry
        }
      }
      
      return {
        total: 0,
        active: 0,
        draft: 0,
        closed: 0,
        pending: 0,
        rejected: 0
      }
    } catch (error) {
      console.error('Error fetching job stats:', error)
      return {
        total: 0,
        active: 0,
        draft: 0,
        closed: 0,
        pending: 0,
        rejected: 0
      }
    }
  }

  // ============= GET JOB BY ID =============
  const getJobById = async (id: string): Promise<Job> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs/${id}`
      
      const response = await $fetch<any>(url, { headers })
      
      return handleResponse<Job>(response)
    } catch (error) {
      console.error('Error fetching job:', error)
      throw error
    }
  }

  // ============= GET ALL JOBS (Helper) =============
  const getAllJobs = async (): Promise<Job[]> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs?limit=1000`
      
      const response = await $fetch<any>(url, { headers })
      
      let allJobs: any[] = []
      if (response?.data?.jobs) {
        allJobs = response.data.jobs
      } else if (response?.jobs) {
        allJobs = response.jobs
      }
      
      return allJobs
    } catch (error) {
      console.error('Error fetching all jobs:', error)
      return []
    }
  }

  // ============= GET JOBS BY COMPANY (Fixed - with manual filter) =============
  const getJobsByCompany = async (companyId: string, params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<JobListResponse> => {
    try {
      console.log('🔍 GET JOBS BY COMPANY - Fetching all jobs first...')
      
      // Ambil semua jobs terlebih dahulu
      const allJobs = await getAllJobs()
      
      console.log('📊 Total jobs from API:', allJobs.length)
      
      // Filter jobs untuk company ini
      let filteredJobs = allJobs.filter((job: Job) => job.companyId === companyId)
      console.log('📊 Jobs for company:', filteredJobs.length)
      
      // Filter by status if needed
      if (params?.status) {
        filteredJobs = filteredJobs.filter((job: Job) => job.status === params.status)
        console.log('📊 Jobs after status filter:', filteredJobs.length)
      }
      
      // Apply pagination
      const page = params?.page || 1
      const pageSize = params?.limit || 10
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const paginatedJobs = filteredJobs.slice(start, end)
      
      console.log('📊 Paginated jobs:', paginatedJobs.length)
      
      return {
        jobs: paginatedJobs,
        total: filteredJobs.length,
        page: page,
        pageSize: pageSize,
        totalPages: Math.ceil(filteredJobs.length / pageSize)
      }
    } catch (error: any) {
      console.error('❌ Error fetching company jobs:', error)
      return { jobs: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }
    }
  }

  // ============= GET COMPANY JOB STATS (Fixed) =============
  const getCompanyJobStats = async (companyId: string): Promise<JobStats> => {
    try {
      console.log('🔍 GET COMPANY JOB STATS - Fetching all jobs first...')
      
      // Ambil semua jobs
      const allJobs = await getAllJobs()
      
      // Filter jobs untuk company ini
      const companyJobs = allJobs.filter((job: Job) => job.companyId === companyId)
      
      console.log('📊 Company jobs count:', companyJobs.length)
      
      // Hitung stats
      const stats = {
        total: companyJobs.length,
        active: companyJobs.filter((job: Job) => job.status === 'active').length,
        pending: companyJobs.filter((job: Job) => job.status === 'pending').length,
        draft: companyJobs.filter((job: Job) => job.status === 'draft').length,
        closed: companyJobs.filter((job: Job) => job.status === 'closed').length,
        rejected: companyJobs.filter((job: Job) => job.status === 'rejected').length
      }
      
      console.log('📊 Calculated stats:', stats)
      
      return stats
    } catch (error: any) {
      console.error('❌ Error calculating company stats:', error)
      return {
        total: 0,
        active: 0,
        draft: 0,
        closed: 0,
        pending: 0,
        rejected: 0
      }
    }
  }

  // ============= CREATE JOB =============
  const createJob = async (data: CreateJobRequest): Promise<Job> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs`
      
      const response = await $fetch<any>(url, {
        method: 'POST',
        headers,
        body: data
      })
      
      return handleResponse<Job>(response)
    } catch (error) {
      console.error('Error creating job:', error)
      throw error
    }
  }

  // ============= SAVE JOB AS DRAFT =============
  const saveJobAsDraft = async (data: CreateJobRequest): Promise<Job> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs/draft`
      
      const response = await $fetch<any>(url, {
        method: 'POST',
        headers,
        body: data
      })
      
      return handleResponse<Job>(response)
    } catch (error) {
      console.error('Error saving job as draft:', error)
      throw error
    }
  }

  // ============= UPDATE JOB =============
  const updateJob = async (id: string, data: UpdateJobRequest): Promise<Job> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs/${id}`
      
      const response = await $fetch<any>(url, {
        method: 'PATCH',
        headers,
        body: data
      })
      
      return handleResponse<Job>(response)
    } catch (error) {
      console.error('Error updating job:', error)
      throw error
    }
  }

  // ============= UPDATE JOB STATUS =============
  const updateJobStatus = async (id: string, status: string): Promise<JobStatusResponse> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs/${id}/status`
      
      const response = await $fetch<any>(url, {
        method: 'PATCH',
        headers,
        body: { status }
      })
      
      return handleResponse<JobStatusResponse>(response)
    } catch (error) {
      console.error('Error updating job status:', error)
      throw error
    }
  }

  // ============= DELETE JOB =============
  const deleteJob = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs/${id}`
      
      await $fetch(url, {
        method: 'DELETE',
        headers
      })
    } catch (error) {
      console.error('Error deleting job:', error)
      throw error
    }
  }

  // ============= BULK UPDATE JOB STATUS =============
  const bulkUpdateJobStatus = async (data: { jobIds: string[], status: string }): Promise<any> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs/bulk/status`
      
      const response = await $fetch<any>(url, {
        method: 'PATCH',
        headers,
        body: data
      })
      
      return handleResponse(response)
    } catch (error) {
      console.error('Error bulk updating job status:', error)
      throw error
    }
  }

  // ============= GET PENDING JOBS (Admin) =============
  const getPendingJobs = async (params?: {
    page?: number
    limit?: number
  }): Promise<JobListResponse> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      
      const url = queryParams.toString() 
        ? `${baseURL}/jobs/admin/pending?${queryParams.toString()}`
        : `${baseURL}/jobs/admin/pending`
      
      const response = await $fetch<any>(url, { headers })
      
      if (response?.data) {
        return response.data as JobListResponse
      }
      return { jobs: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }
    } catch (error) {
      console.error('Error fetching pending jobs:', error)
      throw error
    }
  }

  // ============= GET REJECTED JOBS (Admin) =============
  const getRejectedJobs = async (params?: {
    page?: number
    limit?: number
  }): Promise<JobListResponse> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      
      const url = queryParams.toString() 
        ? `${baseURL}/jobs/admin/rejected?${queryParams.toString()}`
        : `${baseURL}/jobs/admin/rejected`
      
      const response = await $fetch<any>(url, { headers })
      
      if (response?.data) {
        return response.data as JobListResponse
      }
      return { jobs: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }
    } catch (error) {
      console.error('Error fetching rejected jobs:', error)
      throw error
    }
  }

  // ============= REINDEX JOBS (SuperAdmin) =============
  const reindexJobs = async (): Promise<any> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs/reindex`
      
      const response = await $fetch<any>(url, {
        method: 'POST',
        headers
      })
      
      return handleResponse(response)
    } catch (error) {
      console.error('Error reindexing jobs:', error)
      throw error
    }
  }

  // ============= SCREENING QUESTIONS =============
  const listScreeningQuestions = async (jobId: string): Promise<ScreeningQuestion[]> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs/${jobId}/screening-questions`
      
      const response = await $fetch<any>(url, { headers })
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data
      } else if (Array.isArray(response)) {
        return response
      }
      return []
    } catch (error) {
      console.error('Error fetching screening questions:', error)
      return []
    }
  }

  const getScreeningQuestion = async (jobId: string, questionId: string): Promise<ScreeningQuestion> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs/${jobId}/screening-questions/${questionId}`
      
      const response = await $fetch<any>(url, { headers })
      
      return handleResponse<ScreeningQuestion>(response)
    } catch (error) {
      console.error('Error fetching screening question:', error)
      throw error
    }
  }

  const createScreeningQuestion = async (jobId: string, data: CreateScreeningQuestionRequest): Promise<ScreeningQuestion> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs/${jobId}/screening-questions`
      
      const response = await $fetch<any>(url, {
        method: 'POST',
        headers,
        body: data
      })
      
      return handleResponse<ScreeningQuestion>(response)
    } catch (error) {
      console.error('Error creating screening question:', error)
      throw error
    }
  }

  const updateScreeningQuestion = async (jobId: string, questionId: string, data: Partial<CreateScreeningQuestionRequest>): Promise<ScreeningQuestion> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs/${jobId}/screening-questions/${questionId}`
      
      const response = await $fetch<any>(url, {
        method: 'PATCH',
        headers,
        body: data
      })
      
      return handleResponse<ScreeningQuestion>(response)
    } catch (error) {
      console.error('Error updating screening question:', error)
      throw error
    }
  }

  const deleteScreeningQuestion = async (jobId: string, questionId: string): Promise<void> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs/${jobId}/screening-questions/${questionId}`
      
      await $fetch(url, {
        method: 'DELETE',
        headers
      })
    } catch (error) {
      console.error('Error deleting screening question:', error)
      throw error
    }
  }

  const reorderScreeningQuestions = async (jobId: string, questionIds: string[]): Promise<ScreeningQuestion[]> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs/${jobId}/screening-questions/reorder`
      
      const response = await $fetch<any>(url, {
        method: 'PATCH',
        headers,
        body: { questionIds }
      })
      
      return handleResponse<ScreeningQuestion[]>(response)
    } catch (error) {
      console.error('Error reordering screening questions:', error)
      throw error
    }
  }

  return {
    // Master data
    getJobCategories,
    getWorkTypes,
    getPayTypes,
    getCurrencies,
    getWorkPlaces,
    
    // Public routes
    listJobs,
    searchJobs,
    getJobStats,
    getJobById,
    
    // Company routes (protected)
    getJobsByCompany,
    getCompanyJobStats,
    
    // CRUD operations (protected)
    createJob,
    saveJobAsDraft,
    updateJob,
    updateJobStatus,
    deleteJob,
    
    // Bulk operations
    bulkUpdateJobStatus,
    
    // Admin routes
    getPendingJobs,
    getRejectedJobs,
    
    // SuperAdmin routes
    reindexJobs,
    
    // Screening questions
    listScreeningQuestions,
    getScreeningQuestion,
    createScreeningQuestion,
    updateScreeningQuestion,
    deleteScreeningQuestion,
    reorderScreeningQuestions
  }
}