<template>
  <div class="animate-fade-in">
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Work Types Management</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage all work types in your application.</p>
      </div>
      
      <!-- Add Work Type Button - only show in active view -->
      <button 
        v-if="!showDeleted"
        @click="openCreateModal"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Add Work Type
      </button>
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
          :placeholder="showDeleted ? 'Search deleted work types...' : 'Search work types by slug...'"
          class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- Tabs: Active / Deleted -->
    <div class="mb-6 border-b border-slate-200 dark:border-slate-700">
      <div class="flex gap-4">
        <button
          @click="showDeleted = false"
          class="px-4 py-2 text-sm font-medium transition-colors relative"
          :class="[
            !showDeleted 
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          ]"
        >
          Active Work Types
        </button>
        <button
          @click="showDeleted = true"
          class="px-4 py-2 text-sm font-medium transition-colors relative"
          :class="[
            showDeleted 
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          ]"
        >
          Deleted Work Types
        </button>
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
        @click="fetchWorkTypes" 
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
      :title="showDeleted ? 'Deleted Work Types' : 'Active Work Types'" 
      :columns="columns" 
      :rows="workTypes"
      :loading="loading"
      @update:page="handlePageChange"
      @update:perPage="handlePerPageChange"
    >
      <!-- Slug cell -->
      <template #cell-slug="{ row }">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-8 h-8 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center text-sm font-semibold text-primary-600 dark:text-primary-400">
            {{ getWorkTypeInitial(row) }}
          </div>
          <div class="text-sm font-medium text-slate-900 dark:text-white">{{ row.slug }}</div>
        </div>
      </template>

      <!-- Name cell from translations -->
      <template #cell-name="{ row }">
        <div class="text-sm text-slate-900 dark:text-white">
          {{ getWorkTypeName(row) }}
        </div>
      </template>

      <!-- Status cell (for active view) -->
      <template #cell-status="{ row }">
        <span 
          v-if="!showDeleted"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="{
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300': row.isActive && !row.deletedAt,
            'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300': !row.isActive && !row.deletedAt
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

      <!-- Deleted At cell (for deleted view) -->
      <template #cell-deletedAt="{ row }">
        <span v-if="showDeleted" class="text-sm text-slate-600 dark:text-slate-400">
          {{ formatDate(row.deletedAt) }}
        </span>
      </template>

      <!-- Actions -->
      <template #cell-actions="{ row }">
        <div class="flex items-center gap-2 justify-end">
          <!-- Edit button - only show for active work types -->
          <button 
            v-if="!showDeleted"
            @click="openEditModal(row)"
            class="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
            title="Edit Work Type"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          
          <!-- Restore button - only show for deleted work types -->
          <button 
            v-if="showDeleted"
            @click="confirmRestore(row)"
            class="text-slate-600 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 transition-colors"
            title="Restore Work Type"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <!-- Delete button -->
          <button 
            @click="confirmDelete(row)"
            class="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
            :title="showDeleted ? 'Permanently Delete' : 'Delete Work Type'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </template>

      <!-- Empty state -->
      <template #empty>
        <div class="text-center py-8 text-slate-500 dark:text-slate-400">
          {{ showDeleted ? 'No deleted work types found' : 'No work types found' }}
        </div>
      </template>
    </DataTable>

    <!-- Work Type Form Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-container">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                {{ isEdit ? 'Edit Work Type' : 'Create New Work Type' }}
              </h3>
              <button @click="closeModal" class="modal-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <form @submit.prevent="handleSubmit" class="modal-body">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Slug <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="form.slug" 
                    type="text"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g., full-time, part-time, contract"
                    required
                  />
                  <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Unique identifier, will be used in URLs (lowercase, no spaces, use hyphens)
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Display Name
                  </label>
                  <input 
                    v-model="form.name" 
                    type="text"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g., Full Time, Part Time, Contract"
                  />
                  <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Optional: Display name for the work type (will use slug if not provided)
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea 
                    v-model="form.description" 
                    rows="3"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    placeholder="Optional description..."
                  ></textarea>
                </div>

                <div v-if="isEdit">
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
                <button 
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  :disabled="submitting"
                >
                  <span v-if="submitting" class="flex items-center gap-2">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </span>
                  <span v-else>{{ isEdit ? 'Update' : 'Create' }}</span>
                </button>
              </div>
            </form>
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
                {{ showDeleted ? 'Permanently Delete Work Type' : 'Delete Work Type' }}
              </h3>
              <button @click="showDeleteModal = false" class="modal-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div class="modal-body">
              <p class="text-slate-600 dark:text-slate-400">
                Are you sure you want to 
                <span v-if="showDeleted">permanently delete</span>
                <span v-else>delete</span> 
                work type "{{ selectedWorkType?.slug }}"?
                <span v-if="!showDeleted" class="block mt-2 text-sm text-amber-600 dark:text-amber-400">
                  Note: This will soft delete the work type. You can restore it later from the deleted tab.
                </span>
                <span v-else class="block mt-2 text-sm text-red-600 dark:text-red-400">
                  Warning: This action cannot be undone. The work type will be permanently removed from the database.
                </span>
              </p>
              <p v-if="deleteError" class="mt-2 text-sm text-red-600 dark:text-red-400">
                Error: {{ deleteError }}
              </p>
            </div>

            <div class="modal-footer">
              <button 
                @click="showDeleteModal = false"
                class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                @click="handleDelete"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                :disabled="deleting"
              >
                <span v-if="deleting" class="flex items-center gap-2">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {{ showDeleted ? 'Deleting...' : 'Deleting...' }}
                </span>
                <span v-else>{{ showDeleted ? 'Delete Permanently' : 'Delete' }}</span>
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
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Restore Work Type</h3>
              <button @click="showRestoreModal = false" class="modal-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div class="modal-body">
              <p class="text-slate-600 dark:text-slate-400">
                Are you sure you want to restore work type "{{ selectedWorkType?.slug }}"?
              </p>
              <p v-if="restoreError" class="mt-2 text-sm text-red-600 dark:text-red-400">
                Error: {{ restoreError }}
              </p>
            </div>

            <div class="modal-footer">
              <button 
                @click="showRestoreModal = false"
                class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                @click="handleRestore"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                :disabled="restoring"
              >
                <span v-if="restoring" class="flex items-center gap-2">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Restoring...
                </span>
                <span v-else>Restore</span>
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
import { useWorkTypes, type WorkType } from '~/composables/useWorkTypes'

// definePageMeta({
//   middleware: 'auth'
// })

const { isAuthenticated } = useAuth()
const { 
  getWorkTypes, 
  getDeletedWorkTypes,
  getWorkTypeById, 
  createWorkType, 
  updateWorkType, 
  deleteWorkType,
  restoreWorkType 
} = useWorkTypes()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const deleteError = ref<string | null>(null)
const restoreError = ref<string | null>(null)
const workTypes = ref<WorkType[]>([])
const submitting = ref(false)
const deleting = ref(false)
const restoring = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const showRestoreModal = ref(false)
const selectedWorkType = ref<WorkType | null>(null)
const isEdit = ref(false)

// Search and filter state
const searchQuery = ref('')
const searchTimeout = ref<NodeJS.Timeout | null>(null)
const showDeleted = ref(false)

const page = ref(1)
const perPage = ref(10)

// Form state
const form = ref({
  id: '',
  slug: '',
  name: '',
  description: '',
  isActive: true
})

// Table columns based on view
const columns = computed(() => {
  const baseColumns = [
    { key: 'slug', label: 'Slug' },
    { key: 'name', label: 'Name' }
  ]
  
  if (showDeleted.value) {
    baseColumns.push(
      { key: 'deletedAt', label: 'Deleted At' }
    )
  } else {
    baseColumns.push(
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Created' }
    )
  }
  
  baseColumns.push({ key: 'actions', label: 'Actions' })
  
  return baseColumns
})

// Helper function to get work type name from translations
const getWorkTypeName = (workType: WorkType): string => {
  if (workType.translations && workType.translations.length > 0) {
    // Coba cari translation untuk locale yang dipilih atau default ke first
    const translation = workType.translations[0]
    return translation?.name || workType.slug
  }
  return workType.slug
}

// Helper: get work type initial for avatar
const getWorkTypeInitial = (workType: WorkType): string => {
  const name = getWorkTypeName(workType)
  return name ? name.charAt(0).toUpperCase() : '?'
}

// Helper: format date
const formatDate = (timestamp: number | null | undefined): string => {
  if (timestamp == null || timestamp === 0) return '-'
  try {
    return new Date(timestamp * 1000).toLocaleDateString()
  } catch {
    return '-'
  }
}

// Search handler with debounce
const handleSearch = (): void => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  searchTimeout.value = setTimeout(async () => {
    page.value = 1
    await fetchWorkTypes()
  }, 500)
}

// Handle page change
const handlePageChange = (newPage: number): void => {
  page.value = newPage
  fetchWorkTypes()
}

// Handle perPage change
const handlePerPageChange = (value: number): void => {
  perPage.value = value
  page.value = 1
  fetchWorkTypes()
}

// Fetch work types from API
const fetchWorkTypes = async (): Promise<void> => {
  if (!isAuthenticated.value) return
  
  loading.value = true
  error.value = null
  
  try {
    let response: WorkType[] = []
    
    // Log the search query to debug
    console.log('Search query:', searchQuery.value)
    
    if (showDeleted.value) {
      console.log('Fetching deleted work types with params:', {
        page: page.value,
        limit: perPage.value,
        search: searchQuery.value || undefined
      })
      
      response = await getDeletedWorkTypes({
        page: page.value,
        limit: perPage.value,
        search: searchQuery.value || undefined
      })
    } else {
      console.log('Fetching active work types with params:', {
        page: page.value,
        limit: perPage.value,
        search: searchQuery.value || undefined
      })
      
      response = await getWorkTypes({
        page: page.value,
        limit: perPage.value,
        search: searchQuery.value || undefined
      })
    }
    
    console.log('Work types received:', response)
    
    // Filter the response manually if the backend doesn't support search
    if (searchQuery.value && response.length > 0) {
      const filtered = response.filter(item => 
        item.slug.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
      console.log('Filtered work types:', filtered)
      workTypes.value = filtered
    } else {
      workTypes.value = response
    }
    
  } catch (err: any) {
    console.error('Fetch error:', err)
    error.value = err.message || 'Failed to fetch work types'
    
    if (err?.response?.status === 401) {
      error.value = 'Session expired. Please login again.'
    }
  } finally {
    loading.value = false
  }
}

// Modal handlers
const openCreateModal = (): void => {
  isEdit.value = false
  form.value = {
    id: '',
    slug: '',
    name: '',
    description: '',
    isActive: true
  }
  showModal.value = true
}

const openEditModal = async (workType: WorkType): Promise<void> => {
  isEdit.value = true
  selectedWorkType.value = workType
  
  // Fetch detailed work type with translations
  try {
    const detailed = await getWorkTypeById(workType.id, true)
    const translation = detailed.translations?.[0]
    
    form.value = {
      id: workType.id,
      slug: workType.slug,
      name: translation?.name || '',
      description: translation?.description || '',
      isActive: workType.isActive
    }
  } catch (err) {
    console.error('Failed to fetch work type details:', err)
    // Fallback to basic data
    form.value = {
      id: workType.id,
      slug: workType.slug,
      name: '',
      description: '',
      isActive: workType.isActive
    }
  }
  
  showModal.value = true
}

const closeModal = (): void => {
  showModal.value = false
  selectedWorkType.value = null
}

// Form submission
const handleSubmit = async (): Promise<void> => {
  if (!form.value.slug) {
    error.value = 'Slug is required'
    return
  }

  submitting.value = true
  error.value = null
  
  try {
    // Prepare translations array
    const translations = []
    if (form.value.name || form.value.description) {
      translations.push({
        localeCode: 'en', // Default to English, you might want to make this dynamic
        name: form.value.name || form.value.slug,
        description: form.value.description || null
      })
    }
    
    if (isEdit.value && selectedWorkType.value) {
      await updateWorkType(selectedWorkType.value.id, {
        slug: form.value.slug !== selectedWorkType.value.slug ? form.value.slug : undefined,
        isActive: form.value.isActive,
        translations: translations.length > 0 ? translations : undefined
      })
    } else {
      await createWorkType({
        slug: form.value.slug,
        translations: translations.length > 0 ? translations : []
      })
    }
    
    closeModal()
    await fetchWorkTypes()
  } catch (err: any) {
    console.error('Failed to save work type:', err)
    error.value = err.message || `Failed to ${isEdit.value ? 'update' : 'create'} work type`
  } finally {
    submitting.value = false
  }
}

// Delete handlers
const confirmDelete = (workType: WorkType): void => {
  selectedWorkType.value = workType
  deleteError.value = null
  showDeleteModal.value = true
}

const handleDelete = async (): Promise<void> => {
  if (!selectedWorkType.value) return
  
  deleting.value = true
  deleteError.value = null
  
  try {
    await deleteWorkType(selectedWorkType.value.id)
    
    showDeleteModal.value = false
    selectedWorkType.value = null
    await fetchWorkTypes()
  } catch (err: any) {
    console.error('Failed to delete work type:', err)
    
    if (err.message?.includes('foreign key') || err.data?.message?.includes('foreign key')) {
      deleteError.value = 'Cannot delete work type because it has associated jobs. Please delete or reassign the jobs first.'
    } else {
      deleteError.value = err.message || 'Failed to delete work type'
    }
  } finally {
    deleting.value = false
  }
}

// Restore handlers
const confirmRestore = (workType: WorkType): void => {
  selectedWorkType.value = workType
  restoreError.value = null
  showRestoreModal.value = true
}

const handleRestore = async (): Promise<void> => {
  if (!selectedWorkType.value) return
  
  restoring.value = true
  restoreError.value = null
  
  try {
    await restoreWorkType(selectedWorkType.value.id)
    showRestoreModal.value = false
    selectedWorkType.value = null
    await fetchWorkTypes()
  } catch (err: any) {
    console.error('Failed to restore work type:', err)
    restoreError.value = err.message || 'Failed to restore work type'
  } finally {
    restoring.value = false
  }
}

// Login handler
const handleLogin = async (): Promise<void> => {
  await navigateTo('/login')
}

// Watch for authentication changes
watch(() => isAuthenticated.value, (newValue: boolean) => {
  if (newValue) {
    fetchWorkTypes()
  }
})

// Watch for showDeleted changes
watch(showDeleted, () => {
  page.value = 1
  fetchWorkTypes()
})

// Initial fetch
onMounted(() => {
  console.log('Component mounted, isAuthenticated:', isAuthenticated.value)
  if (isAuthenticated.value) {
    fetchWorkTypes()
  }
})
</script>
<style scoped>
/* Modal Styles - same as before */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
  padding: 1rem;
}

.modal-container {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modal-slide-up 0.3s ease-out;
}

.modal-container.modal-sm {
  max-width: 400px;
}

.dark .modal-container {
  background-color: #1e293b;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.dark .modal-header {
  border-bottom-color: #334155;
}

.modal-close-btn {
  padding: 0.5rem;
  border-radius: 0.5rem;
  color: #64748b;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.dark .modal-close-btn:hover {
  background-color: #334155;
  color: #f1f5f9;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
}

.dark .modal-footer {
  border-top-color: #334155;
  background-color: #0f172a;
}

/* Modal Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: translateY(-20px);
}

@keyframes modal-slide-up {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>