<template>
  <div class="animate-fade-in">
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Job Categories Management</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage all job categories in your application.</p>
      </div>
      
      <!-- Add Category Button -->
      <button 
        @click="openCreateModal"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Add Category
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
          placeholder="Search categories by name or slug..."
          class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
          @input="handleSearch"
        />
      </div>

      <!-- Parent Category Filter -->
      <div class="w-64">
        <select
          v-model="selectedParent"
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
        >
          <option value="">All Categories</option>
          <option value="root">Root Categories (No Parent)</option>
          <option v-for="cat in parentCategories" :key="cat.id" :value="cat.id">
            {{ getCategoryName(cat) }}
          </option>
        </select>
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
        @click="fetchCategories" 
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
      title="Job Categories" 
      :columns="columns" 
      :rows="filteredCategories"
      :loading="loading"
    >
      <!-- Customizing the Name cell -->
      <template #cell-name="{ row }">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-8 h-8 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center text-sm font-semibold text-primary-600 dark:text-primary-400">
            {{ getCategoryInitial(row as JobCategory) }}
          </div>
          <div>
            <div class="text-sm font-medium text-slate-900 dark:text-white">{{ getCategoryName(row as JobCategory) }}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Slug: {{ (row as JobCategory).slug }}</div>
          </div>
        </div>
      </template>

      <!-- Parent cell -->
      <template #cell-parent="{ row }">
        <span v-if="(row as JobCategory).parentId" class="text-sm text-slate-600 dark:text-slate-400">
          {{ getParentName((row as JobCategory).parentId as string) }}
        </span>
        <span v-else class="text-sm text-slate-400 dark:text-slate-500 italic">Root</span>
      </template>

      <!-- Status cell -->
      <template #cell-status="{ row }">
        <span 
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="{
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300': (row as JobCategory).isActive,
            'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300': !(row as JobCategory).isActive
          }"
        >
          <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="{
            'bg-emerald-500': (row as JobCategory).isActive,
            'bg-slate-500': !(row as JobCategory).isActive
          }"></span>
          {{ (row as JobCategory).isActive ? 'Active' : 'Inactive' }}
        </span>
      </template>

      <!-- Created At cell -->
      <template #cell-createdAt="{ row }">
        <span class="text-sm text-slate-600 dark:text-slate-400">
          {{ formatDate((row as JobCategory).createdAt) }}
        </span>
      </template>

      <!-- Actions -->
      <template #cell-actions="{ row }">
        <div class="flex items-center gap-2">
          <button 
            @click="openEditModal(row as JobCategory)"
            class="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
            title="Edit Category"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          
          <button 
            @click="confirmDelete(row as JobCategory)"
            class="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
            title="Delete Category"
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
          No job categories found
        </div>
      </template>
    </DataTable>

    <!-- Category Form Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" @click.self="closeModal">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-modal-slide-up">
            <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                {{ isEdit ? 'Edit Category' : 'Create New Category' }}
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
                    Name <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="form.name" 
                    type="text"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g., Technology, Healthcare, Education"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Slug <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="form.slug" 
                    type="text"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g., technology, healthcare, education"
                    required
                  />
                  <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Unique identifier, will be used in URLs (lowercase, no spaces)
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Parent Category
                  </label>
                  <select
                    v-model="form.parentId"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                  >
                    <option :value="null">None (Root Category)</option>
                    <option v-for="cat in parentCategories" :key="cat.id" :value="cat.id">
                      {{ getCategoryName(cat) }}
                    </option>
                  </select>
                </div>
                <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 class="text-sm font-medium text-slate-900 dark:text-white mb-3">Translations</h4>
                  
                  <div v-for="(locale, index) in locales" :key="locale.id" class="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ locale.name }}</span>
                      <span class="text-xs text-slate-500 dark:text-slate-400">({{ locale.code }})</span>
                    </div>
                    
                    <div class="space-y-3">
                      <div>
                        <label class="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                          Name <span class="text-red-500">*</span>
                        </label>
                        <input 
                          :value="form.translations[index]?.name || ''"
                          @input="updateTranslation(index, 'name', ($event.target as HTMLInputElement).value)"
                          type="text"
                          class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                          :placeholder="`Category name in ${locale.name}`"
                          required
                        />
                      </div>
                      
                      <div>
                        <label class="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                          Description
                        </label>
                        <textarea 
                          :value="form.translations[index]?.description || ''"
                          @input="updateTranslation(index, 'description', ($event.target as HTMLTextAreaElement).value)"
                          rows="2"
                          class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                          :placeholder="`Optional description in ${locale.name}`"
                        ></textarea>
                      </div>
                    </div>
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
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Delete Category</h3>
              <button @click="showDeleteModal = false" class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div class="p-6">
              <p class="text-slate-600 dark:text-slate-400">
                Are you sure you want to delete category "{{ selectedCategory ? getCategoryName(selectedCategory) : '' }}"?
                <span class="block mt-2 text-sm text-amber-600 dark:text-amber-400">
                  Note: This will soft delete the category. Jobs associated with this category may be affected.
                </span>
              </p>
              <p v-if="deleteError" class="mt-2 text-sm text-red-600 dark:text-red-400">
                Error: {{ deleteError }}
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
                <span v-else>Delete</span>
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
import { useJobCategories, type JobCategory } from '~/composables/useJobCategories'
import { useLocales } from '~/composables/useLocales'
import type { Locale } from '~/types/locale'

// definePageMeta({
//   middleware: 'auth'
// })

const { isAuthenticated } = useAuth()
const { getJobCategories, createJobCategory, updateJobCategory, deleteJobCategory } = useJobCategories()
const { getLocales } = useLocales()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const deleteError = ref<string | null>(null)
const categories = ref<JobCategory[]>([])
const submitting = ref(false)
const deleting = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const selectedCategory = ref<JobCategory | null>(null)
const isEdit = ref(false)
const locales = ref<Locale[]>([])

// Search and filter state
const searchQuery = ref('')
const searchTimeout = ref<NodeJS.Timeout | null>(null)
const selectedParent = ref('')

const page = ref(1)
const perPage = ref(10)

// Form state - TAMBAHKAN id untuk translation
const form = ref({
  id: '',
  name: '',
  slug: '',
  parentId: null as string | null,
  isActive: true,
  translations: [] as {
    id?: string  // ID translation untuk update
    localeId: string
    name: string
    description: string
  }[]
})

// Table columns
const columns = [
  { key: 'name', label: 'Category' },
  { key: 'parent', label: 'Parent' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created' }
]

// Helper function to get category name from translations
const getCategoryName = (category: JobCategory): string => {
  if (!category.translations || category.translations.length === 0) {
    return category.slug
  }
  // Default to first translation
  const translation = category.translations[0]
  return translation?.name || category.slug
}

// Computed: all categories for parent dropdown (kecuali diri sendiri)
const parentCategories = computed<JobCategory[]>(() => {
  if (!categories.value.length) return []
  
  const currentCategoryId = isEdit.value ? selectedCategory.value?.id : null
  
  // Tampilkan semua category KECUALI category yang sedang diedit
  // (agar tidak bisa memilih dirinya sendiri sebagai parent)
  return categories.value.filter((c: JobCategory) => {
    // Jangan tampilkan category yang sedang diedit
    if (currentCategoryId && c.id === currentCategoryId) {
      return false
    }
    return true
  })
})
// Computed: filtered categories based on search and parent filter
const filteredCategories = computed<JobCategory[]>(() => {
  let filtered = categories.value
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((cat: JobCategory) => {
      const name = getCategoryName(cat).toLowerCase()
      return name.includes(query) || cat.slug.toLowerCase().includes(query)
    })
  }
  
  // Filter by parent
  if (selectedParent.value === 'root') {
    filtered = filtered.filter((cat: JobCategory) => !cat.parentId)
  } else if (selectedParent.value) {
    filtered = filtered.filter((cat: JobCategory) => cat.parentId === selectedParent.value)
  }
  
  return filtered
})

// Helper: get category initial for avatar
const getCategoryInitial = (category: JobCategory): string => {
  const name = getCategoryName(category)
  return name ? name.charAt(0).toUpperCase() : '?'
}

// Helper: get parent name by ID
const getParentName = (parentId: string): string => {
  const parent = categories.value.find((c: JobCategory) => c.id === parentId)
  return parent ? getCategoryName(parent) : 'Unknown'
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

// Helper: update translation field
const updateTranslation = (index: number, field: 'name' | 'description', value: string): void => {
  if (!form.value.translations[index]) {
    // Initialize if not exists
    form.value.translations[index] = {
      localeId: locales.value[index]?.id || '',
      name: '',
      description: ''
    }
  }
  form.value.translations[index][field] = value
}

// Search handler with debounce
const handleSearch = (): void => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  searchTimeout.value = setTimeout(async () => {
    // Filtering is done client-side
  }, 300)
}

// Fetch locales for translations
const fetchLocales = async (): Promise<void> => {
  try {
    const response = await getLocales()
    locales.value = Array.isArray(response) ? response : (response.data || [])
  } catch (err) {
    console.error('Failed to fetch locales:', err)
  }
}

// Fetch categories from API
const fetchCategories = async (): Promise<void> => {
  if (!isAuthenticated.value) return
  
  loading.value = true
  error.value = null
  
  try {
    const response = await getJobCategories()
    console.log('Categories received:', response)
    
    if (response?.data?.categories) {
      categories.value = response.data.categories
    } else {
      categories.value = []
    }
  } catch (err: any) {
    console.error('Fetch error:', err)
    error.value = err.message || 'Failed to fetch categories'
    
    if (err?.response?.status === 401) {
      error.value = 'Session expired. Please login again.'
    }
  } finally {
    loading.value = false
  }
}

// Modal handlers
const openCreateModal = async (): Promise<void> => {
  isEdit.value = false
  await fetchLocales()
  form.value = {
    id: '',
    name: '',
    slug: '',
    parentId: null,
    isActive: true,
    translations: locales.value.map((locale: Locale) => ({
      localeId: locale.id,
      name: '',
      description: ''
    }))
  }
  showModal.value = true
}

const openEditModal = async (category: JobCategory): Promise<void> => {
  isEdit.value = true
  selectedCategory.value = category
  await fetchLocales()
  
  // PERBAIKAN: Simpan ID translation untuk dikirim ke backend
  const translations = category.translations?.map(t => ({
    id: t.id,  // KIRIM ID translation
    localeId: t.localeId,
    name: t.name || '',
    description: t.description || ''
  })) || []
  
  form.value = {
    id: category.id,
    name: getCategoryName(category),
    slug: category.slug,
    parentId: category.parentId,
    isActive: category.isActive,
    translations
  }
  showModal.value = true
}

const closeModal = (): void => {
  showModal.value = false
  selectedCategory.value = null
}

// Form submission
const handleSubmit = async (): Promise<void> => {
  // Validate form
  if (!form.value.slug) {
    error.value = 'Slug is required'
    return
  }
  
  // Validate translations - only check translations that exist
  const hasInvalidTranslation = form.value.translations.some(t => !t.name)
  if (hasInvalidTranslation) {
    error.value = 'All translations must have a name'
    return
  }

  submitting.value = true
  error.value = null
  
  try {
    // PERBAIKAN: Filter translations, hanya kirim yang punya nama
    const translationsToSend = form.value.translations
      .filter(t => t.name) // Hanya kirim yang punya nama
      .map(t => ({
        ...(t.id ? { id: t.id } : {}), // Kirim id jika ada (untuk update)
        localeId: t.localeId,
        name: t.name,
        description: t.description || undefined
      }))
    
    console.log('Submitting translations:', JSON.stringify(translationsToSend, null, 2))
    
    if (isEdit.value && selectedCategory.value) {
      await updateJobCategory(selectedCategory.value.id, {
        slug: form.value.slug,
        parentId: form.value.parentId,
        isActive: form.value.isActive,
        translations: translationsToSend
      })
    } else {
      await createJobCategory({
        name: form.value.name,
        slug: form.value.slug,
        parentId: form.value.parentId,
        isActive: form.value.isActive,
        translations: translationsToSend
      })
    }
    
    closeModal()
    await fetchCategories()
  } catch (err: any) {
    console.error('Failed to save category:', err)
    console.error('Request data:', form.value)
    
    // Check for duplicate key error
    if (err.message?.includes('duplicate key') || err.data?.message?.includes('duplicate key')) {
      error.value = 'Duplicate translation for the same locale. Please check your translations.'
    } else {
      error.value = err.message || `Failed to ${isEdit.value ? 'update' : 'create'} category`
    }
  } finally {
    submitting.value = false
  }
}

// Delete handlers
const confirmDelete = (category: JobCategory): void => {
  selectedCategory.value = category
  deleteError.value = null
  showDeleteModal.value = true
}

const handleDelete = async (): Promise<void> => {
  if (!selectedCategory.value) return
  
  deleting.value = true
  deleteError.value = null
  
  try {
    await deleteJobCategory(selectedCategory.value.id)
    showDeleteModal.value = false
    selectedCategory.value = null
    await fetchCategories()
  } catch (err: any) {
    console.error('Failed to delete category:', err)
    
    // Cek pesan error foreign key
    if (err.message?.includes('foreign key') || err.data?.message?.includes('foreign key')) {
      deleteError.value = 'Cannot delete category because it has associated jobs. Please delete or reassign the jobs first.'
    } else {
      deleteError.value = err.message || 'Failed to delete category'
    }
  } finally {
    deleting.value = false
  }
}

// Login handler
const handleLogin = async (): Promise<void> => {
  await navigateTo('/login')
}

// Watch for authentication changes
watch(() => isAuthenticated.value, (newValue: boolean) => {
  if (newValue) {
    fetchCategories()
  }
})

// Initial fetch
onMounted(() => {
  console.log('Component mounted, isAuthenticated:', isAuthenticated.value)
  if (isAuthenticated.value) {
    fetchCategories()
  }
})
</script>
