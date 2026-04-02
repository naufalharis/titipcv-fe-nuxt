<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Recruiter Dashboard</h1>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Welcome back, {{ user?.email || 'Recruiter' }}!</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-rose-600 dark:text-rose-400">{{ error }}</p>
      <button 
        @click="fetchDashboardData" 
        class="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg transition-colors"
      >
        Retry
      </button>
    </div>

    <!-- Dashboard Content -->
    <template v-else>
      <!-- Recruiter Name -->
      <div class="mb-6">
        <h2 class="text-xl font-semibold text-slate-800 dark:text-slate-200">{{ recruiterName }}</h2>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Active Jobs Card -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-slate-500 dark:text-slate-400">Active Jobs</h3>
            <div class="p-2 bg-primary-100 dark:bg-primary-900/40 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats.activeJobs }} / {{ stats.totalJobs }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ ((stats.activeJobs / stats.totalJobs) * 100).toFixed(1) || 0 }}% of total jobs</p>
        </div>

        <!-- Total Applicants Card -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-slate-500 dark:text-slate-400">Total Applicants</h3>
            <div class="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats.totalApplicants }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Total applicants across all jobs</p>
        </div>

        <!-- Processing Applications Card -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-slate-500 dark:text-slate-400">Processing Applications</h3>
            <div class="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats.processingApplications }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Awaiting review</p>
        </div>

        <!-- Accepted/Rejected Card -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-slate-500 dark:text-slate-400">Accepted / Rejected</h3>
            <div class="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats.acceptedApplications }} / {{ stats.rejectedApplications }}</p>
          <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
            <div 
              class="bg-emerald-500 h-1.5 rounded-full" 
              :style="{ width: `${(stats.acceptedApplications / (stats.acceptedApplications + stats.rejectedApplications || 1)) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Recent Applications Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Recent Applications</h3>
          <NuxtLink to="/recruiter/applications" class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1">
            View All
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
        
        <div v-if="recentApplications.length" class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead class="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Applicant</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Job Position</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Applied Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr v-for="(application, index) in recentApplications" :key="index" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/40 rounded-full flex items-center justify-center">
                      <span class="text-primary-600 dark:text-primary-400 font-medium text-sm">
                        {{ application.applicantName.charAt(0) }}
                      </span>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-slate-900 dark:text-white">{{ application.applicantName }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">{{ application.applicantEmail }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <p class="text-sm text-slate-900 dark:text-white">{{ application.jobTitle }}</p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <p class="text-sm text-slate-500 dark:text-slate-400">{{ application.appliedDate }}</p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 py-1 text-xs rounded-full"
                    :class="getStatusColorClass(application.status)"
                  >
                    {{ getStatusLabel(application.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    @click="viewApplication(application.id)"
                    class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-slate-500 dark:text-slate-400 font-medium">No recent applications</p>
          <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">Applications will appear here when candidates apply to your jobs.</p>
        </div>
      </div>

      <!-- Quick Actions Section -->
      <div>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <!-- Company Profile -->
          <NuxtLink 
            to="/recruiter/company-profile" 
            class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 text-center hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all group"
          >
            <div class="w-12 h-12 mx-auto bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Company Profile</span>
          </NuxtLink>

          <!-- Post New Job -->
          <NuxtLink 
            to="/recruiter/job-create" 
            class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 text-center hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all group"
          >
            <div class="w-12 h-12 mx-auto bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Post New Job</span>
          </NuxtLink>

          <!-- Manage Jobs -->
          <NuxtLink 
            to="/recruiter/jobs"
            class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 text-center hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all group"
          >
            <div class="w-12 h-12 mx-auto bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Manage Jobs</span>
          </NuxtLink>

          <!-- Applications -->
          <NuxtLink 
            to="/recruiter/applications" 
            class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 text-center hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all group"
          >
            <div class="w-12 h-12 mx-auto bg-rose-100 dark:bg-rose-900/40 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Applications</span>
          </NuxtLink>

          <!-- Shared Candidate Profiles -->
          <NuxtLink 
            to="/recruiter/shared-profiles" 
            class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 text-center hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all group"
          >
            <div class="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Shared Profiles</span>
          </NuxtLink>

          <!-- Inbox -->
          <NuxtLink 
            to="/recruiter/inbox" 
            class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 text-center hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all group relative"
          >
            <div class="w-12 h-12 mx-auto bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span v-if="unreadMessages > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {{ unreadMessages }}
              </span>
            </div>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Inbox</span>
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useJobs, type JobStats } from '~/composables/useJobs'
import { useApplications, type CompanyStats, type AcceptedRejectedStats, type ProcessingStats } from '~/composables/useApplications'

const { user, logout: authLogout } = useAuth()
const router = useRouter()
const { getJobStats, getJobsByCompany } = useJobs()
const { 
  getCompanyStats, 
  getCompanyAcceptedRejectedStats, 
  getCompanyProcessingStats,
  getAllApplications,
  getStatusColor,
  getStatusLabel 
} = useApplications()

// Check authentication and role on mount
onMounted(() => {
  if (!user.value) {
    router.push('/auth/login')
    return
  }
  
  if (user.value?.role !== 'RECRUITER' && user.value?.role !== 'ADMIN') {
    router.push('/')
  }
})

// Watch for user changes
watch(() => user.value, (newUser) => {
  if (!newUser) {
    router.push('/auth/login')
  } else if (newUser?.role !== 'RECRUITER' && newUser?.role !== 'ADMIN') {
    router.push('/')
  }
}, { immediate: true })

// Logout function
const logout = async () => {
  await authLogout()
  router.push('/auth/login')
}

// Recruiter info
const recruiterName = ref<string>('Nopalrecruiter')

// Stats data
const stats = ref({
  activeJobs: 0,
  totalJobs: 0,
  totalApplicants: 0,
  processingApplications: 0,
  acceptedApplications: 0,
  rejectedApplications: 0
})

// Recent applications
const recentApplications = ref<any[]>([])

// Unread messages count
const unreadMessages = ref<number>(0)

// UI states
const loading = ref<boolean>(true)
const error = ref<string | null>(null)

// Helper untuk mendapatkan class warna status
const getStatusColorClass = (status: string): string => {
  return getStatusColor(status)
}

// View application detail
const viewApplication = (id: string) => {
  router.push(`/recruiter/applications/${id}`)
}

// Fetch job stats
const fetchJobStats = async (): Promise<void> => {
  try {
    const jobStats: JobStats = await getJobStats()
    
    let activeJobs = jobStats.active || 0
    let totalJobs = jobStats.total || 0
    
    if (user.value?.companyId) {
      try {
        const companyJobs = await getJobsByCompany(user.value.companyId, { limit: 1 })
        totalJobs = companyJobs.total || 0
      } catch (err) {
        console.error('Error fetching company jobs:', err)
      }
    }
    
    stats.value = {
      ...stats.value,
      activeJobs,
      totalJobs
    }
    
  } catch (err) {
    console.error('Error fetching job stats:', err)
  }
}

// Fetch application stats
const fetchApplicationStats = async (): Promise<void> => {
  try {
    if (!user.value?.companyId) {
      console.warn('No companyId found for user')
      return
    }
    
    const companyStats: CompanyStats = await getCompanyStats(user.value.companyId)
    const acceptedRejectedStats: AcceptedRejectedStats = await getCompanyAcceptedRejectedStats(user.value.companyId)
    const processingStats: ProcessingStats = await getCompanyProcessingStats(user.value.companyId)
    
    const totalProcessing = 
      (processingStats.pending || 0) + 
      (processingStats.reviewed || 0) + 
      (processingStats.shortlisted || 0) + 
      (processingStats.interviewed || 0)
    
    stats.value = {
      ...stats.value,
      totalApplicants: companyStats.totalApplications || 0,
      processingApplications: totalProcessing,
      acceptedApplications: acceptedRejectedStats.accepted || 0,
      rejectedApplications: acceptedRejectedStats.rejected || 0
    }
    
  } catch (err) {
    console.error('Error fetching application stats:', err)
  }
}

// Fetch recent applications
const fetchRecentApplications = async (): Promise<void> => {
  try {
    const response = await getAllApplications({ 
      page: 1, 
      pageSize: 5 
    })
    
    if (response?.data && response.data.length > 0) {
      const companyApplications = response.data.filter((app: any) => 
        app.job?.companyId === user.value?.companyId
      )
      
      recentApplications.value = companyApplications.slice(0, 5).map((app: any) => ({
        id: app.id,
        applicantName: app.user?.name || 'Unknown',
        applicantEmail: app.user?.email || 'unknown@email.com',
        jobTitle: app.job?.title || 'Unknown Position',
        appliedDate: formatTimeAgo(app.createdAt),
        status: app.status || 'pending'
      }))
    } else {
      recentApplications.value = []
    }
    
  } catch (err) {
    console.error('Error fetching recent applications:', err)
    recentApplications.value = []
  }
}

// Fetch unread messages count
const fetchUnreadMessages = async (): Promise<void> => {
  try {
    unreadMessages.value = 3
  } catch (err) {
    console.error('Error fetching unread messages:', err)
    unreadMessages.value = 0
  }
}

// Format time ago
const formatTimeAgo = (timestamp: number): string => {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp
  
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
  return new Date(timestamp * 1000).toLocaleDateString()
}

// Fetch all dashboard data
const fetchDashboardData = async (): Promise<void> => {
  loading.value = true
  error.value = null
  
  try {
    await Promise.all([
      fetchJobStats(),
      fetchApplicationStats(),
      fetchRecentApplications(),
      fetchUnreadMessages()
    ])
    
  } catch (err: any) {
    console.error('Error fetching dashboard data:', err)
    error.value = err?.message || 'Failed to load dashboard data'
  } finally {
    loading.value = false
  }
}

// Initial fetch
onMounted(() => {
  if (user.value) {
    fetchDashboardData()
  }
})

// Watch for auth changes
watch(() => user.value, (newUser) => {
  if (newUser) {
    fetchDashboardData()
  } else {
    error.value = 'Please login to view dashboard'
    loading.value = false
  }
})
</script>