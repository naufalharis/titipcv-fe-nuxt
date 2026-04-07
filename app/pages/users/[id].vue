<template>
  <div>
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Header -->
      <div class="mb-4">
        <button @click="goBack" class="flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Applications
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <!-- Profile Content -->
      <div v-else-if="profile" class="space-y-6">
        <!-- Profile Header Card -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div class="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
            <div class="flex flex-col md:flex-row items-center gap-6">
              <!-- Profile Photo -->
              <div class="w-28 h-28 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden border-4 border-white/20">
                <img 
                  v-if="profile.photo?.url" 
                  :src="profile.photo.url" 
                  :alt="getFullName()"
                  class="w-full h-full object-cover"
                />
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-14 w-14 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              <!-- Profile Info -->
              <div class="text-white text-center md:text-left flex-1">
                <h1 class="text-4xl font-bold">{{ getFullName() }}</h1>
                <p class="text-lg text-white/80 mt-2">{{ profile.summary || 'Professional Profile' }}</p>
                <div class="flex flex-wrap gap-6 mt-4 justify-center md:justify-start">
                  <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{{ getLocation() }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{{ profile.experience || 0 }} years experience</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Profile Stats -->
          <div class="grid grid-cols-4 gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Email</p>
              <p class="text-sm text-slate-900 dark:text-white font-medium">{{ user?.email || '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Gender</p>
              <p class="text-sm text-slate-900 dark:text-white font-medium">{{ getGenderText(profile.gender) }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Location</p>
              <p class="text-sm text-slate-900 dark:text-white font-medium">{{ getLocation() }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Member since</p>
              <p class="text-sm text-slate-900 dark:text-white font-medium">{{ formatDate(profile.createdAt) }}</p>
            </div>
          </div>

          <!-- Application Status Section -->
          <div v-if="application" class="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-6">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Application Status</h3>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400">Current Status</p>
                <span 
                  class="inline-block px-3 py-1.5 text-sm rounded-full font-medium mt-1"
                  :class="getStatusBadgeClass(applicationStatus)"
                >
                  {{ getStatusText(applicationStatus) }}
                </span>
              </div>
              <div class="flex flex-wrap gap-2 justify-end">
                <button
                  v-for="status in statusOptions"
                  :key="status.value"
                  @click="updateStatus(status.value)"
                  :disabled="updatingStatus || applicationStatus === status.value"
                  class="px-3 py-1.5 text-xs rounded-lg transition-colors"
                  :class="applicationStatus === status.value 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'"
                >
                  {{ status.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Work Experience Section -->
        <div v-if="workExperiences.length > 0" class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Work Experience</h2>
          
          <div class="space-y-4">
            <div v-for="exp in workExperiences" :key="exp.id" class="p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div class="flex-1">
                <h3 class="font-semibold text-slate-900 dark:text-white">{{ exp.position || 'Position not specified' }}</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400">{{ exp.companyName || 'Company not specified' }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  {{ formatWorkPeriod(exp.monthStart, exp.yearStart, exp.monthFinish, exp.yearFinish, exp.isCurrent) }}
                </p>
                <p v-if="exp.location" class="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {{ exp.location }}
                </p>
                <div v-if="exp.workPlace || exp.workType" class="flex flex-wrap gap-2 mt-2">
                  <span v-if="exp.workPlace" class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                    {{ exp.workPlace.name }}
                  </span>
                  <span v-if="exp.workType" class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
                    {{ exp.workType.name }}
                  </span>
                </div>
                <p v-if="exp.description" class="text-sm text-slate-600 dark:text-slate-400 mt-2">{{ exp.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Skills Section -->
        <div v-if="skills.length > 0" class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Skills</h2>
          
          <div class="flex flex-wrap gap-2">
            <span v-for="skill in skills" :key="skill.id" class="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm flex items-center gap-2">
              {{ skill.skill?.name || 'Skill' }}
              <span v-if="skill.proficiencyLevel !== undefined" class="ml-1 text-xs text-slate-500 dark:text-slate-400">
                ({{ skill.proficiencyLevel === 1 ? 'Beginner' : skill.proficiencyLevel === 2 ? 'Intermediate' : skill.proficiencyLevel === 3 ? 'Advanced' : skill.proficiencyLevel }})
              </span>
            </span>
          </div>
        </div>

        <!-- Certificates Section -->
        <div v-if="certificates.length > 0" class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Certificates</h2>
          
          <div class="space-y-4">
            <div v-for="cert in certificates" :key="cert.id" class="p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <h3 class="font-semibold text-slate-900 dark:text-white">{{ cert.name }}</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">{{ cert.organization || 'Organization not specified' }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-500 mt-1">
                {{ formatCertificatePeriod(cert.issueMonthStart, cert.issueYearStart, cert.issueMonthFinish, cert.issueYearFinish) }}
              </p>
              <div v-if="cert.credentialId || cert.credentialUrl" class="mt-2 space-y-1">
                <p v-if="cert.credentialId" class="text-xs text-slate-500 dark:text-slate-400">
                  Credential ID: {{ cert.credentialId }}
                </p>
                <a v-if="cert.credentialUrl" :href="cert.credentialUrl" target="_blank" class="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 inline-block">
                  View Certificate →
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Languages Section -->
        <div v-if="languages.length > 0" class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Languages</h2>
          
          <div class="overflow-x-auto">
            <div class="grid grid-cols-3 gap-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2 min-w-full">
              <div>Language</div>
              <div>Proficiency Level</div>
              <div class="text-right">Details</div>
            </div>
            <div v-for="lang in languages" :key="lang.id" class="grid grid-cols-3 gap-4 items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg mb-2">
              <div class="truncate text-slate-900 dark:text-white font-medium">{{ lang.language?.name || 'Language' }}</div>
              <div class="text-sm text-slate-600 dark:text-slate-400">
                {{ getProficiencyLevel(lang.proficiencyLevel) }}
              </div>
              <div class="text-right text-xs text-slate-500 dark:text-slate-400">
                {{ lang.language?.name }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600 dark:text-red-400 mb-4">{{ error }}</p>
        <button @click="goBack" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserProfile } from '~/composables/useUserProfile'
import { useUserWorkExperience } from '~/composables/useUserWorkExperience'
import { useUserCertificate } from '~/composables/useUserCertificate'
import { useUsers } from '~/composables/useUsers'
import { useApplications } from '~/composables/useApplications'

const router = useRouter()
const route = useRoute()
const { getUserProfile, getUserSkills, getUserLanguages } = useUserProfile()
const { getUserWorkExperiences } = useUserWorkExperience()
const { getUserCertificates } = useUserCertificate()
const { getUserById } = useUsers()
const { getApplicationById, updateApplicationStatus } = useApplications()

// State
const loading = ref(true)
const error = ref('')
const profile = ref<any>(null)
const user = ref<any>(null)
const application = ref<any>(null)
const applicationStatus = ref('')
const workExperiences = ref<any[]>([])
const certificates = ref<any[]>([])
const skills = ref<any[]>([])
const languages = ref<any[]>([])
const updatingStatus = ref(false)

// Helper functions
const getFullName = (): string => {
  if (!profile.value) return 'Profile'
  const firstName = profile.value.firstName || ''
  const lastName = profile.value.lastName || ''
  return `${firstName} ${lastName}`.trim() || profile.value.username || 'User Profile'
}

const getLocation = (): string => {
  if (!profile.value) return 'Location not specified'
  const parts = [profile.value.city, profile.value.province].filter(p => p)
  return parts.length > 0 ? parts.join(', ') : 'Location not specified'
}

const getGenderText = (gender: string): string => {
  const genderMap: Record<string, string> = { 'M': 'Male', 'F': 'Female' }
  return genderMap[gender] || 'Not specified'
}

const getProficiencyLevel = (level: number): string => {
  const levels: Record<number, string> = {
    1: 'Beginner',
    2: 'Intermediate',
    3: 'Advanced',
    4: 'Fluent'
  }
  return levels[level] || 'Unknown'
}

const formatDate = (timestamp: number): string => {
  if (!timestamp) return 'N/A'
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatWorkPeriod = (monthStart: number, yearStart: number, monthFinish: number, yearFinish: number, isCurrent: boolean): string => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const start = monthStart && yearStart ? `${monthNames[monthStart - 1]} ${yearStart}` : 'Start date not specified'
  const end = isCurrent ? 'Present' : (monthFinish && yearFinish ? `${monthNames[monthFinish - 1]} ${yearFinish}` : 'End date not specified')
  return `${start} - ${end}`
}

const formatCertificatePeriod = (monthStart: number, yearStart: number, monthFinish: number, yearFinish: number): string => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  if (monthStart && yearStart && monthFinish && yearFinish) {
    return `${monthNames[monthStart - 1]} ${yearStart} - ${monthNames[monthFinish - 1]} ${yearFinish}`
  } else if (monthStart && yearStart) {
    return `Issued ${monthNames[monthStart - 1]} ${yearStart}`
  }
  return 'Date not specified'
}

const getStatusBadgeClass = (status: string): string => {
  const classes: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    reviewed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    shortlisted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    interviewed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    offered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    hired: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    withdrawn: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }
  return classes[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
}

const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    pending: 'Pending',
    reviewed: 'Reviewed',
    shortlisted: 'Shortlisted',
    interviewed: 'Interviewed',
    offered: 'Offered',
    hired: 'Hired',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn'
  }
  return texts[status] || status.charAt(0).toUpperCase() + status.slice(1)
}

// Status options for recruiter
const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'shortlisted', label: 'Shortlist' },
  { value: 'interviewed', label: 'Interview' },
  { value: 'offered', label: 'Offer' },
  { value: 'hired', label: 'Hire' },
  { value: 'rejected', label: 'Reject' }
]

const updateStatus = async (newStatus: string) => {
  if (!application.value?.id) return
  
  updatingStatus.value = true
  try {
    await updateApplicationStatus(application.value.id, newStatus)
    applicationStatus.value = newStatus
    alert(`Application status updated to ${getStatusText(newStatus)}`)
  } catch (err) {
    console.error('Error updating status:', err)
    alert('Failed to update application status')
  } finally {
    updatingStatus.value = false
  }
}

const goBack = () => {
  router.back()
}

// Load profile data
onMounted(async () => {
  loading.value = true
  try {
    const userId = route.params.id as string
    const applicationId = route.query.applicationId as string | undefined
    
    if (!userId) {
      error.value = 'User ID not found'
      loading.value = false
      return
    }

    // Fetch user data (for email from users table)
    try {
      const userData = await getUserById(userId)
      user.value = userData || {}
    } catch (e) {
      console.warn('Failed to load user data:', e)
    }

    // Fetch application data if applicationId is provided
    if (applicationId) {
      try {
        const appData = await getApplicationById(applicationId)
        application.value = appData
        applicationStatus.value = appData?.status || ''
      } catch (e) {
        console.warn('Failed to load application data:', e)
      }
    }

    // Fetch profile
    const profileData = await getUserProfile(userId)
    profile.value = profileData || {}

    // Fetch work experiences
    try {
      const exps = await getUserWorkExperiences(userId)
      workExperiences.value = exps || []
    } catch (e) {
      console.warn('Failed to load work experiences:', e)
    }

    // Fetch certificates
    try {
      const certs = await getUserCertificates(userId)
      certificates.value = certs || []
    } catch (e) {
      console.warn('Failed to load certificates:', e)
    }

    // Fetch skills
    try {
      const userSkills = await getUserSkills(userId)
      skills.value = userSkills || []
    } catch (e) {
      console.warn('Failed to load skills:', e)
    }

    // Fetch languages
    try {
      const userLangs = await getUserLanguages(userId)
      languages.value = userLangs || []
    } catch (e) {
      console.warn('Failed to load languages:', e)
    }
  } catch (err: any) {
    console.error('Error loading profile:', err)
    error.value = err?.message || 'Failed to load profile'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
</style>
