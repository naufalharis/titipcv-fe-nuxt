<template>
  <div class="animate-fade-in">
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Countries Management</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage all countries in your application.</p>
      </div>
      
      <!-- Add Country Button -->
      <button 
        @click="openCreateModal"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Add Country
      </button>
    </div>

    <!-- Search and Filter Bar -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <!-- Search Input -->
      <div class="flex-1 relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search countries by name or code..."
          class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
          @input="handleSearch"
        />
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-2">
        <button
          @click="showDeleted = false"
          class="px-4 py-2 rounded-lg transition-colors"
          :class="[
            !showDeleted 
              ? 'bg-primary-600 text-white' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          ]"
        >
          Active Countries
        </button>
        <button
          @click="showDeleted = true"
          class="px-4 py-2 rounded-lg transition-colors"
          :class="[
            showDeleted 
              ? 'bg-primary-600 text-white' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          ]"
        >
          Deleted Countries
        </button>
      </div>
    </div>

    <!-- Quick Code Search -->
    <div class="mb-4 flex items-center gap-2">
      <span class="text-sm text-slate-500 dark:text-slate-400">Quick lookup by code:</span>
      <input
        v-model="codeSearch"
        type="text"
        placeholder="e.g., AF, ID, US"
        maxlength="2"
        class="w-24 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white uppercase"
        @keyup.enter="searchByCode"
      />
      <button
        @click="searchByCode"
        class="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
      >
        Find
      </button>
    </div>

    <!-- Result for code search -->
    <div v-if="codeSearchResult" class="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-medium text-slate-900 dark:text-white">Country Found:</h3>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            {{ codeSearchResult.name }} ({{ codeSearchResult.code }})
            <span v-if="codeSearchResult.phoneCode"> - +{{ codeSearchResult.phoneCode }}</span>
          </p>
        </div>
        <button
          @click="codeSearchResult = null"
          class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
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
        @click="fetchCountries" 
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
      v-model:page="page"
      v-model:perPage="perPage"
      :title="showDeleted ? 'Deleted Countries' : 'All Countries'" 
      :columns="columns" 
      :rows="countries"
      :loading="loading"
    >
      <!-- Customizing the Country cell -->
      <template #cell-country="{ row }">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-lg font-semibold text-slate-600 dark:text-slate-400">
            {{ (row as Country).code }}
          </div>
          <div>
            <div class="text-sm font-medium text-slate-900 dark:text-white">{{ (row as Country).name }}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400">ID: {{ (row as Country).id.slice(0, 8) }}...</div>
          </div>
        </div>
      </template>

      <!-- Customizing the Phone Code cell -->
      <template #cell-phoneCode="{ row }">
        <span class="text-sm text-slate-600 dark:text-slate-400">
          {{ (row as Country).phoneCode ? `+${(row as Country).phoneCode}` : '-' }}
        </span>
      </template>

      <!-- Customizing the Status cell -->
      <template #cell-status="{ row }">
        <span 
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="{
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300': (row as Country).isActive,
            'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300': !(row as Country).isActive
          }"
        >
          <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="{
            'bg-emerald-500': (row as Country).isActive,
            'bg-slate-500': !(row as Country).isActive
          }"></span>
          {{ (row as Country).isActive ? 'Active' : 'Inactive' }}
        </span>
      </template>

      <!-- Customizing the Created At cell -->
      <template #cell-createdAt="{ row }">
        <span class="text-sm text-slate-600 dark:text-slate-400">
          {{ (row as Country).createdAt ? new Date((row as Country).createdAt!).toLocaleDateString() : '-' }}
        </span>
      </template>

      <!-- Customizing the Deleted At cell -->
      <template #cell-deletedAt="{ row }">
        <span class="text-sm text-slate-600 dark:text-slate-400">
          {{ (row as Country).deletedAt ? new Date((row as Country).deletedAt!).toLocaleDateString() : '-' }}
        </span>
      </template>

      <!-- Actions -->
      <template #cell-actions="{ row }">
        <div class="flex items-center gap-2">
          <!-- Edit button - only show for active countries -->
          <button 
            v-if="!showDeleted"
            @click="openEditModal(row as Country)"
            class="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
            title="Edit Country"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          
          <!-- Restore button - only show for deleted countries -->
          <button 
            v-if="showDeleted"
            @click="handleRestore(row as Country)"
            class="text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
            title="Restore Country"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <!-- Delete button -->
          <button 
            @click="confirmDelete(row as Country)"
            class="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
            :title="showDeleted ? 'Permanently Delete' : 'Delete Country'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Country Form Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" @click.self="closeModal">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modal-slide-up">
            <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                {{ isEdit ? 'Edit Country' : 'Create New Country' }}
              </h3>
              <button @click="closeModal" class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <form @submit.prevent="handleSubmit" class="p-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Country Name <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="form.name" 
                    type="text"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g., Indonesia"
                    required
                  />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Country Code <span class="text-red-500">*</span>
                    </label>
                    <input 
                      v-model="form.code" 
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white uppercase"
                      placeholder="e.g., ID"
                      maxlength="2"
                      required
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Phone Code
                    </label>
                    <input 
                      v-model="form.phoneCode" 
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      placeholder="e.g., 62"
                    />
                  </div>
                </div>

                <div>
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

              <div class="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button 
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" @click.self="showDeleteModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md animate-modal-slide-up">
            <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                {{ showDeleted ? 'Permanently Delete Country' : 'Delete Country' }}
              </h3>
              <button @click="showDeleteModal = false" class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div class="p-6">
              <p class="text-slate-600 dark:text-slate-400">
                Are you sure you want to 
                <span v-if="showDeleted">permanently delete</span>
                <span v-else>delete</span> 
                country "{{ selectedCountry?.name }}" ({{ selectedCountry?.code }})?
                <span v-if="!showDeleted" class="block mt-2 text-sm text-amber-600 dark:text-amber-400">
                  Note: This will soft delete the country. You can restore it later from the deleted countries tab.
                </span>
                <span v-else class="block mt-2 text-sm text-red-600 dark:text-red-400">
                  Warning: This action cannot be undone. The country will be permanently removed from the database.
                </span>
              </p>
            </div>

            <div class="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <button 
                @click="showDeleteModal = false"
                class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                @click="handleDelete"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="deleting"
              >
                <span v-if="deleting" class="flex items-center gap-2">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Deleting...
                </span>
                <span v-else>{{ showDeleted ? 'Permanently Delete' : 'Delete' }}</span>
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
import { useCountries, type Country } from '~/composables/useCountries'

const { isAuthenticated } = useAuth()
const { 
  getCountries, 
  getDeletedCountries,
  getCountryByCode,
  createCountry, 
  updateCountry, 
  deleteCountry,
  restoreCountry,
  permanentDeleteCountry,
  searchCountries
} = useCountries()

// State
const loading = ref<boolean>(false)
const error = ref<string | null>(null)
const countries = ref<Country[]>([])
const submitting = ref<boolean>(false)
const deleting = ref<boolean>(false)
const showModal = ref<boolean>(false)
const showDeleteModal = ref<boolean>(false)
const selectedCountry = ref<Country | null>(null)
const isEdit = ref<boolean>(false)

// Search and filter state
const searchQuery = ref<string>('')
const searchTimeout = ref<NodeJS.Timeout | null>(null)
const showDeleted = ref<boolean>(false)
const codeSearch = ref<string>('')
const codeSearchResult = ref<Country | null>(null)

// Form state
const form = ref({
  name: '',
  code: '',
  phoneCode: '',
  isActive: true
})

const page = ref(1)
const perPage = ref(10)

// Table columns based on view
const columns = computed(() => {
  const baseColumns = [
    { key: 'country', label: 'Country' },
    { key: 'phoneCode', label: 'Phone Code' },
    { key: 'status', label: 'Status' }
  ]
  
  if (showDeleted.value) {
    baseColumns.push({ key: 'deletedAt', label: 'Deleted At' })
  } else {
    baseColumns.push({ key: 'createdAt', label: 'Created At' })
  }
  
  return baseColumns
})

// Search handler with debounce
const handleSearch = (): void => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  searchTimeout.value = setTimeout(async () => {
    await fetchCountries()
  }, 500)
}

// Search by code
const searchByCode = async (): Promise<void> => {
  if (!codeSearch.value || codeSearch.value.length !== 2) {
    error.value = 'Please enter a valid 2-letter country code'
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const result = await getCountryByCode(codeSearch.value)
    codeSearchResult.value = result
    codeSearch.value = ''
  } catch (err: any) {
    error.value = err.message || 'Country not found'
    codeSearchResult.value = null
  } finally {
    loading.value = false
  }
}

// Fetch countries from API
const fetchCountries = async (): Promise<void> => {
  if (!isAuthenticated.value) return
  
  loading.value = true
  error.value = null
  
  try {
    let response: Country[]
    
    if (showDeleted.value) {
      response = await getDeletedCountries(searchQuery.value || undefined)
    } else {
      if (searchQuery.value) {
        response = await searchCountries(searchQuery.value)
      } else {
        response = await getCountries()
      }
    }
    
    countries.value = response
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch countries'
    console.error('Failed to fetch countries:', err)
    
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
    name: '',
    code: '',
    phoneCode: '',
    isActive: true
  }
  showModal.value = true
}

const openEditModal = (country: Country): void => {
  isEdit.value = true
  selectedCountry.value = country
  form.value = {
    name: country.name,
    code: country.code,
    phoneCode: country.phoneCode || '',
    isActive: country.isActive
  }
  showModal.value = true
}

const closeModal = (): void => {
  showModal.value = false
  selectedCountry.value = null
}

// Form submission
const handleSubmit = async (): Promise<void> => {
  // Validate form
  if (!form.value.name || !form.value.code) {
    error.value = 'Please fill in all required fields'
    return
  }

  // Validate country code length
  if (form.value.code.length !== 2) {
    error.value = 'Country code must be exactly 2 characters'
    return
  }

  submitting.value = true
  error.value = null
  
  try {
    if (isEdit.value && selectedCountry.value) {
      await updateCountry(selectedCountry.value.id, {
        name: form.value.name,
        code: form.value.code.toUpperCase(),
        phoneCode: form.value.phoneCode || undefined,
        isActive: form.value.isActive
      })
    } else {
      await createCountry({
        name: form.value.name,
        code: form.value.code.toUpperCase(),
        phoneCode: form.value.phoneCode || undefined,
        isActive: form.value.isActive
      })
    }
    
    closeModal()
    await fetchCountries()
  } catch (err: any) {
    error.value = err.message || `Failed to ${isEdit.value ? 'update' : 'create'} country`
    console.error('Failed to save country:', err)
  } finally {
    submitting.value = false
  }
}

// Delete handlers
const confirmDelete = (country: Country): void => {
  selectedCountry.value = country
  showDeleteModal.value = true
}

const handleDelete = async (): Promise<void> => {
  if (!selectedCountry.value) return
  
  deleting.value = true
  error.value = null
  
  try {
    if (showDeleted.value) {
      await permanentDeleteCountry(selectedCountry.value.id)
    } else {
      await deleteCountry(selectedCountry.value.id)
    }
    
    showDeleteModal.value = false
    selectedCountry.value = null
    await fetchCountries()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete country'
    console.error('Failed to delete country:', err)
  } finally {
    deleting.value = false
  }
}

// Restore handler
const handleRestore = async (country: Country): Promise<void> => {
  if (!confirm(`Are you sure you want to restore "${country.name}"?`)) {
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    await restoreCountry(country.id)
    await fetchCountries()
  } catch (err: any) {
    error.value = err.message || 'Failed to restore country'
    console.error('Failed to restore country:', err)
  } finally {
    loading.value = false
  }
}

// Login handler
const handleLogin = async (): Promise<void> => {
  await navigateTo('/login')
}

// Convert code to uppercase as user types
watch(() => form.value.code, (newCode) => {
  if (newCode) {
    form.value.code = newCode.toUpperCase()
  }
})

// Watch for authentication changes
watch(() => isAuthenticated.value, (newValue) => {
  if (newValue) {
    fetchCountries()
  }
})

// Watch for showDeleted changes
watch(showDeleted, () => {
  fetchCountries()
})

// Initial fetch
onMounted(() => {
  if (isAuthenticated.value) {
    fetchCountries()
  }
})
</script>
