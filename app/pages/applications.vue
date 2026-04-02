<!-- pages/applications.vue -->
<template>
  <div class="animate-fade-in">
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Job Applications</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage all job applications in your system.</p>
      </div>
      
      <!-- Filter Button -->
      <button 
        @click="showFilters = !showFilters"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
        </svg>
        Filters
      </button>
    </div>

    <!-- Stats Cards -->
    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
        <p class="text-sm text-slate-500 dark:text-slate-400">Total Applications</p>
        <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats.totalApplications || 0 }}</p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
        <p class="text-sm text-slate-500 dark:text-slate-400">Pending</p>
        <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ stats.pendingApplications || 0 }}</p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
        <p class="text-sm text-slate-500 dark:text-slate-400">Reviewed</p>
        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.reviewedApplications || 0 }}</p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
        <p class="text-sm text-slate-500 dark:text-slate-400">Hired</p>
        <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.hiredApplications || 0 }}</p>
      </div>
    </div>

    <!-- Filters Panel -->
    <div v-if="showFilters" class="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job</label>
          <select
            v-model="filters.jobId"
            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
          >
            <option value="">All Jobs</option>
            <option v-for="job in jobs" :key="job.id" :value="job.id">
              {{ job.title }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
          >
            <option value="">All Status</option>
            <option v-if="statuses.length === 0" value="" disabled>Loading statuses...</option>
            <option v-for="status in statuses" :key="status.slug" :value="status.slug">
              {{ status.title }}
            </option>
          </select>
        </div>
        
        <div class="flex items-end">
          <button
            @click="applyFilters"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Apply Filters
          </button>
          <button
            @click="resetFilters"
            class="ml-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="mb-6">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by applicant name, email, or job title..."
          class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
          @input="debouncedSearch"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600 dark:text-red-400">{{ error }}</p>
      <button 
        @click="fetchApplications" 
        class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Retry
      </button>
    </div>

    <!-- Applications Table -->
    <div v-else class="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead class="bg-slate-50 dark:bg-slate-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Applicant</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Job</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Score</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Applied Date</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          <tr v-for="app in applications" :key="app.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                  <span class="text-primary-600 dark:text-primary-400 font-medium">
                    {{ app.user?.name?.charAt(0) || 'U' }}
                  </span>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-slate-900 dark:text-white">{{ app.user?.name || 'Unknown' }}</div>
                  <div class="text-sm text-slate-500 dark:text-slate-400">{{ app.user?.email || '-' }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-slate-900 dark:text-white">{{ app.job?.title || '-' }}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400">{{ app.job?.company?.name || '-' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getStatusColor(app.status)"
              >
                {{ getStatusLabelWithData(app.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
              <span v-if="scores[app.id]" :class="getScoreColor(scores[app.id].averageScore)">
                {{ scores[app.id]?.averageScore?.toFixed(1) || '-' }}%
              </span>
              <span v-else>-</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
              {{ formatDate(app.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex items-center gap-2">
                <button @click="viewApplication(app)" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="View">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button @click="changeStatus(app)" class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300" title="Change Status">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="applications.length === 0">
            <td colspan="6" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
              No applications found
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="px-6 py-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between">
          <div class="text-sm text-slate-700 dark:text-slate-300">
            Showing {{ (pagination.page - 1) * pagination.pageSize + 1 }} to 
            {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }} of {{ pagination.total }} applications
          </div>
          <div class="flex gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Previous
            </button>
            <span class="px-3 py-1 text-sm text-slate-700 dark:text-slate-300">
              Page {{ pagination.page }} of {{ pagination.totalPages }}
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === pagination.totalPages"
              class="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Application Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showViewModal" class="modal-overlay" @click.self="showViewModal = false">
          <div class="modal-container modal-lg">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Application Details</h3>
              <button @click="showViewModal = false" class="modal-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div v-if="viewData" class="modal-body">
              <div class="space-y-6">
                <!-- Applicant Info -->
                <div class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div class="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                    <span class="text-primary-600 dark:text-primary-400 text-xl font-medium">
                      {{ viewData.user?.name?.charAt(0) || 'U' }}
                    </span>
                  </div>
                  <div>
                    <p class="font-medium text-lg">{{ viewData.user?.name || 'Unknown' }}</p>
                    <p class="text-sm text-slate-500 dark:text-slate-400">{{ viewData.user?.email || '-' }}</p>
                  </div>
                </div>

                <!-- Job Info -->
                <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 class="font-medium mb-2">Job Details</h4>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <p class="text-xs text-slate-500 dark:text-slate-400">Position</p>
                      <p class="text-sm font-medium">{{ viewData.job?.title || '-' }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-slate-500 dark:text-slate-400">Company</p>
                      <p class="text-sm">{{ viewData.job?.company?.name || '-' }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-slate-500 dark:text-slate-400">Status</p>
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1"
                        :class="getStatusColor(viewData.status)"
                      >
                        {{ getStatusLabelWithData(viewData.status) }}
                      </span>
                    </div>
                    <div>
                      <p class="text-xs text-slate-500 dark:text-slate-400">Applied Date</p>
                      <p class="text-sm">{{ formatDateTime(viewData.createdAt) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Cover Letter -->
                <div v-if="viewData.coverLetter" class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 class="font-medium mb-2">Cover Letter</h4>
                  <p class="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{{ viewData.coverLetter }}</p>
                </div>

                <!-- Resume -->
                <div v-if="viewData.resumeUrl" class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 class="font-medium mb-2">Resume</h4>
                  <a :href="viewData.resumeUrl" target="_blank" class="text-primary-600 hover:underline flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd" />
                    </svg>
                    Download Resume
                  </a>
                </div>

                <!-- Screening Questions & Answers -->
                <div v-if="screeningAnswers.length > 0" class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 class="font-medium mb-2">Screening Questions</h4>
                  <div class="space-y-4">
                    <div v-for="(item, idx) in screeningAnswers" :key="item.id" class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <p class="text-sm font-medium">{{ idx + 1 }}. {{ item.question?.question || 'Question' }}</p>
                      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">{{ item.answer }}</p>
                      <p v-if="item.score !== null" class="text-xs text-primary-600 dark:text-primary-400 mt-1">
                        Score: {{ item.score }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button 
                @click="showViewModal = false" 
                class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
              <button 
                @click="handleEditFromView"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Change Status Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showStatusModal" class="modal-overlay" @click.self="showStatusModal = false">
          <div class="modal-container modal-sm">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Change Application Status</h3>
              <button @click="showStatusModal = false" class="modal-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div class="modal-body">
              <p class="text-slate-600 dark:text-slate-400 mb-4">
                Change status for <span class="font-semibold">{{ selectedApplication?.user?.name || 'applicant' }}</span>
              </p>
              
              <select
                v-model="newStatus"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
              >
                <option v-if="statuses.length === 0" value="" disabled>Loading statuses...</option>
                <option v-for="status in statuses" :key="status.slug" :value="status.slug">
                  {{ status.title }}
                </option>
              </select>
              
              <p v-if="statusError" class="mt-2 text-sm text-red-600 dark:text-red-400">
                Error: {{ statusError }}
              </p>
            </div>

            <div class="modal-footer">
              <button 
                @click="showStatusModal = false" 
                class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                @click="handleStatusChange" 
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                :disabled="statusUpdating || !newStatus"
              >
                <span v-if="statusUpdating" class="flex items-center gap-2">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </span>
                <span v-else>Update Status</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useApplications, type Application, type ApplicationStatus } from '~/composables/useApplications'
import { useJobs, type Job } from '~/composables/useJobs'

const { 
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  getScreeningAnswers,
  getScreeningScore,
  getGlobalStats,
  getStatusColor,
  getStatusLabel,
  listStatuses
} = useApplications()

const { listJobs } = useJobs()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const applications = ref<Application[]>([])
const stats = ref<any>(null)
const jobs = ref<Job[]>([])
const statuses = ref<ApplicationStatus[]>([])
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
})
const currentPage = ref(1)
const searchQuery = ref('')
const searchTimeout = ref<NodeJS.Timeout | null>(null)
const showFilters = ref(false)
const scores = ref<Record<string, any>>({})

// Filters
const filters = ref({
  jobId: '',
  status: ''
})

// Modal states
const showViewModal = ref(false)
const showStatusModal = ref(false)
const viewData = ref<Application | null>(null)
const selectedApplication = ref<Application | null>(null)
const screeningAnswers = ref<any[]>([])
const statusUpdating = ref(false)
const statusError = ref<string | null>(null)
const newStatus = ref('')

// Helper untuk mendapatkan label status dengan data dari backend
const getStatusLabelWithData = (slug: string): string => {
  return getStatusLabel(slug, statuses.value)
}

// Fetch statuses
const fetchStatuses = async () => {
  try {
    const data = await listStatuses()
    statuses.value = data
    console.log('Statuses loaded:', data)
  } catch (err) {
    console.error('Error fetching statuses:', err)
  }
}

// Fetch applications
const fetchApplications = async () => {
  loading.value = true
  error.value = null
  
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: 10
    }
    
    if (filters.value.jobId) params.jobId = filters.value.jobId
    if (filters.value.status) params.status = filters.value.status
    if (searchQuery.value) params.search = searchQuery.value
    
    const response = await getAllApplications(params)
    
    applications.value = response.data
    pagination.value = response.pagination
    
    // Fetch scores for each application
    await fetchScores(response.data)
    
  } catch (err: any) {
    console.error('Error fetching applications:', err)
    error.value = err.message || 'Failed to fetch applications'
  } finally {
    loading.value = false
  }
}

// Fetch scores for applications
const fetchScores = async (apps: Application[]) => {
  for (const app of apps) {
    try {
      const score = await getScreeningScore(app.id)
      if (score) {
        scores.value[app.id] = score
      }
    } catch (err) {
      console.error(`Error fetching score for application ${app.id}:`, err)
    }
  }
}

// Fetch jobs for filter
const fetchJobs = async () => {
  try {
    const response = await listJobs({ limit: 100 })
    jobs.value = response.jobs || []
  } catch (err) {
    console.error('Error fetching jobs:', err)
  }
}

// Fetch global stats
const fetchStats = async () => {
  try {
    stats.value = await getGlobalStats()
  } catch (err) {
    console.error('Error fetching stats:', err)
  }
}

// View application
const viewApplication = async (app: Application) => {
  try {
    viewData.value = await getApplicationById(app.id)
    screeningAnswers.value = await getScreeningAnswers(app.id)
    showViewModal.value = true
  } catch (err) {
    console.error('Error fetching application details:', err)
    error.value = 'Failed to load application details'
  }
}

// Change status
const changeStatus = (app: Application) => {
  selectedApplication.value = app
  newStatus.value = app.status
  statusError.value = null
  showStatusModal.value = true
}

// pages/applications.vue - Perbaiki handleStatusChange

const handleStatusChange = async () => {
  if (!selectedApplication.value || !newStatus.value) return
  
  // Validasi status tidak boleh sama dengan status sebelumnya
  if (newStatus.value === selectedApplication.value.status) {
    statusError.value = 'Status is the same as current'
    return
  }
  
  statusUpdating.value = true
  statusError.value = null
  
  try {
    console.log('Updating status:', {
      applicationId: selectedApplication.value.id,
      oldStatus: selectedApplication.value.status,
      newStatus: newStatus.value
    })
    
    await updateApplicationStatus(selectedApplication.value.id, newStatus.value)
    
    showStatusModal.value = false
    selectedApplication.value = null
    newStatus.value = ''
    
    // Refresh data
    await fetchApplications()
    await fetchStats()
    
  } catch (err: any) {
    console.error('Status update error:', err)
    
    // Tangani error response
    if (err.data) {
      statusError.value = err.data.message || 'Failed to update status'
    } else if (err.message) {
      statusError.value = err.message
    } else {
      statusError.value = 'Failed to update status'
    }
  } finally {
    statusUpdating.value = false
  }
}

const handleEditFromView = () => {
  if (viewData.value) {
    showViewModal.value = false
    changeStatus(viewData.value)
  }
}

// Apply filters
const applyFilters = () => {
  currentPage.value = 1
  fetchApplications()
}

const resetFilters = () => {
  filters.value = {
    jobId: '',
    status: ''
  }
  currentPage.value = 1
  fetchApplications()
}

// Debounced search
const debouncedSearch = () => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1
    fetchApplications()
  }, 500)
}

// Format date
const formatDate = (timestamp: number | null | undefined): string => {
  if (!timestamp) return '-'
  return new Date(timestamp * 1000).toLocaleDateString()
}

const formatDateTime = (timestamp: number | null | undefined): string => {
  if (!timestamp) return '-'
  return new Date(timestamp * 1000).toLocaleString()
}

// Score color
const getScoreColor = (score?: number | null): string => {
  if (!score) return 'text-slate-500'
  if (score >= 80) return 'text-green-600 font-semibold'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

// Watch page changes
watch(currentPage, () => {
  fetchApplications()
})

// Initial fetch
onMounted(() => {
  fetchJobs()
  fetchApplications()
  fetchStats()
  fetchStatuses()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-container.modal-sm { max-width: 400px; }
.modal-container.modal-lg { max-width: 900px; }
.modal-container.modal-xl { max-width: 1200px; }
.dark .modal-container { background: #1e293b; }

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.dark .modal-header { border-bottom-color: #334155; }

.modal-close-btn {
  padding: 0.5rem;
  border-radius: 0.5rem;
  color: #64748b;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.dark .modal-close-btn:hover {
  background: #334155;
  color: #f1f5f9;
}

.modal-body { padding: 1.5rem; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 0 0 1rem 1rem;
}

.dark .modal-footer {
  border-top-color: #334155;
  background: #0f172a;
}

.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.3s ease;
}
.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: translateY(-20px);
}
</style>