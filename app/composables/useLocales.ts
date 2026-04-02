// composables/useLocales.ts
import { useAuth } from './useAuth'
import type { Locale, LocalesResponse } from '~/types/locale'

export const useLocales = () => {
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

  // Get all locales
  const getLocales = async (): Promise<LocalesResponse> => {
    try {
      const headers = getHeaders()
      const response = await $fetch<LocalesResponse>(`${baseURL}/locales`, {
        headers
      })
      return response
    } catch (error) {
      console.error('Error fetching locales:', error)
      throw error
    }
  }

  return {
    getLocales
  }
}