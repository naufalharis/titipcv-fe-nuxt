<template>
  <aside 
    class="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 h-full w-64 fixed lg:static z-40 transform"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
  >
    <!-- Logo area -->
    <div class="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
      <div class="flex items-center gap-2 text-primary-600 dark:text-primary-500 font-bold text-xl">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <span>AdminCMS</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      <!-- Filter menu berdasarkan auth status dan role -->
      <template v-for="item in filteredNavigation" :key="item.name">
        <div
          @click="navigateToPage(item.path)"
          class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group cursor-pointer"
          :class="isActive(item.path) 
            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' 
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'"
        >
          <component 
            :is="item.icon" 
            class="mr-3 h-5 w-5 flex-shrink-0 transition-colors"
            :class="isActive(item.path) 
              ? 'text-primary-700 dark:text-primary-400' 
              : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400'"
          />
          {{ item.name }}
        </div>
      </template>

      <!-- Logout button (hanya tampil jika sudah login) -->
      <button 
        v-if="isAuthenticated"
        @click="handleLogout"
        class="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="mr-3 h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.625A3.375 3.375 0 0012.375 2h-6.75A3.375 3.375 0 002.25 5.625V9m16.5 0v10.125A3.375 3.375 0 0112.375 22h-6.75A3.375 3.375 0 012.25 18.125V9m16.5 0h-16.5" />
        </svg>
        Logout
      </button>
    </nav>

    <!-- Footer Profile (hanya tampil jika sudah login) -->
    <div v-if="isAuthenticated && user" class="p-4 border-t border-slate-200 dark:border-slate-800">
      <div class="flex items-center">
        <img 
          class="h-9 w-9 rounded-full bg-slate-200 object-cover" 
          :src="userAvatar" 
          :alt="userName"
        />
        <div class="ml-3 flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{{ userName }}</p>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{{ userEmail }}</p>
          <p class="text-xs text-primary-600 dark:text-primary-400 mt-0.5">{{ userRoleText }}</p>
        </div>
      </div>
    </div>
  </aside>

  <!-- Mobile Overlay -->
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
    @click="$emit('close')"
  ></div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const props = defineProps({
  isOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const route = useRoute()
const router = useRouter()
const { isAuthenticated, user, logout } = useAuth()

// User info
const userName = computed(() => {
  if (!user.value) return 'Guest'
  return user.value.name || user.value.username || user.value.email?.split('@')[0] || 'User'
})

const userEmail = computed(() => {
  if (!user.value) return ''
  return user.value.email || ''
})

const userRole = computed(() => {
  if (!user.value) return null
  return user.value.role?.toUpperCase() || ''
})

const userRoleText = computed(() => {
  const role = userRole.value
  if (role === 'RECRUITER') return 'Recruiter'
  if (role === 'JOBSEEKER') return 'Job Seeker'
  if (role === 'ADMIN') return 'Administrator'
  return 'User'
})

const userAvatar = computed(() => {
  const name = userName.value
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`
})

const isActive = (path) => {
  const currentPath = route.path
  const targetPath = path.startsWith('/') ? path : `/${path}`
  return currentPath === targetPath || currentPath.startsWith(targetPath + '/')
}

// Navigasi manual
const navigateToPage = (path) => {
  const targetPath = path.startsWith('/') ? path : `/${path}`
  console.log('Navigating to:', targetPath)
  router.push(targetPath)
  emit('close')
}

// Definisi menu berdasarkan role
const getMenuByRole = () => {
  const role = userRole.value
  
  // Menu Home selalu ada untuk semua role yang sudah login
  const homeMenu = { name: 'Home', path: '/', icon: IconHome }
  
  if (role === 'RECRUITER') {
    return [
      homeMenu,
      { name: 'Dashboard', path: '/recruiter/dashboard', icon: IconDashboard },
      { name: 'Manage Jobs', path: '/recruiter/jobs', icon: IconJobs },
      { name: 'Post Job', path: '/recruiter/job-create', icon: IconPostJob },
      { name: 'Shared Profiles', path: '/recruiter/shared-profiles', icon: IconShare },
      { name: 'Company Profile', path: '/recruiter/company-profile', icon: IconCompany },
    ]
  }
  
  if (role === 'JOBSEEKER') {
    return [
      homeMenu,
      { name: 'Dashboard', path: '/jobseeker/dashboard', icon: IconDashboardJobseeker },
      { name: 'My Profile', path: '/jobseeker/profile', icon: IconProfile },
      { name: 'My Applications', path: '/jobseeker/applications', icon: IconApplications },
      { name: 'Saved Jobs', path: '/jobseeker/saved-jobs', icon: IconBookmark },
    ]
  }
  
  // Default untuk admin
  return [
    homeMenu,
    { name: 'Dashboard', path: '/dashboard', icon: IconDashboard },
    { name: 'Users', path: '/users', icon: IconUsers },
  ]
}

// Filter navigation berdasarkan auth status dan role
const filteredNavigation = computed(() => {
  // Jika belum login, tampilkan menu public
  if (!isAuthenticated.value) {
    return [
      { name: 'Home', path: '/', icon: IconHome },
      { name: 'Login', path: '/login', icon: IconLogin },
      { name: 'Register', path: '/register', icon: IconRegister },
    ]
  }
  
  // Jika sudah login, tampilkan menu sesuai role (termasuk Home)
  return getMenuByRole()
})

const handleLogout = async () => {
  await logout()
  router.push('/login')
}

// Ikon
const IconHome = (props) => h('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })
])

const IconLogin = (props) => h('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M15.75 9V5.625A3.375 3.375 0 0012.375 2h-6.75A3.375 3.375 0 002.25 5.625V9m16.5 0v10.125A3.375 3.375 0 0112.375 22h-6.75A3.375 3.375 0 012.25 18.125V9m16.5 0h-16.5' })
])

const IconRegister = (props) => h('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z' })
])

const IconDashboard = (props) => h('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })
])

const IconDashboardJobseeker = (props) => h('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })
])

const IconProfile = (props) => h('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
])

const IconJobs = (props) => h('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' })
])

const IconPostJob = (props) => h('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 4v16m8-8H4' })
])

const IconShare = (props) => h('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' })
])

const IconCompany = (props) => h('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' })
])

const IconUsers = (props) => h('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })
])

const IconApplications = (props) => h('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
])

const IconBookmark = (props) => h('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z' })
])
</script>