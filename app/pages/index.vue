<template>
  <div>
    <!-- Maintenance Mode Banner -->
    <div 
      v-if="siteSettings.maintenanceMode" 
      class="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 class="font-medium text-amber-800 dark:text-amber-300">Maintenance Mode Active</h3>
          <p class="text-sm text-amber-600 dark:text-amber-400">Your site is currently in maintenance mode. Only admins can access the site.</p>
        </div>
      </div>
      <button 
        v-if="isAuthenticated"
        @click="disableMaintenanceMode"
        class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors"
      >
        Disable
      </button>
    </div>

    <!-- Page Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Site Settings Home</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage and preview your site's configuration</p>
      </div>
      
      <!-- Company List Status -->
      <div 
        v-if="siteSettings.companyListEnabled"
        class="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg"
      >
        <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
        <span class="text-sm text-emerald-700 dark:text-emerald-400">Company List Active</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-rose-600 dark:text-rose-400">{{ error }}</p>
      <button 
        @click="fetchSiteSettings" 
        class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Retry
      </button>
    </div>

    <!-- Home Content -->
    <template v-else>
      <!-- Popup Banner Preview Button - Hanya untuk admin yang sudah login -->
      <div v-if="isAuthenticated" class="mb-6 flex justify-end">
        <button
          v-if="siteSettings.popupBannerEnabled && siteSettings.popupBannerImage"
          @click="showPopupPreview = true"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview Popup Banner
        </button>
      </div>

      <!-- Banners Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Profile Banner -->
        <div 
          v-if="siteSettings.profileBannerEnabled && siteSettings.profileBannerImage"
          class="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 h-48 group cursor-pointer hover:shadow-lg transition-shadow"
          @click="openBannerUrl(siteSettings.profileBannerUrl)"
        >
          <img 
            :src="siteSettings.profileBannerImage.url" 
            :alt="siteSettings.profileBannerImage.alt || 'Profile Banner'"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
            <span class="text-white font-medium">Profile Banner Active</span>
          </div>
          <span class="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-lg">
            Click to open
          </span>
        </div>
        <div v-else class="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
          <p class="text-slate-500 dark:text-slate-400">Profile Banner Disabled</p>
        </div>

        <!-- Footer Banner -->
        <div 
          v-if="siteSettings.footerBannerEnabled && siteSettings.footerBannerImage"
          class="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 h-48 group cursor-pointer hover:shadow-lg transition-shadow"
          @click="openBannerUrl(siteSettings.footerBannerUrl)"
        >
          <img 
            :src="siteSettings.footerBannerImage.url" 
            :alt="siteSettings.footerBannerImage.alt || 'Footer Banner'"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
            <span class="text-white font-medium">Footer Banner Active</span>
          </div>
          <span class="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-lg">
            Click to open
          </span>
        </div>
        <div v-else class="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
          <p class="text-slate-500 dark:text-slate-400">Footer Banner Disabled</p>
        </div>
      </div>

      <!-- Company List Section - VERTICAL LIST (KE BAWAH) -->
      <div 
        v-if="siteSettings.companyListEnabled && siteSettings.companyList?.length"
        class="mb-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Featured Companies</h2>
          <span class="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded-full">
            {{ siteSettings.companyList.length }} Companies
          </span>
        </div>
        
        <!-- Search/Filter Bar -->
        <div class="mb-4">
          <div class="relative">
            <input 
              v-model="companySearch"
              type="text"
              placeholder="Search companies..."
              class="w-full px-4 py-2 pl-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <!-- LIST VERTICAL (KE BAWAH) -->
        <div class="space-y-2">
          <div 
            v-for="(company, index) in filteredCompanies" 
            :key="index"
            class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md group"
          >
            <!-- Company Initial/Logo -->
            <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <span class="text-blue-600 dark:text-blue-400 font-bold text-base">
                {{ getCompanyInitial(company) }}
              </span>
            </div>
            
            <!-- Company Name -->
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-slate-900 dark:text-white text-sm md:text-base truncate" :title="company">
                {{ company }}
              </h3>
            </div>
            
            <!-- Copy Button - Tetap bisa digunakan oleh public -->
            <button 
              @click="copyCompanyName(company)"
              class="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
              :title="'Copy: ' + company"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Empty State for Search -->
        <div v-if="filteredCompanies.length === 0" class="text-center py-8">
          <p class="text-slate-500 dark:text-slate-400">No companies found matching "{{ companySearch }}"</p>
        </div>
        
        <!-- Company Count Info -->
        <div class="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
          <span>Showing {{ filteredCompanies.length }} of {{ siteSettings.companyList.length }} companies</span>
          <span class="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
            Total: {{ siteSettings.companyList.length }}
          </span>
        </div>
      </div>

      <!-- Company List Banner -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div 
          v-if="siteSettings.companyListBannerEnabled && siteSettings.companyListBannerImage"
          class="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 h-32 group cursor-pointer hover:shadow-lg transition-shadow"
          @click="openBannerUrl(siteSettings.companyListBannerUrl)"
        >
          <img 
            :src="siteSettings.companyListBannerImage.url" 
            :alt="siteSettings.companyListBannerImage.alt || 'Company List Banner'"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent flex items-center p-6">
            <span class="text-white font-semibold text-lg">Company List Banner Active</span>
          </div>
        </div>
        <div v-else class="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
          <p class="text-slate-500 dark:text-slate-400">Company List Banner Disabled</p>
        </div>

        <!-- Job List Banner -->
        <div 
          v-if="siteSettings.jobListBannerEnabled && siteSettings.jobListBannerImage"
          class="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 h-32 group cursor-pointer hover:shadow-lg transition-shadow"
          @click="openBannerUrl(siteSettings.jobListBannerUrl)"
        >
          <img 
            :src="siteSettings.jobListBannerImage.url" 
            :alt="siteSettings.jobListBannerImage.alt || 'Job List Banner'"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent flex items-center p-6">
            <span class="text-white font-semibold text-lg">Job List Banner Active</span>
          </div>
        </div>
        <div v-else class="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
          <p class="text-slate-500 dark:text-slate-400">Job List Banner Disabled</p>
        </div>
      </div>

      <!-- Settings Summary Card -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Settings Summary</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <span class="text-sm text-slate-600 dark:text-slate-400">Maintenance Mode</span>
            <span :class="siteSettings.maintenanceMode ? 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30' : 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30'" class="px-2 py-1 text-xs rounded-full">
              {{ siteSettings.maintenanceMode ? 'Active' : 'Inactive' }}
            </span>
          </div>
          
          <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <span class="text-sm text-slate-600 dark:text-slate-400">Company List</span>
            <span :class="siteSettings.companyListEnabled ? 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' : 'text-slate-600 bg-slate-200 dark:text-slate-400 dark:bg-slate-800'" class="px-2 py-1 text-xs rounded-full">
              {{ siteSettings.companyListEnabled ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
          
          <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <span class="text-sm text-slate-600 dark:text-slate-400">Popup Banner</span>
            <span :class="siteSettings.popupBannerEnabled ? 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' : 'text-slate-600 bg-slate-200 dark:text-slate-400 dark:bg-slate-800'" class="px-2 py-1 text-xs rounded-full">
              {{ siteSettings.popupBannerEnabled ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
          
          <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <span class="text-sm text-slate-600 dark:text-slate-400">Profile Banner</span>
            <span :class="siteSettings.profileBannerEnabled ? 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' : 'text-slate-600 bg-slate-200 dark:text-slate-400 dark:bg-slate-800'" class="px-2 py-1 text-xs rounded-full">
              {{ siteSettings.profileBannerEnabled ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
          
          <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <span class="text-sm text-slate-600 dark:text-slate-400">Footer Banner</span>
            <span :class="siteSettings.footerBannerEnabled ? 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' : 'text-slate-600 bg-slate-200 dark:text-slate-400 dark:bg-slate-800'" class="px-2 py-1 text-xs rounded-full">
              {{ siteSettings.footerBannerEnabled ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
          
          <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <span class="text-sm text-slate-600 dark:text-slate-400">Job List Banner</span>
            <span :class="siteSettings.jobListBannerEnabled ? 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' : 'text-slate-600 bg-slate-200 dark:text-slate-400 dark:bg-slate-800'" class="px-2 py-1 text-xs rounded-full">
              {{ siteSettings.jobListBannerEnabled ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
        </div>
        
        <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
          <p>Last updated: {{ new Date(siteSettings.updatedAt * 1000).toLocaleString() }}</p>
          <p class="mt-1">Settings ID: {{ siteSettings.id }}</p>
        </div>
      </div>
    </template>

    <!-- POPUP BANNER MODAL - AUTO OPEN & AUTO CLOSE -->
    <Teleport to="body">
      <div 
        v-if="showPopupPreview && siteSettings.popupBannerEnabled && siteSettings.popupBannerImage"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <!-- Background overlay - klik untuk close -->
        <div 
          class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          @click="closePopupPreview"
        ></div>

        <!-- Modal panel -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div 
            class="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-2xl transition-all max-w-2xl w-full"
            :class="{ 'animate-slide-up': true }"
          >
            <!-- Close button (X) -->
            <button
              @click="closePopupPreview"
              class="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/30 rounded-full text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Timer countdown (auto close) -->
            <div 
              v-if="popupAutoCloseSeconds > 0"
              class="absolute top-4 left-4 z-10 px-3 py-1.5 bg-black/20 backdrop-blur-sm rounded-full text-white text-sm font-medium flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Auto closes in {{ popupCountdown }}s
            </div>

            <!-- Banner Image -->
            <div class="relative">
              <img 
                :src="siteSettings.popupBannerImage.url" 
                :alt="siteSettings.popupBannerImage.alt || 'Popup Banner'"
                class="w-full max-h-[80vh] object-contain bg-slate-100 dark:bg-slate-900"
              />
            </div>

            <!-- Banner Info Footer -->
            <div class="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium text-slate-900 dark:text-white">Popup Banner</h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400">
                    Auto-closes in {{ siteSettings.popupBannerAutoCloseSeconds || 0 }} seconds | 
                    {{ siteSettings.popupBannerShowOnce ? 'Show once per session' : 'Show every time' }}
                  </p>
                </div>
              </div>
              <button
                @click="closePopupPreview"
                class="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useSiteSettings, type SiteSettings } from '~/composables/useSiteSettings'

const { isAuthenticated } = useAuth()
const { getSiteSettings, updateSiteSettings } = useSiteSettings()

// Search state
const companySearch = ref<string>('')

// Popup modal state
const showPopupPreview = ref<boolean>(false)
const popupCountdown = ref<number>(0)
let countdownTimer: NodeJS.Timeout | null = null

// Session storage key untuk popup once per session
const POPUP_SESSION_KEY = 'popup_banner_shown'

// Site settings dengan default values
const siteSettings = ref<SiteSettings>({
  id: '',
  maintenanceMode: false,
  companyListEnabled: false,
  companyList: [],
  popupBannerEnabled: false,
  popupBannerImageId: null,
  popupBannerImage: undefined,
  popupBannerAutoCloseSeconds: 5,
  popupBannerShowOnce: true,
  profileBannerEnabled: false,
  profileBannerImageId: null,
  profileBannerImage: undefined,
  profileBannerUrl: null,
  footerBannerEnabled: false,
  footerBannerImageId: null,
  footerBannerImage: undefined,
  footerBannerUrl: null,
  companyListBannerEnabled: false,
  companyListBannerImageId: null,
  companyListBannerImage: undefined,
  companyListBannerUrl: null,
  jobListBannerEnabled: false,
  jobListBannerImageId: null,
  jobListBannerImage: undefined,
  jobListBannerUrl: null,
  createdAt: 0,
  updatedAt: 0
})

// UI states
const loading = ref<boolean>(true)
const error = ref<string | null>(null)

// Computed property untuk auto close seconds
const popupAutoCloseSeconds = computed(() => {
  return siteSettings.value.popupBannerAutoCloseSeconds || 0
})

// Filtered companies based on search
const filteredCompanies = computed(() => {
  if (!companySearch.value.trim()) {
    return siteSettings.value.companyList || []
  }
  
  const searchTerm = companySearch.value.toLowerCase().trim()
  return (siteSettings.value.companyList || []).filter(company => 
    company.toLowerCase().includes(searchTerm)
  )
})

// Get company initial
const getCompanyInitial = (company: string): string => {
  if (!company) return 'C'
  
  // Remove PT. / CV. etc for initial
  const cleanName = company.replace(/^(PT\.?|CV\.?|PD\.?|UD\.?)\s*/i, '').trim()
  return cleanName.charAt(0).toUpperCase() || 'C'
}

// Copy company name to clipboard
const copyCompanyName = async (company: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(company)
    alert(`Copied: ${company}`)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Start countdown for popup
const startPopupCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  
  const autoCloseSeconds = siteSettings.value.popupBannerAutoCloseSeconds || 0
  
  if (autoCloseSeconds > 0) {
    popupCountdown.value = autoCloseSeconds
    
    countdownTimer = setInterval(() => {
      popupCountdown.value -= 1
      
      if (popupCountdown.value <= 0) {
        closePopupPreview()
      }
    }, 1000)
  }
}

// Close popup preview
const closePopupPreview = () => {
  showPopupPreview.value = false
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

// Check if popup should be shown based on showOnce setting
const shouldShowPopup = (): boolean => {
  if (!siteSettings.value.popupBannerEnabled || !siteSettings.value.popupBannerImage) {
    return false
  }
  
  // If showOnce is true, check session storage
  if (siteSettings.value.popupBannerShowOnce) {
    const popupShown = sessionStorage.getItem(POPUP_SESSION_KEY)
    if (popupShown === 'true') {
      return false
    }
  }
  
  return true
}

// Mark popup as shown in session storage
const markPopupAsShown = () => {
  if (siteSettings.value.popupBannerShowOnce) {
    sessionStorage.setItem(POPUP_SESSION_KEY, 'true')
  }
}

// Show popup if conditions are met
const showPopupIfNeeded = () => {
  if (shouldShowPopup()) {
    showPopupPreview.value = true
    markPopupAsShown()
  }
}

// Watch for popup modal open
watch(showPopupPreview, (newVal) => {
  if (newVal) {
    startPopupCountdown()
  } else {
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }
})

// Disable maintenance mode
const disableMaintenanceMode = async (): Promise<void> => {
  try {
    await updateSiteSettings({
      maintenanceMode: false
    })
    await fetchSiteSettings()
    alert('Maintenance mode disabled successfully')
  } catch (err) {
    console.error('Error disabling maintenance mode:', err)
    alert('Failed to disable maintenance mode')
  }
}

// Open banner URL
const openBannerUrl = (url?: string | null): void => {
  if (url) {
    window.open(url, '_blank')
  } else {
    alert('No URL configured for this banner')
  }
}

// Fetch site settings - PUBLIC
const fetchSiteSettings = async (): Promise<void> => {
  loading.value = true
  error.value = null
  
  try {
    const settings = await getSiteSettings()
    siteSettings.value = settings as SiteSettings
    console.log('Site settings loaded:', siteSettings.value)
    
    // TAMPILKAN POPUP OTOMATIS SETELAH DATA LOAD
    showPopupIfNeeded()
  } catch (err: any) {
    console.error('Error fetching site settings:', err)
    error.value = err?.message || 'Failed to load site settings'
  } finally {
    loading.value = false
  }
}

// LANGSUNG PANGGIL TANPA CEK LOGIN
onMounted(() => {
  fetchSiteSettings()
})

// Cleanup on unmount
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
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