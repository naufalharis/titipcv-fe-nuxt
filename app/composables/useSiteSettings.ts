// composables/useSiteSettings.ts
import { useAuth } from './useAuth'

export interface SiteSettings {
  id: string
  maintenanceMode: boolean
  companyListEnabled: boolean
  companyList?: any[] | null
  popupBannerEnabled: boolean
  popupBannerImageId?: string | null
  popupBannerImage?: Asset
  popupBannerAutoCloseSeconds?: number | null
  popupBannerShowOnce: boolean
  profileBannerEnabled: boolean
  profileBannerImageId?: string | null
  profileBannerImage?: Asset
  profileBannerUrl?: string | null
  footerBannerEnabled: boolean
  footerBannerImageId?: string | null
  footerBannerImage?: Asset
  footerBannerUrl?: string | null
  companyListBannerEnabled: boolean
  companyListBannerImageId?: string | null
  companyListBannerImage?: Asset
  companyListBannerUrl?: string | null
  jobListBannerEnabled: boolean
  jobListBannerImageId?: string | null
  jobListBannerImage?: Asset
  jobListBannerUrl?: string | null
  createdAt: number
  updatedAt: number
  deletedAt?: number | null
  createdBy?: string | null
  updatedBy?: string | null
  deletedBy?: string | null
}

export interface Asset {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  url: string
  alt?: string
  createdAt: number
  updatedAt: number
}

export interface UpdateSiteSettingsRequest {
  maintenanceMode?: boolean
  companyListEnabled?: boolean
  companyList?: any[]
  popupBannerEnabled?: boolean
  popupBannerImageId?: string | null
  popupBannerAutoCloseSeconds?: number | null
  popupBannerShowOnce?: boolean
  profileBannerEnabled?: boolean
  profileBannerImageId?: string | null
  profileBannerUrl?: string | null
  footerBannerEnabled?: boolean
  footerBannerImageId?: string | null
  footerBannerUrl?: string | null
  companyListBannerEnabled?: boolean
  companyListBannerImageId?: string | null
  companyListBannerUrl?: string | null
  jobListBannerEnabled?: boolean
  jobListBannerImageId?: string | null
  jobListBannerUrl?: string | null
}

export const useSiteSettings = () => {
  const { accessToken } = useAuth()
  const runtimeConfig = useRuntimeConfig()
  const baseURL = runtimeConfig.public.apiBaseUrl || 'http://localhost:3335/api/v1'

  // Helper untuk mendapatkan headers dengan token
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

  // Helper untuk handle response
  const handleResponse = <T>(response: any): T => {
    if (response?.status === 'success' && response?.data) {
      return response.data as T
    }
    return response as T
  }

  // ============= GET SITE SETTINGS =============
  const getSiteSettings = async (): Promise<SiteSettings> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/site-settings`
      
      console.log('Fetching site settings from:', url)
      
      const response = await $fetch<any>(url, { headers })
      
      console.log('Site settings response:', response)
      
      return handleResponse<SiteSettings>(response)
    } catch (error) {
      console.error('Error fetching site settings:', error)
      throw error
    }
  }

  // ============= UPDATE SITE SETTINGS =============
  const updateSiteSettings = async (data: UpdateSiteSettingsRequest): Promise<SiteSettings> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/site-settings`
      
      console.log('=== UPDATE SITE SETTINGS ===')
      console.log('URL:', url)
      console.log('Request data:', JSON.stringify(data, null, 2))
      
      const response = await $fetch<any>(url, {
        method: 'PATCH',
        headers,
        body: data
      })
      
      console.log('Update site settings response:', response)
      return handleResponse<SiteSettings>(response)
    } catch (error) {
      console.error('=== UPDATE SITE SETTINGS ERROR ===')
      console.error('Error:', error)
      throw error
    }
  }

  return {
    getSiteSettings,
    updateSiteSettings
  }
}