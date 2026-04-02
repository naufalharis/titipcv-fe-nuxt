<template>
  <div>
    <div class="container mx-auto px-4 py-8 max-w-7xl">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p class="mt-2 text-slate-500 dark:text-slate-400">Welcome back, {{ userFullName }}!</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
          <p class="text-sm text-slate-500 dark:text-slate-400">Total Applications</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats.totalApplications }}</p>
        </div>
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
          <p class="text-sm text-slate-500 dark:text-slate-400">In Review</p>
          <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ stats.inReview }}</p>
        </div>
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
          <p class="text-sm text-slate-500 dark:text-slate-400">Accepted</p>
          <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ stats.accepted }}</p>
        </div>
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
          <p class="text-sm text-slate-500 dark:text-slate-400">Rejected</p>
          <p class="text-2xl font-bold text-rose-600 dark:text-rose-400">{{ stats.rejected }}</p>
        </div>
      </div>

      <!-- Recommended Jobs & Quick Actions Side by Side -->
      <div class="flex flex-col lg:flex-row gap-6 mb-8">
        <!-- Recommended Jobs Section - Lebih kecil (60%) -->
        <div class="lg:w-3/5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Recommended for You</h2>
            <NuxtLink 
              to="/jobs" 
              class="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              View All
            </NuxtLink>
          </div>
          
          <div v-if="recommendedJobs.length > 0" class="divide-y divide-slate-200 dark:divide-slate-800">
            <div v-for="job in recommendedJobs" :key="job.id" class="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="text-base font-semibold text-slate-900 dark:text-white">{{ job.title }}</h3>
                  <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">{{ job.company?.name || 'Company' }}</p>
                  <div class="flex flex-wrap gap-4 mt-2 text-xs text-slate-500 dark:text-slate-500">
                    <span class="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {{ job.city || 'Remote' }}
                    </span>
                    <span class="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {{ job.workType?.name || 'Full Time' }}
                    </span>
                    <span v-if="job.showSalary && job.payFrom" class="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ formatSalary(job.payFrom) }} - {{ formatSalary(job.payTo) }}
                    </span>
                  </div>
                </div>
                <NuxtLink 
                  :to="`/jobs/${job.id}`" 
                  class="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  View Details
                </NuxtLink>
              </div>
            </div>
          </div>
          
          <div v-else class="p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p class="text-slate-500 dark:text-slate-400 font-medium">You haven't applied to any jobs yet</p>
            <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">Start exploring job opportunities</p>
            <NuxtLink 
              to="/jobs" 
              class="mt-4 inline-block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Browse Jobs
            </NuxtLink>
          </div>
        </div>

        <!-- Quick Actions - Di sebelah kanan (40%) dan bentuk vertikal -->
        <div class="lg:w-2/5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
          </div>
          <div class="divide-y divide-slate-200 dark:divide-slate-800">
            <NuxtLink 
              to="/jobseeker/profile" 
              class="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300">Edit Profile</p>
                <p class="text-xs text-slate-500 dark:text-slate-500">Update your personal information</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
            
            <NuxtLink 
              to="/jobs" 
              class="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300">Browse Jobs</p>
                <p class="text-xs text-slate-500 dark:text-slate-500">Find your next opportunity</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
            
            <NuxtLink 
              to="/jobseeker/applications" 
              class="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300">My Applications</p>
                <p class="text-xs text-slate-500 dark:text-slate-500">Track your job applications</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
            
            <NuxtLink 
              to="/jobseeker/saved-jobs" 
              class="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300">Saved Jobs</p>
                <p class="text-xs text-slate-500 dark:text-slate-500">View your bookmarked positions</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useJobs } from '~/composables/useJobs'

const router = useRouter()
const { user, isAuthenticated } = useAuth()
const { listJobs } = useJobs()

// User info
const userFullName = computed(() => {
  if (!user.value) return 'Job Seeker'
  return user.value.name || user.value.username || user.value.email?.split('@')[0] || 'Job Seeker'
})

// Stats
const stats = ref({
  totalApplications: 0,
  inReview: 0,
  accepted: 0,
  rejected: 0
})

// Recommended jobs
const recommendedJobs = ref<any[]>([])
const loading = ref(true)

// Format salary
const formatSalary = (amount: string | number | null): string => {
  if (!amount) return ''
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return ''
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num)
}

// Load stats (mock untuk sementara)
const loadStats = async () => {
  try {
    // TODO: Ganti dengan API call real
    stats.value = {
      totalApplications: 0,
      inReview: 0,
      accepted: 0,
      rejected: 0
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

// Load recommended jobs
const loadRecommendedJobs = async () => {
  try {
    const response = await listJobs({
      page: 1,
      limit: 3,
      status: 'active'
    })
    recommendedJobs.value = response.jobs || []
  } catch (error) {
    console.error('Error loading recommended jobs:', error)
  } finally {
    loading.value = false
  }
}

// Check authentication
const checkAuth = () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return false
  }
  return true
}

onMounted(async () => {
  if (!checkAuth()) return
  
  await Promise.all([
    loadStats(),
    loadRecommendedJobs()
  ])
})
</script>