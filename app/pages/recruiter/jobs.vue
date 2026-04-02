<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Manage Jobs</h1>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage and track all your job postings</p>
        </div>
        <NuxtLink
          to="/recruiter/job-create"
          class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Post New Job
        </NuxtLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
    </div>

    <!-- Company Not Found -->
    <div v-else-if="!hasCompany" class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <p class="text-slate-500 dark:text-slate-400 font-medium">No Company Found</p>
      <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">Please create your company profile first to start posting jobs</p>
      <NuxtLink
        to="/recruiter/company-profile"
        class="mt-4 inline-block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
      >
        Create Company Profile
      </NuxtLink>
    </div>

    <!-- Jobs Content -->
    <template v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
          <p class="text-sm text-slate-500 dark:text-slate-400">Total Jobs</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats.total }}</p>
        </div>
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
          <p class="text-sm text-slate-500 dark:text-slate-400">Active</p>
          <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ stats.active }}</p>
        </div>
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
          <p class="text-sm text-slate-500 dark:text-slate-400">Pending</p>
          <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ stats.pending }}</p>
        </div>
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
          <p class="text-sm text-slate-500 dark:text-slate-400">Draft</p>
          <p class="text-2xl font-bold text-slate-500 dark:text-slate-400">{{ stats.draft }}</p>
        </div>
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
          <p class="text-sm text-slate-500 dark:text-slate-400">Closed</p>
          <p class="text-2xl font-bold text-rose-600 dark:text-rose-400">{{ stats.closed }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-6">
        <div class="flex flex-wrap gap-4 items-center justify-between">
          <div class="flex flex-wrap gap-3">
            <select
              v-model="filters.status"
              @change="fetchJobs"
              class="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </select>

            <div class="relative">
              <input
                v-model="filters.search"
                type="text"
                placeholder="Search jobs..."
                class="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white w-64"
                @keyup.enter="fetchJobs"
              />
              <svg class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <button
            @click="fetchJobs"
            class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <!-- Jobs Grid - Card Layout -->
      <div v-if="jobsLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>

      <div v-else-if="jobs.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="job in jobs"
          :key="job.id"
          class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow overflow-hidden"
        >
          <!-- Status Badge -->
          <div class="px-4 pt-4 pb-2 flex justify-between items-start">
            <span 
              class="px-2 py-1 text-xs rounded-full"
              :class="getStatusBadgeClass(job.status)"
            >
              {{ getStatusText(job.status) }}
            </span>
            <div class="flex gap-1">
              <button
                @click="viewApplications(job.id)"
                class="p-1.5 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="View Applications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <NuxtLink
                :to="`/recruiter/job-edit?id=${job.id}`"
                class="p-1.5 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </NuxtLink>
              <button
                @click="deleteJobHandler(job.id)"
                class="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Job Title and Company -->
          <div class="px-4 pb-2">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">
              {{ job.title }}
            </h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">
              {{ companyData?.name || 'Company' }}
            </p>
          </div>

          <!-- Job Details -->
          <div class="px-4 py-2 space-y-2">
            <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="truncate">{{ job.city || 'Remote' }}{{ job.country?.name ? `, ${job.country.name}` : '' }}</span>
            </div>
            
            <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{{ job.workType?.name || 'N/A' }}</span>
            </div>

            <div v-if="job.showSalary && job.payFrom && job.payTo" class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ formatSalary(job.payFrom) }} - {{ formatSalary(job.payTo) }}</span>
            </div>

            <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Published at {{ formatDate(job.createdAt) }}</span>
            </div>

            <div v-if="job.expiresAt" class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Expires at {{ formatDate(job.expiresAt) }}</span>
            </div>

            <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{{ job.jobApplications?.length || 0 }} Applicants</span>
            </div>

            <div v-if="job.updatedAt && job.updatedAt !== job.createdAt" class="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Updated at {{ formatDate(job.updatedAt) }}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <button
              @click="viewApplications(job.id)"
              class="flex-1 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              View Applications ({{ job.jobApplications?.length || 0 }})
            </button>
            
            <button
              v-if="job.status === 'draft'"
              @click="publishJob(job.id)"
              class="px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              Publish
            </button>
            
            <button
              v-if="job.status === 'active'"
              @click="closeJob(job.id)"
              class="px-3 py-1.5 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p class="text-slate-500 dark:text-slate-400 font-medium">No jobs found</p>
        <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">Create your first job posting to get started</p>
        <NuxtLink
          to="/recruiter/job-create"
          class="mt-4 inline-block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          Post New Job
        </NuxtLink>
      </div>

      <!-- Pagination -->
      <div v-if="jobs.length > 0" class="mt-6 flex items-center justify-between">
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Showing {{ (pagination.page - 1) * pagination.pageSize + 1 }} to 
          {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }} of {{ pagination.total }} jobs
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
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useJobs } from '~/composables/useJobs'
import { useAuth } from '~/composables/useAuth'
import { useCompany } from '~/composables/useCompany'

const { user, isAuthenticated } = useAuth()
const router = useRouter()
const { getJobsByCompany, getCompanyJobStats, updateJobStatus, deleteJob } = useJobs()
const { getMyCompany } = useCompany()

// Company state
const hasCompany = ref(false)
const companyData = ref<any>(null)
const companyId = ref<string | null>(null)

// Stats
const stats = ref({
  total: 0,
  active: 0,
  pending: 0,
  draft: 0,
  closed: 0,
  rejected: 0
})

// Jobs data
const jobs = ref<any[]>([])
const jobsLoading = ref(false)

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

// UI states
const loading = ref(true)

// Helper functions
const getStatusBadgeClass = (status: string): string => {
  const classes: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    closed: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
  }
  return classes[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
}

const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    active: 'Active',
    pending: 'Pending',
    draft: 'Draft',
    closed: 'Closed',
    rejected: 'Rejected'
  }
  return texts[status] || status
}

const formatDate = (timestamp: number): string => {
  if (!timestamp) return 'N/A'
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatSalary = (amount: string): string => {
  if (!amount) return 'N/A'
  const num = parseFloat(amount)
  if (isNaN(num)) return amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num)
}

// Check if user has company
const checkCompany = async () => {
  try {
    console.log('🔍 Checking company for user:', user.value?.id)
    const data = await getMyCompany()
    console.log('📦 Company data:', data)
    
    if (data && data.id) {
      hasCompany.value = true
      companyData.value = data
      companyId.value = data.id
      console.log('🏢 Company found:', data.id, data.name)
    } else {
      hasCompany.value = false
      companyData.value = null
      companyId.value = null
      console.log('⚠️ No company found')
    }
  } catch (err) {
    console.error('❌ Error checking company:', err)
    hasCompany.value = false
    companyData.value = null
    companyId.value = null
  }
}

// Fetch jobs
const fetchJobs = async () => {
  console.log('🔍 fetchJobs called - companyId:', companyId.value)
  
  if (!hasCompany.value || !companyId.value) {
    console.log('⚠️ No company ID, skipping fetchJobs')
    return
  }
  
  jobsLoading.value = true
  
  try {
    const response = await getJobsByCompany(companyId.value, {
      page: pagination.page,
      limit: pagination.pageSize,
      status: filters.status || undefined
    })
    
    console.log('📥 Jobs response:', response)
    
    if (response?.jobs) {
      jobs.value = response.jobs
      pagination.total = response.total || 0
      pagination.totalPages = response.totalPages || 0
      console.log('✅ Jobs loaded successfully:', jobs.value.length)
    } else {
      jobs.value = []
      pagination.total = 0
      pagination.totalPages = 0
    }
    
    // Filter by search locally if needed
    if (filters.search && jobs.value.length > 0) {
      jobs.value = jobs.value.filter(job => 
        job.title?.toLowerCase().includes(filters.search.toLowerCase())
      )
    }
  } catch (err) {
    console.error('❌ Error fetching jobs:', err)
    jobs.value = []
  } finally {
    jobsLoading.value = false
  }
}

// Fetch stats
const fetchStats = async () => {
  if (!hasCompany.value || !companyId.value) return
  
  try {
    const statsData = await getCompanyJobStats(companyId.value)
    stats.value = {
      total: statsData?.total || 0,
      active: statsData?.active || 0,
      pending: statsData?.pending || 0,
      draft: statsData?.draft || 0,
      closed: statsData?.closed || 0,
      rejected: statsData?.rejected || 0
    }
  } catch (err) {
    console.error('❌ Error fetching stats:', err)
  }
}

// Change page
const changePage = (page: number) => {
  if (page < 1 || page > pagination.totalPages) return
  pagination.page = page
  fetchJobs()
}

// View applications
const viewApplications = (jobId: string) => {
  router.push(`/recruiter/applications?jobId=${jobId}`)
}

// Publish job
const publishJob = async (jobId: string) => {
  if (!confirm('Are you sure you want to publish this job? It will be submitted for review.')) return
  
  try {
    await updateJobStatus(jobId, 'pending')
    alert('Job submitted for review successfully!')
    fetchJobs()
    fetchStats()
  } catch (err) {
    console.error('Error publishing job:', err)
    alert('Failed to publish job')
  }
}

// Close job
const closeJob = async (jobId: string) => {
  if (!confirm('Are you sure you want to close this job? It will no longer accept applications.')) return
  
  try {
    await updateJobStatus(jobId, 'closed')
    alert('Job closed successfully!')
    fetchJobs()
    fetchStats()
  } catch (err) {
    console.error('Error closing job:', err)
    alert('Failed to close job')
  }
}

// Delete job
const deleteJobHandler = async (jobId: string) => {
  if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) return
  
  try {
    await deleteJob(jobId)
    alert('Job deleted successfully!')
    fetchJobs()
    fetchStats()
  } catch (err) {
    console.error('Error deleting job:', err)
    alert('Failed to delete job')
  }
}

// Check authentication and load data
onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push('/auth/login')
    return
  }
  
  if (user.value?.role !== 'RECRUITER' && user.value?.role !== 'ADMIN') {
    router.push('/')
    return
  }
  
  loading.value = true
  await checkCompany()
  await new Promise(resolve => setTimeout(resolve, 500))
  
  if (hasCompany.value && companyId.value) {
    await Promise.all([fetchStats(), fetchJobs()])
  }
  
  loading.value = false
})
</script>