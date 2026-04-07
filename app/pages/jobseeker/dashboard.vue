<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
    <div class="container mx-auto px-4 py-6 max-w-7xl">
      <!-- Welcome Section -->
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-slate-800 dark:text-white">Welcome back, {{ userFullName }}!</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Track your job applications and discover new opportunities</p>
      </div>

      <!-- Stats Cards - Green Theme -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div class="flex items-center justify-between mb-2">
            <div class="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ stats.total }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Applications</p>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div class="flex items-center justify-between mb-2">
            <div class="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ stats.inReview }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">In Review</p>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div class="flex items-center justify-between mb-2">
            <div class="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ stats.accepted }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Accepted</p>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div class="flex items-center justify-between mb-2">
            <div class="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-rose-500 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ stats.rejected }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Rejected</p>
        </div>
      </div>

      <!-- Recommended Jobs & Quick Actions -->
      <div class="flex flex-col lg:flex-row gap-5">
        <!-- Recommended Jobs Section -->
        <div class="lg:w-3/5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-base font-semibold text-slate-800 dark:text-white">Recommended for You</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Jobs that match your profile</p>
              </div>
              <NuxtLink 
                to="/jobs" 
                class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                View All →
              </NuxtLink>
            </div>
          </div>
          
          <div v-if="recommendedJobs.length > 0" class="divide-y divide-slate-100 dark:divide-slate-700">
            <div v-for="job in recommendedJobs.slice(0, 3)" :key="job.id" class="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1">
                  <h3 class="text-sm font-semibold text-slate-800 dark:text-white mb-1">
                    {{ job.title }}
                  </h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {{ job.company?.name || 'Company' }}
                  </p>
                  
                  <div class="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span class="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {{ job.city || 'Remote' }}
                    </span>
                    <span class="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {{ job.workType?.name || 'Full Time' }}
                    </span>
                    <span v-if="job.showSalary && job.payFrom" class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ formatSalary(job.payFrom) }}
                    </span>
                  </div>
                </div>
                <NuxtLink 
                  :to="`/jobs/${job.id}`" 
                  class="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors whitespace-nowrap"
                >
                  View
                </NuxtLink>
              </div>
            </div>
          </div>
          
          <div v-else class="p-8 text-center">
            <div class="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-400">No recommendations yet</p>
            <NuxtLink 
              to="/jobs" 
              class="mt-3 inline-block px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              Browse Jobs
            </NuxtLink>
          </div>
        </div>

        <!-- Quick Actions Section -->
        <div class="lg:w-2/5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <h2 class="text-base font-semibold text-slate-800 dark:text-white">Quick Actions</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage your activities</p>
          </div>
          
          <div class="divide-y divide-slate-100 dark:divide-slate-700">
            <NuxtLink 
              to="/jobseeker/profile" 
              class="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
            >
              <div class="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300">Edit Profile</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Update your information</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
            
            <NuxtLink 
              to="/jobs" 
              class="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
            >
              <div class="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300">Browse Jobs</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Find opportunities</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
            
            <NuxtLink 
              to="/jobseeker/applications" 
              class="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
            >
              <div class="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300">My Applications</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Track your status</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
            
            <NuxtLink 
              to="/jobseeker/saved-jobs" 
              class="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
            >
              <div class="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300">Saved Jobs</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Bookmarked positions</p>
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
import { useApplications } from '~/composables/useApplications'

const router = useRouter()
const { user, isAuthenticated } = useAuth()
const { listJobs } = useJobs()
const { getMyApplications, getApplicationStats } = useApplications()

// User info
const userFullName = computed(() => {
  if (!user.value) return 'Job Seeker'
  return user.value.name || user.value.username || user.value.email?.split('@')[0] || 'Job Seeker'
})

// Stats
const stats = ref({
  total: 0,
  inReview: 0,
  accepted: 0,
  rejected: 0
})

// Recommended jobs - hanya 3 data
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

// Load stats dari API
const loadStats = async () => {
  try {
    const statsData = await getApplicationStats()
    
    stats.value = {
      total: statsData.total || 0,
      inReview: statsData.inReview || 0,
      accepted: statsData.accepted || 0,
      rejected: statsData.rejected || 0
    }
  } catch (error) {
    console.error('Error loading stats:', error)
    
    // Fallback
    try {
      const response = await getMyApplications({ page: 1, pageSize: 100 })
      const applications = response.data || []
      
      const total = applications.length
      const inReview = applications.filter(app => 
        app.status === 'pending' || app.status === 'reviewed' || 
        app.status === 'shortlisted' || app.status === 'interviewed'
      ).length
      const accepted = applications.filter(app => 
        app.status === 'offered' || app.status === 'hired'
      ).length
      const rejected = applications.filter(app => 
        app.status === 'rejected' || app.status === 'withdrawn'
      ).length
      
      stats.value = { total, inReview, accepted, rejected }
    } catch (fallbackError) {
      console.error('Error in fallback stats:', fallbackError)
      stats.value = { total: 0, inReview: 0, accepted: 0, rejected: 0 }
    }
  }
}

// Load recommended jobs - hanya 3
const loadRecommendedJobs = async () => {
  try {
    const response = await listJobs({
      page: 1,
      limit: 5,
      status: 'active'
    })
    recommendedJobs.value = (response.jobs || []).slice(0, 3)
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
  
  loading.value = true
  await Promise.all([
    loadStats(),
    loadRecommendedJobs()
  ])
  loading.value = false
})
</script>