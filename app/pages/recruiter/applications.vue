<template>
  <div>
    <div class="container mx-auto px-4 py-8 max-w-7xl">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Applications</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage and review job applications from candidates</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-4 mb-8">
        <div 
          v-for="stat in statusStats" 
          :key="stat.status"
          @click="filterByStatus(stat.status)"
          class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-all"
          :class="{ 'ring-2 ring-primary-500 border-primary-500': filters.status === stat.status }"
        >
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ stat.label }}</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stat.count }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-6">
        <div class="flex flex-wrap gap-4 items-center justify-between">
          <div class="flex flex-wrap gap-3">

            <div class="relative">
              <input
                v-model="filters.search"
                type="text"
                placeholder="Search by candidate name..."
                class="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white w-64"
                @keyup.enter="fetchApplications"
              />
              <svg class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button
              @click="showFilterModal = true"
              class="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filter
            </button>
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

      <!-- Applications Grid -->
      <div v-else-if="applications.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          v-for="application in applications"
          :key="application.id"
          class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow overflow-hidden"
        >
          <!-- Status Badge -->
          <div class="px-4 pt-4 pb-2 flex justify-between items-start">
            <span 
              class="px-2 py-1 text-xs rounded-full"
              :class="getStatusBadgeClass(application.status)"
            >
              {{ getStatusText(application.status) }}
            </span>
            <p class="text-xs text-slate-400 dark:text-slate-500">
              Applied {{ formatRelativeTime(application.createdAt) }}
            </p>
          </div>

          <!-- Candidate Info -->
          <div class="px-4 pb-2">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full flex items-center justify-center">
                  <span class="text-primary-600 dark:text-primary-400 font-semibold text-lg">
                    {{ getInitials(application.userId) }}
                  </span>
                </div>
              </div>
              
              <div class="flex-1">
                <h3 class="text-base font-semibold text-slate-900 dark:text-white">
                  {{ getUserFullName(application.userId) }}
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {{ getUserHeadline(application.userId) }}
                </p>
                <div class="flex flex-wrap gap-3 mt-2 text-xs text-slate-500 dark:text-slate-500">
                  <span class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {{ getUserLocation(application.userId) }}
                  </span>
                  <span class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {{ getUserGender(application.userId) }}
                  </span>
                  <span v-if="getUserExperience(application.userId)" class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {{ getUserExperience(application.userId) }} years
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Job Info -->
          <div class="mx-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg mb-3">
            <p class="text-xs text-slate-500 dark:text-slate-400">Applied for</p>
            <p class="text-sm font-medium text-slate-900 dark:text-white">{{ application.job?.title }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ application.job?.city }} • {{ application.job?.workType?.name }}</p>
          </div>

          <!-- Cover Letter Preview -->
          <div v-if="application.coverLetter" class="mx-4 mb-3">
            <p class="text-xs text-slate-500 dark:text-slate-400">Cover Letter</p>
            <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{{ application.coverLetter }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <button
              @click="viewApplicationDetail(application)"
              class="flex-1 px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              View Profile
            </button>
            <button
              @click="openMessageModal(application)"
              class="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
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
        <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">Applications will appear here when candidates apply to your jobs</p>
      </div>

      <!-- Pagination -->
      <div v-if="applications.length > 0" class="mt-6 flex items-center justify-between">
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
          <!-- Candidate Header -->
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full flex items-center justify-center">
              <span class="text-primary-600 dark:text-primary-400 font-semibold text-xl">
                {{ getInitials(selectedApplication.userId) }}
              </span>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ getUserFullName(selectedApplication.userId) }}</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">{{ getUserHeadline(selectedApplication.userId) }}</p>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Email</p>
              <p class="text-sm text-slate-900 dark:text-white">{{ getUserEmail(selectedApplication.userId) }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Location</p>
              <p class="text-sm text-slate-900 dark:text-white">{{ getUserLocation(selectedApplication.userId) }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Experience</p>
              <p class="text-sm text-slate-900 dark:text-white">{{ getUserExperience(selectedApplication.userId) || 0 }} years</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Gender</p>
              <p class="text-sm text-slate-900 dark:text-white">{{ getUserGender(selectedApplication.userId) }}</p>
            </div>
          </div>

          <!-- Job Info -->
          <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p class="text-xs text-slate-500 dark:text-slate-400">Applied for</p>
            <p class="text-sm font-medium text-slate-900 dark:text-white">{{ selectedApplication.job?.title }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Applied on {{ formatDate(selectedApplication.createdAt) }}</p>
          </div>

          <!-- Cover Letter -->
          <div v-if="selectedApplication.coverLetter">
            <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cover Letter</p>
            <p class="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{{ selectedApplication.coverLetter }}</p>
          </div>

          <!-- Status Update -->
          <div class="border-t border-slate-200 dark:border-slate-800 pt-4">
            <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Update Status</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="status in statusOptions"
                :key="status.value"
                @click="updateApplicationStatusHandler(selectedApplication.id, status.value)"
                class="px-3 py-1.5 text-xs rounded-lg transition-colors"
                :class="selectedApplication.status === status.value 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'"
              >
                {{ status.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Modal -->
    <div v-if="showFilterModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Filter Applications</h2>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
            <select v-model="tempFilters.status" class="w-full px-3 py-2 border rounded-lg">
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
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date Range</label>
            <div class="grid grid-cols-2 gap-2">
              <input v-model="tempFilters.dateFrom" type="date" class="px-3 py-2 border rounded-lg" placeholder="From" />
              <input v-model="tempFilters.dateTo" type="date" class="px-3 py-2 border rounded-lg" placeholder="To" />
            </div>
          </div>
        </div>
        <div class="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button @click="showFilterModal = false" class="px-4 py-2 border rounded-lg">Cancel</button>
          <button @click="applyFilters" class="px-4 py-2 bg-primary-600 text-white rounded-lg">Apply</button>
        </div>
      </div>
    </div>

    <!-- Message Modal -->
    <div v-if="showMessageModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Send Message</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Send a message to {{ messageCandidateName }}</p>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
            <input v-model="messageSubject" type="text" class="w-full px-3 py-2 border rounded-lg" placeholder="Interview Invitation" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
            <textarea v-model="messageContent" rows="5" class="w-full px-3 py-2 border rounded-lg" placeholder="Write your message here..."></textarea>
          </div>
        </div>
        <div class="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button @click="showMessageModal = false" class="px-4 py-2 border rounded-lg">Cancel</button>
          <button @click="sendMessage" :disabled="sending" class="px-4 py-2 bg-primary-600 text-white rounded-lg">Send Message</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useApplications, type JobApplication } from '~/composables/useApplications'
import { useJobs } from '~/composables/useJobs'
import { useUserProfile } from '~/composables/useUserProfile'
import { useUsers } from '~/composables/useUsers'

const router = useRouter()
const { user, isAuthenticated } = useAuth()
const { getAllApplications, updateApplicationStatus } = useApplications()
const { getJobsByCompany } = useJobs()
const { getUserProfile } = useUserProfile()
const { getUserById } = useUsers()

// State
const applications = ref<JobApplication[]>([])
const jobs = ref<any[]>([])
const loading = ref(true)
const sending = ref(false)
const showDetailModal = ref(false)
const showFilterModal = ref(false)
const showMessageModal = ref(false)
const selectedApplication = ref<JobApplication | null>(null)
const messageCandidateName = ref('')
const messageSubject = ref('')
const messageContent = ref('')
const userProfilesCache = ref<Record<string, any>>({})
const userCache = ref<Record<string, any>>({})

// Filters
const filters = reactive({
  jobId: '',
  status: '',
  search: ''
})

const tempFilters = reactive({
  status: '',
  dateFrom: '',
  dateTo: ''
})

// Pagination
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
})

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

// Status stats
const statusStats = computed(() => {
  const counts: Record<string, number> = {}
  applications.value.forEach((app: JobApplication) => {
    counts[app.status] = (counts[app.status] || 0) + 1
  })
  
  return [
    { status: '', label: 'All', count: applications.value.length },
    { status: 'pending', label: 'Pending', count: counts.pending || 0 },
    { status: 'reviewed', label: 'Reviewed', count: counts.reviewed || 0 },
    { status: 'shortlisted', label: 'Shortlisted', count: counts.shortlisted || 0 },
    { status: 'interviewed', label: 'Interviewed', count: counts.interviewed || 0 },
    { status: 'offered', label: 'Offered', count: counts.offered || 0 },
    { status: 'hired', label: 'Hired', count: counts.hired || 0 },
    { status: 'rejected', label: 'Rejected', count: counts.rejected || 0 }
  ]
})

// Helper functions
const getInitials = (userId?: string): string => {
  if (!userId) return '?'
  const user = userCache.value[userId]
  if (!user) return '?'
  const name = user.name || user.username || user.email?.split('@')[0] || ''
  if (!name) return '?'
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
}

const getUserFullName = (userId?: string): string => {
  if (!userId) return 'Unknown Candidate'
  const user = userCache.value[userId]
  if (!user) return 'Unknown Candidate'
  return user.name || user.username || user.email?.split('@')[0] || 'Unknown'
}

const getUserHeadline = (userId?: string): string => {
  if (!userId) return 'No summary'
  const profile = userProfilesCache.value[userId]
  if (!profile) return 'No summary'
  return profile.summary || 'No summary'
}

const getUserLocation = (userId?: string): string => {
  if (!userId) return 'Location not specified'
  const profile = userProfilesCache.value[userId]
  if (!profile) return 'Location not specified'
  const parts = [profile.city, profile.province].filter(p => p)
  return parts.length > 0 ? parts.join(', ') : 'Location not specified'
}

const getUserGender = (userId?: string): string => {
  if (!userId) return 'Not specified'
  const profile = userProfilesCache.value[userId]
  if (!profile?.gender) return 'Not specified'
  const genderMap: Record<string, string> = { 'M': 'Male', 'F': 'Female' }
  return genderMap[profile.gender] || profile.gender
}

const getUserExperience = (userId?: string): number | null => {
  if (!userId) return null
  const profile = userProfilesCache.value[userId]
  return profile?.experience || null
}

const getUserEmail = (userId?: string): string => {
  if (!userId) return '-'
  const user = userCache.value[userId]
  return user?.email || '-'
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

// Load user profile
const loadUserProfile = async (userId: string) => {
  if (userProfilesCache.value[userId]) return userProfilesCache.value[userId]
  
  try {
    const profile = await getUserProfile(userId)
    userProfilesCache.value[userId] = profile
    return profile
  } catch (err) {
    console.error(`Error loading profile for user ${userId}:`, err)
    return null
  }
}

// Load user data
const loadUserData = async (userId: string) => {
  if (userCache.value[userId]) return userCache.value[userId]
  
  try {
    const userData = await getUserById(userId)
    userCache.value[userId] = userData
    return userData
  } catch (err) {
    console.error(`Error loading user ${userId}:`, err)
    return null
  }
}

// Load all user profiles for applications
const loadUserProfiles = async (apps: JobApplication[]) => {
  const userIds = [...new Set(apps.map((app: JobApplication) => app.userId))]
  await Promise.all(userIds.map((id: string) => Promise.all([loadUserProfile(id), loadUserData(id)])))
}

// Filter by status
const filterByStatus = (status: string) => {
  filters.status = status
  pagination.page = 1
  fetchApplications()
}

// Fetch jobs
const fetchJobs = async () => {
  if (!user.value?.companyId) return
  try {
    const response = await getJobsByCompany(user.value.companyId, { limit: 100 })
    jobs.value = response.jobs || []
  } catch (err) {
    console.error('Error fetching jobs:', err)
  }
}

// Fetch applications - FIXED: handle response structure
const fetchApplications = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    if (filters.jobId) params.jobId = filters.jobId
    if (filters.status) params.status = filters.status
    
    const response = await getAllApplications(params)

    console.log('API Response:', response)

    let apps: JobApplication[] = []
    let total = 0
    let totalPages = 0

    // Handle API response structures safely
    if (response && typeof response === 'object') {
      // If Response already has data array and pagination
      if (Array.isArray(response.data)) {
        apps = response.data
        total = response.pagination?.total ?? apps.length
        totalPages = response.pagination?.totalPages ?? Math.ceil(apps.length / pagination.pageSize)
      }
      // backward compatible if nested format appears (unlikely with typed composable)
      else if (response.data && (response.data as any).data && Array.isArray((response.data as any).data)) {
        apps = (response.data as any).data
        total = (response.data as any).pagination?.total ?? apps.length
        totalPages = (response.data as any).pagination?.totalPages ?? Math.ceil(apps.length / pagination.pageSize)
      }
    } else if (Array.isArray(response)) {
      apps = response
      total = apps.length
      totalPages = Math.ceil(apps.length / pagination.pageSize)
    }
    
    // Filter by company
    if (user.value?.companyId) {
      apps = apps.filter((app: JobApplication) => app.job?.company?.id === user.value?.companyId)
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      apps = apps.filter((app: JobApplication) => 
        getUserFullName(app.userId).toLowerCase().includes(searchTerm)
      )
    }
    
    applications.value = apps
    pagination.total = total
    pagination.totalPages = totalPages
    
    // Load user profiles for these applications
    await loadUserProfiles(apps)
    
    console.log('Applications loaded:', applications.value.length)
  } catch (err) {
    console.error('Error fetching applications:', err)
  } finally {
    loading.value = false
  }
}

// Update application status
const updateApplicationStatusHandler = async (id: string, status: string) => {
  try {
    await updateApplicationStatus(id, status)
    alert(`Application status updated to ${getStatusText(status)}`)
    await fetchApplications()
    if (selectedApplication.value) {
      selectedApplication.value.status = status
    }
  } catch (err) {
    console.error('Error updating status:', err)
    alert('Failed to update status')
  }
}

// View application detail - navigate to candidate profile
const viewApplicationDetail = (application: JobApplication) => {
  router.push({
    path: `/users/${application.userId}`,
    query: { applicationId: application.id }
  })
}

// Open message modal
const openMessageModal = (application: JobApplication) => {
  messageCandidateName.value = getUserFullName(application.userId)
  messageSubject.value = `Interview Invitation for ${application.job?.title}`
  messageContent.value = `Dear ${getUserFullName(application.userId)},

Thank you for your application for the ${application.job?.title} position. We are pleased to invite you for an interview.

Please let us know your availability.

Best regards,
Recruitment Team`
  showMessageModal.value = true
}

// Send message
const sendMessage = async () => {
  if (!messageSubject.value || !messageContent.value) {
    alert('Please fill in subject and message')
    return
  }
  
  sending.value = true
  try {
    // TODO: Implement send message API
    console.log('Sending message:', {
      to: getUserEmail(selectedApplication.value?.userId),
      subject: messageSubject.value,
      message: messageContent.value
    })
    alert('Message sent successfully!')
    showMessageModal.value = false
    messageSubject.value = ''
    messageContent.value = ''
  } catch (err) {
    console.error('Error sending message:', err)
    alert('Failed to send message')
  } finally {
    sending.value = false
  }
}

// Apply filters
const applyFilters = () => {
  filters.status = tempFilters.status
  pagination.page = 1
  showFilterModal.value = false
  fetchApplications()
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
  if (user.value?.role !== 'RECRUITER' && user.value?.role !== 'ADMIN') {
    router.push('/')
    return false
  }
  return true
}

onMounted(async () => {
  if (!checkAuth()) return
  
  await fetchJobs()
  await fetchApplications()
})
</script>