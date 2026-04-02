<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Shared Candidate Profile</h1>
        <p class="mt-2 text-slate-500 dark:text-slate-400">
          Enter the passcode provided by the recruiter to view the candidate's details.
        </p>
      </div>

      <!-- Passcode Input Section -->
      <div v-if="!isValidated" class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 mb-8">
        <div class="max-w-md mx-auto">
          <div class="mb-6">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Passcode
            </label>
            <input
              v-model="passcode"
              type="password"
              class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
              placeholder="Enter the passcode"
              @keyup.enter="validatePasscode"
            />
          </div>
          
          <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {{ errorMessage }}
          </div>
          
          <button
            @click="validatePasscode"
            :disabled="validating"
            class="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {{ validating ? 'Validating...' : 'ACCESS GRANTED' }}
          </button>
          
          <div class="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Only share this link with trusted parties. Passcode access is required each time.
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <!-- Profile Content -->
      <div v-else-if="profileData" class="space-y-6">
        <!-- Profile Header -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div class="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-white/80 text-sm">ACCESS GRANTED</p>
                <p class="text-white/60 text-xs mt-1">Shared by {{ profileData.company?.name || 'Company' }}</p>
              </div>
              <div class="text-right">
                <p class="text-white/60 text-xs">ID: {{ urlIdentifier }}</p>
                <p class="text-white/60 text-xs">Shared on: {{ formatDateTime(sharedAt) }}</p>
              </div>
            </div>
          </div>
          
          <div class="p-6">
            <div class="flex items-start gap-6">
              <!-- Profile Photo -->
              <div class="flex-shrink-0">
                <div class="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              
              <!-- Basic Info -->
              <div class="flex-1">
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
                  {{ getFullName() }}
                </h2>
                <p class="text-slate-600 dark:text-slate-400 mt-1">
                  {{ profileData.userProfile?.summary || 'No summary available' }}
                </p>
                
                <div class="flex flex-wrap gap-4 mt-3">
                  <div v-if="profileData.userProfile?.experience" class="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{{ profileData.userProfile.experience }} years experience</span>
                  </div>
                  
                  <div v-if="profileData.userProfile?.isReadyToWork" class="flex items-center gap-1">
                    <span class="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs">
                      Ready to Work
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Information
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400">Email</p>
                <p class="text-sm text-slate-900 dark:text-white">{{ getEmail() }}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400">Location</p>
                <p class="text-sm text-slate-900 dark:text-white">{{ getLocation() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Personal Information -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Personal Information
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Gender</p>
              <p class="text-sm text-slate-900 dark:text-white">{{ getGender() }}</p>
            </div>
            
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Birth Date</p>
              <p class="text-sm text-slate-900 dark:text-white">{{ formatDate(profileData.userProfile?.birthDate) }}</p>
            </div>
            
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Birth Place</p>
              <p class="text-sm text-slate-900 dark:text-white">{{ profileData.userProfile?.birthPlace || 'Not provided' }}</p>
            </div>
          </div>
        </div>

        <!-- Resume Section -->
        <div v-if="profileData.userProfile?.cv" class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Resume / CV
          </h3>
          
          <a
            :href="profileData.userProfile.cv"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Resume
          </a>
        </div>

        <!-- Footer -->
        <div class="text-center py-6">
          <button
            @click="resetValidation"
            class="text-primary-600 dark:text-primary-400 hover:underline text-sm"
          >
            Use another passcode
          </button>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-4">
            Only share this link with trusted parties. Passcode access is required each time.
          </p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage && !isValidated" class="text-center py-12">
        <p class="text-red-600 dark:text-red-400">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCandidateProfilePage, type ValidationResponse } from '~/composables/useCandidateProfilePage'

const route = useRoute()
const { validateCandidateProfilePage } = useCandidateProfilePage()

// State
const urlIdentifier = ref('')
const passcode = ref('')
const isValidated = ref(false)
const validating = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const profileData = ref<ValidationResponse['data'] | null>(null)
const sharedAt = ref(0)

// Get full name
const getFullName = (): string => {
  const userProfile = profileData.value?.userProfile
  if (!userProfile) return 'Unknown Candidate'
  const firstName = userProfile.firstName || ''
  const lastName = userProfile.lastName || ''
  if (firstName || lastName) {
    return `${firstName} ${lastName}`.trim()
  }
  return 'Unknown Candidate'
}

// Get email
const getEmail = (): string => {
  return profileData.value?.recruiter?.email || 'Not provided'
}

// Get location
const getLocation = (): string => {
  const userProfile = profileData.value?.userProfile
  if (!userProfile) return 'Location not specified'
  const parts = [userProfile.city, userProfile.province, userProfile.district].filter(p => p)
  return parts.length > 0 ? parts.join(', ') : 'Location not specified'
}

// Get gender
const getGender = (): string => {
  const gender = profileData.value?.userProfile?.gender
  if (!gender) return 'Not specified'
  const genderMap: Record<string, string> = {
    'M': 'Male',
    'F': 'Female',
    'm': 'Male',
    'f': 'Female'
  }
  return genderMap[gender] || gender
}

// Format date
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'Not provided'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateStr
  }
}

// Format date time
const formatDateTime = (timestamp: number): string => {
  if (!timestamp) return 'Unknown'
  return new Date(timestamp * 1000).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  })
}

// Validate passcode
const validatePasscode = async () => {
  if (!passcode.value.trim()) {
    errorMessage.value = 'Please enter a passcode'
    return
  }
  
  validating.value = true
  errorMessage.value = ''
  
  try {
    const response = await validateCandidateProfilePage({
      urlIdentifier: urlIdentifier.value,
      passcode: passcode.value
    })
    
    console.log('Validation result:', response)
    
    if (response.valid && response.data) {
      isValidated.value = true
      profileData.value = response.data
      sharedAt.value = Date.now() / 1000
      errorMessage.value = ''
    } else {
      errorMessage.value = response.message || 'Invalid passcode. Please try again.'
      isValidated.value = false
      profileData.value = null
    }
  } catch (error: any) {
    console.error('Validation error:', error)
    errorMessage.value = error?.message || 'Failed to validate passcode. Please try again.'
    isValidated.value = false
    profileData.value = null
  } finally {
    validating.value = false
  }
}

// Reset validation
const resetValidation = () => {
  isValidated.value = false
  passcode.value = ''
  profileData.value = null
  errorMessage.value = ''
}

// Get URL identifier from route params
onMounted(() => {
  // Get the dynamic parameter from URL
  urlIdentifier.value = route.params.id as string
  console.log('URL Identifier from params:', urlIdentifier.value)
  console.log('Full route:', route.path)
  console.log('Route params:', route.params)
})
</script>