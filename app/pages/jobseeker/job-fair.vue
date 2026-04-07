<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Job Fairs
        </h1>
        <p class="text-lg text-slate-600 dark:text-slate-400">
          Connect with top employers and discover exciting career opportunities
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 text-center">
          <div class="inline-flex p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="text-3xl font-bold text-slate-900 dark:text-white">{{ stats.total }}</div>
          <div class="text-sm text-slate-600 dark:text-slate-400">Total Events</div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 text-center">
          <div class="inline-flex p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="text-3xl font-bold text-slate-900 dark:text-white">{{ stats.ongoing }}</div>
          <div class="text-sm text-slate-600 dark:text-slate-400">Ongoing</div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 text-center">
          <div class="inline-flex p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="text-3xl font-bold text-slate-900 dark:text-white">{{ stats.upcoming }}</div>
          <div class="text-sm text-slate-600 dark:text-slate-400">Upcoming</div>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="relative">
            <input 
              v-model="filters.search"
              type="text"
              placeholder="Search job fairs..."
              @input="debouncedSearch"
              class="w-full px-4 py-2 pl-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select 
            v-model="filters.status"
            @change="filterJobFairs"
            class="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="ONGOING">Ongoing</option>
            <option value="PUBLISHED">Upcoming</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Job Fairs Grid -->
      <div v-else-if="filteredJobFairs.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="jobFair in paginatedJobFairs" 
          :key="jobFair.id"
          @click="viewJobFairDetail(jobFair.id)"
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
        >
          <!-- Banner -->
          <div class="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            <img 
              v-if="jobFair.banner?.url"
              :src="jobFair.banner.url"
              :alt="jobFair.title"
              class="w-full h-full object-cover"
            />
            <div v-else class="flex items-center justify-center h-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            
            <!-- Status Badge -->
            <div class="absolute top-4 right-4">
              <span 
                class="px-3 py-1 rounded-full text-xs font-semibold"
                :class="getStatusBadgeClass(jobFair.status)"
              >
                {{ getStatusText(jobFair.status) }}
              </span>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
              {{ jobFair.title }}
            </h3>
            
            <p class="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
              {{ jobFair.shortDescription || jobFair.description || 'No description available' }}
            </p>

            <!-- Date -->
            <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ formatDateRange(jobFair.start, jobFair.finish) }}</span>
            </div>

            <!-- View Details Button -->
            <button 
              class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <p class="text-slate-600 dark:text-slate-400 text-lg">No job fairs found</p>
        <p class="text-slate-500 dark:text-slate-500">Check back later for upcoming events</p>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-8">
        <button 
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <span class="px-4 py-2 bg-blue-600 text-white rounded-lg">
          {{ currentPage }} / {{ totalPages }}
        </span>
        <button 
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Job Fair Detail Modal -->
    <Teleport to="body">
      <div 
        v-if="selectedJobFair"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="closeModal"
      >
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
        
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <!-- Close Button -->
            <button 
              @click="closeModal"
              class="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/30 rounded-full text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Banner -->
            <div class="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600">
              <img 
                v-if="selectedJobFair.banner?.url"
                :src="selectedJobFair.banner.url"
                :alt="selectedJobFair.title"
                class="w-full h-full object-cover"
              />
              <div v-else class="flex items-center justify-center h-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <h2 class="text-3xl font-bold text-white mb-2">{{ selectedJobFair.title }}</h2>
                <span 
                  class="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                  :class="getStatusBadgeClass(selectedJobFair.status)"
                >
                  {{ getStatusText(selectedJobFair.status) }}
                </span>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6">
              <!-- Date & Time -->
              <div class="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p class="text-xs text-slate-500 dark:text-slate-400">Start Date</p>
                      <p class="font-medium text-slate-900 dark:text-white">{{ formatFullDate(selectedJobFair.start) }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p class="text-xs text-slate-500 dark:text-slate-400">End Date</p>
                      <p class="font-medium text-slate-900 dark:text-white">{{ formatFullDate(selectedJobFair.finish) }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">About This Event</h3>
                <div class="prose dark:prose-invert max-w-none">
                  <p class="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                    {{ selectedJobFair.description || selectedJobFair.shortDescription || 'No detailed description available.' }}
                  </p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-4">
                <button 
                  v-if="isRegistrationOpen"
                  @click="registerForJobFair"
                  class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Register Now
                </button>
                <button 
                  @click="closeModal"
                  class="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useJobFairs, type JobFair } from '~/composables/useJobFairs'

const { getJobFairs, getJobFairById } = useJobFairs()

// State
const allJobFairs = ref<JobFair[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 9
const selectedJobFair = ref<JobFair | null>(null)

const filters = ref({
  search: '',
  status: 'all'
})

// Computed stats berdasarkan data yang ada
const stats = computed(() => {
  const total = allJobFairs.value.length
  const ongoing = allJobFairs.value.filter(jf => jf.status === 'ONGOING').length
  const upcoming = allJobFairs.value.filter(jf => jf.status === 'PUBLISHED').length
  return { total, ongoing, upcoming }
})

// Filtered job fairs
const filteredJobFairs = computed(() => {
  let filtered = [...allJobFairs.value]
  
  // Filter by status
  if (filters.value.status !== 'all') {
    filtered = filtered.filter(jf => jf.status === filters.value.status)
  }
  
  // Filter by search
  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase()
    filtered = filtered.filter(jf => 
      jf.title.toLowerCase().includes(searchLower) ||
      jf.shortDescription?.toLowerCase().includes(searchLower) ||
      jf.description?.toLowerCase().includes(searchLower)
    )
  }
  
  // Sort by start date (nearest first)
  filtered.sort((a, b) => (a.start || 0) - (b.start || 0))
  
  return filtered
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredJobFairs.value.length / pageSize))
const paginatedJobFairs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredJobFairs.value.slice(start, end)
})

// Computed untuk cek apakah registrasi dibuka
const isRegistrationOpen = computed(() => {
  if (!selectedJobFair.value) return false
  const now = Math.floor(Date.now() / 1000) // Current time in seconds
  const start = selectedJobFair.value.start || 0
  const finish = selectedJobFair.value.finish || 0
  return now >= start && now <= finish
})

// Methods
const formatDateRange = (start?: number | null, finish?: number | null) => {
  if (!start || !finish) return 'TBD'
  // Convert from seconds to milliseconds
  const startDate = new Date(start * 1000)
  const endDate = new Date(finish * 1000)
  return `${startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - ${endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

const formatFullDate = (timestamp?: number | null) => {
  if (!timestamp) return 'TBD'
  const date = new Date(timestamp * 1000) // Convert from seconds to milliseconds
  return date.toLocaleDateString('id-ID', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusText = (status?: string | null) => {
  const statusMap: Record<string, string> = {
    'ONGOING': 'Ongoing',
    'PUBLISHED': 'Upcoming',
    'COMPLETED': 'Completed',
    'CANCELLED': 'Cancelled'
  }
  return statusMap[status || ''] || status || 'Unknown'
}

const getStatusBadgeClass = (status?: string | null) => {
  const classMap: Record<string, string> = {
    'ONGOING': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'PUBLISHED': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'COMPLETED': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    'CANCELLED': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
  return classMap[status || ''] || 'bg-gray-100 text-gray-700'
}

const loadJobFairs = async () => {
  loading.value = true
  try {
    const data = await getJobFairs({ page: 1, limit: 100 })
    allJobFairs.value = data
    console.log('Loaded job fairs:', data)
  } catch (error) {
    console.error('Error loading job fairs:', error)
  } finally {
    loading.value = false
  }
}

const filterJobFairs = () => {
  currentPage.value = 1 // Reset to first page when filter changes
}

const viewJobFairDetail = async (id: string) => {
  try {
    const jobFair = await getJobFairById(id)
    selectedJobFair.value = jobFair
  } catch (error) {
    console.error('Error loading job fair detail:', error)
  }
}

const closeModal = () => {
  selectedJobFair.value = null
}

const registerForJobFair = () => {
  alert('Registration feature coming soon!')
}

const changePage = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    filterJobFairs()
  }, 500)
}

onMounted(() => {
  loadJobFairs()
})
</script>