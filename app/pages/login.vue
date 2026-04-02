<template>
  <div class="animate-fade-in">
    <div class="mb-6 text-center">
      <h2 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sign in to your account</h2>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Or
        <a href="#" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">request access</a>
      </p>
    </div>

    <form class="space-y-6" @submit.prevent="handleLogin">
      <div>
        <label for="email" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
        <div class="mt-1">
          <input 
            v-model="email"
            id="email" 
            name="email" 
            type="email" 
            autocomplete="email" 
            required 
            class="appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors"
            :disabled="isSubmitting"
          >
        </div>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
        <div class="mt-1">
          <input 
            v-model="password"
            id="password" 
            name="password" 
            type="password" 
            autocomplete="current-password" 
            required 
            class="appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors"
            :disabled="isSubmitting"
          >
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input 
            id="remember-me" 
            name="remember-me" 
            type="checkbox" 
            v-model="rememberMe"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
          >
          <label for="remember-me" class="ml-2 block text-sm text-slate-700 dark:text-slate-300">Remember me</label>
        </div>

        <div class="text-sm">
          <a href="#" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">Forgot your password?</a>
        </div>
      </div>

      <!-- Turnstile Component -->
      <div class="flex justify-center my-4 overflow-hidden rounded-lg min-h-[65px]">
        <NuxtTurnstile 
          v-model="turnstileToken" 
          :options="{ 
            theme: colorMode.value as 'light' | 'dark' | 'auto',
            size: 'normal'
          }" 
        />
      </div>

      <div>
        <button 
          type="submit" 
          :disabled="isSubmitting || !turnstileToken"
          class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"        >
          <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-else class="flex gap-2 items-center">
            Sign in
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </button>
      </div>
    </form>
    
    <!-- Error Message -->
    <div v-if="errorMsg" class="mt-4 p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-sm rounded-lg border border-rose-100 dark:border-rose-800">
      {{ errorMsg }}
    </div>

    <!-- Success Message -->
    <div v-if="successMsg" class="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm rounded-lg border border-emerald-100 dark:border-emerald-800">
      {{ successMsg }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'guest'
})

const colorMode = useColorMode()
const { login, isAuthenticated } = useAuth()
const router = useRouter()

// Redirect if already logged in
if (isAuthenticated.value) {
  router.push('/')
}

// Form state
const email = ref<string>('admin@cms.com')
const password = ref<string>('password')
const turnstileToken = ref<string>('')
const rememberMe = ref<boolean>(false)

// UI state
const isSubmitting = ref<boolean>(false)
const errorMsg = ref<string>('')
const successMsg = ref<string>('')

const handleLogin = async (): Promise<void> => {
  // Validate Turnstile
  if (!turnstileToken.value) {
    errorMsg.value = 'Please complete the CAPTCHA verification.'
    return
  }

  // Validate inputs
  if (!email.value || !password.value) {
    errorMsg.value = 'Please enter both email and password.'
    return
  }

  isSubmitting.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    // Call login API
    const success = await login(turnstileToken.value, email.value, password.value)
    
    if (success) {
      successMsg.value = 'Login successful! Redirecting...'
      
      // Redirect to dashboard after successful login
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
      errorMsg.value = 'Invalid credentials or validation failed.'
    }
  } catch (error: unknown) {
    console.error('Login error:', error)
    if (error instanceof Error) {
      errorMsg.value = error.message
    } else {
      errorMsg.value = 'An error occurred during sign in. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}

// Reset error when user starts typing
const resetError = (): void => {
  errorMsg.value = ''
}

// Watch for input changes to clear error
watch([email, password], () => {
  if (errorMsg.value) {
    resetError()
  }
})
</script>