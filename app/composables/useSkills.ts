import { useAuth } from './useAuth'

export interface Skill {
  id: string
  name: string
  category: string | null
  createdAt?: number
  updatedAt?: number
  deletedAt?: number | null
}

export interface SkillsApiResponse {
  status: string
  message: string
  data: {
    skills: Skill[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export const useSkills = () => {
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

  // Helper untuk mengekstrak skills dari response
  const extractSkills = (response: any): Skill[] => {
    console.log('Extracting skills from:', response)
    
    // Format response dari backend: { status, message, data: { skills, total, page, pageSize, totalPages } }
    if (response?.data?.skills && Array.isArray(response.data.skills)) {
      return response.data.skills
    }
    
    // Fallback: jika response langsung array
    if (Array.isArray(response)) {
      return response
    }
    
    // Fallback: jika response punya property 'skills' langsung
    if (response?.skills && Array.isArray(response.skills)) {
      return response.skills
    }
    
    // Fallback: jika response punya property 'data' yang berisi array
    if (response?.data && Array.isArray(response.data)) {
      return response.data
    }
    
    console.warn('No skills array found in response:', response)
    return []
  }

  // Get all skills (active)
  const getSkills = async (): Promise<Skill[]> => {
    try {
      const headers = getHeaders()
      const response = await $fetch<SkillsApiResponse>(`${baseURL}/skills`, {
        headers
      })
      
      console.log('getSkills response:', response)
      return extractSkills(response)
    } catch (error) {
      console.error('Error fetching skills:', error)
      throw error
    }
  }

  // Search skills by name or category
  const searchSkills = async (query: string): Promise<Skill[]> => {
    try {
      const headers = getHeaders()
      const response = await $fetch<SkillsApiResponse>(`${baseURL}/skills/search?q=${encodeURIComponent(query)}`, {
        headers
      })
      
      console.log('searchSkills response:', response)
      return extractSkills(response)
    } catch (error) {
      console.error('Error searching skills:', error)
      throw error
    }
  }

  // Get skill by ID
  const getSkillById = async (id: string): Promise<Skill> => {
    try {
      const headers = getHeaders()
      const response = await $fetch<{ status: string, data: Skill }>(`${baseURL}/skills/${id}`, {
        headers
      })
      return response.data
    } catch (error) {
      console.error('Error fetching skill:', error)
      throw error
    }
  }

  // Get skills by category
  const getSkillsByCategory = async (category: string): Promise<Skill[]> => {
    try {
      const headers = getHeaders()
      const response = await $fetch<SkillsApiResponse>(`${baseURL}/skills/category/${encodeURIComponent(category)}`, {
        headers
      })
      
      return extractSkills(response)
    } catch (error) {
      console.error('Error fetching skills by category:', error)
      throw error
    }
  }

  // Get deleted skills
  const getDeletedSkills = async (search?: string): Promise<Skill[]> => {
    try {
      const headers = getHeaders()
      
      const url = search
        ? `${baseURL}/skills/deleted?search=${encodeURIComponent(search)}`
        : `${baseURL}/skills/deleted`
      
      const response = await $fetch<SkillsApiResponse>(url, { headers })
      
      console.log('getDeletedSkills response:', response)
      return extractSkills(response)
    } catch (error) {
      console.error('Error fetching deleted skills:', error)
      throw error
    }
  }

  // Create skill
  const createSkill = async (data: {
    name: string
    category?: string | null
  }): Promise<Skill> => {
    try {
      const headers = getHeaders()
      const body: Record<string, any> = { name: data.name }
      if (data.category != null && data.category !== '') {
        body.category = data.category
      }

      const response = await $fetch<{ status: string, data: Skill }>(`${baseURL}/skills`, {
        method: "POST",
        headers,
        body
      })
      return response.data
    } catch (error) {
      console.error('Error creating skill:', error)
      throw error
    }
  }

  // Update skill
  const updateSkill = async (id: string, data: Partial<Skill>): Promise<Skill> => {
    try {
      const headers = getHeaders()
      const response = await $fetch<{ status: string, data: Skill }>(`${baseURL}/skills/${id}`, {
        method: "PATCH",
        headers,
        body: data
      })
      return response.data
    } catch (error) {
      console.error('Error updating skill:', error)
      throw error
    }
  }

  // Soft delete skill
  const deleteSkill = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      await $fetch(`${baseURL}/skills/${id}`, {
        method: "DELETE",
        headers
      })
    } catch (error) {
      console.error('Error deleting skill:', error)
      throw error
    }
  }

  // Permanently delete skill (hard delete)
  const permanentDeleteSkill = async (id: string): Promise<void> => {
    try {
      const headers = getHeaders()
      await $fetch(`${baseURL}/skills/${id}/permanent`, {
        method: "DELETE",
        headers
      })
    } catch (error) {
      console.error('Error permanently deleting skill:', error)
      throw error
    }
  }

  // Restore soft-deleted skill
  const restoreSkill = async (id: string): Promise<Skill> => {
    try {
      const headers = getHeaders()
      const response = await $fetch<{ status: string, data: Skill }>(`${baseURL}/skills/${id}/restore`, {
        method: "PATCH",
        headers
      })
      return response.data
    } catch (error) {
      console.error('Error restoring skill:', error)
      throw error
    }
  }


  return {
    // Skill master APIs only
    getSkills,
    searchSkills,
    getSkillById,
    getSkillsByCategory,
    getDeletedSkills,
    createSkill,
    updateSkill,
    deleteSkill,
    permanentDeleteSkill,
    restoreSkill,
  }
}