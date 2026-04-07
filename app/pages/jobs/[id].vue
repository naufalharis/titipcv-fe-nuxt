<!-- pages/jobs/[id].vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <div class="container mx-auto px-4 py-8 max-w-5xl">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-slate-600 dark:text-slate-400 text-lg">{{ error }}</p>
        <NuxtLink 
          to="/jobs" 
          class="mt-4 inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Back
        </NuxtLink>
      </div>

      <!-- Job Detail Content -->
      <div v-else-if="job" class="space-y-6">
        <!-- Back Button -->
        <button 
          @click="router.back()"
          class="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <!-- Job Header Card -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
          <div class="p-6 md:p-8">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div class="flex-1">
                <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {{ job.title }}
                </h1>
                <p class="text-lg text-slate-600 dark:text-slate-400 mb-4">
                  {{ job.company?.name || 'Company' }}
                </p>
                
                <div class="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <span class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {{ job.city || 'Remote' }}{{ job.country?.name ? `, ${job.country.name}` : '' }}
                  </span>
                  
                  <span class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {{ job.workType?.name || 'Full Time' }}
                  </span>
                  
                  <span class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Posted {{ formatRelativeTime(job.createdAt) }}
                  </span>
                </div>
              </div>

              <div class="flex flex-col gap-3">
                <!-- Bookmark Button -->
                <button 
                  @click="toggleBookmark"
                  :disabled="bookmarkLoading"
                  class="px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                  :class="isBookmarked 
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                    : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'"
                >
                  <span v-if="bookmarkLoading" class="flex items-center justify-center gap-2">
                    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  </span>
                  <span v-else>
                    <svg v-if="isBookmarked" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </span>
                  <span>{{ isBookmarked ? 'Bookmarked' : 'Bookmark' }}</span>
                </button>
                
                <p v-if="job.showSalary && job.payFrom" class="text-center text-sm text-green-600 dark:text-green-400 font-medium">
                  {{ formatSalary(job.payFrom) }} - {{ formatSalary(job.payTo) }}
                  <span v-if="job.currency?.code"> {{ job.currency.code }}</span>
                  <span v-if="job.payType?.name">/ {{ job.payType.name }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Job Details Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Description -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Job Description</h2>
              <div class="prose dark:prose-invert max-w-none">
                <div v-html="job.description" class="text-slate-600 dark:text-slate-400"></div>
              </div>
            </div>

            <!-- Qualifications -->
            <div v-if="job.qualification" class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Qualifications</h2>
              <div class="prose dark:prose-invert max-w-none">
                <div v-html="job.qualification" class="text-slate-600 dark:text-slate-400"></div>
              </div>
            </div>

            <!-- Benefits -->
            <div v-if="job.benefits" class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Benefits</h2>
              <div class="prose dark:prose-invert max-w-none">
                <div v-html="job.benefits" class="text-slate-600 dark:text-slate-400"></div>
              </div>
            </div>

            <!-- Video -->
            <div v-if="job.videoUrl" class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Company Video</h2>
              <div class="aspect-video">
                <iframe 
                  :src="getYouTubeEmbedUrl(job.videoUrl)" 
                  class="w-full h-full rounded-lg"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Job Summary Card -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Job Summary</h3>
              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500 dark:text-slate-400">Job Type</span>
                  <span class="font-medium text-slate-700 dark:text-slate-300">{{ job.workType?.name || 'Full Time' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500 dark:text-slate-400">Work Place</span>
                  <span class="font-medium text-slate-700 dark:text-slate-300">{{ job.workPlace?.name || 'On Site' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500 dark:text-slate-400">Experience Level</span>
                  <span class="font-medium text-slate-700 dark:text-slate-300">Mid-Senior Level</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500 dark:text-slate-400">Posted Date</span>
                  <span class="font-medium text-slate-700 dark:text-slate-300">{{ formatDate(job.createdAt) }}</span>
                </div>
                <div v-if="job.expiresAt" class="flex justify-between text-sm">
                  <span class="text-slate-500 dark:text-slate-400">Application Deadline</span>
                  <span class="font-medium text-amber-600 dark:text-amber-400">{{ formatDate(job.expiresAt) }}</span>
                </div>
              </div>
            </div>

            <!-- Share Job Card -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Share This Job</h3>
              <div class="flex gap-3">
                <button 
                  @click="shareOnLinkedIn"
                  class="flex-1 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.203 0 22.225 0z"/>
                  </svg>
                  LinkedIn
                </button>
                <button 
                  @click="shareOnTwitter"
                  class="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.963-12.143c0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <div 
      v-if="showToast"
      class="fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-up"
      :class="toastType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
    >
      <svg v-if="toastType === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useJobBookmark } from '~/composables/useJobBookmark'

// Types
interface Job {
  id: string
  title: string
  slug: string
  description: string
  summary: string
  qualification: string
  benefits: string
  companyId: string
  countryId: string
  workTypeId: string
  payTypeId: string
  currencyId: string
  workPlaceId: string
  city: string
  payFrom: string
  payTo: string
  videoUrl: string
  showSalary: boolean
  isPrivate: boolean
  status: string
  publishedAt: number
  expiresAt: number
  createdAt: number
  updatedAt: number
  createdBy: string
  updatedBy: string
  company?: any
  category?: any
  country?: any
  workType?: any
  payType?: any
  currency?: any
  workPlace?: any
  creator?: any
}

interface ApiResponse<T> {
  status: string
  message: string
  data: T
}

const route = useRoute()
const router = useRouter()
const { isAuthenticated, accessToken } = useAuth()
const { bookmarkJob, unbookmarkJob, checkBookmarkStatus } = useJobBookmark()

// State
const job = ref<Job | null>(null)
const loading = ref(true)
const error = ref('')
const isBookmarked = ref(false)
const bookmarkLoading = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

// Methods
const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const formatDate = (timestamp?: number | null) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatRelativeTime = (timestamp?: number | null) => {
  if (!timestamp) return 'N/A'
  const now = Date.now() / 1000
  const diff = now - timestamp
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
  return formatDate(timestamp)
}

const formatSalary = (amount?: string | null) => {
  if (!amount) return ''
  const num = parseFloat(amount)
  if (isNaN(num)) return ''
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num)
}

const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return ''
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  const videoId = (match && match[2].length === 11) ? match[2] : null
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`
  }
  return url
}

const shareOnLinkedIn = () => {
  const url = encodeURIComponent(window.location.href)
  const title = encodeURIComponent(`Job Opportunity: ${job.value?.title}`)
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
}

const shareOnTwitter = () => {
  const url = encodeURIComponent(window.location.href)
  const text = encodeURIComponent(`Check out this job: ${job.value?.title}`)
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
}

const toggleBookmark = async () => {
  if (!isAuthenticated.value) {
    showNotification('Please login to bookmark jobs', 'error')
    router.push('/login')
    return
  }

  if (!job.value) return

  bookmarkLoading.value = true
  
  try {
    if (isBookmarked.value) {
      await unbookmarkJob(job.value.id)
      isBookmarked.value = false
      showNotification('Job removed from bookmarks', 'success')
    } else {
      await bookmarkJob(job.value.id)
      isBookmarked.value = true
      showNotification('Job bookmarked successfully', 'success')
    }
  } catch (err: any) {
    console.error('Error toggling bookmark:', err)
    showNotification(err.message || 'Failed to update bookmark', 'error')
  } finally {
    bookmarkLoading.value = false
  }
}

const loadJobDetail = async () => {
  const id = route.params.id as string
  
  try {
    const runtimeConfig = useRuntimeConfig()
    const baseURL = runtimeConfig.public.apiBaseUrl || 'http://localhost:3335/api/v1'
    
    // Fetch job details
    const jobResponse = await fetch(`${baseURL}/jobs/${id}`)
    
    if (!jobResponse.ok) {
      throw new Error('Failed to fetch job details')
    }
    
    const jobResult: ApiResponse<Job> = await jobResponse.json()
    
    // Extract job data from response wrapper
    if (jobResult.status === 'success' && jobResult.data) {
      job.value = jobResult.data
    } else {
      throw new Error('Invalid job data format')
    }
    
    // Check bookmark status if authenticated
    if (isAuthenticated.value) {
      isBookmarked.value = await checkBookmarkStatus(id)
    }
    
  } catch (err: any) {
    console.error('Error loading job:', err)
    error.value = err.message || 'Failed to load job details'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadJobDetail()
})
</script>

<style scoped>
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}
</style>