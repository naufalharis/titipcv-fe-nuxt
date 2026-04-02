<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Shared Candidate Profiles</h1>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Review and manage passcode-protected profile links you've generated for clients
          </p>
        </div>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create New Link
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
        <p class="text-sm text-slate-500 dark:text-slate-400">Total Shared Links</p>
        <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats.total }}</p>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
        <p class="text-sm text-slate-500 dark:text-slate-400">Unique Candidates</p>
        <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ stats.uniqueCandidates }}</p>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
        <p class="text-sm text-slate-500 dark:text-slate-400">Most Shared</p>
        <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ stats.mostSharedCandidate || '-' }}</p>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
        <p class="text-sm text-slate-500 dark:text-slate-400">Created This Month</p>
        <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ stats.createdThisMonth }}</p>
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
              placeholder="Search by candidate name or passcode..."
              class="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white w-80"
              @keyup.enter="fetchProfiles"
            />
            <svg class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <button
          @click="fetchProfiles"
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

    <!-- Profiles Table -->
    <div v-else-if="profiles.length > 0" class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead class="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Candidate</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Company</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Share URL</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Passcode</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
            <tr v-for="profile in profiles" :key="profile.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <!-- Candidate Info -->
              <td class="px-6 py-4">
                <div>
                  <p class="text-sm font-medium text-slate-900 dark:text-white">
                    {{ getFullName(profile.userProfile) }}
                  </p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {{ profile.userProfile?.summary || 'No summary' }}
                  </p>
                  <p v-if="profile.userProfile?.city" class="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {{ profile.userProfile.city }}
                  </p>
                </div>
              </td>

              <!-- Company -->
              <td class="px-6 py-4">
                <p class="text-sm text-slate-700 dark:text-slate-300">{{ companyName || '-' }}</p>
              </td>

              <!-- Share URL -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <code class="text-xs text-primary-600 dark:text-primary-400 break-all">
                    {{ getShortUrl(getShareableLink(profile.urlIdentifier)) }}
                  </code>
                  <button
                    @click="copyLinkOnly(profile.urlIdentifier)"
                    class="p-1 text-slate-400 hover:text-primary-600 transition-colors"
                    title="Copy full link"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </td>

              <!-- Passcode Hash - Ditampilkan seperti di gambar -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <code class="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded break-all max-w-[280px]">
                    {{ truncateHash(profile.passcode) }}
                  </code>
                  <button
                    @click="copyPasscode(profile.passcode)"
                    class="p-1 text-slate-400 hover:text-primary-600 transition-colors flex-shrink-0"
                    title="Copy passcode hash"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </td>

              <!-- Created Date -->
              <td class="px-6 py-4">
                <p class="text-sm text-slate-700 dark:text-slate-300">{{ formatDate(profile.createdAt) }}</p>
                <p class="text-xs text-slate-400 dark:text-slate-500">Updated {{ formatRelativeTime(profile.updatedAt) }}</p>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="viewProfile(profile)"
                    class="p-1.5 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="View Profile"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    @click="copyFullDetails(profile)"
                    class="p-1.5 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Copy Full Details"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </button>
                  <button
                    @click="deleteProfile(profile.id)"
                    class="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Delete Link"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Showing {{ (pagination.page - 1) * pagination.pageSize + 1 }} to 
          {{ Math.min(pagination.page * pagination.pageSize, profiles.length) }} of {{ profiles.length }} links
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
      <p class="text-slate-500 dark:text-slate-400 font-medium">No shared profiles found</p>
      <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">Create your first shared profile link to get started</p>
      <button
        @click="showCreateModal = true"
        class="mt-4 inline-block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
      >
        Create New Link
      </button>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Create Shared Profile Link</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Generate a passcode-protected link to share candidate profiles</p>
        </div>

        <form @submit.prevent="createProfile" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Candidate *
            </label>
            <select
              v-model="newProfile.userProfileId"
              required
              class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a candidate</option>
              <option v-for="candidate in candidates" :key="candidate.id" :value="candidate.id">
                {{ candidate.firstName }} {{ candidate.lastName }} - {{ candidate.summary || 'No summary' }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Passcode *
            </label>
            <input
              v-model="newProfile.passcode"
              type="text"
              required
              minlength="4"
              maxlength="50"
              class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter a passcode (4-50 characters)"
            />
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              This passcode will be required to view the candidate profile
            </p>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="creating"
              class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {{ creating ? 'Creating...' : 'Create Link' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCandidateProfilePage, type CandidateProfilePage, type UserProfile } from '~/composables/useCandidateProfilePage'
import { useAuth } from '~/composables/useAuth'
import { useCompany } from '~/composables/useCompany'

const router = useRouter()
const { user } = useAuth()
const { getMyCompany } = useCompany()
const {
  getCandidateProfilePagesByCompany,
  createCandidateProfilePage,
  deleteCandidateProfilePage
} = useCandidateProfilePage()

// State
const profiles = ref<CandidateProfilePage[]>([])
const candidates = ref<UserProfile[]>([])
const loading = ref(true)
const creating = ref(false)
const showCreateModal = ref(false)
const companyId = ref<string | null>(null)
const companyName = ref<string>('')

// Filters
const filters = reactive({
  search: ''
})

// Pagination
const pagination = reactive({
  page: 1,
  pageSize: 10,
  totalPages: 1
})

// New profile form
const newProfile = reactive({
  userProfileId: '',
  passcode: ''
})

// Helper functions
const getFullName = (userProfile?: UserProfile): string => {
  if (!userProfile) return 'Unknown Candidate'
  const firstName = userProfile.firstName || ''
  const lastName = userProfile.lastName || ''
  if (firstName || lastName) {
    return `${firstName} ${lastName}`.trim()
  }
  return 'Unknown Candidate'
}

const getShortUrl = (url: string): string => {
  if (url.length <= 45) return url
  return url.substring(0, 42) + '...'
}

const truncateHash = (hash: string): string => {
  if (!hash) return 'N/A'
  if (hash.length <= 35) return hash
  return hash.substring(0, 32) + '...'
}

const formatRelativeTime = (timestamp: number): string => {
  if (!timestamp) return 'N/A'
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp
  
  if (diff < 60) return `${diff} seconds ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`
  return formatDate(timestamp)
}

// Stats
const stats = computed(() => {
  const uniqueCandidates = new Set(profiles.value.map(p => p.userProfileId)).size
  const thisMonth = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60)
  const createdThisMonth = profiles.value.filter(p => p.createdAt > thisMonth).length
  
  const candidateCounts: Record<string, number> = {}
  profiles.value.forEach(p => {
    const name = getFullName(p.userProfile)
    candidateCounts[name] = (candidateCounts[name] || 0) + 1
  })
  
  let mostShared = ''
  let maxCount = 0
  Object.entries(candidateCounts).forEach(([name, count]) => {
    if (count > maxCount) {
      maxCount = count
      mostShared = name
    }
  })
  
  return {
    total: profiles.value.length,
    uniqueCandidates,
    createdThisMonth,
    mostSharedCandidate: mostShared
  }
})

// Fetch profiles
const fetchProfiles = async () => {
  if (!companyId.value) {
    console.log('No company ID, skipping fetch')
    loading.value = false
    return
  }
  
  loading.value = true
  
  try {
    const response = await getCandidateProfilePagesByCompany(companyId.value, {
      page: pagination.page,
      limit: pagination.pageSize
    })
    
    if (Array.isArray(response)) {
      profiles.value = response
      pagination.totalPages = Math.ceil(profiles.value.length / pagination.pageSize)
    } else {
      profiles.value = []
      pagination.totalPages = 1
    }
    
    // Apply search filter
    if (filters.search && profiles.value.length > 0) {
      const searchTerm = filters.search.toLowerCase()
      profiles.value = profiles.value.filter(profile => {
        const fullName = getFullName(profile.userProfile)
        return fullName.toLowerCase().includes(searchTerm) ||
               profile.urlIdentifier.toLowerCase().includes(searchTerm) ||
               profile.passcode.toLowerCase().includes(searchTerm)
      })
    }
    
  } catch (error) {
    console.error('Error fetching profiles:', error)
    profiles.value = []
  } finally {
    loading.value = false
  }
}

// Create new profile
const createProfile = async () => {
  if (!newProfile.userProfileId || !newProfile.passcode || !companyId.value) {
    alert('Please fill in all fields')
    return
  }
  
  creating.value = true
  
  try {
    await createCandidateProfilePage({
      userProfileId: newProfile.userProfileId,
      companyId: companyId.value,
      passcode: newProfile.passcode
    })
    
    alert('Profile link created successfully!')
    showCreateModal.value = false
    newProfile.userProfileId = ''
    newProfile.passcode = ''
    await fetchProfiles()
  } catch (error: any) {
    console.error('Error creating profile:', error)
    alert(error?.message || 'Failed to create profile link')
  } finally {
    creating.value = false
  }
}

// Delete profile
const deleteProfile = async (id: string) => {
  if (!confirm('Are you sure you want to delete this shared link? This action cannot be undone.')) return
  
  try {
    await deleteCandidateProfilePage(id)
    alert('Profile link deleted successfully!')
    await fetchProfiles()
  } catch (error) {
    console.error('Error deleting profile:', error)
    alert('Failed to delete profile link')
  }
}

// Copy functions
const copyLinkOnly = (urlIdentifier: string) => {
  const link = getShareableLink(urlIdentifier)
  navigator.clipboard.writeText(link)
  alert('Link copied to clipboard!')
}

const copyPasscode = (passcode: string) => {
  navigator.clipboard.writeText(passcode)
  alert('Passcode hash copied to clipboard!')
}

const copyFullDetails = (profile: CandidateProfilePage) => {
  const link = getShareableLink(profile.urlIdentifier)
  const fullText = `Candidate: ${getFullName(profile.userProfile)}\nLink: ${link}\nPasscode: ${profile.passcode}`
  navigator.clipboard.writeText(fullText)
  alert('Full details copied to clipboard!')
}

// Get shareable link
const getShareableLink = (urlIdentifier: string): string => {
  const baseUrl = window.location.origin
  return `${baseUrl}/candidate-profile/${urlIdentifier}`
}

// View profile
const viewProfile = (profile: CandidateProfilePage) => {
  const passcodeInput = prompt(`Enter passcode to view ${getFullName(profile.userProfile)}'s profile:`)
  if (passcodeInput === profile.passcode) {
    window.open(`/candidate-profile/${profile.urlIdentifier}`, '_blank')
  } else if (passcodeInput !== null) {
    alert('Invalid passcode')
  }
}

// Format date
const formatDate = (timestamp: number): string => {
  if (!timestamp) return 'N/A'
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Change page
const changePage = (page: number) => {
  if (page < 1 || page > pagination.totalPages) return
  pagination.page = page
  fetchProfiles()
}

// Load candidates
const loadCandidates = async () => {
  try {
    candidates.value = []
  } catch (error) {
    console.error('Error loading candidates:', error)
  }
}

// Get company info
const loadCompany = async () => {
  try {
    const company = await getMyCompany()
    if (company?.id) {
      companyId.value = company.id
      companyName.value = company.name || 'PT Antiqq'
    }
  } catch (error) {
    console.error('Error loading company:', error)
  }
}

onMounted(async () => {
  await loadCompany()
  if (companyId.value) {
    await fetchProfiles()
    await loadCandidates()
  } else {
    loading.value = false
  }
})
</script>