// composables/useUsers.ts
import { useAuth } from './useAuth'
import type { User, UsersResponse } from '~/types/user'

export const useUsers = () => {
  const { accessToken } = useAuth()
  const runtimeConfig = useRuntimeConfig()
  const baseURL = runtimeConfig.public.apiBaseUrl

  // Helper untuk mendapatkan headers dengan token
  const getHeaders = () => {
    if (!accessToken.value) {
      throw new Error('No access token available')
    }
    
    return {
      'Authorization': `Bearer ${accessToken.value}`,
      'Content-Type': 'application/json'
    }
  }

  const getUsers = async (): Promise<UsersResponse> => {
    try {
      const headers = getHeaders()
      const response = await $fetch<UsersResponse>(`${baseURL}/users`, {
        headers
      })
      return response
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }

  const getDeletedUsers = async (): Promise<UsersResponse> => {
    try {
      const headers = getHeaders()
      const response = await $fetch<UsersResponse>(`${baseURL}/users/deleted`, {
        headers
      })
      return response
    } catch (error) {
      console.error('Error fetching deleted users:', error)
      throw error
    }
  }

  const searchUsers = async (query: string): Promise<UsersResponse> => {
    try {
      const headers = getHeaders()
      const response = await $fetch<UsersResponse>(`${baseURL}/users/search`, {
        headers,
        params: {
          q: query
        }
      })
      return response
    } catch (error) {
      console.error('Error searching users:', error)
      throw error
    }
  }

  const createUser = async (userData: Partial<User>) : Promise<any> => {
    try {
      const headers = getHeaders()
      const response = await $fetch(`${baseURL}/users`, {
        method: 'POST',
        headers,
        body: userData
      })
      return response
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  const updateUser = async (id: string, userData: Partial<User>) : Promise<any> => {
    try {
      const headers = getHeaders()
      const response = await $fetch(`${baseURL}/users/${id}`, {
        method: 'PUT',
        headers,
        body: userData
      })
      return response
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  const deleteUser = async (id: string) : Promise<any> => {
    try {
      const headers = getHeaders()
      const response = await $fetch(`${baseURL}/users/${id}`, {
        method: 'DELETE',
        headers
      })
      return response
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  const restoreUser = async (id: string) : Promise<any> => {
    try {
      const headers = getHeaders()
      const response = await $fetch(`${baseURL}/users/${id}/restore`, {
        method: 'PATCH',
        headers
      })
      return response
    } catch (error) {
      console.error('Error restoring user:', error)
      throw error
    }
  }

  // Method untuk permanent delete (opsional, tergantung kebutuhan)
  const permanentDeleteUser = async (id: string) : Promise<any> => {
    try {
      const headers = getHeaders()
      const response = await $fetch(`${baseURL}/users/${id}/permanent`, {
        method: 'DELETE',
        headers
      })
      return response
    } catch (error) {
      console.error('Error permanently deleting user:', error)
      throw error
    }
  }

  return {
    getUsers,
    getDeletedUsers,
    searchUsers,
    createUser,
    updateUser,
    deleteUser,
    restoreUser,
    permanentDeleteUser
  }
}