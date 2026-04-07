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
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 mb-8">
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
            {{ validating ? 'Validating...' : 'Unlock Profile' }}
          </button>
          
          <div class="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Only share this link with trusted parties. Passcode access is required each time.
          </div>
        </div>
      </div>

      <!-- Redirecting Message -->
      <div v-if="redirecting" class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p class="text-slate-600 dark:text-slate-400 text-lg">Validation successful!</p>
        <p class="text-slate-500 dark:text-slate-500 mt-2">Redirecting to candidate profile...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCandidateProfilePage } from '~/composables/useCandidateProfilePage'

const route = useRoute()
const router = useRouter()
const { validateCandidateProfilePage } = useCandidateProfilePage()

// State
const urlIdentifier = ref('')
const passcode = ref('')
const validating = ref(false)
const redirecting = ref(false)
const errorMessage = ref('')

// Validate passcode and redirect to user profile
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
    
    if (response.valid && response.profilePage) {
      // Coba ambil userId dari berbagai kemungkinan
      let userId = response.profilePage.userProfile?.userId
      const userProfileId = response.profilePage.userProfile?.id
      const applicationId = route.query.applicationId as string || ''
      
      console.log('userId from response:', userId)
      console.log('userProfileId from response:', userProfileId)
      
      // Jika userId kosong, gunakan userProfileId
      if (!userId && userProfileId) {
        userId = userProfileId
        console.log('Using userProfileId as userId:', userId)
      }
      
      if (userId) {
        console.log('Redirecting to user profile:', userId)
        redirecting.value = true
        
        const redirectUrl = applicationId 
          ? `/users/${userId}?applicationId=${applicationId}`
          : `/users/${userId}`
        
        await router.push(redirectUrl)
      } else {
        errorMessage.value = 'User ID not found in profile data. Please contact support.'
        console.error('Profile data:', response.profilePage)
      }
    } else {
      errorMessage.value = response.message || 'Invalid passcode. Please try again.'
    }
  } catch (error: any) {
    console.error('Validation error:', error)
    errorMessage.value = error?.message || 'Failed to validate passcode. Please try again.'
  } finally {
    validating.value = false
  }
}

onMounted(() => {
  urlIdentifier.value = route.params.id as string
  console.log('URL Identifier:', urlIdentifier.value)
  console.log('Application ID:', route.query.applicationId)
})
</script>