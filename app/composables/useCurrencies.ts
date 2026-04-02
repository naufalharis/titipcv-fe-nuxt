import { useAuth } from './useAuth'

export interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  createdAt?: number
  updatedAt?: number
  deletedAt?: number | null
}

export type CurrenciesResponse = Currency[] | {
  data: Currency[]
  total?: number
  page?: number
  limit?: number
}

export const useCurrencies = () => {
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

  // Get all active currencies
  const getCurrencies = async (): Promise<Currency[]> => {
    try {
      const headers = getHeaders()
      const response = await $fetch(`${baseURL}/currencies/`, {
        headers
      })
      return response as Currency[]
    } catch (error) {
      console.error('Error fetching currencies:', error)
      throw error
    }
  }

  // Search currencies by name or code
  const searchCurrencies = async (query: string): Promise<Currency[]> => {
    try {
      const headers = getHeaders()
      const response = await $fetch(`${baseURL}/currencies/search?q=${encodeURIComponent(query)}`, {
        headers
      })
      return response as Currency[]
    } catch (error) {
      console.error('Error searching currencies:', error)
      throw error
    }
  }

  // Get currency by ID
  const getCurrencyById = async (id: string): Promise<Currency> => {
    try {
      const headers = getHeaders()
      const response = await $fetch(`${baseURL}/currencies/${id}`, {
        headers
      })
      return response as Currency
    } catch (error) {
      console.error('Error fetching currency:', error)
      throw error
    }
  }

  // Get currency by code
  const getCurrencyByCode = async (code: string): Promise<Currency> => {
    try {
      const headers = getHeaders()
      const response = await $fetch(`${baseURL}/currencies/code/${code.toUpperCase()}`, {
        headers
      })
      return response as Currency
    } catch (error) {
      console.error('Error fetching currency by code:', error)
      throw error
    }
  }

  // Get deleted currencies
  const getDeletedCurrencies = async (search?: string): Promise<Currency[]> => {
    try {
      const headers = getHeaders()
      
      const url = search
        ? `${baseURL}/currencies/deleted?search=${encodeURIComponent(search)}`
        : `${baseURL}/currencies/deleted`
      
      const response = await $fetch(url, { headers })
      return response as Currency[]
    } catch (error) {
      console.error('Error fetching deleted currencies:', error)
      throw error
    }
  }

  // Get all currencies including deleted
  const getAllCurrencies = async (): Promise<Currency[]> => {
    try {
      const headers = getHeaders()
      const response = await $fetch(`${baseURL}/currencies/with-deleted`, {
        headers
      })
      return response as Currency[]
    } catch (error) {
      console.error('Error fetching all currencies:', error)
      throw error
    }
  }

  // Create currency
  const createCurrency = async (data: {
    code: string
    name: string
    symbol: string
  }): Promise<Currency> => {
    try {
      const headers = getHeaders()
      const response = await $fetch(`${baseURL}/currencies/`, {
        method: "POST",
        headers,
        body: {
          code: data.code.toUpperCase(),
          name: data.name,
          symbol: data.symbol
        }
      })
      return response as Currency
    } catch (error) {
      console.error('Error creating currency:', error)
      throw error
    }
  }

  // Update currency
  const updateCurrency = async (id: string, data: Partial<Currency>): Promise<Currency> => {
    try {
      const headers = getHeaders()
      const response = await $fetch(`${baseURL}/currencies/${id}`, {
        method: "PATCH",
        headers,
        body: data
      })
      return response as Currency
    } catch (error) {
      console.error('Error updating currency:', error)
      throw error
    }
  }

  // Soft delete currency
  const deleteCurrency = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      await $fetch(`${baseURL}/currencies/${id}`, {
        method: "DELETE",
        headers
      })
    } catch (error) {
      console.error('Error deleting currency:', error)
      throw error
    }
  }

  // Restore soft-deleted currency
  const restoreCurrency = async (id: string): Promise<Currency> => {
    try {
      const headers = getHeaders()
      const response = await $fetch(`${baseURL}/currencies/${id}/restore`, {
        method: "PATCH",
        headers
      })
      return response as Currency
    } catch (error) {
      console.error('Error restoring currency:', error)
      throw error
    }
  }

  // Permanent delete (hard delete)
  const permanentDeleteCurrency = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      await $fetch(`${baseURL}/currencies/${id}`, {
        method: "DELETE",
        headers
      })
    } catch (error) {
      console.error('Error permanently deleting currency:', error)
      throw error
    }
  }

  return {
    getCurrencies,
    searchCurrencies,
    getCurrencyById,
    getCurrencyByCode,
    getDeletedCurrencies,
    getAllCurrencies,
    createCurrency,
    updateCurrency,
    deleteCurrency,
    restoreCurrency,
    permanentDeleteCurrency
  }
}