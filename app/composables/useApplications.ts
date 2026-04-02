// composables/useApplications.ts
import { useAuth } from './useAuth'

export interface ScreeningQuestion {
  id: string
  question: string
  answerType: string
  options?: string[]
  isRequired: boolean
  order: number
}

export interface ScreeningAnswer {
  id: string
  applicationId: string
  questionId: string
  question?: ScreeningQuestion
  answer: string
  score?: number
  createdAt: number
  updatedAt: number
}

export interface JobApplication {
  id: string
  jobId: string
  userId: string
  status: string
  coverLetter?: string
  resumeUrl?: string
  createdAt: number
  updatedAt: number
  deletedAt?: number
  job?: {
    id: string
    title: string
    slug: string
    description: string
    summary?: string
    city?: string
    workType?: {
      id: string
      name: string
    }
    company?: {
      id: string
      name: string
      logo?: string
    }
  },
  user?: {
    id: string
    email: string
    username: string
  },
  statusRef?: {
    slug: string
    title: string
    sortOrder: number
  },
  screeningAnswers?: ScreeningAnswer[]
}

export interface ApplicationStats {
  total: number
  inReview: number
  accepted: number
  rejected: number
}

export interface ApplicationListResponse {
  data: JobApplication[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const useApplications = () => {
  const { accessToken, user } = useAuth()
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

  // Get all applications (for admin/recruiter)
  const getAllApplications = async (params?: {
    page?: number
    pageSize?: number
    jobId?: string
    userId?: string
    status?: string
  }): Promise<ApplicationListResponse> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
      if (params?.jobId) queryParams.append('jobId', params.jobId)
      if (params?.userId) queryParams.append('userId', params.userId)
      if (params?.status) queryParams.append('status', params.status)
      
      const url = queryParams.toString() 
        ? `${baseURL}/job-applications?${queryParams.toString()}`
        : `${baseURL}/job-applications`
      
      const response = await $fetch<any>(url, { headers })
      
      if (response?.data) {
        return {
          data: response.data,
          pagination: response.pagination || {
            page: params?.page || 1,
            pageSize: params?.pageSize || 10,
            total: response.data.length,
            totalPages: 1
          }
        }
      }
      
      return { data: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } }
    } catch (error) {
      console.error('Error fetching applications:', error)
      return { data: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } }
    }
  }

  // Get my applications (for jobseeker)
  const getMyApplications = async (params?: {
    page?: number
    pageSize?: number
    status?: string
  }): Promise<ApplicationListResponse> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()

      // Add userId to filter applications for current user
      if (user.value?.id) {
        queryParams.append('userId', user.value.id)
      }

      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
      if (params?.status) queryParams.append('status', params.status)

      const url = queryParams.toString()
        ? `${baseURL}/job-applications?${queryParams.toString()}`
        : `${baseURL}/job-applications`

      const response = await $fetch<any>(url, { headers })

      if (response?.data?.data) {
        return {
          data: response.data.data,
          pagination: response.data.pagination || {
            page: params?.page || 1,
            pageSize: params?.pageSize || 10,
            total: response.data.data.length,
            totalPages: Math.ceil((response.data.pagination?.total || response.data.data.length) / (params?.pageSize || 10))
          }
        }
      }

      return { data: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } }
    } catch (error) {
      console.error('Error fetching my applications:', error)
      // Since the endpoint seems to not exist or be implemented, return empty data
      // This allows the application to load without crashing
      return {
        data: [],
        pagination: {
          page: params?.page || 1,
          pageSize: params?.pageSize || 10,
          total: 0,
          totalPages: 0
        }
      }
    }
  }

  // Get application by ID
  const getApplicationById = async (id: string): Promise<JobApplication> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/job-applications/${id}`
      
      const response = await $fetch<any>(url, { headers })
      
      return response?.data || response
    } catch (error) {
      console.error('Error fetching application:', error)
      // Return a default application object to prevent crashes
      return {
        id,
        jobId: '',
        userId: '',
        status: 'unknown',
        createdAt: 0,
        updatedAt: 0
      } as JobApplication
    }
  }

  // Update application status
  const updateApplicationStatus = async (id: string, status: string): Promise<JobApplication> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/job-applications/${id}/status`
      
      const response = await $fetch<any>(url, {
        method: 'PATCH',
        headers,
        body: { status }
      })
      
      return response?.data || response
    } catch (error) {
      console.error('Error updating application status:', error)
      throw error
    }
  }

  // Delete application
  const deleteApplication = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/job-applications/${id}`
      
      await $fetch(url, {
        method: 'DELETE',
        headers
      })
    } catch (error) {
      console.error('Error deleting application:', error)
      throw error
    }
  }

  // Get screening answers for an application
  const getScreeningAnswers = async (applicationId: string): Promise<ScreeningAnswer[]> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/job-applications/${applicationId}/screening-answers`
      
      const response = await $fetch<any>(url, { headers })
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data
      }
      if (Array.isArray(response)) {
        return response
      }
      return []
    } catch (error) {
      console.error('Error fetching screening answers:', error)
      return []
    }
  }

  // Get screening score for an application
  const getScreeningScore = async (applicationId: string): Promise<{ averageScore?: number; totalAnswers: number; scoredAnswers: number }> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/job-applications/${applicationId}/screening-score`
      
      const response = await $fetch<any>(url, { headers })
      
      return {
        averageScore: response?.averageScore,
        totalAnswers: response?.totalAnswers || 0,
        scoredAnswers: response?.scoredAnswers || 0
      }
    } catch (error) {
      console.error('Error fetching screening score:', error)
      return { totalAnswers: 0, scoredAnswers: 0 }
    }
  }

  // Get application stats for jobseeker
  const getApplicationStats = async (): Promise<ApplicationStats> => {
    try {
      // Try to get stats from dedicated endpoint first
      const headers = getHeaders()
      const url = `${baseURL}/job-applications/me/stats`

      const response = await $fetch<any>(url, { headers })

      return {
        total: response?.total || 0,
        inReview: response?.inReview || 0,
        accepted: response?.accepted || 0,
        rejected: response?.rejected || 0
      }
    } catch (error) {
      console.error('Error fetching application stats from dedicated endpoint, calculating from applications:', error)

      // Fallback: get all applications for current user and calculate stats
      try {
        const headers = getHeaders()
        const queryParams = new URLSearchParams()

        if (user.value?.id) {
          queryParams.append('userId', user.value.id)
        }

        // Get a large number of applications to calculate accurate stats
        queryParams.append('page', '1')
        queryParams.append('pageSize', '1000')

        const url = `${baseURL}/job-applications?${queryParams.toString()}`
        const response = await $fetch<any>(url, { headers })

        const applications = response?.data?.data || []

        const stats = applications.reduce(
          (acc: { total: number; inReview: number; accepted: number; rejected: number }, app: any) => {
            acc.total++
            switch (app.status) {
              case 'pending':
              case 'reviewed':
              case 'shortlisted':
              case 'interviewed':
                acc.inReview++
                break
              case 'hired':
              case 'offered':
                acc.accepted++
                break
              case 'rejected':
                acc.rejected++
                break
            }
            return acc
          },
          { total: 0, inReview: 0, accepted: 0, rejected: 0 }
        )

        return stats
      } catch (fallbackError) {
        console.error('Error calculating stats from applications, returning default stats:', fallbackError)
        // Return default stats if everything fails
        return {
          total: 0,
          inReview: 0,
          accepted: 0,
          rejected: 0
        }
      }
    }
  }

  // Get all application statuses
  const getApplicationStatuses = async (): Promise<{ slug: string; title: string; sortOrder: number }[]> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/job-applications/statuses`
      
      const response = await $fetch<any>(url, { headers })
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data
      }
      if (Array.isArray(response)) {
        return response
      }
      return []
    } catch (error) {
      console.error('Error fetching application statuses:', error)
      return []
    }
  }

  return {
    getAllApplications,
    getMyApplications,
    getApplicationById,
    updateApplicationStatus,
    deleteApplication,
    getScreeningAnswers,
    getScreeningScore,
    getApplicationStats,
    getApplicationStatuses
  }
}