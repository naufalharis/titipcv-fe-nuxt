// composables/useAuth.ts
import { useState } from '#app'

export const useAuth = () => {
  // Global state for authentication status
  const isAuthenticated = useState<boolean>('auth:isAuthenticated', () => false)
  const user = useState<any>('auth:user', () => null)
  const accessToken = useState<string | null>('auth:accessToken', () => null)
  const refreshToken = useState<string | null>('auth:refreshToken', () => null)

  const runtimeConfig = useRuntimeConfig()
  const baseURL = runtimeConfig.public.apiBaseUrl

  const login = async (turnstileToken: string, email: string, password: string) => {
    try {
      const timestamp = Date.now().toString()

      const response: any = await $fetch(`${baseURL}/auth/login-main`, {
        method: "POST",
        headers: {
          "cf-turnstile-timestamp": timestamp,
          "cf-turnstile-token": turnstileToken
        },
        body: {
          email,
          password
        }
      })

      if (response?.data) {
        // Save tokens
        accessToken.value = response.data.access_token
        refreshToken.value = response.data.refresh_token
        
        // Save user data
        user.value = response.data.user
        
        // Set authenticated state
        isAuthenticated.value = true

        // Store in localStorage for persistence
        if (import.meta.client) { // 🔴 Gunakan import.meta.client
          localStorage.setItem('access_token', response.data.access_token)
          localStorage.setItem('refresh_token', response.data.refresh_token)
          localStorage.setItem('user', JSON.stringify(response.data.user))
        }

        return true
      }
      
      return false
    } catch (error: any) {
      console.error('Login error:', error)
      
      if (error?.data?.message) {
        throw new Error(error.data.message)
      } else if (error?.message) {
        throw new Error(error.message)
      } else {
        throw new Error('Login failed. Please try again.')
      }
    }
  }

  // Check if user is already logged in (call this on app initialization)
  const checkAuth = () => {
    if (import.meta.client) { // 🔴 Gunakan import.meta.client
      const token = localStorage.getItem('access_token')
      const userData = localStorage.getItem('user')
      const refreshTokenValue = localStorage.getItem('refresh_token')
      
      console.log('🔍 checkAuth dipanggil:', { 
        hasToken: !!token, 
        hasUser: !!userData,
        hasRefreshToken: !!refreshTokenValue,
        timestamp: new Date().toISOString()
      })
      
      if (token && userData) {
        try {
          accessToken.value = token
          user.value = JSON.parse(userData)
          refreshToken.value = refreshTokenValue
          isAuthenticated.value = true
          
          console.log('✅ Session direstore untuk:', user.value?.email)
          return true
        } catch (e) {
          console.error('❌ Gagal parse user data:', e)
          // Hapus data yang corrupt
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          localStorage.removeItem('refresh_token')
        }
      } else {
        console.log('ℹ️ Tidak ada session tersimpan')
      }
    }
    return false
  }

  const logout = async () => {
    const currentToken = accessToken.value
    
    // Clear state
    isAuthenticated.value = false
    user.value = null
    accessToken.value = null
    refreshToken.value = null

    // Clear localStorage
    if (import.meta.client) { // 🔴 Gunakan import.meta.client
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    }

    // Optionally call logout API
    if (currentToken) {
      try {
        await $fetch(`${baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentToken}`
          }
        })
      } catch (error) {
        console.log('Logout API error:', error)
      }
    }
  }

  // Refresh token function
  const refreshAccessToken = async () => {
    try {
      if (!refreshToken.value) {
        throw new Error('No refresh token')
      }

      const response: any = await $fetch(`${baseURL}/auth/refresh`, {
        method: 'POST',
        body: {
          refresh_token: refreshToken.value
        }
      })

      if (response?.data?.access_token) {
        accessToken.value = response.data.access_token
        if (import.meta.client) { // 🔴 Gunakan import.meta.client
          localStorage.setItem('access_token', response.data.access_token)
        }
        return true
      }
      return false
    } catch (error) {
      await logout()
      return false
    }
  }

  // Get auth header for API requests
  const getAuthHeader = () => {
    if (!accessToken.value) return {}
    return {
      'Authorization': `Bearer ${accessToken.value}`
    }
  }

  return {
    isAuthenticated,
    user,
    accessToken,
    refreshToken,
    login,
    logout,
    checkAuth,
    refreshAccessToken,
    getAuthHeader
  }
}