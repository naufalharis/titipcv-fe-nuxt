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

          <!-- Salary -->
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

          <!-- Job Settings -->
          <div>
            <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-4">Job Settings</h3>
            <div class="space-y-4">
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
                  Published at <span class="text-rose-500">*</span>
                </label>
                <input
                  v-model="form.publishedAt"
                  type="date"
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
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Write -->
      <div v-if="currentStep === 1" class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Write</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Write the job description and requirements</p>
        </div>

        <div class="p-6 space-y-6">
          <!-- Job Description -->
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
                  Job Summary
                </label>
                <textarea
                  v-model="form.summary"
                  rows="3"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="Write a compelling statement about your role to entice more candidates..."
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Qualifications <span class="text-rose-500">*</span>
                </label>
                <textarea
                  v-model="form.qualification"
                  rows="4"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="List the required qualifications and skills..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Screening Questions -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-slate-900 dark:text-white">Screening Questions</h3>
              <button
                type="button"
                @click="addScreeningQuestion"
                class="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Add Question
              </button>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Add qualification questions that candidates must answer when applying
            </p>

            <div v-if="screeningQuestions.length > 0" class="space-y-4">
              <div
                v-for="(question, index) in screeningQuestions"
                :key="index"
                class="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/30"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1">
                    <input
                      v-model="question.question"
                      type="text"
                      class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
                      placeholder="Type your question here..."
                    />
                    <div class="flex flex-wrap items-center gap-4 mt-2">
                      <select
                        v-model="question.type"
                        class="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="TEXT">Short Answer</option>
                        <option value="TEXTAREA">Paragraph</option>
                        <option value="NUMBER">Number</option>
                        <option value="DATE">Date</option>
                        <option value="YES_NO">Yes/No</option>
                        <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                        <option value="CHECKBOX">Checkbox</option>
                      </select>
                      
                      <label class="flex items-center gap-2 text-sm">
                        <input
                          v-model="question.isRequired"
                          type="checkbox"
                          class="rounded border-slate-300 dark:border-slate-700 text-primary-600"
                        />
                        Required
                      </label>
                    </div>
                    
                    <!-- Options input untuk MULTIPLE_CHOICE atau CHECKBOX -->
                    <div v-if="question.type === 'MULTIPLE_CHOICE' || question.type === 'CHECKBOX'" class="mt-2">
                      <input
                        :value="question.options?.join(', ')"
                        @input="(e: Event) => updateOptions(index, (e.target as HTMLInputElement).value)"
                        type="text"
                        class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                        placeholder="Options (comma separated, e.g., Option 1, Option 2, Option 3)"
                      />
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Enter options separated by commas
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="removeScreeningQuestion(index)"
                    class="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No screening questions added yet.</p>
              <p class="text-xs mt-1">Click "Add Question" to get started.</p>
            </div>
          </div>

          <!-- Benefits -->
          <div>
            <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-4">Benefits</h3>
            <textarea
              v-model="form.benefits"
              rows="4"
              class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
              placeholder="List the benefits and perks..."
            ></textarea>
          </div>

          <!-- Video URL -->
          <div>
            <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-4">Video (optional)</h3>
            <div class="space-y-2">
              <input
                v-model="form.videoUrl"
                type="url"
                class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                placeholder="e.g., https://youtube.com/watch?v=abc123"
              />
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Add a video to your ad with a YouTube link. The video will appear at the bottom of your ad.
              </p>
            </div>
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
const steps = ['Classify', 'Write']
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

// Screening questions
interface ScreeningQuestion {
  question: string
  type: ScreeningQuestionType
  options?: string[]
  isRequired: boolean
}

const screeningQuestions = ref<ScreeningQuestion[]>([])

// Form data
const form = reactive({
  title: '',
  description: '',
  summary: '',
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

// Add screening question
const addScreeningQuestion = () => {
  screeningQuestions.value.push({
    question: '',
    type: 'TEXT',
    isRequired: true,
    options: []
  })
}

// Remove screening question
const removeScreeningQuestion = (index: number) => {
  screeningQuestions.value.splice(index, 1)
}

// Update options dengan safety check
const updateOptions = (index: number, optionsString: string) => {
  const question = screeningQuestions.value[index]
  if (question) {
    question.options = optionsString.split(',').map(opt => opt.trim()).filter(opt => opt)
  }
}

// Set published date to today
const setPublishedDateToToday = () => {
  if (!form.publishedAt) {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    form.publishedAt = `${year}-${month}-${day}`
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

// Check token validity
const isTokenValid = (): boolean => {
  const token = accessToken.value
  if (!token || typeof token !== 'string') return false
  
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    const base64 = parts[1]
    if (!base64) return false
    
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
    if (!form.currencyId) return false
    if (!form.payFrom && form.payFrom !== 0) return false
    if (!form.publishedAt) return false
    if (!isSalaryValid()) return false
    if (!isDatesValid()) return false
    return true
  }
  if (currentStep.value === 1) {
    if (!form.description) return false
    if (!form.qualification) return false
    return true
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
const formatDateToTimestamp = (dateStr: string): number => {
  if (!dateStr) return Math.floor(Date.now() / 1000)
  const date = new Date(dateStr)
  date.setHours(12, 0, 0, 0)
  return Math.floor(date.getTime() / 1000)
}

// Submit job
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
    // Prepare screening questions - gunakan answerType, bukan type
    const screeningQuestionsPayload = screeningQuestions.value
      .filter(q => q.question && q.question.trim())
      .map(q => ({
        question: q.question.trim(),
        answerType: q.type,  // ← Ubah dari 'type' ke 'answerType'
        isRequired: q.isRequired,
        options: q.options && q.options.length > 0 ? q.options : undefined
      }))
    
    // Konversi publishedAt dan expiresAt ke timestamp jika ada
    let publishedTimestamp = null
    let expiresTimestamp = null
    
    if (form.publishedAt) {
      const publishedDate = new Date(form.publishedAt)
      publishedDate.setHours(0, 0, 0, 0)
      publishedTimestamp = Math.floor(publishedDate.getTime() / 1000)
    }
    
    if (form.expiresAt) {
      const expiresDate = new Date(form.expiresAt)
      expiresDate.setHours(23, 59, 59, 999)
      expiresTimestamp = Math.floor(expiresDate.getTime() / 1000)
    }
    
    const payload = {
      companyId: form.companyId,
      title: form.title.trim(),
      description: form.description.trim(),
      summary: form.summary?.trim() || null,
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
      videoUrl: form.videoUrl?.trim() || '',
      showSalary: form.showSalary,
      isPrivate: form.isPrivate,
      publishedAt: publishedTimestamp,
      expiresAt: expiresTimestamp,
      screeningQuestions: screeningQuestionsPayload
    }
    
    console.log('📝 Full payload:', JSON.stringify(payload, null, 2))
    
    const result = await createJob(payload)
    console.log('✅ Job created successfully:', result)
    
    alert('Job posted successfully!')
    router.push('/recruiter/jobs')
  } catch (err: any) {
    console.error('Error creating job:', err)
    
    if (err?.response?.status === 401) {
      alert('Your session has expired. Please login again.')
      router.push('/auth/login')
    } else {
      const errorMessage = err?.data?.message || err?.data?.error || err?.message || 'Failed to create job'
      alert(errorMessage)
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
    // Prepare screening questions - gunakan answerType, bukan type
    const screeningQuestionsPayload = screeningQuestions.value
      .filter(q => q.question && q.question.trim())
      .map(q => ({
        question: q.question.trim(),
        answerType: q.type,  // ← Ubah dari 'type' ke 'answerType'
        isRequired: q.isRequired,
        options: q.options && q.options.length > 0 ? q.options : undefined
      }))
    
    const payload = {
      companyId: form.companyId,
      title: form.title.trim(),
      description: form.description?.trim() || 'Draft job',
      summary: form.summary?.trim() || null,
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
      videoUrl: form.videoUrl?.trim() || '',
      showSalary: form.showSalary,
      isPrivate: form.isPrivate,
      screeningQuestions: screeningQuestionsPayload
    }
    
    console.log('📝 Draft payload:', payload)
    
    const result = await saveJobAsDraft(payload)
    console.log('✅ Draft saved:', result)
    
    alert('Job saved as draft!')
    router.push('/recruiter/jobs')
  } catch (err: any) {
    console.error('Error saving draft:', err)
    
    if (err?.response?.status === 401) {
      alert('Your session has expired. Please login again.')
      router.push('/auth/login')
    } else {
      const errorMessage = err?.data?.message || err?.data?.error || err?.message || 'Failed to save draft'
      alert(errorMessage)
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
  setPublishedDateToToday()
  loading.value = false
})
</script>