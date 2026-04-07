<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Manage Job Fairs</h1>
          <p class="text-slate-600 dark:text-slate-400 mt-2">Create and manage your job fair events</p>
        </div>
        <button 
          @click="openCreateModal"
          class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Job Fair
        </button>
      </div>

      <!-- Tabs -->
      <div class="border-b border-slate-200 dark:border-slate-700 mb-6">
        <div class="flex gap-4">
          <button 
            @click="activeTab = 'all'; loadJobFairs()"
            class="px-4 py-2 font-medium transition-colors relative"
            :class="activeTab === 'all' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
          >
            All Job Fairs
            <div v-if="activeTab === 'all'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          </button>
          <button 
            @click="activeTab = 'ongoing'; loadJobFairs()"
            class="px-4 py-2 font-medium transition-colors relative"
            :class="activeTab === 'ongoing' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
          >
            Ongoing
            <div v-if="activeTab === 'ongoing'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          </button>
          <button 
            @click="activeTab = 'published'; loadJobFairs()"
            class="px-4 py-2 font-medium transition-colors relative"
            :class="activeTab === 'published' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
          >
            Published
            <div v-if="activeTab === 'published'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          </button>
          <button 
            @click="activeTab = 'completed'; loadJobFairs()"
            class="px-4 py-2 font-medium transition-colors relative"
            :class="activeTab === 'completed' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
          >
            Completed
            <div v-if="activeTab === 'completed'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-6">
        <div class="relative max-w-md">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search job fairs..."
            @input="debouncedSearch"
            class="w-full px-4 py-2 pl-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Job Fairs Table -->
      <div v-else-if="filteredJobFairs.length > 0" class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Banner</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
              <tr v-for="jobFair in filteredJobFairs" :key="jobFair.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
                    <img 
                      v-if="jobFair.banner?.url"
                      :src="jobFair.banner.url"
                      :alt="jobFair.title"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="flex items-center justify-center h-full">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="font-medium text-slate-900 dark:text-white">{{ jobFair.title }}</div>
                  <div class="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{{ jobFair.shortDescription }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-slate-600 dark:text-slate-400">{{ formatDate(jobFair.start) }}</div>
                  <div class="text-xs text-slate-500 dark:text-slate-500">to {{ formatDate(jobFair.finish) }}</div>
                </td>
                <td class="px-6 py-4">
                  <span 
                    class="px-2 py-1 rounded-full text-xs font-semibold"
                    :class="getStatusBadgeClass(jobFair.status)"
                  >
                    {{ getStatusText(jobFair.status) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex gap-2">
                    <button 
                      @click="editJobFair(jobFair)"
                      class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      @click="confirmDelete(jobFair)"
                      class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <p class="text-slate-600 dark:text-slate-400 text-lg">No job fairs found</p>
        <button 
          @click="openCreateModal"
          class="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Create your first job fair
        </button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div 
        v-if="showModal"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="closeModal"
      >
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
        
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ isEditing ? 'Edit Job Fair' : 'Create New Job Fair' }}
              </h2>
              <button 
                @click="closeModal"
                class="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="p-6">
              <form @submit.prevent="saveJobFair" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Title *
                  </label>
                  <input 
                    v-model="form.title"
                    type="text"
                    required
                    class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Short Description
                  </label>
                  <textarea 
                    v-model="form.shortDescription"
                    rows="2"
                    class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Full Description
                  </label>
                  <textarea 
                    v-model="form.description"
                    rows="5"
                    class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Start Date & Time *
                    </label>
                    <input 
                      v-model="form.startDate"
                      type="datetime-local"
                      required
                      class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      End Date & Time *
                    </label>
                    <input 
                      v-model="form.finishDate"
                      type="datetime-local"
                      required
                      class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Status
                  </label>
                  <select 
                    v-model="form.status"
                    class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Banner Image
                  </label>
                  <input 
                    type="file"
                    accept="image/*"
                    @change="handleFileUpload"
                    class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div v-if="uploadPreview" class="mt-2">
                    <img :src="uploadPreview" class="h-32 w-full object-cover rounded-lg" />
                  </div>
                </div>

                <div class="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    :disabled="saving"
                    class="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {{ saving ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
                  </button>
                  <button 
                    type="button"
                    @click="closeModal"
                    class="flex-1 px-6 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useJobFairs, type JobFair, type CreateJobFairRequest } from '~/composables/useJobFairs'

const { 
  getJobFairs, 
  createJobFair,
  updateJobFair,
  deleteJobFair,
  uploadBanner
} = useJobFairs()

// State
const jobFairs = ref<JobFair[]>([])
const loading = ref(false)
const saving = ref(false)
const activeTab = ref('all')
const searchQuery = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const selectedJobFair = ref<JobFair | null>(null)

// Form state
const form = ref({
  title: '',
  shortDescription: '',
  description: '',
  startDate: '',
  finishDate: '',
  status: 'PUBLISHED',
  bannerFile: null as File | null,
  existingBannerId: null as string | null,
  existingBannerUrl: null as string | null
})

const uploadPreview = ref<string | null>(null)

// Computed
const filteredJobFairs = computed(() => {
  let filtered = [...jobFairs.value]
  
  // Filter by tab
  if (activeTab.value !== 'all') {
    filtered = filtered.filter(jf => jf.status?.toUpperCase() === activeTab.value.toUpperCase())
  }
  
  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(jf => 
      jf.title.toLowerCase().includes(query) ||
      jf.shortDescription?.toLowerCase().includes(query) ||
      jf.description?.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

// Methods
const formatDate = (timestamp?: number | null) => {
  if (!timestamp) return 'TBD'
  const date = new Date(timestamp * 1000) // Karena timestamp dalam detik
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const getStatusText = (status?: string | null) => {
  const statusMap: Record<string, string> = {
    'ONGOING': 'Ongoing',
    'PUBLISHED': 'Published',
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
    jobFairs.value = data
  } catch (error) {
    console.error('Error loading job fairs:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEditing.value = false
  selectedJobFair.value = null
  resetForm()
  showModal.value = true
}

const editJobFair = (jobFair: JobFair) => {
  isEditing.value = true
  selectedJobFair.value = jobFair
  
  form.value = {
    title: jobFair.title,
    shortDescription: jobFair.shortDescription || '',
    description: jobFair.description || '',
    startDate: jobFair.start ? new Date(jobFair.start * 1000).toISOString().slice(0, 16) : '',
    finishDate: jobFair.finish ? new Date(jobFair.finish * 1000).toISOString().slice(0, 16) : '',
    status: jobFair.status || 'PUBLISHED',
    bannerFile: null,
    existingBannerId: jobFair.bannerId || null,
    existingBannerUrl: jobFair.banner?.url || null
  }
  
  uploadPreview.value = null
  showModal.value = true
}

const resetForm = () => {
  form.value = {
    title: '',
    shortDescription: '',
    description: '',
    startDate: '',
    finishDate: '',
    status: 'PUBLISHED',
    bannerFile: null,
    existingBannerId: null,
    existingBannerUrl: null
  }
  uploadPreview.value = null
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    form.value.bannerFile = file
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}


const saveJobFair = async () => {
  saving.value = true
  
  try {
    const startTimestamp = Math.floor(new Date(form.value.startDate).getTime() / 1000)
    const finishTimestamp = Math.floor(new Date(form.value.finishDate).getTime() / 1000)
    
    const requestData: CreateJobFairRequest = {
      title: form.value.title,
      shortDescription: form.value.shortDescription || null,
      description: form.value.description || null,
      start: startTimestamp,
      finish: finishTimestamp,
      status: form.value.status
    }
    
    let jobFair: JobFair
    
    if (isEditing.value && selectedJobFair.value) {
      jobFair = await updateJobFair(selectedJobFair.value.id, requestData)
      
      // Handle banner upload if new file selected
      if (form.value.bannerFile) {
        await uploadBanner(jobFair.id, form.value.bannerFile)
      }
    } else {
      jobFair = await createJobFair(requestData)
      
      // Upload banner if file selected
      if (form.value.bannerFile) {
        await uploadBanner(jobFair.id, form.value.bannerFile)
      }
    }
    
    await loadJobFairs()
    closeModal()
  } catch (error) {
    console.error('Error saving job fair:', error)
    alert('Failed to save job fair')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (jobFair: JobFair) => {
  if (confirm(`Are you sure you want to delete "${jobFair.title}"?`)) {
    try {
      await deleteJobFair(jobFair.id)
      await loadJobFairs()
    } catch (error) {
      console.error('Error deleting job fair:', error)
      alert('Failed to delete job fair')
    }
  }
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    // Search sudah handled oleh computed
  }, 500)
}

onMounted(() => {
  loadJobFairs()
})
</script>