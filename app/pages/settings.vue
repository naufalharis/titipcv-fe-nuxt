<!-- pages/settings/index.vue -->
<template>
  <div class="animate-fade-in">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Site Settings</h1>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage site-wide settings and configurations.</p>
    </div>

    <!-- Tabs -->
    <div class="mb-6 border-b border-slate-200 dark:border-slate-700">
      <div class="flex gap-4 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          class="px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap"
          :class="[
            activeTab === tab.value 
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          ]"
        >
          {{ tab.label }}
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
        @click="fetchSettings" 
        class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Retry
      </button>
    </div>

    <!-- Settings Forms -->
    <div v-else>
      <!-- Tab 1: Site Settings (Maintenance Mode) -->
      <div v-if="activeTab === 'site'" class="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Maintenance Mode</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Enable maintenance mode to temporarily disable access to the site for regular users.</p>
        
        <div class="space-y-6">
          <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div>
              <h3 class="font-medium text-slate-900 dark:text-white">Enable Maintenance Mode</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">When enabled, the site will be inaccessible to non-admin users.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.maintenanceMode" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Tab 2: Company List -->
      <div v-if="activeTab === 'company'" class="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Company List</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Manage the list of company names displayed on the home page</p>

        <div class="space-y-6">
          <!-- Enable Company List Toggle -->
          <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div>
              <h3 class="font-medium text-slate-900 dark:text-white">Enable Company List</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">When enabled, the company list will be displayed on the home page after the countdown</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.companyListEnabled" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <!-- Company List Items -->
          <div v-if="form.companyListEnabled" class="space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="font-medium text-slate-900 dark:text-white">Company Names</h3>
              <button @click="showAddCompanyModal = true" class="px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Add
              </button>
            </div>

            <div class="space-y-2">
              <div v-for="(company, index) in companyList" :key="index" class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <span class="text-slate-700 dark:text-slate-300">{{ company }}</span>
                <div class="flex items-center gap-2">
                  <button @click="editCompany(index)" class="text-primary-600 hover:text-primary-700 text-sm">Edit</button>
                  <span class="text-slate-300 dark:text-slate-600">|</span>
                  <button @click="removeCompany(index)" class="text-red-600 hover:text-red-700 text-sm">Remove</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 3: Banner Settings -->
      <div v-if="activeTab === 'banner'" class="space-y-6">
        <!-- Popup Banner -->
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Popup Banner</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Configure a popup banner that appears on the home page. Users can dismiss it, and it will respect cookie settings.</p>

          <div class="space-y-6">
            <!-- Enable Popup Banner -->
            <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div>
                <h3 class="font-medium text-slate-900 dark:text-white">Enable Popup Banner</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400">When enabled, a popup banner will appear on the home page for users.</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="form.popupBannerEnabled" class="sr-only peer">
                <div class="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div v-if="form.popupBannerEnabled" class="space-y-6">
              <!-- Banner Image Preview -->
              <div class="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div class="bg-slate-100 dark:bg-slate-700 rounded-lg p-6 text-center">
                  <p class="text-slate-500 dark:text-slate-400">Banner Image Preview</p>
                  <div class="mt-2 text-primary-600 dark:text-primary-400 font-medium">altitip.tv</div>
                  <div class="text-2xl font-bold text-slate-900 dark:text-white">VIRTUAL JOB FAIR</div>
                  <div class="text-slate-600 dark:text-slate-300">24 - 30 NOVEMBER 2025</div>
                  <div class="text-green-600 dark:text-green-400 font-semibold mt-2">FREE</div>
                  <div class="text-sm text-slate-500 dark:text-slate-400 mt-2">100+ COMPANY PARTICIPANT | LOBBY JOB OPPORTUNITY</div>
                  <div class="text-sm text-slate-500 dark:text-slate-400">TO ADD SUBSCRIBERS (FREE CONSULTANT & EXPERIENCED)</div>
                </div>
                <button class="mt-4 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm">
                  Change Banner Image
                </button>
              </div>

              <!-- Auto-close Timer -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Auto-close Timer (seconds)</label>
                <input 
                  v-model.number="form.popupBannerAutoCloseSeconds" 
                  type="number" 
                  min="0"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                />
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Set to 0 to disable auto-close. Popup will close automatically after the specified seconds.</p>
              </div>

              <!-- Display Behavior -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Display Behavior</label>
                <div class="flex items-center gap-4">
                  <label class="flex items-center gap-2">
                    <input type="radio" v-model="popupDisplayBehavior" value="refresh" class="text-primary-600 focus:ring-primary-500">
                    <span class="text-sm text-slate-700 dark:text-slate-300">Every Page Refresh (respects 1-day cookie)</span>
                  </label>
                  <label class="flex items-center gap-2">
                    <input type="radio" v-model="popupDisplayBehavior" value="once" class="text-primary-600 focus:ring-primary-500">
                    <span class="text-sm text-slate-700 dark:text-slate-300">Show Only Once (until cookie expires after 1 day)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Banner -->
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Profile Banner</h2>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.profileBannerEnabled" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>

        <!-- Footer Banner -->
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Footer Banner</h2>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.footerBannerEnabled" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>

        <!-- Company List Banner -->
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Company List Banner</h2>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.companyListBannerEnabled" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>

        <!-- Job List Banner -->
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Job List Banner</h2>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.jobListBannerEnabled" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Save Buttons -->
      <div class="mt-6 flex justify-end gap-3">
        <button 
          @click="resetForm" 
          class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Reset
        </button>
        <button 
          @click="saveSettings" 
          :disabled="saving"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="saving" class="flex items-center gap-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Saving...
          </span>
          <span v-else>Save Settings</span>
        </button>
      </div>
    </div>

    <!-- Add Company Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showAddCompanyModal" class="modal-overlay" @click.self="showAddCompanyModal = false">
          <div class="modal-container modal-sm">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Add Company</h3>
              <button @click="showAddCompanyModal = false" class="modal-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div class="modal-body">
              <div class="mb-4">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                <input 
                  v-model="newCompanyName" 
                  type="text" 
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                  placeholder="Enter company name"
                />
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Advanced Mode</p>
            </div>

            <div class="modal-footer">
              <button 
                @click="showAddCompanyModal = false" 
                class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                @click="addCompany" 
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useSiteSettings, type SiteSettings, type UpdateSiteSettingsRequest } from '~/composables/useSiteSettings'

const { getSiteSettings, updateSiteSettings } = useSiteSettings()

// Tabs
const tabs = [
  { label: 'Site Settings', value: 'site' },
  { label: 'Company List', value: 'company' },
  { label: 'Banner Settings', value: 'banner' }
]
const activeTab = ref('site')

// State
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const originalSettings = ref<SiteSettings | null>(null)

// Form
const form = reactive<UpdateSiteSettingsRequest>({
  maintenanceMode: false,
  companyListEnabled: false,
  companyList: [],
  popupBannerEnabled: false,
  popupBannerAutoCloseSeconds: 0,
  popupBannerShowOnce: false,
  profileBannerEnabled: false,
  footerBannerEnabled: false,
  companyListBannerEnabled: false,
  jobListBannerEnabled: false
})

// Company list
const companyList = ref<string[]>([])
const showAddCompanyModal = ref(false)
const newCompanyName = ref<string>('') // Explicitly type as string
const editingCompanyIndex = ref<number | null>(null)

// Popup behavior
const popupDisplayBehavior = computed({
  get: () => form.popupBannerShowOnce ? 'once' : 'refresh',
  set: (value: string) => {
    form.popupBannerShowOnce = value === 'once'
  }
})

// Fetch settings
const fetchSettings = async () => {
  loading.value = true
  error.value = null
  
  try {
    const data = await getSiteSettings()
    originalSettings.value = data
    
    // Update form dengan data dari API
    form.maintenanceMode = data.maintenanceMode
    form.companyListEnabled = data.companyListEnabled
    form.popupBannerEnabled = data.popupBannerEnabled
    form.popupBannerAutoCloseSeconds = data.popupBannerAutoCloseSeconds || 0
    form.popupBannerShowOnce = data.popupBannerShowOnce
    form.profileBannerEnabled = data.profileBannerEnabled
    form.footerBannerEnabled = data.footerBannerEnabled
    form.companyListBannerEnabled = data.companyListBannerEnabled
    form.jobListBannerEnabled = data.jobListBannerEnabled
    
    // Parse companyList
    if (data.companyList) {
      if (Array.isArray(data.companyList)) {
        companyList.value = data.companyList as string[]
        form.companyList = data.companyList
      } else if (typeof data.companyList === 'string') {
        try {
          const parsed = JSON.parse(data.companyList)
          companyList.value = Array.isArray(parsed) ? parsed : []
          form.companyList = companyList.value
        } catch {
          companyList.value = []
          form.companyList = []
        }
      }
    } else {
      companyList.value = []
      form.companyList = []
    }
    
  } catch (err: any) {
    console.error('Error fetching settings:', err)
    error.value = err.message || 'Failed to load settings'
  } finally {
    loading.value = false
  }
}

// Save settings
const saveSettings = async () => {
  saving.value = true
  error.value = null
  
  try {
    // Update companyList dari companyList.value
    if (form.companyListEnabled) {
      form.companyList = companyList.value
    } else {
      form.companyList = []
    }
    
    await updateSiteSettings(form)
    
    // Refresh data
    await fetchSettings()
    
  } catch (err: any) {
    console.error('Error saving settings:', err)
    error.value = err.message || 'Failed to save settings'
  } finally {
    saving.value = false
  }
}

// Reset form ke nilai original
const resetForm = () => {
  if (originalSettings.value) {
    form.maintenanceMode = originalSettings.value.maintenanceMode
    form.companyListEnabled = originalSettings.value.companyListEnabled
    form.popupBannerEnabled = originalSettings.value.popupBannerEnabled
    form.popupBannerAutoCloseSeconds = originalSettings.value.popupBannerAutoCloseSeconds || 0
    form.popupBannerShowOnce = originalSettings.value.popupBannerShowOnce
    form.profileBannerEnabled = originalSettings.value.profileBannerEnabled
    form.footerBannerEnabled = originalSettings.value.footerBannerEnabled
    form.companyListBannerEnabled = originalSettings.value.companyListBannerEnabled
    form.jobListBannerEnabled = originalSettings.value.jobListBannerEnabled
    
    // Reset companyList
    if (originalSettings.value.companyList) {
      if (Array.isArray(originalSettings.value.companyList)) {
        companyList.value = originalSettings.value.companyList as string[]
        form.companyList = originalSettings.value.companyList
      } else if (typeof originalSettings.value.companyList === 'string') {
        try {
          const parsed = JSON.parse(originalSettings.value.companyList)
          companyList.value = Array.isArray(parsed) ? parsed : []
          form.companyList = companyList.value
        } catch {
          companyList.value = []
          form.companyList = []
        }
      }
    } else {
      companyList.value = []
      form.companyList = []
    }
  }
}

// Company list methods
const addCompany = () => {
  // Ensure newCompanyName.value is always treated as string
  const companyName = newCompanyName.value || ''
  const trimmedName = companyName.trim()
  
  if (trimmedName) {
    if (editingCompanyIndex.value !== null) {
      // Edit existing
      companyList.value[editingCompanyIndex.value] = trimmedName
      editingCompanyIndex.value = null
    } else {
      // Add new
      companyList.value.push(trimmedName)
    }
    newCompanyName.value = ''
    showAddCompanyModal.value = false
  }
}

const editCompany = (index: number) => {
  newCompanyName.value = companyList.value[index] || ''
  editingCompanyIndex.value = index
  showAddCompanyModal.value = true
}

const removeCompany = (index: number) => {
  if (confirm('Are you sure you want to remove this company?')) {
    companyList.value.splice(index, 1)
  }
}

// Watch untuk reset editing index saat modal ditutup
watch(showAddCompanyModal, (val) => {
  if (!val) {
    setTimeout(() => {
      newCompanyName.value = ''
      editingCompanyIndex.value = null
    }, 300)
  }
})

// Initial fetch
onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-container.modal-sm { max-width: 400px; }
.modal-container.modal-lg { max-width: 900px; }
.modal-container.modal-xl { max-width: 1200px; }
.dark .modal-container { background: #1e293b; }

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.dark .modal-header { border-bottom-color: #334155; }

.modal-close-btn {
  padding: 0.5rem;
  border-radius: 0.5rem;
  color: #64748b;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.dark .modal-close-btn:hover {
  background: #334155;
  color: #f1f5f9;
}

.modal-body { padding: 1.5rem; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 0 0 1rem 1rem;
}

.dark .modal-footer {
  border-top-color: #334155;
  background: #0f172a;
}

.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.3s ease;
}
.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: translateY(-20px);
}
</style>