// composables/useAssets.ts
import { useAuth } from './useAuth'

export interface Asset {
  id: string
  originalName: string
  fileName: string
  location: string
  mimeType: string
  url: string
  size?: number | null
  createdAt: number
  updatedAt: number
  deletedAt?: number | null
  createdBy?: string | null
  updatedBy?: string | null
  deletedBy?: string | null
}

export interface AssetListResponse {
  data: Asset[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface UploadAssetResponse {
  message: string
  asset: Asset
}

export interface SearchAssetsRequest {
  q?: string
  mimeType?: string
  page?: number
  pageSize?: number
}

export const useAssets = () => {
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

  // ============= LIST LIBRARY ASSETS =============
  const listLibraryAssets = async (params?: {
    page?: number
    pageSize?: number
  }): Promise<AssetListResponse> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
      
      const url = queryParams.toString() 
        ? `${baseURL}/assets/library?${queryParams.toString()}`
        : `${baseURL}/assets/library`
      
      console.log('Fetching library assets from:', url)
      
      const response = await $fetch<any>(url, { headers })
      
      if (response?.status === 'success' && response?.data) {
        return response.data
      }
      
      return { data: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } }
    } catch (error) {
      console.error('Error fetching library assets:', error)
      throw error
    }
  }

  // ============= GET LIBRARY ASSET BY ID =============
  const getLibraryAsset = async (id: string): Promise<Asset> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/assets/library/${id}`
      
      console.log('Fetching library asset from:', url)
      
      const response = await $fetch<any>(url, { headers })
      
      return handleResponse<Asset>(response)
    } catch (error) {
      console.error('Error fetching library asset:', error)
      throw error
    }
  }

  // ============= LIST ALL ASSETS =============
  const listAllAssets = async (params?: {
    page?: number
    pageSize?: number
  }): Promise<AssetListResponse> => {
    try {
      const headers = getHeaders()
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
      
      const url = queryParams.toString() 
        ? `${baseURL}/assets?${queryParams.toString()}`
        : `${baseURL}/assets`
      
      console.log('Fetching all assets from:', url)
      
      const response = await $fetch<any>(url, { headers })
      
      if (response?.status === 'success' && response?.data) {
        return response.data
      }
      
      return { data: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } }
    } catch (error) {
      console.error('Error fetching all assets:', error)
      throw error
    }
  }

  // ============= SEARCH ASSETS =============
const searchAssets = async (params: SearchAssetsRequest): Promise<AssetListResponse> => {
  try {
    const headers = getHeaders()
    const queryParams = new URLSearchParams()
    
    // q parameter WAJIB ada untuk search endpoint
    if (params.q) {
      queryParams.append('q', params.q)
    } else {
      // Jika tidak ada q, return empty response atau throw error
      console.warn('Search query is required')
      return { data: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } }
    }
    
    // Optional parameters
    if (params.mimeType) {
      queryParams.append('mimeType', params.mimeType)
    }
    if (params.page) {
      queryParams.append('page', params.page.toString())
    }
    if (params.pageSize) {
      queryParams.append('pageSize', params.pageSize.toString())
    }
    
    const url = `${baseURL}/assets/search?${queryParams.toString()}`
    
    console.log('Searching assets from:', url)
    console.log('Search params:', params)
    
    const response = await $fetch<any>(url, { headers })
    
    if (response?.status === 'success' && response?.data) {
      return response.data
    }
    
    return { data: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } }
  } catch (error) {
    console.error('Error searching assets:', error)
    throw error
  }
}

  // ============= GET ASSET BY ID =============
  const getAsset = async (id: string): Promise<Asset> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/assets/${id}`
      
      console.log('Fetching asset from:', url)
      
      const response = await $fetch<any>(url, { headers })
      
      return handleResponse<Asset>(response)
    } catch (error) {
      console.error('Error fetching asset:', error)
      throw error
    }
  }

  // ============= UPLOAD ASSET =============
    const uploadAsset = async (file: File, folder?: string): Promise<UploadAssetResponse> => {
    try {
        const headers = {
        'Authorization': `Bearer ${accessToken.value}`
        // Jangan set Content-Type, biarkan browser yang set dengan boundary
        }
        
        const formData = new FormData()
        formData.append('file', file)
        
        // Dari screenshot, folder dikirim sebagai query parameter, bukan di form-data
        let url = `${baseURL}/assets/upload`
        if (folder) {
        url = `${url}?folder=${encodeURIComponent(folder)}`
        }
        
        console.log('=== UPLOAD ASSET ===')
        console.log('URL:', url)
        console.log('File:', file.name, file.type, file.size)
        console.log('Folder param:', folder)
        
        const response = await $fetch<any>(url, {
        method: 'POST',
        headers,
        body: formData
        })
        
        console.log('Upload response:', response)
        
        if (response?.status === 'success' && response?.data) {
        return response.data as UploadAssetResponse
        }
        
        return response as UploadAssetResponse
    } catch (error) {
        console.error('=== UPLOAD ASSET ERROR ===')
        console.error('Error:', error)
        throw error
    }
    }

  // ============= DELETE ASSET =============
  const deleteAsset = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/assets/${id}`
      
      console.log('=== DELETE ASSET ===')
      console.log('URL:', url)
      
      await $fetch(url, {
        method: 'DELETE',
        headers
      })
      
      console.log('Asset deleted successfully')
    } catch (error) {
      console.error('Error deleting asset:', error)
      throw error
    }
  }

  // ============= RESTORE ASSET =============
  const restoreAsset = async (id: string): Promise<Asset> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/assets/${id}/restore`
      
      console.log('=== RESTORE ASSET ===')
      console.log('URL:', url)
      
      const response = await $fetch<any>(url, {
        method: 'PATCH',
        headers
      })
      
      console.log('Restore response:', response)
      return handleResponse<Asset>(response)
    } catch (error) {
      console.error('Error restoring asset:', error)
      throw error
    }
  }

  // ============= PERMANENT DELETE ASSET =============
  const permanentDeleteAsset = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/assets/${id}/permanent`
      
      console.log('=== PERMANENT DELETE ASSET ===')
      console.log('URL:', url)
      
      await $fetch(url, {
        method: 'DELETE',
        headers
      })
      
      console.log('Asset permanently deleted')
    } catch (error) {
      console.error('Error permanently deleting asset:', error)
      throw error
    }
  }

  // Helper untuk format ukuran file
  const formatFileSize = (bytes?: number | null): string => {
    if (!bytes) return '0 B'
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  // Helper untuk mendapatkan icon berdasarkan mime type
  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) {
      return '🖼️'
    } else if (mimeType.startsWith('video/')) {
      return '🎬'
    } else if (mimeType.startsWith('audio/')) {
      return '🎵'
    } else if (mimeType.includes('pdf')) {
      return '📄'
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return '📝'
    } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      return '📊'
    } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return '📽️'
    } else if (mimeType.includes('zip') || mimeType.includes('archive')) {
      return '🗜️'
    } else if (mimeType.includes('text')) {
      return '📃'
    } else {
      return '📁'
    }
  }

  return {
    listLibraryAssets,
    getLibraryAsset,
    listAllAssets,
    searchAssets,
    getAsset,
    uploadAsset,
    deleteAsset,
    restoreAsset,
    permanentDeleteAsset,
    formatFileSize,
    getFileIcon
  }
}