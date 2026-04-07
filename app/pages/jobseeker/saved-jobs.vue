<!-- pages/bookmarks/index.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Bookmarks</h1>
        <p class="text-slate-600 dark:text-slate-400">Jobs you've saved for later</p>
      </div>

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
        <button 
          @click="loadBookmarks"
          class="mt-4 inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="bookmarks.length === 0" class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 mx-auto text-slate-400 dark:text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">No bookmarks yet</h3>
        <p class="text-slate-600 dark:text-slate-400 mb-6">Start saving jobs you're interested in</p>
        <NuxtLink 
          to="/jobs"
          class="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Browse Jobs
        </NuxtLink>
      </div>

      <!-- Bookmarks Grid -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          v-for="bookmark in bookmarks" 
          :key="bookmark.id"
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
        >
          <div class="p-6">
            <!-- Job Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <NuxtLink :to="`/jobs/${bookmark.jobId}`" class="block">
                  <h2 class="text-xl font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2">
                    {{ bookmark.job?.title || 'Untitled Job' }}
                  </h2>
                </NuxtLink>
                <p class="text-slate-600 dark:text-slate-400">
                  {{ bookmark.job?.company?.name || 'Company' }}
                </p>
              </div>
              
              <!-- Remove Bookmark Button -->
              <button 
                @click="removeBookmark(bookmark.jobId)"
                :disabled="removing === bookmark.id"
                class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <span v-if="removing === bookmark.id" class="inline-block">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                </span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <!-- Job Details -->
            <div class="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400 mb-4">
              <span class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ bookmark.job?.city || 'Remote' }}
              </span>
              <span class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {{ getWorkTypeName(bookmark.job?.workType) || 'Full Time' }}
              </span>
              <span v-if="bookmark.job?.showSalary && bookmark.job?.payFrom" class="flex items-center gap-1 text-green-600 dark:text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ formatSalary(bookmark.job.payFrom) }} - {{ formatSalary(bookmark.job.payTo) }}
                <span v-if="bookmark.job?.currency?.symbol"> {{ bookmark.job.currency.symbol }}</span>
              </span>
            </div>

            <!-- Footer -->
            <div class="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
              <span class="text-xs text-slate-400">
                Saved {{ formatDate(bookmark.createdAt) }}
              </span>
              <NuxtLink 
                :to="`/jobs/${bookmark.jobId}`"
                class="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-sm font-medium"
              >
                View Details →
              </NuxtLink>
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
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useJobBookmark, type JobBookmark } from '~/composables/useJobBookmark'

const router = useRouter()
const { isAuthenticated } = useAuth()
const { getMyBookmarks, unbookmarkJob } = useJobBookmark()

const bookmarks = ref<JobBookmark[]>([])
const loading = ref(true)
const error = ref('')
const removing = ref<string | null>(null)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const formatDate = (timestamp?: number) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
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

const getWorkTypeName = (workType: any): string => {
  if (!workType) return 'Full Time'
  
  // Cari nama dalam bahasa Indonesia (default locale)
  if (workType.translations && Array.isArray(workType.translations)) {
    const indonesianTranslation = workType.translations.find(
      (t: any) => t.locale?.code === 'id'
    )
    if (indonesianTranslation?.name) {
      return indonesianTranslation.name
    }
    
    // Fallback ke translation pertama
    if (workType.translations[0]?.name) {
      return workType.translations[0].name
    }
  }
  
  return workType.name || workType.slug || 'Full Time'
}

const loadBookmarks = async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    const response = await getMyBookmarks(1, 50)
    // Response langsung berupa { bookmarks, page, pageSize, total }
    if (response && response.bookmarks) {
      bookmarks.value = response.bookmarks
      console.log('Bookmarks loaded:', bookmarks.value.length)
    } else {
      bookmarks.value = []
    }
  } catch (err: any) {
    console.error('Error loading bookmarks:', err)
    error.value = err.message || 'Failed to load bookmarks'
    
    if (err.message?.includes('login') || err.message?.includes('Session expired')) {
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  } finally {
    loading.value = false
  }
}

const removeBookmark = async (jobId: string) => {
  removing.value = jobId
  
  try {
    await unbookmarkJob(jobId)
    // Remove from local list
    bookmarks.value = bookmarks.value.filter(b => b.jobId !== jobId)
    showNotification('Bookmark removed successfully', 'success')
  } catch (err: any) {
    console.error('Error removing bookmark:', err)
    showNotification(err.message || 'Failed to remove bookmark', 'error')
    
    if (err.message?.includes('login') || err.message?.includes('Session expired')) {
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  } finally {
    removing.value = null
  }
}

onMounted(() => {
  loadBookmarks()
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