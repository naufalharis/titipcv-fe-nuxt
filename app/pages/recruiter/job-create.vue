<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Post New Job</h1>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Create a job posting to attract top talent</p>
        </div>
        <div class="px-4 py-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
          <p class="text-sm text-primary-700 dark:text-primary-300">
            Job will be posted under: <span class="font-semibold">{{ company?.name || 'Loading...' }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
    </div>

    <!-- Form Content -->
    <div v-else class="max-w-4xl mx-auto">
      <!-- Stepper -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="flex items-center"
            :class="{ 'flex-1': index < steps.length - 1 }"
          >
            <div class="relative flex flex-col items-center">
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all"
                :class="{
                  'bg-primary-600 text-white': currentStep >= index,
                  'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400': currentStep < index
                }"
              >
                {{ index + 1 }}
              </div>
              <span 
                class="absolute top-12 text-xs font-medium whitespace-nowrap"
                :class="{
                  'text-primary-600 dark:text-primary-400': currentStep >= index,
                  'text-slate-500 dark:text-slate-400': currentStep < index
                }"
              >
                {{ step }}
              </span>
            </div>
            <div 
              v-if="index < steps.length - 1"
              class="flex-1 h-0.5 mx-4"
              :class="{
                'bg-primary-600': currentStep > index,
                'bg-slate-200 dark:bg-slate-700': currentStep <= index
              }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Step 1: Classify -->
      <div v-if="currentStep === 0" class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Classify</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Define the basic details and classification for your job posting</p>
        </div>

        <div class="p-6 space-y-6">
          <!-- Basic Information -->
          <div>
            <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-4">Basic Information</h3>
            <div class="grid grid-cols-1 gap-6">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Job Title <span class="text-rose-500">*</span>
                </label>
                <input
                  v-model="form.title"
                  type="text"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="misalnya, Software Engineer, Marketing Manager"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category <span class="text-rose-500">*</span>
                </label>
                <select
                  v-model="form.categoryId"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                >
                  <option value="">Select a category</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Location -->
          <div>
            <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-4">Location</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Country <span class="text-rose-500">*</span>
                </label>
                <select
                  v-model="form.countryId"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                >
                  <option value="">Select a country</option>
                  <option v-for="country in countries" :key="country.id" :value="country.id">
                    {{ country.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  City <span class="text-rose-500">*</span>
                </label>
                <input
                  v-model="form.city"
                  type="text"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="e.g., Jakarta"
                />
              </div>
            </div>
          </div>

          <!-- Job Details -->
          <div>
            <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-4">Job Details</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Workplace <span class="text-rose-500">*</span>
                </label>
                <select
                  v-model="form.workPlaceId"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                >
                  <option value="">Select a workplace</option>
                  <option v-for="place in workPlaces" :key="place.id" :value="place.id">
                    {{ place.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Work Type <span class="text-rose-500">*</span>
                </label>
                <select
                  v-model="form.workTypeId"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                >
                  <option value="">Select a work type</option>
                  <option v-for="type in workTypes" :key="type.id" :value="type.id">
                    {{ type.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Pay Type <span class="text-rose-500">*</span>
                </label>
                <select
                  v-model="form.payTypeId"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                >
                  <option value="">Select a pay type</option>
                  <option v-for="type in payTypes" :key="type.id" :value="type.id">
                    {{ type.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div>
            <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-4">Job Description</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description <span class="text-rose-500">*</span>
                </label>
                <textarea
                  v-model="form.description"
                  rows="6"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="Describe the job responsibilities, requirements, and benefits..."
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Qualifications
                </label>
                <textarea
                  v-model="form.qualification"
                  rows="4"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="List the required qualifications and skills..."
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Benefits
                </label>
                <textarea
                  v-model="form.benefits"
                  rows="4"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="Describe the benefits and perks..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Compensation -->
      <div v-if="currentStep === 1" class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Compensation</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Define the salary and compensation details</p>
        </div>

        <div class="p-6 space-y-6">
          <div>
            <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-4">Salary</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Currency <span class="text-rose-500">*</span>
                </label>
                <select
                  v-model="form.currencyId"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                >
                  <option value="">Select a currency</option>
                  <option v-for="currency in currencies" :key="currency.id" :value="currency.id">
                    {{ currency.code }} - {{ currency.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Minimum <span class="text-rose-500">*</span>
                </label>
                <input
                  v-model.number="form.payFrom"
                  type="number"
                  @input="validateSalaryRange"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="0"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Maximum
                </label>
                <input
                  v-model.number="form.payTo"
                  type="number"
                  @input="validateSalaryRange"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="0"
                />
                <p v-if="salaryError" class="text-xs text-rose-500 mt-1">{{ salaryError }}</p>
              </div>
            </div>

            <div class="mt-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="form.showSalary"
                  type="checkbox"
                  class="w-4 h-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                />
                <span class="text-sm text-slate-700 dark:text-slate-300">Show salary on ad</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Settings -->
      <div v-if="currentStep === 2" class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Job Settings</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure visibility and deadlines</p>
        </div>

        <div class="p-6 space-y-6">
          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.isPrivate"
                type="checkbox"
                class="w-4 h-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
              />
              <span class="text-sm text-slate-700 dark:text-slate-300">Advertise privately (optional)</span>
            </label>
            <p class="text-xs text-slate-400 mt-1 ml-6">Only selected candidates can see this job</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Published at
            </label>
            <input
              v-model="form.publishedAt"
              type="date"
              @input="validateDates"
              class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Application deadline (optional)
            </label>
            <input
              v-model="form.expiresAt"
              type="date"
              @input="validateDates"
              class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
            />
            <p v-if="dateError" class="text-xs text-rose-500 mt-1">{{ dateError }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Video URL (optional)
            </label>
            <input
              v-model="form.videoUrl"
              type="url"
              class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-between gap-3 mt-8">
        <button
          v-if="currentStep > 0"
          @click="prevStep"
          class="px-6 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Back
        </button>
        <div class="flex-1"></div>
        <button
          v-if="currentStep < steps.length - 1"
          @click="nextStep"
          :disabled="!validateStep()"
          class="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
        <button
          v-if="currentStep === steps.length - 1"
          @click="handleSubmit"
          :disabled="submitting"
          class="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg v-if="submitting" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Publish Job
        </button>
        <button
          @click="saveAsDraft"
          :disabled="submitting"
          class="px-6 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save as Draft
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useJobs } from '~/composables/useJobs'
import { useCompany } from '~/composables/useCompany'
import { useAuth } from '~/composables/useAuth'

const { user, isAuthenticated, accessToken } = useAuth()
const router = useRouter()
const { createJob, saveJobAsDraft, getJobCategories, getWorkTypes, getPayTypes, getCurrencies, getWorkPlaces } = useJobs()
const { getMyCompany } = useCompany()

// Steps
const steps = ['Classify', 'Compensation', 'Settings']
const currentStep = ref(0)

// Data
const company = ref<any>(null)
const categories = ref<any[]>([])
const workTypes = ref<any[]>([])
const payTypes = ref<any[]>([])
const currencies = ref<any[]>([])
const workPlaces = ref<any[]>([])
const countries = ref<any[]>([
  { id: '550e8400-e29b-41d4-a716-446655440010', name: 'Indonesia' },
  { id: '550e8400-e29b-41d4-a716-446655440011', name: 'Malaysia' },
  { id: '550e8400-e29b-41d4-a716-446655440012', name: 'Singapore' }
])

// Form data
const form = reactive({
  title: '',
  description: '',
  qualification: '',
  benefits: '',
  categoryId: '',
  countryId: '',
  city: '',
  workTypeId: '',
  payTypeId: '',
  currencyId: '',
  workPlaceId: '',
  payFrom: null as number | null,
  payTo: null as number | null,
  videoUrl: '',
  showSalary: true,
  isPrivate: false,
  publishedAt: '',
  expiresAt: '',
  companyId: ''
})

// UI states
const loading = ref(true)
const submitting = ref(false)
const salaryError = ref('')
const dateError = ref('')

// Validate salary range
const validateSalaryRange = () => {
  if (form.payFrom !== null && form.payTo !== null) {
    if (form.payTo <= form.payFrom) {
      salaryError.value = 'Maximum salary must be greater than minimum salary'
    } else {
      salaryError.value = ''
    }
  } else if (form.payFrom !== null && form.payTo === null) {
    salaryError.value = ''
  } else if (form.payFrom === null && form.payTo !== null) {
    salaryError.value = 'Please specify minimum salary first'
  } else {
    salaryError.value = ''
  }
}

// Validate dates
const validateDates = () => {
  if (!form.publishedAt && !form.expiresAt) {
    dateError.value = ''
    return
  }
  
  if (!form.publishedAt && form.expiresAt) {
    dateError.value = 'Please specify published date first'
    return
  }
  
  if (form.publishedAt && form.expiresAt) {
    const published = new Date(form.publishedAt)
    const expires = new Date(form.expiresAt)
    
    if (expires <= published) {
      dateError.value = 'Application deadline must be after the published date'
    } else {
      dateError.value = ''
    }
  } else {
    dateError.value = ''
  }
}

// Watch for salary changes
watch([() => form.payFrom, () => form.payTo], () => {
  validateSalaryRange()
})

// Watch for date changes
watch([() => form.publishedAt, () => form.expiresAt], () => {
  validateDates()
})

// Check if salary is valid
const isSalaryValid = () => {
  if (form.payFrom !== null && form.payTo !== null) {
    return form.payTo > form.payFrom
  }
  return true
}

// Check if dates are valid
const isDatesValid = () => {
  if (!form.publishedAt && form.expiresAt) {
    return false
  }
  
  if (form.publishedAt && form.expiresAt) {
    const published = new Date(form.publishedAt)
    const expires = new Date(form.expiresAt)
    return expires > published
  }
  
  return true
}

// Check token validity - FIXED: dengan guard yang aman
// Check token validity - FIXED dengan guard yang aman
const isTokenValid = (): boolean => {
  const token = accessToken.value
  if (!token || typeof token !== 'string') return false
  
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    const base64 = parts[1]
    // Guard untuk base64 yang mungkin undefined
    if (!base64) return false
    
    // Ganti karakter URL-safe ke base64 standar
    const base64Str = base64.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(base64Str)
    const payload = JSON.parse(decoded)
    const exp = payload.exp * 1000
    return Date.now() < exp
  } catch (err) {
    console.error('Error decoding token:', err)
    return false
  }
}
// Ensure valid token
const ensureValidToken = (): boolean => {
  const token = accessToken.value
  if (!token || typeof token !== 'string') {
    alert('Please login first')
    router.push('/auth/login')
    return false
  }
  
  if (!isTokenValid()) {
    alert('Your session has expired. Please login again.')
    router.push('/auth/login')
    return false
  }
  
  return true
}

// Fetch master data
const fetchMasterData = async () => {
  try {
    const [cats, wTypes, pTypes, curs, wPlaces] = await Promise.all([
      getJobCategories(),
      getWorkTypes(),
      getPayTypes(),
      getCurrencies(),
      getWorkPlaces()
    ])
    
    categories.value = cats || []
    workTypes.value = wTypes || []
    payTypes.value = pTypes || []
    currencies.value = curs || []
    workPlaces.value = wPlaces || []
  } catch (err) {
    console.error('Error fetching master data:', err)
  }
}

// Fetch company data
const fetchCompany = async () => {
  try {
    const data = await getMyCompany()
    if (data && data.id) {
      company.value = data
      form.companyId = data.id
    } else {
      alert('Please create company profile first')
      router.push('/recruiter/company-profile')
    }
  } catch (err) {
    console.error('Error fetching company:', err)
  }
}

// Validate current step
const validateStep = (): boolean => {
  if (currentStep.value === 0) {
    if (!form.title) return false
    if (!form.categoryId) return false
    if (!form.countryId) return false
    if (!form.city) return false
    if (!form.workPlaceId) return false
    if (!form.workTypeId) return false
    if (!form.payTypeId) return false
    if (!form.description) return false
    return true
  }
  if (currentStep.value === 1) {
    if (!form.currencyId) return false
    if (!form.payFrom && form.payFrom !== 0) return false
    if (!isSalaryValid()) return false
    return true
  }
  if (currentStep.value === 2) {
    return isDatesValid()
  }
  return true
}

// Next step
const nextStep = () => {
  if (validateStep() && currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

// Previous step
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// Format date to timestamp
const formatDateToTimestamp = (dateStr: string): number | null => {
  if (!dateStr) return null
  const date = new Date(dateStr)
  date.setHours(12, 0, 0, 0)
  return Math.floor(date.getTime() / 1000)
}

// Submit job
const handleSubmit = async () => {
  if (!ensureValidToken()) return
  
  if (!validateStep()) {
    alert('Please fill all required fields')
    return
  }
  
  if (!isSalaryValid()) {
    alert(salaryError.value || 'Maximum salary must be greater than minimum salary')
    return
  }
  
  if (!isDatesValid()) {
    alert(dateError.value || 'Application deadline must be after the published date')
    return
  }
  
  submitting.value = true
  
  try {
    const payload = {
      companyId: form.companyId,
      title: form.title.trim(),
      description: form.description.trim(),
      qualification: form.qualification?.trim() || null,
      benefits: form.benefits?.trim() || null,
      categoryId: form.categoryId || null,
      countryId: form.countryId || null,
      city: form.city?.trim() || null,
      workTypeId: form.workTypeId || null,
      payTypeId: form.payTypeId || null,
      currencyId: form.currencyId || null,
      workPlaceId: form.workPlaceId || null,
      payFrom: form.payFrom,
      payTo: form.payTo,
      videoUrl: form.videoUrl?.trim() || null,
      showSalary: form.showSalary,
      isPrivate: form.isPrivate,
      publishedAt: formatDateToTimestamp(form.publishedAt),
      expiresAt: formatDateToTimestamp(form.expiresAt)
    }
    
    const result = await createJob(payload)
    alert('Job posted successfully!')
    router.push('/recruiter/jobs')
  } catch (err: any) {
    console.error('Error creating job:', err)
    
    if (err?.response?.status === 401) {
      alert('Your session has expired. Please login again.')
      router.push('/auth/login')
    } else {
      alert(err?.data?.message || err?.data?.error || err?.message || 'Failed to create job')
    }
  } finally {
    submitting.value = false
  }
}

// Save as draft
const saveAsDraft = async () => {
  if (!ensureValidToken()) return
  
  if (!form.title) {
    alert('Please enter job title')
    return
  }
  
  submitting.value = true
  
  try {
    const payload = {
      companyId: form.companyId,
      title: form.title.trim(),
      description: form.description?.trim() || 'Draft job',
      qualification: form.qualification?.trim() || null,
      benefits: form.benefits?.trim() || null,
      categoryId: form.categoryId || null,
      countryId: form.countryId || null,
      city: form.city?.trim() || null,
      workTypeId: form.workTypeId || null,
      payTypeId: form.payTypeId || null,
      currencyId: form.currencyId || null,
      workPlaceId: form.workPlaceId || null,
      payFrom: form.payFrom,
      payTo: form.payTo,
      videoUrl: form.videoUrl?.trim() || null,
      showSalary: form.showSalary,
      isPrivate: form.isPrivate
    }
    
    const result = await saveJobAsDraft(payload)
    alert('Job saved as draft!')
    router.push('/recruiter/jobs')
  } catch (err: any) {
    console.error('Error saving draft:', err)
    
    if (err?.response?.status === 401) {
      alert('Your session has expired. Please login again.')
      router.push('/auth/login')
    } else {
      alert(err?.data?.message || err?.data?.error || err?.message || 'Failed to save draft')
    }
  } finally {
    submitting.value = false
  }
}

// Check authentication and load data
onMounted(async () => {
  if (!isAuthenticated.value || !accessToken.value) {
    router.push('/auth/login')
    return
  }
  
  if (!isTokenValid()) {
    alert('Your session has expired. Please login again.')
    router.push('/auth/login')
    return
  }
  
  if (user.value?.role !== 'RECRUITER' && user.value?.role !== 'ADMIN') {
    router.push('/')
    return
  }
  
  loading.value = true
  await Promise.all([
    fetchCompany(),
    fetchMasterData()
  ])
  loading.value = false
})
</script>