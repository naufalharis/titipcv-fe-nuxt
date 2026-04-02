<template>
  <div class="animate-fade-in">
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Work Places Management</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage all work places in your application.</p>
      </div>
      
      <!-- Add Work Place Button -->
      <button 
        v-if="!showDeleted"
        @click="openCreateModal"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Add Work Place
      </button>
    </div>

    <!-- Language Selection and Search -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <!-- Language Selection -->
      <div class="w-48">
        <select
          v-model="selectedLocale"
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
          @change="fetchWorkPlaces"
        >
          <option value="en">English</option>
          <option value="id">Indonesian</option>
        </select>
      </div>

      <!-- Search Bar -->
      <div class="flex-1 relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="showDeleted ? 'Search deleted work places...' : 'Search work places by name or slug...'"
          class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- Search Info -->
    <div v-if="searchQuery" class="mb-4 text-sm text-slate-500 dark:text-slate-400">
      Searching for "{{ searchQuery }}" • {{ filteredWorkPlaces.length }} results found
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600 dark:text-red-400">{{ error }}</p>
      <button 
        @click="fetchWorkPlaces" 
        class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Retry
      </button>
    </div>

    <!-- Not Authenticated -->
    <div v-else-if="!isAuthenticated" class="text-center py-12">
      <p class="text-red-600 dark:text-red-400">You need to be authenticated to view this page.</p>
      <button 
        @click="handleLogin" 
        class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Login
      </button>
    </div>

    <!-- Data Table -->
    <DataTable 
      v-else
      v-model:page="page"
      v-model:perPage="perPage"
      :title="tableTitle"
      :columns="columns" 
      :rows="paginatedWorkPlaces"
      :loading="loading"
      :totalRows="filteredWorkPlaces.length"
      @update:page="handlePageChange"
      @update:perPage="handlePerPageChange"
    >
      <!-- Name cell -->
      <template #cell-name="{ row }">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-8 h-8 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center text-sm font-semibold text-primary-600 dark:text-primary-400">
            {{ getWorkPlaceInitial(row) }}
          </div>
          <div>
            <div class="text-sm font-medium text-slate-900 dark:text-white">{{ getWorkPlaceName(row) }}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Slug: {{ row.slug }}</div>
          </div>
        </div>
      </template>

      <!-- Description cell -->
      <template #cell-description="{ row }">
        <div class="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
          {{ getWorkPlaceDescription(row) }}
        </div>
      </template>

      <!-- Status cell -->
      <template #cell-status="{ row }">
        <span 
          v-if="!showDeleted"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="{
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300': row.isActive,
            'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300': !row.isActive
          }"
        >
          <span 
            class="w-1.5 h-1.5 rounded-full mr-1.5" 
            :class="{
              'bg-emerald-500': row.isActive,
              'bg-slate-500': !row.isActive
            }"
          ></span>
          {{ row.isActive ? 'Active' : 'Inactive' }}
        </span>
      </template>

      <!-- Created At cell -->
      <template #cell-createdAt="{ row }">
        <span class="text-sm text-slate-600 dark:text-slate-400">
          {{ formatDate(row.createdAt) }}
        </span>
      </template>

      <!-- Deleted At cell -->
      <template #cell-deletedAt="{ row }">
        <span v-if="showDeleted" class="text-sm text-slate-600 dark:text-slate-400">
          {{ formatDate(row.deletedAt) }}
        </span>
      </template>

      <!-- Actions -->
      <template #cell-actions="{ row }">
        <div class="flex items-center gap-2 justify-end">
          <!-- View button -->
          <button 
            @click="viewWorkPlace(row)"
            class="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
            title="View Details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Edit button (only for active) -->
          <button 
            v-if="!showDeleted"
            @click="openEditModal(row)"
            class="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
            title="Edit Work Place"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          
          <!-- Restore button (only for deleted) -->
          <button 
            v-if="showDeleted"
            @click="confirmRestore(row)"
            class="text-slate-600 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 transition-colors"
            title="Restore Work Place"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <!-- Delete button (soft delete for active, permanent for deleted) -->
          <button 
            @click="confirmDelete(row)"
            class="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
            :title="showDeleted ? 'Permanently Delete' : 'Delete Work Place'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </template>

      <!-- Empty state -->
      <template #empty>
        <div class="text-center py-8">
          <div class="text-slate-500 dark:text-slate-400 mb-2">
            {{ emptyStateMessage }}
          </div>
          <button 
            v-if="searchQuery"
            @click="clearSearch" 
            class="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Clear search
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-container modal-lg">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                {{ isEdit ? 'Edit Work Place' : 'Create New Work Place' }}
              </h3>
              <button @click="closeModal" class="modal-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <form @submit.prevent="handleSubmit" class="modal-body">
              <div class="space-y-6">
                <!-- Slug -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Slug <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="form.slug" 
                    type="text"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g., on-site, remote, hybrid"
                    required
                  />
                </div>

                <!-- English Translation -->
                <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 class="text-md font-medium text-slate-900 dark:text-white mb-3">English (en)</h4>
                  <div class="space-y-3">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Name <span class="text-red-500">*</span>
                      </label>
                      <input 
                        v-model="form.translations.en.name" 
                        type="text"
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Description
                      </label>
                      <textarea 
                        v-model="form.translations.en.description" 
                        rows="2"
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <!-- Indonesian Translation -->
                <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 class="text-md font-medium text-slate-900 dark:text-white mb-3">Indonesian (id)</h4>
                  <div class="space-y-3">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Name <span class="text-red-500">*</span>
                      </label>
                      <input 
                        v-model="form.translations.id.name" 
                        type="text"
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Description
                      </label>
                      <textarea 
                        v-model="form.translations.id.description" 
                        rows="2"
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <!-- Status (edit only) -->
                <div v-if="isEdit" class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <div class="flex items-center gap-4">
                    <label class="inline-flex items-center">
                      <input 
                        type="radio" 
                        v-model="form.isActive" 
                        :value="true"
                        class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300"
                      >
                      <span class="ml-2 text-sm text-slate-700 dark:text-slate-300">Active</span>
                    </label>
                    <label class="inline-flex items-center">
                      <input 
                        type="radio" 
                        v-model="form.isActive" 
                        :value="false"
                        class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300"
                      >
                      <span class="ml-2 text-sm text-slate-700 dark:text-slate-300">Inactive</span>
                    </label>
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" @click="closeModal" class="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg" :disabled="submitting">
                  {{ submitting ? 'Saving...' : (isEdit ? 'Update' : 'Create') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- View Details Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showViewModal" class="modal-overlay" @click.self="showViewModal = false">
          <div class="modal-container modal-lg">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Work Place Details</h3>
              <button @click="showViewModal = false" class="modal-close-btn">✕</button>
            </div>
            
            <div v-if="viewData" class="modal-body">
              <!-- Details content -->
              <div class="space-y-4">
                <div><label class="font-medium">ID:</label> {{ viewData.id }}</div>
                <div><label class="font-medium">Slug:</label> {{ viewData.slug }}</div>
                <div><label class="font-medium">Status:</label> {{ viewData.isActive ? 'Active' : 'Inactive' }}</div>
                
                <div class="border-t pt-4">
                  <h4 class="font-medium mb-2">Translations</h4>
                  <div v-for="trans in viewData.translations" :key="trans.id" class="mb-3 p-3 bg-slate-50 dark:bg-slate-800 rounded">
                    <div class="font-medium">{{ trans.locale?.name }} ({{ trans.locale?.code }})</div>
                    <div>Name: {{ trans.name }}</div>
                    <div v-if="trans.description">Description: {{ trans.description }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button @click="showViewModal = false" class="px-4 py-2 border rounded-lg">Close</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
          <div class="modal-container modal-sm">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                {{ showDeleted ? 'Permanently Delete' : 'Delete' }} Work Place
              </h3>
              <button @click="showDeleteModal = false" class="modal-close-btn">✕</button>
            </div>
            
            <div class="modal-body">
              <p>Are you sure you want to {{ showDeleted ? 'permanently delete' : 'delete' }} "{{ selectedWorkPlace?.slug }}"?</p>
              <p v-if="deleteError" class="text-red-600 mt-2">{{ deleteError }}</p>
            </div>

            <div class="modal-footer">
              <button @click="showDeleteModal = false" class="px-4 py-2 border rounded-lg">Cancel</button>
              <button @click="handleDelete" class="px-4 py-2 bg-red-600 text-white rounded-lg" :disabled="deleting">
                {{ deleting ? 'Deleting...' : (showDeleted ? 'Delete Permanently' : 'Delete') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Restore Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showRestoreModal" class="modal-overlay" @click.self="showRestoreModal = false">
          <div class="modal-container modal-sm">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Restore Work Place</h3>
              <button @click="showRestoreModal = false" class="modal-close-btn">✕</button>
            </div>
            
            <div class="modal-body">
              <p>Are you sure you want to restore "{{ selectedWorkPlace?.slug }}"?</p>
              <p v-if="restoreError" class="text-red-600 mt-2">{{ restoreError }}</p>
            </div>

            <div class="modal-footer">
              <button @click="showRestoreModal = false" class="px-4 py-2 border rounded-lg">Cancel</button>
              <button @click="handleRestore" class="px-4 py-2 bg-green-600 text-white rounded-lg" :disabled="restoring">
                {{ restoring ? 'Restoring...' : 'Restore' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useWorkPlaces, type WorkPlace } from '~/composables/useWorkPlaces'

const { isAuthenticated } = useAuth()
const { 
  getWorkPlaces, 
  getWorkPlaceById, 
  createWorkPlace, 
  updateWorkPlace, 
  deleteWorkPlace,
  restoreWorkPlace 
} = useWorkPlaces()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const deleteError = ref<string | null>(null)
const restoreError = ref<string | null>(null)
const allWorkPlaces = ref<WorkPlace[]>([])
const submitting = ref(false)
const deleting = ref(false)
const restoring = ref(false)
const showModal = ref(false)
const showViewModal = ref(false)
const showDeleteModal = ref(false)
const showRestoreModal = ref(false)
const selectedWorkPlace = ref<WorkPlace | null>(null)
const viewData = ref<WorkPlace | null>(null)
const isEdit = ref(false)

// Filters
const searchQuery = ref('')
const searchTimeout = ref<NodeJS.Timeout | null>(null)
const showDeleted = ref(false)
const selectedLocale = ref('en')
const page = ref(1)
const perPage = ref(10)

// Form
const form = ref({
  id: '',
  slug: '',
  isActive: true,
  translations: {
    en: { name: '', description: '' },
    id: { name: '', description: '' }
  }
})

// Computed: Filter work places berdasarkan tab dan search query
const filteredWorkPlaces = computed<WorkPlace[]>(() => {
  if (!allWorkPlaces.value.length) return []
  
  // First filter by tab (active/deleted)
  let filtered = allWorkPlaces.value.filter(workPlace => {
    if (showDeleted.value) {
      return workPlace.deletedAt !== null && workPlace.deletedAt !== undefined
    } else {
      return workPlace.deletedAt === null || workPlace.deletedAt === undefined
    }
  })
  
  // Then filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter((workPlace: WorkPlace) => {
      const name = getWorkPlaceName(workPlace).toLowerCase()
      const slug = workPlace.slug.toLowerCase()
      const description = getWorkPlaceDescription(workPlace).toLowerCase()
      
      // Search in name, slug, and description
      return name.includes(query) || 
             slug.includes(query) || 
             description.includes(query)
    })
  }
  
  return filtered
})

// Computed: Paginated work places
const paginatedWorkPlaces = computed<WorkPlace[]>(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredWorkPlaces.value.slice(start, end)
})

// Computed: Counts for tabs
const activeCount = computed(() => {
  return allWorkPlaces.value.filter(w => !w.deletedAt).length
})

const deletedCount = computed(() => {
  return allWorkPlaces.value.filter(w => w.deletedAt).length
})

// Computed: Table title
const tableTitle = computed(() => {
  if (searchQuery.value) {
    return `Search Results for "${searchQuery.value}" (${filteredWorkPlaces.value.length} found)`
  }
  return showDeleted.value ? 'Deleted Work Places' : 'Active Work Places'
})

// Computed: Empty state message
const emptyStateMessage = computed(() => {
  if (searchQuery.value) {
    return `No work places found matching "${searchQuery.value}"`
  }
  return showDeleted.value ? 'No deleted work places found' : 'No work places found'
})

// Columns
const columns = computed(() => {
  const cols = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' }
  ]
  
  if (showDeleted.value) {
    cols.push({ key: 'deletedAt', label: 'Deleted At' })
  } else {
    cols.push({ key: 'status', label: 'Status' })
    cols.push({ key: 'createdAt', label: 'Created' })
  }
  
  cols.push({ key: 'actions', label: 'Actions' })
  return cols
})

// Helpers
const getWorkPlaceName = (workPlace: WorkPlace): string => {
  const translation = workPlace.translations?.find(t => 
    t.locale?.code === selectedLocale.value
  )
  return translation?.name || workPlace.slug
}

const getWorkPlaceDescription = (workPlace: WorkPlace): string => {
  const translation = workPlace.translations?.find(t => 
    t.locale?.code === selectedLocale.value
  )
  return translation?.description || '-'
}

const getWorkPlaceInitial = (workPlace: WorkPlace): string => {
  const name = getWorkPlaceName(workPlace)
  return name ? name.charAt(0).toUpperCase() : '?'
}

const formatDate = (timestamp: number | null | undefined): string => {
  if (!timestamp) return '-'
  return new Date(timestamp * 1000).toLocaleDateString()
}

// Search handlers
const handleSearch = () => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    page.value = 1 // Reset to first page on new search
  }, 500)
}

const clearSearch = () => {
  searchQuery.value = ''
  page.value = 1
}

// Tab switch handler
const switchTab = (deleted: boolean) => {
  showDeleted.value = deleted
  page.value = 1
  searchQuery.value = ''
  // No need to refetch, just re-filter with computed
}

// Page change handlers
const handlePageChange = (newPage: number) => {
  page.value = newPage
}

const handlePerPageChange = (value: number) => {
  perPage.value = value
  page.value = 1
}

// Fetch data - Fetch ALL data for frontend filtering
const fetchWorkPlaces = async () => {
  if (!isAuthenticated.value) return
  
  loading.value = true
  error.value = null
  
  try {
    // Fetch all work places (both active and deleted)
    const params: any = {
      page: 1,
      limit: 100, // Fetch more data at once
      includeDeleted: true // Include deleted items
    }
    
    const response = await getWorkPlaces({
      ...params,
      locale: selectedLocale.value
    })
    
    allWorkPlaces.value = response
    
    console.log(`Fetched ${allWorkPlaces.value.length} work places`)
    
  } catch (err: any) {
    console.error('Fetch error:', err)
    error.value = err.message || 'Failed to fetch work places'
    allWorkPlaces.value = []
  } finally {
    loading.value = false
  }
}

// Modal handlers
const openCreateModal = () => {
  isEdit.value = false
  form.value = {
    id: '',
    slug: '',
    isActive: true,
    translations: {
      en: { name: '', description: '' },
      id: { name: '', description: '' }
    }
  }
  showModal.value = true
}

const openEditModal = async (workPlace: WorkPlace) => {
  isEdit.value = true
  selectedWorkPlace.value = workPlace
  
  try {
    const detailed = await getWorkPlaceById(workPlace.id, true)
    
    form.value = {
      id: workPlace.id,
      slug: workPlace.slug,
      isActive: workPlace.isActive,
      translations: {
        en: { name: '', description: '' },
        id: { name: '', description: '' }
      }
    }
    
    detailed.translations?.forEach(trans => {
      const code = trans.locale?.code
      if (code === 'en') {
        form.value.translations.en = { name: trans.name, description: trans.description || '' }
      } else if (code === 'id') {
        form.value.translations.id = { name: trans.name, description: trans.description || '' }
      }
    })
  } catch (err) {
    console.error('Failed to fetch details:', err)
  }
  
  showModal.value = true
}

const viewWorkPlace = async (workPlace: WorkPlace) => {
  try {
    viewData.value = await getWorkPlaceById(workPlace.id, true)
    showViewModal.value = true
  } catch (err) {
    console.error('Failed to fetch details:', err)
  }
}

const closeModal = () => {
  showModal.value = false
  selectedWorkPlace.value = null
}

// Submit form
const handleSubmit = async () => {
  if (!form.value.slug) {
    error.value = 'Slug is required'
    return
  }

  if (!form.value.translations.en.name || !form.value.translations.id.name) {
    error.value = 'Both English and Indonesian names are required'
    return
  }

  submitting.value = true
  error.value = null
  
  try {
    const translations = [
      {
        localeCode: 'en',
        name: form.value.translations.en.name,
        description: form.value.translations.en.description || null
      },
      {
        localeCode: 'id',
        name: form.value.translations.id.name,
        description: form.value.translations.id.description || null
      }
    ]
    
    if (isEdit.value && selectedWorkPlace.value) {
      await updateWorkPlace(selectedWorkPlace.value.id, {
        slug: form.value.slug !== selectedWorkPlace.value.slug ? form.value.slug : undefined,
        isActive: form.value.isActive,
        translations
      })
    } else {
      await createWorkPlace({ slug: form.value.slug, translations })
    }
    
    closeModal()
    await fetchWorkPlaces()
  } catch (err: any) {
    error.value = err.message || 'Failed to save work place'
  } finally {
    submitting.value = false
  }
}

// Delete
const confirmDelete = (workPlace: WorkPlace) => {
  selectedWorkPlace.value = workPlace
  deleteError.value = null
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!selectedWorkPlace.value) return
  
  deleting.value = true
  deleteError.value = null
  
  try {
    await deleteWorkPlace(selectedWorkPlace.value.id)
    showDeleteModal.value = false
    selectedWorkPlace.value = null
    await fetchWorkPlaces()
  } catch (err: any) {
    deleteError.value = err.message || 'Failed to delete'
  } finally {
    deleting.value = false
  }
}

// Restore
const confirmRestore = (workPlace: WorkPlace) => {
  selectedWorkPlace.value = workPlace
  restoreError.value = null
  showRestoreModal.value = true
}

const handleRestore = async () => {
  if (!selectedWorkPlace.value) return
  
  restoring.value = true
  restoreError.value = null
  
  try {
    await restoreWorkPlace(selectedWorkPlace.value.id)
    showRestoreModal.value = false
    selectedWorkPlace.value = null
    await fetchWorkPlaces()
  } catch (err: any) {
    restoreError.value = err.message || 'Failed to restore'
  } finally {
    restoring.value = false
  }
}

const handleLogin = () => navigateTo('/login')

// Watchers
watch(() => isAuthenticated.value, (val) => { if (val) fetchWorkPlaces() })
watch(showDeleted, () => { 
  page.value = 1
  // No need to refetch, just re-filter with computed
})
watch(selectedLocale, () => { 
  fetchWorkPlaces() // Refetch when language changes
})

// Initial fetch
onMounted(() => { if (isAuthenticated.value) fetchWorkPlaces() })
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
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-container.modal-sm { max-width: 400px; }
.modal-container.modal-lg { max-width: 900px; }
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