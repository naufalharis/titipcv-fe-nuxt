// composables/useJobBookmark.ts
import { ref } from 'vue'

export interface JobBookmark {
  id: string
  userId: string
  jobId: string
  createdAt: number
  job?: {
    id: string
    title: string
    slug: string
    description: string
    summary: string
    qualification: string
    benefits: string
    city: string
    payFrom: string
    payTo: string
    showSalary: boolean
    workType?: any
    country?: any
    currency?: any
    company?: any
  }
}

export interface ApiResponse<T> {
  status: string
  message: string
  data: T
}

export function useJobBookmark() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getAuthHeaders = () => {
    const { accessToken, isAuthenticated, refreshToken } = useAuth()
    
    if (!isAuthenticated.value || !accessToken.value) {
      throw new Error('User not authenticated')
    }
    
    return {
      'Authorization': `Bearer ${accessToken.value}`,
      'Content-Type': 'application/json'
    }
  }

  const handleResponse = async (response: Response, defaultMessage: string) => {
    if (response.status === 401) {
      // Token expired, coba refresh
      const { refreshToken, isAuthenticated } = useAuth()
      if (refreshToken.value) {
        // Trigger refresh token
        const { refresh } = useAuth()
        const refreshed = await refresh()
        if (refreshed) {
          // Retry the request
          return null // Signal to retry
        }
      }
      throw new Error('Session expired. Please login again.')
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: defaultMessage }))
      throw new Error(errorData.message || defaultMessage)
    }
    
    return await response.json()
  }

  const getMyBookmarks = async (page: number = 1, pageSize: number = 10): Promise<ApiResponse<JobBookmark[]>> => {
    loading.value = true
    error.value = null
    
    try {
      const runtimeConfig = useRuntimeConfig()
      const baseURL = runtimeConfig.public.apiBaseUrl || 'http://localhost:3335/api/v1'
      const headers = getAuthHeaders()
      
      let response = await fetch(`${baseURL}/bookmarks?page=${page}&pageSize=${pageSize}`, {
        headers
      })
      
      // Handle token refresh if needed
      if (response.status === 401) {
        const { refresh } = useAuth()
        const refreshed = await refresh()
        if (refreshed) {
          const newHeaders = getAuthHeaders()
          response = await fetch(`${baseURL}/bookmarks?page=${page}&pageSize=${pageSize}`, {
            headers: newHeaders
          })
        } else {
          throw new Error('Session expired. Please login again.')
        }
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch bookmarks: ${response.statusText}`)
      }
      
      const result: ApiResponse<JobBookmark[]> = await response.json()
      return result
      
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const bookmarkJob = async (jobId: string): Promise<ApiResponse<JobBookmark>> => {
    loading.value = true
    error.value = null
    
    try {
      const runtimeConfig = useRuntimeConfig()
      const baseURL = runtimeConfig.public.apiBaseUrl || 'http://localhost:3335/api/v1'
      const { accessToken, isAuthenticated } = useAuth()
      
      // Log untuk debugging
      console.log('Bookmark Job - Token exists:', !!accessToken.value)
      console.log('Is Authenticated:', isAuthenticated.value)
      
      if (!isAuthenticated.value || !accessToken.value) {
        throw new Error('Please login to bookmark jobs')
      }
      
      const response = await fetch(`${baseURL}/bookmarks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.value}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId })
      })
      
      console.log('Bookmark Response Status:', response.status)
      
      if (response.status === 401) {
        // Token expired, coba refresh
        const { refresh } = useAuth()
        const refreshed = await refresh()
        
        if (refreshed) {
          // Retry with new token
          const { accessToken: newToken } = useAuth()
          const retryResponse = await fetch(`${baseURL}/bookmarks`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${newToken.value}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ jobId })
          })
          
          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({ message: 'Failed to bookmark job' }))
            throw new Error(errorData.message || 'Failed to bookmark job')
          }
          
          const result: ApiResponse<JobBookmark> = await retryResponse.json()
          return result
        } else {
          throw new Error('Session expired. Please login again.')
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to bookmark job' }))
        throw new Error(errorData.message || 'Failed to bookmark job')
      }
      
      const result: ApiResponse<JobBookmark> = await response.json()
      return result
      
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const unbookmarkJob = async (jobId: string): Promise<ApiResponse<null>> => {
    loading.value = true
    error.value = null
    
    try {
      const runtimeConfig = useRuntimeConfig()
      const baseURL = runtimeConfig.public.apiBaseUrl || 'http://localhost:3335/api/v1'
      const { accessToken, isAuthenticated } = useAuth()
      
      if (!isAuthenticated.value || !accessToken.value) {
        throw new Error('Please login to remove bookmarks')
      }
      
      let response = await fetch(`${baseURL}/bookmarks/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken.value}`
        }
      })
      
      if (response.status === 401) {
        const { refresh } = useAuth()
        const refreshed = await refresh()
        
        if (refreshed) {
          const { accessToken: newToken } = useAuth()
          response = await fetch(`${baseURL}/bookmarks/${jobId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${newToken.value}`
            }
          })
        } else {
          throw new Error('Session expired. Please login again.')
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to unbookmark job' }))
        throw new Error(errorData.message || 'Failed to unbookmark job')
      }
      
      const result: ApiResponse<null> = await response.json()
      return result
      
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const checkBookmarkStatus = async (jobId: string): Promise<boolean> => {
    try {
      const runtimeConfig = useRuntimeConfig()
      const baseURL = runtimeConfig.public.apiBaseUrl || 'http://localhost:3335/api/v1'
      const { accessToken, isAuthenticated } = useAuth()
      
      if (!isAuthenticated.value || !accessToken.value) return false
      
      let response = await fetch(`${baseURL}/bookmarks/${jobId}/check`, {
        headers: {
          'Authorization': `Bearer ${accessToken.value}`
        }
      })
      
      if (response.status === 401) {
        const { refresh } = useAuth()
        const refreshed = await refresh()
        
        if (refreshed) {
          const { accessToken: newToken } = useAuth()
          response = await fetch(`${baseURL}/bookmarks/${jobId}/check`, {
            headers: {
              'Authorization': `Bearer ${newToken.value}`
            }
          })
        } else {
          return false
        }
      }
      
      if (!response.ok) {
        return false
      }
      
      const result: ApiResponse<{ isBookmarked: boolean }> = await response.json()
      return result.data?.isBookmarked || false
      
    } catch (err) {
      console.error('Error checking bookmark status:', err)
      return false
    }
  }

  return {
    loading,
    error,
    getMyBookmarks,
    bookmarkJob,
    unbookmarkJob,
    checkBookmarkStatus
  }
}