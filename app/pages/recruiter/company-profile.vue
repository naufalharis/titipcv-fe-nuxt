<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Company Profile</h1>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {{ hasCompany ? 'Manage your company information' : 'Create your company profile to start posting jobs' }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-rose-600 dark:text-rose-400">{{ error }}</p>
      <button 
        @click="fetchCompanyData" 
        class="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg transition-colors"
      >
        Retry
      </button>
    </div>

    <!-- Company Form -->
    <template v-else>
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <!-- Form Header with Logo -->
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-6">
            <!-- Logo Upload Area -->
            <div class="relative">
              <div 
                class="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-500 transition-colors cursor-pointer group"
                :class="{ 'opacity-50 cursor-wait': uploadingLogo }"
                @click="!uploadingLogo && triggerFileInput()"
              >
                <img 
                  v-if="companyForm.logoUrl" 
                  :src="companyForm.logoUrl" 
                  alt="Company Logo" 
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                  @load="handleImageLoad"
                />
                <div v-else class="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-400 dark:text-slate-500 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-xs text-slate-500 dark:text-slate-400">
                    {{ uploadingLogo ? 'Uploading...' : 'Upload Logo' }}
                  </span>
                </div>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                :disabled="uploadingLogo"
                @change="handleLogoUpload"
              />
              <button 
                v-if="companyForm.logoUrl && hasCompany && !uploadingLogo"
                @click="removeLogo"
                class="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors shadow-sm"
                title="Remove logo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div v-if="uploadingLogo" class="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                <div class="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              </div>
            </div>
            
            <div>
              <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
                {{ hasCompany ? 'Edit Company Profile' : 'Create Company Profile' }}
              </h2>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {{ hasCompany ? 'Update your company information' : 'Fill in your company details to get started' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Form Content -->
        <form @submit.prevent="handleSubmit" class="p-6">
          <!-- Company Information Section -->
          <div class="mb-8">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-6">Company Information</h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Company Name -->
              <div class="lg:col-span-2">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company Name <span class="text-rose-500">*</span>
                </label>
                <input
                  v-model="companyForm.name"
                  type="text"
                  required
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="Enter company name"
                />
              </div>

              <!-- Industry -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Industry
                </label>
                <input
                  v-model="companyForm.industry"
                  type="text"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="Financial Technology"
                />
              </div>

              <!-- Company Size -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company Size <span class="text-rose-500">*</span>
                </label>
                <select
                  v-model="companyForm.size"
                  required
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                >
                  <option value="">Select Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>

              <!-- Email address -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email address <span class="text-rose-500">*</span>
                </label>
                <input
                  v-model="companyForm.email"
                  type="email"
                  required
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="company@example.com"
                />
              </div>

              <!-- Phone Number -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Phone Number <span class="text-rose-500">*</span>
                </label>
                <input
                  v-model="companyForm.phone"
                  type="tel"
                  required
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="+62 812 3456 7890"
                />
              </div>

              <!-- Website -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Website
                </label>
                <input
                  v-model="companyForm.website"
                  type="url"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          <!-- Person In Charge (PIC) Section -->
          <div class="mb-8 pt-8 border-t border-slate-200 dark:border-slate-800">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-6">Person In Charge (PIC)</h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- PIC Name -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Name <span class="text-rose-500">*</span>
                </label>
                <input
                  v-model="companyForm.pic_name"
                  type="text"
                  required
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="Full name"
                />
              </div>

              <!-- PIC Position -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Position <span class="text-rose-500">*</span>
                </label>
                <input
                  v-model="companyForm.pic_position"
                  type="text"
                  required
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="HR Manager"
                />
              </div>

              <!-- PIC Email -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email address <span class="text-rose-500">*</span>
                </label>
                <input
                  v-model="companyForm.pic_email"
                  type="email"
                  required
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="pic@company.com"
                />
              </div>

              <!-- PIC WhatsApp -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  WhatsApp Number <span class="text-rose-500">*</span>
                </label>
                <input
                  v-model="companyForm.pic_whatsapp"
                  type="tel"
                  required
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="+62 812 3456 7890"
                />
              </div>
            </div>
          </div>

          <!-- Location Section -->
          <div class="mb-8 pt-8 border-t border-slate-200 dark:border-slate-800">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-6">Location</h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Country -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Negara
                </label>
                <input
                  type="text"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="Indonesia"
                />
              </div>

              <!-- City -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Kota
                </label>
                <input
                  v-model="companyForm.city"
                  type="text"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="Jakarta"
                />
              </div>

              <!-- Province -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Provinsi
                </label>
                <input
                  v-model="companyForm.province"
                  type="text"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="DKI Jakarta"
                />
              </div>

              <!-- District -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Kecamatan
                </label>
                <input
                  v-model="companyForm.district"
                  type="text"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="Central Jakarta"
                />
              </div>

              <!-- Address -->
              <div class="lg:col-span-2">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Alamat
                </label>
                <input
                  v-model="companyForm.address"
                  type="text"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="Street address"
                />
              </div>
            </div>
          </div>

          <!-- About Company Section -->
          <div class="mb-8 pt-8 border-t border-slate-200 dark:border-slate-800">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-6">About Company</h3>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                About Company
              </label>
              <textarea
                v-model="companyForm.about"
                rows="4"
                maxlength="1000"
                class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 text-slate-900 dark:text-white transition-colors resize-none"
                placeholder="Tell us about your company..."
              ></textarea>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {{ companyForm.about?.length || 0 }}/1000 characters
              </p>
            </div>
          </div>

          <!-- Company Introduction Video Section -->
          <div class="mb-8 pt-8 border-t border-slate-200 dark:border-slate-800">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-6">Company Introduction Video</h3>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Company Video URL
              </label>
              <input
                v-model="companyForm.videoUrl"
                type="url"
                class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 text-slate-900 dark:text-white transition-colors"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Paste a YouTube URL to show an embedded video preview
              </p>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
            <NuxtLink
              to="/recruiter"
              class="px-6 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </NuxtLink>
            <button
              type="submit"
              :disabled="submitting"
              class="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg v-if="submitting" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ hasCompany ? 'Update Company' : 'Create Company' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Company Status Card -->
      <div v-if="hasCompany" class="mt-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">Company Status</h3>
        <div class="flex items-center gap-3">
          <div 
            class="px-3 py-1.5 rounded-full text-sm font-medium"
            :class="{
              'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': company?.status === 'PENDING',
              'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': company?.status === 'APPROVED',
              'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400': company?.status === 'REJECTED'
            }"
          >
            {{ getStatusText(company?.status) }}
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            <span v-if="company?.status === 'PENDING'">
              Your company profile is under review. You'll be notified once it's approved.
            </span>
            <span v-else-if="company?.status === 'APPROVED'">
              Your company profile has been approved! You can now post jobs.
            </span>
            <span v-else-if="company?.status === 'REJECTED'">
              Your company profile was rejected. Please contact support for more information.
            </span>
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useCompany, type Company, type CreateCompanyRequest, type UpdateCompanyRequest } from '~/composables/useCompany'

const { user, isAuthenticated } = useAuth()
const router = useRouter()
const { getMyCompany, createMyCompany, updateMyCompany, uploadLogo, removeLogo: removeCompanyLogo } = useCompany()

// UI states
const loading = ref<boolean>(true)
const submitting = ref<boolean>(false)
const error = ref<string | null>(null)
const hasCompany = ref<boolean>(false)
const company = ref<Company | null>(null)
const uploadingLogo = ref<boolean>(false)

// File input ref
const fileInput = ref<HTMLInputElement | null>(null)

// Form data
const companyForm = reactive({
  name: '',
  about: '',
  industry: '',
  size: '',
  website: '',
  email: '',
  phone: '',
  pic_name: '',
  pic_position: '',
  pic_whatsapp: '',
  pic_email: '',
  address: '',
  province: '',
  district: '',
  city: '',
  videoUrl: '',
  logoUrl: ''
})

// Get status text
const getStatusText = (status?: string): string => {
  switch (status) {
    case 'PENDING': return 'Pending Review'
    case 'APPROVED': return 'Approved'
    case 'REJECTED': return 'Rejected'
    default: return 'Unknown'
  }
}

// Handle image load success
const handleImageLoad = () => {
  console.log('✅ Logo image loaded successfully')
}

// Handle image load error
const handleImageError = (event: Event) => {
  console.error('❌ Logo image failed to load:', companyForm.logoUrl)
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  // Tampilkan placeholder di parent
  const parent = img.parentElement
  if (parent) {
    const placeholder = document.createElement('div')
    placeholder.className = 'text-center'
    placeholder.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-400 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span class="text-xs text-slate-500">Invalid Image</span>
    `
    parent.appendChild(placeholder)
    img.remove()
  }
}

// Build asset URL from asset ID
const getAssetUrl = (assetId: string): string => {
  const runtimeConfig = useRuntimeConfig()
  const baseURL = runtimeConfig.public.apiBaseUrl || 'http://localhost:3335/api/v1'
  return `${baseURL}/assets/${assetId}`
}

// Get logo URL from company data
const getLogoUrl = (data: Company): string => {
  console.log('🔍 Getting logo URL...')
  
  // Priority 1: Jika ada companyLogo object dengan url
  if (data.companyLogo?.url) {
    console.log('✅ Using URL from companyLogo:', data.companyLogo.url)
    return data.companyLogo.url
  }
  
  // Priority 2: Jika ada companyLogoId, buat URL ke assets endpoint
  if (data.companyLogoId) {
    const url = getAssetUrl(data.companyLogoId)
    console.log('⚠️ Using URL from companyLogoId:', url)
    return url
  }
  
  console.log('❌ No logo found')
  return ''
}

// Trigger file input
const triggerFileInput = () => {
  fileInput.value?.click()
}

// Handle logo upload
const handleLogoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) {
    console.log('⚠️ No file selected')
    return
  }
  
  console.log('📸 File selected:', file.name, file.size, file.type)
  
  if (!company.value?.id) {
    alert('Please save company information first before uploading logo')
    return
  }
  
  if (file.size > 2 * 1024 * 1024) {
    alert('File size must be less than 2MB')
    return
  }
  
  if (!file.type.startsWith('image/')) {
    alert('Only image files are allowed')
    return
  }
  
  uploadingLogo.value = true
  
  try {
    const response = await uploadLogo(company.value.id, file)
    console.log('📤 Upload response:', response)
    
    if (response?.url) {
      companyForm.logoUrl = response.url
      
      if (company.value) {
        company.value.companyLogo = {
          id: response.id,
          originalName: response.originalName,
          fileName: response.fileName,
          location: response.location,
          mimeType: response.mimeType,
          url: response.url,
          size: response.size,
          createdAt: response.createdAt,
          updatedAt: response.updatedAt
        }
        company.value.companyLogoId = response.id
      }
      
      alert('Logo uploaded successfully!')
      await fetchCompanyData()
    } else {
      alert('Upload failed: No URL returned')
    }
  } catch (err: any) {
    console.error('❌ Error uploading logo:', err)
    alert(`Upload failed: ${err.message || 'Unknown error'}`)
  } finally {
    uploadingLogo.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

// Remove logo
const removeLogo = async () => {
  if (!company.value?.id) {
    alert('Company not found')
    return
  }
  
  if (!confirm('Are you sure you want to remove the company logo?')) {
    return
  }
  
  uploadingLogo.value = true
  
  try {
    await removeCompanyLogo(company.value.id)
    companyForm.logoUrl = ''
    if (company.value) {
      company.value.companyLogo = null
      company.value.companyLogoId = null
    }
    alert('Logo removed successfully!')
  } catch (err: any) {
    console.error('❌ Error removing logo:', err)
    alert(err?.message || 'Failed to remove logo')
  } finally {
    uploadingLogo.value = false
  }
}

// Fetch company data
const fetchCompanyData = async () => {
  loading.value = true
  error.value = null
  
  try {
    console.log('🔄 Fetching company data...')
    const data = await getMyCompany()
    
    console.log('📦 Raw data received:', data)
    
    if (data && data.id) {
      hasCompany.value = true
      company.value = data
      
      companyForm.name = data.name || ''
      companyForm.about = data.about || ''
      companyForm.industry = data.industry || ''
      companyForm.size = data.size || ''
      companyForm.website = data.website || ''
      companyForm.email = data.email || ''
      companyForm.phone = data.phone || ''
      companyForm.pic_name = data.pic_name || ''
      companyForm.pic_position = data.pic_position || ''
      companyForm.pic_whatsapp = data.pic_whatsapp || ''
      companyForm.pic_email = data.pic_email || ''
      companyForm.address = data.address || ''
      companyForm.province = data.province || ''
      companyForm.district = data.district || ''
      companyForm.city = data.city || ''
      companyForm.videoUrl = data.videoUrl || ''
      
      companyForm.logoUrl = getLogoUrl(data)
      console.log('🎯 Final logo URL:', companyForm.logoUrl)
    } else {
      console.log('❌ No company data found')
      hasCompany.value = false
      company.value = null
      
      // Reset form
      companyForm.name = ''
      companyForm.about = ''
      companyForm.industry = ''
      companyForm.size = ''
      companyForm.website = ''
      companyForm.email = ''
      companyForm.phone = ''
      companyForm.pic_name = ''
      companyForm.pic_position = ''
      companyForm.pic_whatsapp = ''
      companyForm.pic_email = ''
      companyForm.address = ''
      companyForm.province = ''
      companyForm.district = ''
      companyForm.city = ''
      companyForm.videoUrl = ''
      companyForm.logoUrl = ''
    }
  } catch (err: any) {
    console.error('❌ Error fetching company:', err)
    error.value = err?.message || 'Failed to load company data'
  } finally {
    loading.value = false
  }
}

// Handle form submit
const handleSubmit = async () => {
  if (!companyForm.name.trim()) {
    alert('Company name is required')
    return
  }

  if (!companyForm.size) {
    alert('Company size is required')
    return
  }

  if (!companyForm.email.trim()) {
    alert('Company email is required')
    return
  }

  if (!companyForm.phone.trim()) {
    alert('Company phone number is required')
    return
  }

  if (!companyForm.pic_name.trim()) {
    alert('PIC name is required')
    return
  }

  if (!companyForm.pic_position.trim()) {
    alert('PIC position is required')
    return
  }

  if (!companyForm.pic_email.trim()) {
    alert('PIC email is required')
    return
  }

  if (!companyForm.pic_whatsapp.trim()) {
    alert('PIC WhatsApp number is required')
    return
  }
  
  submitting.value = true
  error.value = null
  
  try {
    const data = {
      name: companyForm.name,
      about: companyForm.about || null,
      industry: companyForm.industry || null,
      size: companyForm.size || null,
      website: companyForm.website || null,
      email: companyForm.email || null,
      phone: companyForm.phone || null,
      pic_name: companyForm.pic_name || null,
      pic_position: companyForm.pic_position || null,
      pic_whatsapp: companyForm.pic_whatsapp || null,
      pic_email: companyForm.pic_email || null,
      address: companyForm.address || null,
      province: companyForm.province || null,
      district: companyForm.district || null,
      city: companyForm.city || null,
      videoUrl: companyForm.videoUrl || null
    }
    
    console.log('📝 Submitting company data:', data)
    
    let result: Company
    
    if (hasCompany.value && company.value?.id) {
      console.log('🔄 Updating existing company:', company.value.id)
      result = await updateMyCompany(data as UpdateCompanyRequest)
      alert('Company updated successfully!')
    } else {
      console.log('✨ Creating new company')
      result = await createMyCompany(data as CreateCompanyRequest)
      alert('Company created successfully!')
    }
    
    company.value = result
    hasCompany.value = true
    
    await fetchCompanyData()
    
  } catch (err: any) {
    console.error('❌ Error saving company:', err)
    error.value = err?.data?.error || err?.message || 'Failed to save company data'
    alert(error.value)
  } finally {
    submitting.value = false
  }
}

// Initial fetch
onMounted(() => {
  console.log('🚀 Component mounted, isAuthenticated:', isAuthenticated.value)
  if (isAuthenticated.value) {
    fetchCompanyData()
  } else {
    error.value = 'Please login to view company profile'
    loading.value = false
  }
})

// Watch for auth changes
watch(() => isAuthenticated.value, (newVal) => {
  console.log('👀 Auth changed:', newVal)
  if (newVal) {
    fetchCompanyData()
  } else {
    error.value = 'Please login to view company profile'
    loading.value = false
  }
})
</script>