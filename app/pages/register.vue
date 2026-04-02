<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Create new account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?
          <NuxtLink to="/login" class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
            Sign in
          </NuxtLink>
        </p>
      </div>

      <!-- Alert Messages -->
      <div v-if="error" class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      </div>

      <div v-if="success" class="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <p class="text-sm text-green-600 dark:text-green-400">{{ success }}</p>
      </div>

      <!-- Register Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              :class="{ 'border-red-500': errors.email }"
              placeholder="your@email.com"
              :disabled="loading"
            />
            <p v-if="errors.email" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ errors.email }}</p>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              :class="{ 'border-red-500': errors.password }"
              placeholder="Minimum 8 characters"
              :disabled="loading"
            />
            <p v-if="errors.password" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ errors.password }}</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              :class="{ 'border-red-500': errors.confirmPassword }"
              placeholder="Re-enter your password"
              :disabled="loading"
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ errors.confirmPassword }}</p>
          </div>

          <!-- First Name -->
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              First Name
            </label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              :class="{ 'border-red-500': errors.firstName }"
              placeholder="John"
              :disabled="loading"
            />
            <p v-if="errors.firstName" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ errors.firstName }}</p>
          </div>

          <!-- Last Name -->
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Last Name
            </label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              :class="{ 'border-red-500': errors.lastName }"
              placeholder="Doe"
              :disabled="loading"
            />
            <p v-if="errors.lastName" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ errors.lastName }}</p>
          </div>

          <!-- Role Selection -->
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Register as
            </label>
            <select
              id="role"
              v-model="form.role"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              :disabled="loading"
            >
              <option value="JOBSEEKER">Job Seeker</option>
              <option value="RECRUITER">Recruiter</option>
            </select>
          </div>

          <!-- Cloudflare Turnstile -->
          <div class="flex justify-center my-4 overflow-hidden rounded-lg min-h-[65px]">
            <NuxtTurnstile 
              v-model="turnstileToken" 
              :options="{ 
                theme: colorMode.value as 'light' | 'dark' | 'auto',
                size: 'normal'
              }" 
            />
          </div>

          <!-- Terms and Conditions -->
          <div class="flex items-center">
            <input
              id="terms"
              v-model="form.terms"
              type="checkbox"
              required
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              :disabled="loading"
            />
            <label for="terms" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              I agree to the
              <a href="#" class="font-medium text-primary-600 hover:text-primary-500">Terms and Conditions</a>
            </label>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="loading || !turnstileToken"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            <span v-else class="flex gap-2 items-center">
              Create account
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'guest'
})

const colorMode = useColorMode()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const baseURL = runtimeConfig.public.apiBaseUrl || 'http://localhost:3335/api/v1'

// Redirect if already logged in
const { isAuthenticated } = useAuth()
if (isAuthenticated.value) {
  router.push('/')
}

// Form state
const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  role: 'JOBSEEKER',
  terms: false
})

// Turnstile token
const turnstileToken = ref<string>('')

// UI states
const loading = ref(false)
const error = ref('')
const success = ref('')

// Validation errors
const errors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: ''
})

// Validate form
const validateForm = (): boolean => {
  let isValid = true
  
  // Reset errors
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.firstName = ''
  errors.lastName = ''
  error.value = ''
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }
  
  // Password validation (min 8 characters)
  if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
    isValid = false
  }
  
  // Confirm password
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }
  
  // First name validation
  if (!form.firstName.trim()) {
    errors.firstName = 'First name is required'
    isValid = false
  }
  
  // Last name validation
  if (!form.lastName.trim()) {
    errors.lastName = 'Last name is required'
    isValid = false
  }
  
  // Turnstile validation
  if (!turnstileToken.value) {
    error.value = 'Please complete the CAPTCHA verification.'
    isValid = false
  }
  
  // Terms validation
  if (!form.terms) {
    error.value = 'You must agree to the Terms and Conditions'
    isValid = false
  }
  
  return isValid
}

// Reset error when user starts typing
const resetError = (): void => {
  error.value = ''
}

// Watch for input changes to clear error
watch([() => form.email, () => form.password, () => form.confirmPassword, () => form.firstName, () => form.lastName], () => {
  if (error.value) {
    resetError()
  }
})

// Handle register
const handleRegister = async () => {
  // Reset messages
  error.value = ''
  success.value = ''
  
  // Validate form
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    // Prepare request body sesuai DTO
    const requestBody = {
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      role: form.role
    }
    
    console.log('Register request:', requestBody)
    
    // Call register API dengan Turnstile token di header
    const response = await $fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      body: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'cf-turnstile-token': turnstileToken.value
      },
      // Jangan parse error sebagai response biasa
      ignoreResponseError: true
    }).catch(err => {
      // Tangkap error dengan lebih detail
      console.error('Fetch error:', err)
      throw err
    })
    
    console.log('Register response:', response)
    
    // Show success message
    success.value = 'Registration successful! Redirecting to login...'
    
    // Reset form
    form.email = ''
    form.password = ''
    form.confirmPassword = ''
    form.firstName = ''
    form.lastName = ''
    form.role = 'JOBSEEKER'
    form.terms = false
    turnstileToken.value = ''
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/login')
    }, 2000)
    
  } catch (err: any) {
    console.error('Register error details:', err)
    
    // Handle error response dengan lebih baik
    if (err.response?.status === 400) {
      // Bad request - kemungkinan email sudah terdaftar
      error.value = 'Email already registered or invalid data.'
    } else if (err.data?.message) {
      error.value = err.data.message
    } else if (err.message) {
      error.value = err.message
    } else {
      error.value = 'Registration failed. Please try again.'
    }
    
    // Reset Turnstile token if error
    turnstileToken.value = ''
  } finally {
    loading.value = false
  }
}
</script>