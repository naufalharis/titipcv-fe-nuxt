import { useAuth } from './useAuth'

export interface Country {
  id: string
  name: string
  code: string
  phoneCode?: string
  isActive: boolean
  createdAt?: number
  updatedAt?: number
  deletedAt?: number | null // Untuk soft delete
}

export const useCountries = () => {
  const { accessToken } = useAuth()
  const runtimeConfig = useRuntimeConfig()
  const baseURL = runtimeConfig.public.apiBaseUrl

  // Helper untuk mendapatkan headers
  const getHeaders = () => {
    if (!accessToken.value) {
      throw new Error('No access token available')
    }
    
    return {
      'Authorization': `Bearer ${accessToken.value}`,
      'Content-Type': 'application/json'
    }
  }

  // Get all countries (with optional search and deleted filter)
  const getCountries = async (params?: {
    search?: string
    includeDeleted?: boolean
  }): Promise<Country[]> => {
    try {
      const headers = getHeaders()
      
      // Build query string
      const queryParams = new URLSearchParams()
      if (params?.search) {
        queryParams.append('search', params.search)
      }
      if (params?.includeDeleted) {
        queryParams.append('deleted', 'true')
      }
      
      const queryString = queryParams.toString()
      const url = `${baseURL}/countries/${queryString ? `?${queryString}` : ''}`
      
      const response = await $fetch(url, {
        headers
      })
      return response as Country[]
    } catch (error) {
      console.error('Error fetching countries:', error)
      throw error
    }
  }

  // Search countries by name or code
  const searchCountries = async (query: string): Promise<Country[]> => {
    try {
      const headers = getHeaders()
      const response = await $fetch(`${baseURL}/countries/search?q=${encodeURIComponent(query)}`, {
        headers
      })
      return response as Country[]
    } catch (error) {
      console.error('Error searching countries:', error)
      throw error
    }
  }

  // Get country by ID
  const getCountryById = async (id: string): Promise<Country> => {
    try {
      const headers = getHeaders()
      const response = await $fetch(`${baseURL}/countries/${id}`, {
        headers
      })
      return response as Country
    } catch (error) {
      console.error('Error fetching country:', error)
      throw error
    }
  }

  // Get country by code (e.g., /countries/code/AF)
  const getCountryByCode = async (code: string): Promise<Country> => {
    try {
      const headers = getHeaders()
      const response = await $fetch(`${baseURL}/countries/code/${code.toUpperCase()}`, {
        headers
      })
      return response as Country
    } catch (error) {
      console.error('Error fetching country by code:', error)
      throw error
    }
  }

  // Get deleted countries only (separate endpoint)
  const getDeletedCountries = async (search?: string): Promise<Country[]> => {
    try {
      const headers = getHeaders()
      
      const url = search
        ? `${baseURL}/countries/deleted?search=${encodeURIComponent(search)}`
        : `${baseURL}/countries/deleted`
      
      const response = await $fetch(url, { headers })
      return response as Country[]
    } catch (error) {
      console.error('Error fetching deleted countries:', error)
      throw error
    }
  }

  // Create country
  const createCountry = async (data: {
    name: string
    code: string
    phoneCode?: string
    isActive?: boolean
  }): Promise<Country> => {
    try {
      const headers = getHeaders()
      const response = await $fetch(`${baseURL}/countries/`, {
        method: "POST",
        headers,
        body: {
          name: data.name,
          code: data.code,
          phoneCode: data.phoneCode,
          isActive: data.isActive ?? true
        }
      })
      return response as Country
    } catch (error) {
      console.error('Error creating country:', error)
      throw error
    }
  }

  // Update country
  const updateCountry = async (id: string, data: Partial<Country>): Promise<Country> => {
    try {
      const headers = getHeaders()
      const response = await $fetch(`${baseURL}/countries/${id}`, {
        method: "PATCH",
        headers,
        body: data
      })
      return response as Country
    } catch (error) {
      console.error('Error updating country:', error)
      throw error
    }
  }

  // Soft delete country
  const deleteCountry = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      await $fetch(`${baseURL}/countries/${id}`, {
        method: "DELETE",
        headers
      })
    } catch (error) {
      console.error('Error deleting country:', error)
      throw error
    }
  }

  // Restore soft-deleted country
  const restoreCountry = async (id: string): Promise<Country> => {
    try {
      const headers = getHeaders()
      const response = await $fetch(`${baseURL}/countries/${id}/restore`, {
        method: "PATCH",
        headers
      })
      return response as Country
    } catch (error) {
      console.error('Error restoring country:', error)
      throw error
    }
  }

  // Permanent delete (hard delete) - untuk admin
  const permanentDeleteCountry = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      await $fetch(`${baseURL}/countries/${id}/permanent`, {
        method: "DELETE",
        headers
      })
    } catch (error) {
      console.error('Error permanently deleting country:', error)
      throw error
    }
  }

  return {
    getCountries,
    searchCountries,
    getCountryById,
    getCountryByCode,
    getDeletedCountries,
    createCountry,
    updateCountry,
    deleteCountry,
    restoreCountry,
    permanentDeleteCountry
  }
}