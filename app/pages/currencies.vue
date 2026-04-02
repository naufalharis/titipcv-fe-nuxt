<template>
  <div class="animate-fade-in">
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Currencies Management</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage all currencies in your application.</p>
      </div>
      
      <!-- Add Currency Button - only show in active view -->
      <button 
        v-if="!showDeleted"
        @click="openCreateModal"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Add Currency
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
          placeholder="Search currencies by name or code..."
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
          Active Currencies
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
          Deleted Currencies
        </button>
      </div>
    </div>

    <!-- Quick Code Search -->
    <div class="mb-4 flex items-center gap-2">
      <span class="text-sm text-slate-500 dark:text-slate-400">Quick lookup by code:</span>
      <input
        v-model="codeSearch"
        type="text"
        placeholder="e.g., USD, EUR, IDR"
        maxlength="3"
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
          <h3 class="font-medium text-slate-900 dark:text-white">Currency Found:</h3>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            {{ codeSearchResult.name }} ({{ codeSearchResult.code }}) - {{ codeSearchResult.symbol }}
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
        @click="fetchCurrencies" 
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
      :title="showDeleted ? 'Deleted Currencies' : 'Active Currencies'" 
      :columns="columns" 
      :rows="currencies"
      :loading="loading"
    >
      <!-- Customizing the Currency cell -->
      <template #cell-currency="{ row }">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center text-lg font-semibold text-primary-600 dark:text-primary-400">
            {{ (row as Currency).symbol }}
          </div>
          <div>
            <div class="text-sm font-medium text-slate-900 dark:text-white">{{ (row as Currency).name }}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400">ID: {{ (row as Currency).id.slice(0, 8) }}...</div>
          </div>
        </div>
      </template>

      <!-- Code cell -->
      <template #cell-code="{ row }">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 uppercase">
          {{ (row as Currency).code }}
        </span>
      </template>

      <!-- Symbol cell -->
      <template #cell-symbol="{ row }">
        <span class="text-lg font-semibold text-slate-700 dark:text-slate-300">
          {{ (row as Currency).symbol }}
        </span>
      </template>

      <!-- Created At cell -->
      <template #cell-createdAt="{ row }">
        <span class="text-sm text-slate-600 dark:text-slate-400">
          {{ formatDate((row as Currency).createdAt) }}
        </span>
      </template>

      <!-- Deleted At cell (for deleted view) -->
      <template #cell-deletedAt="{ row }">
        <span v-if="showDeleted" class="text-sm text-slate-600 dark:text-slate-400">
          {{ formatDate((row as Currency).deletedAt) }}
        </span>
      </template>

      <!-- Status cell (for active view) -->
      <template #cell-status="{ row }">
        <span 
          v-if="!showDeleted"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="{
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300': !(row as Currency).deletedAt,
            'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300': (row as Currency).deletedAt
          }"
        >
          <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="{
            'bg-emerald-500': !(row as Currency).deletedAt,
            'bg-slate-500': (row as Currency).deletedAt
          }"></span>
          {{ (row as Currency).deletedAt ? 'Deleted' : 'Active' }}
        </span>
      </template>

      <!-- Actions -->
      <template #cell-actions="{ row }">
        <div class="flex items-center gap-2">
          <!-- Edit button - only show for active currencies -->
          <button 
            v-if="!showDeleted"
            @click="openEditModal(row as Currency)"
            class="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
            title="Edit Currency"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          
          <!-- Restore button - only show for deleted currencies -->
          <button 
            v-if="showDeleted"
            @click="handleRestore(row as Currency)"
            class="text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
            title="Restore Currency"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <!-- Delete button -->
          <button 
            @click="confirmDelete(row as Currency)"
            class="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
            :title="showDeleted ? 'Permanently Delete' : 'Delete Currency'"
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
          {{ showDeleted ? 'No deleted currencies found' : 'No currencies found' }}
        </div>
      </template>
    </DataTable>

    <!-- Currency Form Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" @click.self="closeModal">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modal-slide-up">
            <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                {{ isEdit ? 'Edit Currency' : 'Create New Currency' }}
              </h3>
              <button @click="closeModal" class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <form @submit.prevent="handleSubmit" class="p-6">
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Currency Code <span class="text-red-500">*</span>
                    </label>
                    <input 
                      v-model="form.code" 
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white uppercase"
                      placeholder="e.g., USD, EUR, IDR"
                      maxlength="3"
                      required
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Symbol <span class="text-red-500">*</span>
                    </label>
                    <input 
                      v-model="form.symbol" 
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      placeholder="e.g., $, €, Rp"
                      maxlength="5"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Currency Name <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="form.name" 
                    type="text"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g., US Dollar, Euro, Indonesian Rupiah"
                    required
                  />
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
                {{ showDeleted ? 'Permanently Delete Currency' : 'Delete Currency' }}
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
                currency "{{ selectedCurrency?.name }}" ({{ selectedCurrency?.code }})?
                <span v-if="!showDeleted" class="block mt-2 text-sm text-amber-600 dark:text-amber-400">
                  Note: This will soft delete the currency. You can restore it later from the deleted currencies tab.
                </span>
                <span v-else class="block mt-2 text-sm text-red-600 dark:text-red-400">
                  Warning: This action cannot be undone. The currency will be permanently removed from the database.
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
import { useCurrencies, type Currency } from '~/composables/useCurrencies'

// definePageMeta({
//   middleware: 'auth'
// })

const { isAuthenticated } = useAuth()
const { 
  getCurrencies, 
  searchCurrencies,
  getCurrencyByCode,
  getDeletedCurrencies,
  createCurrency, 
  updateCurrency, 
  deleteCurrency,
  restoreCurrency,
  permanentDeleteCurrency 
} = useCurrencies()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const currencies = ref<Currency[]>([])
const submitting = ref(false)
const deleting = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const selectedCurrency = ref<Currency | null>(null)
const isEdit = ref(false)

// Search and filter state
const searchQuery = ref('')
const searchTimeout = ref<NodeJS.Timeout | null>(null)
const showDeleted = ref(false)
const codeSearch = ref('')
const codeSearchResult = ref<Currency | null>(null)

const page = ref(1)
const perPage = ref(10)

// Form state
const form = ref({
  id: '',
  code: '',
  name: '',
  symbol: ''
})

// Table columns based on view
const columns = computed(() => {
  const baseColumns = [
    { key: 'currency', label: 'Currency' },
    { key: 'code', label: 'Code' },
    { key: 'symbol', label: 'Symbol' }
  ]
  
  if (showDeleted.value) {
    baseColumns.push({ key: 'deletedAt', label: 'Deleted At' })
  } else {
    baseColumns.push(
      { key: 'createdAt', label: 'Created' },
      { key: 'status', label: 'Status' }
    )
  }
  
  return baseColumns
})

// Helper function to format date
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
    await fetchCurrencies()
  }, 500)
}

// Search by code
const searchByCode = async (): Promise<void> => {
  if (!codeSearch.value || codeSearch.value.length < 2) {
    error.value = 'Please enter a valid currency code'
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const result = await getCurrencyByCode(codeSearch.value)
    codeSearchResult.value = result
    codeSearch.value = ''
  } catch (err: any) {
    error.value = err.message || 'Currency not found'
    codeSearchResult.value = null
  } finally {
    loading.value = false
  }
}

// Fetch currencies from API
const fetchCurrencies = async () => {
  if (!isAuthenticated.value) return
  
  loading.value = true
  error.value = null
  
  try {
    let response: Currency[]
    
    if (showDeleted.value) {
      // Fetch deleted currencies
      response = await getDeletedCurrencies(searchQuery.value || undefined)
    } else {
      if (searchQuery.value) {
        // Search currencies
        response = await searchCurrencies(searchQuery.value)
      } else {
        // Fetch all active currencies
        response = await getCurrencies()
      }
    }
    
    currencies.value = response
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch currencies'
    console.error('Failed to fetch currencies:', err)
    
    if (err?.response?.status === 401) {
      error.value = 'Session expired. Please login again.'
    }
  } finally {
    loading.value = false
  }
}

// Modal handlers
const openCreateModal = () => {
  isEdit.value = false
  form.value = {
    id: '',
    code: '',
    name: '',
    symbol: ''
  }
  showModal.value = true
}

const openEditModal = (currency: Currency) => {
  isEdit.value = true
  selectedCurrency.value = currency
  form.value = {
    id: currency.id,
    code: currency.code,
    name: currency.name,
    symbol: currency.symbol
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedCurrency.value = null
}

// Form submission
const handleSubmit = async () => {
  // Validate form
  if (!form.value.code || !form.value.name || !form.value.symbol) {
    error.value = 'Please fill in all required fields'
    return
  }

  submitting.value = true
  error.value = null
  
  try {
    if (isEdit.value && selectedCurrency.value) {
      await updateCurrency(selectedCurrency.value.id, {
        code: form.value.code.toUpperCase(),
        name: form.value.name,
        symbol: form.value.symbol
      })
    } else {
      await createCurrency({
        code: form.value.code.toUpperCase(),
        name: form.value.name,
        symbol: form.value.symbol
      })
    }
    
    closeModal()
    await fetchCurrencies()
  } catch (err: any) {
    error.value = err.message || `Failed to ${isEdit.value ? 'update' : 'create'} currency`
    console.error('Failed to save currency:', err)
  } finally {
    submitting.value = false
  }
}

// Delete handlers
const confirmDelete = (currency: Currency) => {
  selectedCurrency.value = currency
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!selectedCurrency.value) return
  
  deleting.value = true
  error.value = null
  
  try {
    if (showDeleted.value) {
      // Permanent delete
      await permanentDeleteCurrency(selectedCurrency.value.id)
    } else {
      // Soft delete
      await deleteCurrency(selectedCurrency.value.id)
    }
    
    showDeleteModal.value = false
    selectedCurrency.value = null
    await fetchCurrencies()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete currency'
    console.error('Failed to delete currency:', err)
  } finally {
    deleting.value = false
  }
}

// Restore handler
const handleRestore = async (currency: Currency) => {
  if (!confirm(`Are you sure you want to restore "${currency.name}"?`)) {
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    await restoreCurrency(currency.id)
    await fetchCurrencies()
  } catch (err: any) {
    error.value = err.message || 'Failed to restore currency'
    console.error('Failed to restore currency:', err)
  } finally {
    loading.value = false
  }
}

// Login handler
const handleLogin = async () => {
  await navigateTo('/login')
}

// Watch for authentication changes
watch(() => isAuthenticated.value, (newValue) => {
  if (newValue) {
    fetchCurrencies()
  }
})

// Watch for showDeleted changes
watch(showDeleted, () => {
  fetchCurrencies()
})

// Initial fetch
onMounted(() => {
  if (isAuthenticated.value) {
    fetchCurrencies()
  }
})
</script>

<!-- Hapus tag <style scoped> karena sudah menggunakan Tailwind -->