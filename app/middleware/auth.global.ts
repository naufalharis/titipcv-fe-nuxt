// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, checkAuth } = useAuth()
  
  if (process.client) {
    checkAuth()
  }
  
  console.log('📍 Middleware - path:', to.path, 'isAuthenticated:', isAuthenticated.value)

  // Daftar prefix halaman publik (tanpa login)
  const publicPrefixes = [
    '/candidate-profile',  // Semua halaman candidate profile
  ]
  
  // Daftar halaman publik exact match
  const publicPages = [
    '/', 
    '/about', 
    '/contact',
    '/login',        // Tambahkan ini
    '/register',     // Tambahkan ini
    '/forgot-password' // Tambahkan ini
  ]
  
  // Cek apakah halaman termasuk dalam public prefixes
  const hasPublicPrefix = publicPrefixes.some(prefix => to.path.startsWith(prefix))
  
  // Cek apakah halaman auth (login, register, forgot-password)
  const isAuthPage = to.path === '/login' || to.path === '/register' || to.path === '/forgot-password'
  
  // JIKA SUDAH DI HALAMAN AUTH, LANGSUNG IZINKAN - INI KUNCI UTAMA
  if (isAuthPage) {
    console.log('✅ Auth page - allowing access:', to.path)
    return
  }
  
  // Jika halaman publik (exact match atau prefix match), izinkan akses
  if (publicPages.includes(to.path) || hasPublicPrefix) {
    console.log('✅ Public page - allowed:', to.path)
    return
  }

  // Jika user belum login, redirect ke login
  if (!isAuthenticated.value) {
    console.log('⛔ Redirect to login - not authenticated')
    return navigateTo('/login')
  }

  // User sudah login dan halaman protected
  console.log('✅ Authenticated - allowed:', to.path)
})