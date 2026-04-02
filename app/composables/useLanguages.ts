import type { Language, LanguagesResponse } from '~/types/language'

export const useLanguages = () => {
  const token = useAuth().accessToken
  const runtimeConfig = useRuntimeConfig()
  const baseURL = runtimeConfig.public.apiBaseUrl

  // Get all active languages
  const getLanguages = async (): Promise<LanguagesResponse> => {
    return await $fetch<LanguagesResponse>(`${baseURL}/languages/`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
  }

  // Search languages by name or code
  const searchLanguages = async (query: string): Promise<LanguagesResponse> => {
    return await $fetch<LanguagesResponse>(`${baseURL}/languages/search?q=${encodeURIComponent(query)}`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
  }

  // Get deleted languages
  const getDeletedLanguages = async (search?: string): Promise<LanguagesResponse> => {
    const url = search 
      ? `${baseURL}/languages/deleted?search=${encodeURIComponent(search)}`
      : `${baseURL}/languages/deleted`
    
    return await $fetch<LanguagesResponse>(url, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
  }
  // Get language by ID
  const getLanguageById = async (id: string): Promise<Language> => {
    return await $fetch(`${baseURL}/languages/${id}`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
  }

  // Create new language
  const createLanguage = async (data: {
    code: string
    name: string
  }) => {
    return await $fetch(`${baseURL}/languages/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        code: data.code,
        name: data.name
      }
    })
  }

  // Update language
  const updateLanguage = async (id: string, data: Partial<Language>) => {
    return await $fetch(`${baseURL}/languages/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: data
    })
  }

  // Soft delete language
  const deleteLanguage = async (id: string) => {
    return await $fetch(`${baseURL}/languages/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
  }

  // Restore soft-deleted language
  const restoreLanguage = async (id: string) => {
    return await $fetch(`${baseURL}/languages/${id}/restore`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
  }

  // Permanently delete language (hard delete)
  const permanentDeleteLanguage = async (id: string) => {
    return await $fetch(`${baseURL}/languages/${id}/permanent`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
  }

  return {
    getLanguages,
    searchLanguages,
    getDeletedLanguages,
    getLanguageById,
    createLanguage,
    updateLanguage,
    deleteLanguage,
    restoreLanguage,
    permanentDeleteLanguage
  }
}