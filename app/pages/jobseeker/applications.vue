<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950">
    <div class="container mx-auto px-4 py-8 max-w-7xl">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">My Applications</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Track and manage all your job applications</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
          <p class="text-sm text-slate-500 dark:text-slate-400">Total Applications</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats.total }}</p>
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

      <!-- Filters -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-6">
        <div class="flex flex-wrap gap-4 items-center justify-between">
          <div class="flex flex-wrap gap-3">
            <select
              v-model="filters.status"
              @change="fetchApplications"
              class="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interviewed">Interviewed</option>
              <option value="offered">Offered</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>

            <div class="relative">
              <input
                v-model="filters.search"
                type="text"
                placeholder="Search by job title or company..."
                class="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white w-64"
                @keyup.enter="fetchApplications"
              />
              <svg class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <button
            @click="fetchApplications"
            class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>

      <!-- Applications List -->
      <div v-else-if="applications.length > 0" class="space-y-4">
        <div
          v-for="application in applications"
          :key="application.id"
          class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow overflow-hidden"
        >
          <div class="p-6">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                  {{ application.job?.title || 'Job not found' }}
                </h3>
                <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {{ application.job?.company?.name || 'Company' }}
                </p>
                
                <div class="flex flex-wrap gap-4 mt-2 text-xs text-slate-500 dark:text-slate-500">
                  <span class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {{ application.job?.city || 'Remote' }}
                  </span>
                  <span class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {{ application.job?.workType?.name || 'Full Time' }}
                  </span>
                </div>
              </div>
              
              <div class="flex flex-col items-end gap-2">
                <span 
                  class="px-3 py-1 text-xs rounded-full"
                  :class="getStatusBadgeClass(application.status)"
                >
                  {{ getStatusText(application.status) }}
                </span>
                <p class="text-xs text-slate-400 dark:text-slate-500">
                  Applied {{ formatRelativeTime(application.createdAt) }}
                </p>
              </div>
            </div>

            <div v-if="application.coverLetter" class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cover Letter</p>
              <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                {{ application.coverLetter }}
              </p>
            </div>

            <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
              <button
                @click="viewApplicationDetail(application.id)"
                class="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                View Details
              </button>
              <button
                v-if="application.status === 'pending' || application.status === 'reviewed'"
                @click="withdrawApplication(application.id)"
                class="px-4 py-2 text-sm border border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between mt-6">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Showing {{ (pagination.page - 1) * pagination.pageSize + 1 }} to 
            {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }} of {{ pagination.total }} applications
          </p>
          <div class="flex gap-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page === 1"
              class="px-3 py-1 border border-slate-300 dark:border-slate-700 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Previous
            </button>
            <span class="px-3 py-1 text-sm text-slate-700 dark:text-slate-300">
              Page {{ pagination.page }} of {{ pagination.totalPages }}
            </span>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page === pagination.totalPages"
              class="px-3 py-1 border border-slate-300 dark:border-slate-700 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-slate-500 dark:text-slate-400 font-medium">No applications found</p>
        <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">Start applying to jobs to see your applications here</p>
        <NuxtLink
          to="/jobs"
          class="mt-4 inline-block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          Browse Jobs
        </NuxtLink>
      </div>
    </div>

    <!-- Application Detail Modal -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Application Details</h2>
          <button @click="showDetailModal = false" class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div v-if="selectedApplication" class="p-6 space-y-4">
          <div>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">{{ selectedApplication.job?.title }}</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">{{ selectedApplication.job?.company?.name }}</p>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Status:</span>
            <span class="px-2 py-1 text-xs rounded-full" :class="getStatusBadgeClass(selectedApplication.status)">
              {{ getStatusText(selectedApplication.status) }}
            </span>
          </div>

          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Applied on {{ formatDate(selectedApplication.createdAt) }}
            </p>
          </div>

          <div v-if="selectedApplication.coverLetter">
            <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cover Letter</p>
            <p class="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{{ selectedApplication.coverLetter }}</p>
          </div>

          <div v-if="screeningAnswers.length > 0">
            <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Screening Questions</p>
            <div class="space-y-3">
              <div v-for="answer in screeningAnswers" :key="answer.id" class="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <p class="text-sm font-medium text-slate-900 dark:text-white">{{ answer.question?.question || 'Question' }}</p>
                <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">{{ answer.answer }}</p>
              </div>
            </div>
          </div>

          <div v-if="screeningScore.totalAnswers > 0" class="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
            <p class="text-sm font-medium text-slate-700 dark:text-slate-300">Screening Score</p>
            <div class="flex items-center gap-2 mt-1">
              <div class="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  class="bg-primary-600 h-2 rounded-full transition-all"
                  :style="{ width: `${((screeningScore.scoredAnswers / screeningScore.totalAnswers) * 100)}%` }"
                ></div>
              </div>
              <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {{ screeningScore.scoredAnswers }}/{{ screeningScore.totalAnswers }}
              </span>
            </div>
            <p v-if="screeningScore.averageScore" class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Average Score: {{ (screeningScore.averageScore * 100).toFixed(0) }}%
            </p>
          </div>

          <div class="flex gap-3 pt-4">
            <NuxtLink
              :to="`/jobs/${selectedApplication.jobId}`"
              class="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              View Job
            </NuxtLink>
            <button
              v-if="selectedApplication.status === 'pending' || selectedApplication.status === 'reviewed'"
              @click="withdrawApplication(selectedApplication.id)"
              class="px-4 py-2 text-sm border border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
            >
              Withdraw Application
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useApplications, type JobApplication, type ApplicationStats, type ScreeningAnswer } from '~/composables/useApplications'

const router = useRouter()
const { user, isAuthenticated } = useAuth()
const { getMyApplications, getApplicationStats, getApplicationById, getScreeningAnswers, getScreeningScore, updateApplicationStatus } = useApplications()

// State
const applications = ref<JobApplication[]>([])
const loading = ref(true)
const error = ref('')
const showDetailModal = ref(false)
const selectedApplication = ref<JobApplication | null>(null)
const screeningAnswers = ref<ScreeningAnswer[]>([])
const screeningScore = ref<{ totalAnswers: number; scoredAnswers: number; averageScore?: number }>({ totalAnswers: 0, scoredAnswers: 0 })

// Stats
const stats = ref<ApplicationStats>({
  total: 0,
  inReview: 0,
  accepted: 0,
  rejected: 0
})

// Filters
const filters = reactive({
  status: '',
  search: ''
})

// Pagination
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
})

// Helper functions
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
    pending: 'Pending Review',
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

const formatDate = (timestamp: number): string => {
  if (!timestamp) return 'N/A'
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatRelativeTime = (timestamp: number): string => {
  if (!timestamp) return 'N/A'
  const now = Date.now() / 1000
  const diff = now - timestamp
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
  return formatDate(timestamp)
}

// Fetch applications
const fetchApplications = async () => {
  loading.value = true
  try {
    const response = await getMyApplications({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: filters.status || undefined
    })
    
    applications.value = response.data || []
    pagination.total = response.pagination?.total || 0
    pagination.totalPages = response.pagination?.totalPages || 0
    
    if (filters.search && applications.value.length > 0) {
      const searchTerm = filters.search.toLowerCase()
      applications.value = applications.value.filter(app => 
        app.job?.title?.toLowerCase().includes(searchTerm) ||
        app.job?.company?.name?.toLowerCase().includes(searchTerm)
      )
    }
  } catch (err) {
    console.error('Error fetching applications:', err)
    error.value = 'Failed to load applications'
  } finally {
    loading.value = false
  }
}

// Fetch stats
const fetchStats = async () => {
  try {
    stats.value = await getApplicationStats()
  } catch (err) {
    console.error('Error fetching stats:', err)
  }
}

// View application detail
const viewApplicationDetail = async (id: string) => {
  try {
    const application = await getApplicationById(id)
    selectedApplication.value = application
    
    const answers = await getScreeningAnswers(id)
    screeningAnswers.value = answers
    
    const score = await getScreeningScore(id)
    screeningScore.value = score
    
    showDetailModal.value = true
  } catch (err) {
    console.error('Error fetching application detail:', err)
    alert('Failed to load application details')
  }
}

// Withdraw application
const withdrawApplication = async (id: string) => {
  if (!confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) return
  
  try {
    await updateApplicationStatus(id, 'withdrawn')
    alert('Application withdrawn successfully')
    showDetailModal.value = false
    selectedApplication.value = null
    await fetchApplications()
    await fetchStats()
  } catch (err) {
    console.error('Error withdrawing application:', err)
    alert('Failed to withdraw application')
  }
}

// Change page
const changePage = (page: number) => {
  if (page < 1 || page > pagination.totalPages) return
  pagination.page = page
  fetchApplications()
}

// Check authentication
const checkAuth = () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return false
  }
  if (user.value?.role !== 'JOBSEEKER') {
    router.push('/')
    return false
  }
  return true
}

onMounted(async () => {
  if (!checkAuth()) return
  
  await Promise.all([
    fetchApplications(),
    fetchStats()
  ])
})
</script>