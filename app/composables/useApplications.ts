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

export interface CompanyStats {
  totalApplications: number
  [key: string]: any
}

export interface AcceptedRejectedStats {
  accepted: number
  rejected: number
  [key: string]: any
}

export interface ProcessingStats {
  pending: number
  reviewed: number
  shortlisted: number
  interviewed: number
  [key: string]: any
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
  const { accessToken, user, refreshAccessToken, logout } = useAuth()
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
    const doFetch = async () => {
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

      return await $fetch<any>(url, { headers })
    }

    try {
      const response = await doFetch()

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
    } catch (error: any) {
      if (error?.status === 401) {
        const tokenRefreshed = await refreshAccessToken()
        if (tokenRefreshed) {
          const response = await doFetch()
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
        }
        await logout()
      }

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
    const tryUpdate = async () => {
      const headers = getHeaders()
      const url = `${baseURL}/job-applications/${id}/status`

      const response = await $fetch<any>(url, {
        method: 'PATCH',
        headers,
        body: { status }
      })

      return response?.data || response
    }

    try {
      return await tryUpdate()
    } catch (error: any) {
      if (error?.status === 401) {
        console.warn('Unauthorized while updating application status, trying refresh token...')
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          return await tryUpdate()
        }

        await logout()
        throw new Error('Authentication expired, please log in again.')
      }

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

  // Get company stats
  const getCompanyStats = async (companyId: string): Promise<CompanyStats> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/job-applications/company/${companyId}/stats`
      
      const response = await $fetch<any>(url, { headers })
      
      return {
        totalApplications: response?.totalApplications || 0
      }
    } catch (error) {
      console.error('Error fetching company stats:', error)
      return { totalApplications: 0 }
    }
  }

  // Get company accepted and rejected stats
  const getCompanyAcceptedRejectedStats = async (companyId: string): Promise<AcceptedRejectedStats> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/job-applications/company/${companyId}/accepted-rejected-stats`
      
      const response = await $fetch<any>(url, { headers })
      
      return {
        accepted: response?.accepted || 0,
        rejected: response?.rejected || 0
      }
    } catch (error) {
      console.error('Error fetching company accepted/rejected stats:', error)
      return { accepted: 0, rejected: 0 }
    }
  }

  // Get company processing stats
  const getCompanyProcessingStats = async (companyId: string): Promise<ProcessingStats> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/job-applications/company/${companyId}/processing-stats`
      
      const response = await $fetch<any>(url, { headers })
      
      return {
        pending: response?.pending || 0,
        reviewed: response?.reviewed || 0,
        shortlisted: response?.shortlisted || 0,
        interviewed: response?.interviewed || 0
      }
    } catch (error) {
      console.error('Error fetching company processing stats:', error)
      return { pending: 0, reviewed: 0, shortlisted: 0, interviewed: 0 }
    }
  }

  // Get status color
  const getStatusColor = (status: string): string => {
    const statusColorMap: Record<string, string> = {
      'pending': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
      'reviewed': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      'shortlisted': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
      'interviewed': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200',
      'accepted': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      'hired': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      'offered': 'bg-lime-100 dark:bg-lime-900/30 text-lime-800 dark:text-lime-200',
      'rejected': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
    }
    return statusColorMap[status?.toLowerCase()] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }

  // Get status label
  const getStatusLabel = (status: string): string => {
    const statusLabelMap: Record<string, string> = {
      'pending': 'Pending',
      'reviewed': 'Reviewed',
      'shortlisted': 'Shortlisted',
      'interviewed': 'Interviewed',
      'accepted': 'Accepted',
      'hired': 'Hired',
      'offered': 'Offered',
      'rejected': 'Rejected'
    }
    return statusLabelMap[status?.toLowerCase()] || status || 'Unknown'
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
    getApplicationStatuses,
    getCompanyStats,
    getCompanyAcceptedRejectedStats,
    getCompanyProcessingStats,
    getStatusColor,
    getStatusLabel
  }
}