<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Find Your Dream Job
        </h1>
        <p class="text-lg text-slate-600 dark:text-slate-400">
          Discover thousands of job opportunities from top companies
        </p>
      </div>

      <!-- Search Bar -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="relative md:col-span-2">
            <input 
              v-model="filters.search"
              type="text"
              placeholder="Job title, keywords, or company..."
              @input="debouncedSearch"
              class="w-full px-4 py-3 pl-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <input 
            v-model="filters.location"
            type="text"
            placeholder="City or location..."
            @input="debouncedSearch"
            class="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select 
            v-model="filters.workType"
            @change="fetchJobs"
            class="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Work Types</option>
            <option v-for="type in workTypes" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>

          <button 
            @click="fetchJobs"
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Search Jobs
          </button>
        </div>

        <!-- Advanced Filters Toggle -->
        <button 
          @click="showAdvancedFilters = !showAdvancedFilters"
          class="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
          Advanced Filters
        </button>

        <!-- Advanced Filters -->
        <div v-if="showAdvancedFilters" class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select 
              v-model="filters.category"
              @change="fetchJobs"
              class="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option v-for="cat in jobCategories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>

            <select 
              v-model="filters.payType"
              @change="fetchJobs"
              class="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Pay Types</option>
              <option v-for="type in payTypes" :key="type.id" :value="type.id">
                {{ type.name }}
              </option>
            </select>

            <select 
              v-model="filters.workPlace"
              @change="fetchJobs"
              class="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Work Places</option>
              <option v-for="place in workPlaces" :key="place.id" :value="place.id">
                {{ place.name }}
              </option>
            </select>

            <div class="flex gap-4">
              <div class="flex-1">
                <label class="text-xs text-slate-500 mb-1 block">Salary Range (From)</label>
                <input 
                  v-model.number="filters.salaryFrom"
                  type="number"
                  placeholder="Min salary"
                  @input="fetchJobs"
                  class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div class="flex-1">
                <label class="text-xs text-slate-500 mb-1 block">To</label>
                <input 
                  v-model.number="filters.salaryTo"
                  type="number"
                  placeholder="Max salary"
                  @input="fetchJobs"
                  class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="flex justify-between items-center mb-6">
        <p class="text-slate-600 dark:text-slate-400">
          Found <span class="font-bold text-slate-900 dark:text-white">{{ totalJobs }}</span> jobs
        </p>
        <select 
          v-model="filters.sortOrder"
          @change="fetchJobs"
          class="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Jobs List -->
      <div v-else-if="jobs.length > 0" class="space-y-4">
        <div 
          v-for="job in paginatedJobs" 
          :key="job.id"
          @click="viewJobDetail(job.id)"
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <div class="p-6">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <!-- Left Content -->
              <div class="flex-1">
                <div class="flex items-start gap-4">
                  <!-- Company Logo Placeholder -->
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span class="text-white font-bold text-lg">
                      {{ getCompanyInitial(job.company?.name) }}
                    </span>
                  </div>
                  
                  <div class="flex-1">
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                      {{ job.title }}
                    </h3>
                    <p class="text-slate-600 dark:text-slate-400 mt-1">
                      {{ job.company?.name || 'Company' }}
                    </p>
                    
                    <div class="flex flex-wrap gap-3 mt-3">
                      <span class="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {{ job.city || 'Remote' }}{{ job.country?.name ? `, ${job.country.name}` : '' }}
                      </span>
                      
                      <span v-if="job.workType?.name" class="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {{ job.workType.name }}
                      </span>
                      
                      <span v-if="job.showSalary && job.payFrom && job.payTo" class="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ formatCurrency(job.payFrom) }} - {{ formatCurrency(job.payTo) }}
                        <span v-if="job.currency?.code">{{ job.currency.code }}</span>
                        <span v-if="job.payType?.name">/ {{ job.payType.name }}</span>
                      </span>
                    </div>
                    
                    <p class="text-slate-500 dark:text-slate-400 text-sm mt-3 line-clamp-2">
                      {{ job.summary || job.description?.substring(0, 150) }}...
                    </p>
                  </div>
                </div>
              </div>
              
              <!-- Right Content -->
              <div class="flex flex-col items-end gap-2">
                <span class="text-sm text-slate-400">
                  Posted {{ formatDate(job.createdAt) }}
                </span>
                <button 
                  @click.stop="applyForJob(job)"
                  class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p class="text-slate-600 dark:text-slate-400 text-lg">No jobs found</p>
        <p class="text-slate-500 dark:text-slate-500">Try adjusting your search filters</p>
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

    <!-- Job Detail Modal -->
    <Teleport to="body">
      <div 
        v-if="selectedJob"
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

            <!-- Header -->
            <div class="p-6 border-b border-slate-200 dark:border-slate-700">
              <div class="flex items-start gap-4">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span class="text-white font-bold text-2xl">
                    {{ getCompanyInitial(selectedJob.company?.name) }}
                  </span>
                </div>
                <div class="flex-1">
                  <h2 class="text-2xl font-bold text-slate-900 dark:text-white">{{ selectedJob.title }}</h2>
                  <p class="text-slate-600 dark:text-slate-400 mt-1">{{ selectedJob.company?.name }}</p>
                  <div class="flex flex-wrap gap-3 mt-2">
                    <span class="text-sm text-slate-500">{{ selectedJob.city || 'Remote' }}</span>
                    <span class="text-sm text-slate-500">{{ selectedJob.workType?.name }}</span>
                    <span class="text-sm text-green-600 dark:text-green-400" v-if="selectedJob.showSalary">
                      {{ formatCurrency(selectedJob.payFrom) }} - {{ formatCurrency(selectedJob.payTo) }}
                      {{ selectedJob.currency?.code }}/{{ selectedJob.payType?.name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6">
              <!-- Description -->
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">Job Description</h3>
                <div class="prose dark:prose-invert max-w-none">
                  <p class="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{{ selectedJob.description }}</p>
                </div>
              </div>

              <!-- Qualification -->
              <div v-if="selectedJob.qualification" class="mb-6">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">Qualifications</h3>
                <div class="prose dark:prose-invert max-w-none">
                  <p class="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{{ selectedJob.qualification }}</p>
                </div>
              </div>

              <!-- Benefits -->
              <div v-if="selectedJob.benefits" class="mb-6">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">Benefits</h3>
                <div class="prose dark:prose-invert max-w-none">
                  <p class="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{{ selectedJob.benefits }}</p>
                </div>
              </div>

              <!-- Screening Questions (if any) -->
              <div v-if="screeningQuestions.length > 0" class="mb-6">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">Screening Questions</h3>
                <div class="space-y-4">
                  <div v-for="(q, idx) in screeningQuestions" :key="q.id" class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p class="font-medium text-slate-900 dark:text-white mb-2">
                      {{ idx + 1 }}. {{ q.question }}
                      <span v-if="q.isRequired" class="text-red-500 text-sm">*</span>
                    </p>
                    
                    <div v-if="q.answerType === 'text'">
                      <input 
                        v-model="screeningAnswers[q.id]"
                        type="text"
                        :required="q.isRequired"
                        class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        :placeholder="`Answer for: ${q.question}`"
                      />
                    </div>
                    
                    <div v-else-if="q.answerType === 'textarea'">
                      <textarea 
                        v-model="screeningAnswers[q.id]"
                        :required="q.isRequired"
                        rows="3"
                        class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        :placeholder="`Answer for: ${q.question}`"
                      ></textarea>
                    </div>
                    
                    <div v-else-if="q.answerType === 'number'">
                      <input 
                        v-model.number="screeningAnswers[q.id]"
                        type="number"
                        :required="q.isRequired"
                        class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        :placeholder="`Answer for: ${q.question}`"
                      />
                    </div>
                    
                    <div v-else-if="q.answerType === 'boolean'">
                      <div class="flex gap-4">
                        <label class="flex items-center gap-2">
                          <input 
                            type="radio"
                            :name="`question_${q.id}`"
                            :value="true"
                            v-model="screeningAnswers[q.id]"
                            :required="q.isRequired"
                            class="text-blue-600"
                          />
                          <span>Yes</span>
                        </label>
                        <label class="flex items-center gap-2">
                          <input 
                            type="radio"
                            :name="`question_${q.id}`"
                            :value="false"
                            v-model="screeningAnswers[q.id]"
                            :required="q.isRequired"
                            class="text-blue-600"
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>
                    
                    <div v-else-if="q.answerType === 'select' && q.options">
                      <select 
                        v-model="screeningAnswers[q.id]"
                        :required="q.isRequired"
                        class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select an option</option>
                        <option v-for="opt in parseOptions(q.options)" :key="opt" :value="opt">
                          {{ opt }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Cover Letter -->
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">Cover Letter</h3>
                <textarea 
                  v-model="coverLetter"
                  rows="5"
                  class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write a cover letter explaining why you're the best candidate for this position..."
                ></textarea>
              </div>

              <!-- Submit Button -->
              <div class="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button 
                  @click="submitApplication"
                  :disabled="submitting"
                  class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="submitting" class="flex items-center justify-center gap-2">
                    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </span>
                  <span v-else>Submit Application</span>
                </button>
                <button 
                  @click="closeModal"
                  class="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Success Toast -->
    <div 
      v-if="showSuccess"
      class="fixed bottom-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-up"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Application submitted successfully!
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useJobs, type Job } from '~/composables/useJobs'
import { useScreeningQuestions, type ScreeningQuestion } from '~/composables/useScreeningQuestions'
import { useAuth } from '~/composables/useAuth'

const { isAuthenticated } = useAuth()
const { 
  listJobs, 
  getJobById, 
  getWorkTypes, 
  getPayTypes, 
  getWorkPlaces, 
  getJobCategories 
} = useJobs()
const { getScreeningQuestionsByJob, submitScreeningAnswers } = useScreeningQuestions()

// State
const jobs = ref<Job[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalJobs = ref(0)
const totalPages = ref(0)
const showAdvancedFilters = ref(false)
const selectedJob = ref<Job | null>(null)
const screeningQuestions = ref<ScreeningQuestion[]>([])
const screeningAnswers = ref<Record<string, string>>({})
const coverLetter = ref('')
const submitting = ref(false)
const showSuccess = ref(false)

// Master data
const workTypes = ref<any[]>([])
const payTypes = ref<any[]>([])
const workPlaces = ref<any[]>([])
const jobCategories = ref<any[]>([])

// Filters
const filters = ref({
  search: '',
  location: '',
  workType: '',
  category: '',
  payType: '',
  workPlace: '',
  salaryFrom: null as number | null,
  salaryTo: null as number | null,
  sortOrder: 'desc' as 'asc' | 'desc'
})

// Computed
const paginatedJobs = computed(() => {
  return jobs.value
})

// Methods
const formatDate = (timestamp?: number | null) => {
  if (!timestamp) return 'Recently'
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatCurrency = (amount?: string | null) => {
  if (!amount) return '0'
  const num = parseFloat(amount)
  if (isNaN(num)) return '0'
  return new Intl.NumberFormat('en-US').format(num)
}

const getCompanyInitial = (name?: string | null) => {
  if (!name) return 'C'
  return name.charAt(0).toUpperCase()
}

const parseOptions = (options?: string | string[]) => {
  if (!options) return []
  if (Array.isArray(options)) return options
  try {
    return JSON.parse(options)
  } catch {
    return options.split(',').map(o => o.trim())
  }
}

const fetchMasterData = async () => {
  try {
    const [types, pTypes, places, cats] = await Promise.all([
      getWorkTypes(),
      getPayTypes(),
      getWorkPlaces(),
      getJobCategories()
    ])
    workTypes.value = types
    payTypes.value = pTypes
    workPlaces.value = places
    jobCategories.value = cats
  } catch (error) {
    console.error('Error fetching master data:', error)
  }
}

const fetchJobs = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      limit: 100,
      sortOrder: filters.value.sortOrder
    }
    
    if (filters.value.search) params.search = filters.value.search
    if (filters.value.workType) params.workTypeId = filters.value.workType
    if (filters.value.category) params.categoryId = filters.value.category
    if (filters.value.payType) params.payTypeId = filters.value.payType
    if (filters.value.workPlace) params.workPlaceId = filters.value.workPlace
    
    const response = await listJobs(params)
    
    let filtered = response.jobs || []
    
    // Filter by location (client-side)
    if (filters.value.location) {
      const locationLower = filters.value.location.toLowerCase()
      filtered = filtered.filter(job => 
        job.city?.toLowerCase().includes(locationLower) ||
        job.country?.name?.toLowerCase().includes(locationLower)
      )
    }
    
    // Filter by salary range
    if (filters.value.salaryFrom) {
      filtered = filtered.filter(job => 
        job.payFrom && parseFloat(job.payFrom) >= (filters.value.salaryFrom || 0)
      )
    }
    if (filters.value.salaryTo) {
      filtered = filtered.filter(job => 
        job.payTo && parseFloat(job.payTo) <= (filters.value.salaryTo || Infinity)
      )
    }
    
    // Filter only active jobs for job seekers
    filtered = filtered.filter(job => job.status === 'active')
    
    jobs.value = filtered
    totalJobs.value = filtered.length
    totalPages.value = Math.ceil(filtered.length / pageSize.value)
    
  } catch (error) {
    console.error('Error fetching jobs:', error)
  } finally {
    loading.value = false
  }
}

const viewJobDetail = async (id: string) => {
  try {
    const job = await getJobById(id)
    selectedJob.value = job
    
    // Fetch screening questions for this job
    const questions = await getScreeningQuestionsByJob(id)
    screeningQuestions.value = questions
    screeningAnswers.value = {}
    coverLetter.value = ''
    
  } catch (error) {
    console.error('Error fetching job details:', error)
  }
}

const applyForJob = (job: Job) => {
  if (!isAuthenticated.value) {
    alert('Please login to apply for this job')
    return
  }
  viewJobDetail(job.id)
}
const submitApplication = async () => {
  if (!selectedJob.value) return
  
  submitting.value = true
  
  try {
    const runtimeConfig = useRuntimeConfig()
    const baseURL = runtimeConfig.public.apiBaseUrl || 'http://localhost:3335/api/v1'
    
    // PERBAIKAN: Gunakan accessToken dari useAuth
    const { accessToken } = useAuth()
    
    if (!accessToken.value) {
      alert('Please login to apply for this job')
      return
    }
    
    console.log('Token available:', !!accessToken.value)
    
    const response = await fetch(`${baseURL}/job-applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobId: selectedJob.value.id,
        coverLetter: coverLetter.value
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error response:', errorData)
      throw new Error(errorData.message || 'Failed to submit application')
    }
    
    const result = await response.json()
    const applicationId = result.data?.id
    
    // Submit screening answers if any
    if (applicationId && Object.keys(screeningAnswers.value).length > 0) {
      const answers = Object.entries(screeningAnswers.value).map(([questionId, answer]) => ({
        questionId,
        answer: String(answer)
      }))
      
      await submitScreeningAnswers(applicationId, answers)
    }
    
    // Show success message
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
    
    // Close modal
    closeModal()
    
  } catch (error: any) {
    console.error('Error submitting application:', error)
    alert(error.message || 'Failed to submit application. Please try again.')
  } finally {
    submitting.value = false
  }
}

const closeModal = () => {
  selectedJob.value = null
  screeningQuestions.value = []
  screeningAnswers.value = {}
  coverLetter.value = ''
}

const changePage = (page: number) => {
  currentPage.value = page
  fetchJobs()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchJobs()
  }, 500)
}

onMounted(() => {
  fetchMasterData()
  fetchJobs()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}
</style>