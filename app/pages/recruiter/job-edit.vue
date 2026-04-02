<template>
  <div>
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Edit Job</h1>
            <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Update your job posting details</p>
          </div>
          <NuxtLink
            to="/recruiter/jobs"
            class="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Back to Jobs
          </NuxtLink>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
        {{ error }}
      </div>

      <!-- Edit Form -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic Information -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Basic Information</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Job Title *
              </label>
              <input
                v-model="form.title"
                type="text"
                required
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
                placeholder="e.g., Senior Frontend Developer"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Summary
              </label>
              <input
                v-model="form.summary"
                type="text"
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
                placeholder="Brief summary of the position"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description *
              </label>
              <textarea
                v-model="form.description"
                rows="6"
                required
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
                placeholder="Detailed job description..."
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Qualifications
              </label>
              <textarea
                v-model="form.qualification"
                rows="4"
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
                placeholder="Required qualifications and skills..."
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Benefits
              </label>
              <textarea
                v-model="form.benefits"
                rows="4"
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
                placeholder="Benefits and perks..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Location & Work Type -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Location & Work Type</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                City
              </label>
              <input
                v-model="form.city"
                type="text"
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
                placeholder="e.g., Jakarta"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Work Type *
              </label>
              <select
                v-model="form.workTypeId"
                required
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
              >
                <option value="">Select work type</option>
                <option v-for="type in workTypes" :key="type.id" :value="type.id">
                  {{ type.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Work Place
              </label>
              <select
                v-model="form.workPlaceId"
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
              >
                <option value="">Select work place</option>
                <option v-for="place in workPlaces" :key="place.id" :value="place.id">
                  {{ place.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Salary Information -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Salary Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Pay From
              </label>
              <input
                v-model.number="form.payFrom"
                type="number"
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
                placeholder="Minimum salary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Pay To
              </label>
              <input
                v-model.number="form.payTo"
                type="number"
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
                placeholder="Maximum salary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Currency
              </label>
              <select
                v-model="form.currencyId"
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
              >
                <option value="">Select currency</option>
                <option v-for="currency in currencies" :key="currency.id" :value="currency.id">
                  {{ currency.name }} ({{ currency.code }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Pay Type
              </label>
              <select
                v-model="form.payTypeId"
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
              >
                <option value="">Select pay type</option>
                <option v-for="type in payTypes" :key="type.id" :value="type.id">
                  {{ type.name }}
                </option>
              </select>
            </div>

            <div class="col-span-2">
              <label class="flex items-center gap-2">
                <input
                  v-model="form.showSalary"
                  type="checkbox"
                  class="rounded border-slate-300 dark:border-slate-700 text-primary-600 focus:ring-primary-500"
                />
                <span class="text-sm text-slate-700 dark:text-slate-300">Show salary range in job posting</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Additional Information</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Category
              </label>
              <select
                v-model="form.categoryId"
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
              >
                <option value="">Select category</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Video URL
              </label>
              <input
                v-model="form.videoUrl"
                type="url"
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label class="flex items-center gap-2">
                <input
                  v-model="form.isPrivate"
                  type="checkbox"
                  class="rounded border-slate-300 dark:border-slate-700 text-primary-600 focus:ring-primary-500"
                />
                <span class="text-sm text-slate-700 dark:text-slate-300">Private job (only accessible via direct link)</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3">
          <NuxtLink
            to="/recruiter/jobs"
            class="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </NuxtLink>
          <button
            type="submit"
            :disabled="submitting"
            class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submitting ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJobs } from '~/composables/useJobs'

const route = useRoute()
const router = useRouter()
const { getJobById, updateJob, getJobCategories, getWorkTypes, getPayTypes, getCurrencies, getWorkPlaces } = useJobs()

// Get job ID from query parameter
const jobId = route.query.id as string

// Form data
const form = ref({
  title: '',
  summary: '',
  description: '',
  qualification: '',
  benefits: '',
  city: '',
  workTypeId: '',
  workPlaceId: '',
  payFrom: null as number | null,
  payTo: null as number | null,
  currencyId: '',
  payTypeId: '',
  categoryId: '',
  videoUrl: '',
  showSalary: false,
  isPrivate: false
})

// Master data
const categories = ref<any[]>([])
const workTypes = ref<any[]>([])
const payTypes = ref<any[]>([])
const currencies = ref<any[]>([])
const workPlaces = ref<any[]>([])

// UI states
const loading = ref(true)
const submitting = ref(false)
const error = ref('')

// Load job data
const loadJob = async () => {
  if (!jobId) {
    error.value = 'Job ID is required'
    loading.value = false
    return
  }
  
  try {
    const job = await getJobById(jobId)
    console.log('Job loaded:', job)
    
    // Populate form
    form.value.title = job.title || ''
    form.value.summary = job.summary || ''
    form.value.description = job.description || ''
    form.value.qualification = job.qualification || ''
    form.value.benefits = job.benefits || ''
    form.value.city = job.city || ''
    form.value.workTypeId = job.workTypeId || ''
    form.value.workPlaceId = job.workPlaceId || ''
    form.value.payFrom = job.payFrom ? parseFloat(job.payFrom) : null
    form.value.payTo = job.payTo ? parseFloat(job.payTo) : null
    form.value.currencyId = job.currencyId || ''
    form.value.payTypeId = job.payTypeId || ''
    form.value.categoryId = job.categoryId || ''
    form.value.videoUrl = job.videoUrl || ''
    form.value.showSalary = job.showSalary || false
    form.value.isPrivate = job.isPrivate || false
    
    console.log('Form after population:', form.value)
    
  } catch (err: any) {
    console.error('Error loading job:', err)
    error.value = `Failed to load job data: ${err.message || 'Unknown error'}`
  }
}

// Load master data
const loadMasterData = async () => {
  try {
    const [cats, wTypes, pTypes, currs, wPlaces] = await Promise.all([
      getJobCategories(),
      getWorkTypes(),
      getPayTypes(),
      getCurrencies(),
      getWorkPlaces()
    ])
    
    categories.value = cats
    workTypes.value = wTypes
    payTypes.value = pTypes
    currencies.value = currs
    workPlaces.value = wPlaces
    
    console.log('Master data loaded')
    
  } catch (err) {
    console.error('Error loading master data:', err)
  }
}

// Validate form
const validateForm = () => {
  const errors = []
  
  if (!form.value.title || !form.value.title.trim()) {
    errors.push('Job title is required')
  }
  
  if (!form.value.description || !form.value.description.trim()) {
    errors.push('Job description is required')
  }
  
  if (!form.value.workTypeId) {
    errors.push('Work type is required')
  }
  
  // Validate salary range
  if (form.value.payFrom !== null && form.value.payTo !== null) {
    if (form.value.payFrom > form.value.payTo) {
      errors.push('Minimum salary cannot be greater than maximum salary')
    }
  }
  
  if (errors.length > 0) {
    alert(errors.join('\n'))
    return false
  }
  
  return true
}

// Handle form submission
const handleSubmit = async () => {
  if (!jobId) {
    alert('Job ID is missing')
    return
  }
  
  if (!validateForm()) {
    return
  }
  
  submitting.value = true
  
  try {
    // Prepare update data - hanya kirim field yang memiliki nilai
    const updateData: any = {}
    
    // Required fields
    updateData.title = form.value.title.trim()
    updateData.description = form.value.description.trim()
    updateData.workTypeId = form.value.workTypeId
    
    // Optional fields - only add if they have value
    if (form.value.summary && form.value.summary.trim()) {
      updateData.summary = form.value.summary.trim()
    }
    
    if (form.value.qualification && form.value.qualification.trim()) {
      updateData.qualification = form.value.qualification.trim()
    }
    
    if (form.value.benefits && form.value.benefits.trim()) {
      updateData.benefits = form.value.benefits.trim()
    }
    
    if (form.value.city && form.value.city.trim()) {
      updateData.city = form.value.city.trim()
    }
    
    if (form.value.workPlaceId) {
      updateData.workPlaceId = form.value.workPlaceId
    }
    
    if (form.value.payFrom !== null && form.value.payFrom !== undefined) {
      updateData.payFrom = form.value.payFrom
    }
    
    if (form.value.payTo !== null && form.value.payTo !== undefined) {
      updateData.payTo = form.value.payTo
    }
    
    if (form.value.currencyId) {
      updateData.currencyId = form.value.currencyId
    }
    
    if (form.value.payTypeId) {
      updateData.payTypeId = form.value.payTypeId
    }
    
    if (form.value.categoryId) {
      updateData.categoryId = form.value.categoryId
    }
    
    if (form.value.videoUrl && form.value.videoUrl.trim()) {
      updateData.videoUrl = form.value.videoUrl.trim()
    }
    
    // Boolean fields
    updateData.showSalary = form.value.showSalary
    updateData.isPrivate = form.value.isPrivate
    
    console.log('Updating job with data:', updateData)
    
    await updateJob(jobId, updateData)
    
    alert('Job updated successfully!')
    router.push('/recruiter/jobs')
  } catch (err: any) {
    console.error('Error updating job:', err)
    
    // Tampilkan error lebih detail
    let errorMessage = 'Failed to update job. '
    
    if (err.response?._data) {
      console.log('Error response:', err.response._data)
      if (err.response._data.message) {
        errorMessage = err.response._data.message
      } else {
        errorMessage += JSON.stringify(err.response._data)
      }
    } else if (err.message) {
      errorMessage += err.message
    } else {
      errorMessage += 'Please try again.'
    }
    
    alert(errorMessage)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  console.log('Job edit page mounted')
  await loadMasterData()
  await loadJob()
  loading.value = false
  console.log('Loading complete')
})
</script>