// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxtjs/turnstile'
  ],
  turnstile: {
    siteKey: process.env.NUXT_TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
    addValidateEndpoint: true
  },
  // runtime configuration available both on client and server
  runtimeConfig: {
    public: {
      // LANGSUNG KE BACKEND, BYPASS PROXY
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3335/api/v1',
    }
  },
  devServer: {
    port: 3001
  },
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light'
  },
  css: [
    '~/assets/scss/main.scss'
  ],
  tailwindcss: {
    configPath: 'tailwind.config.ts',
    cssPath: '~/assets/scss/main.scss',
  }
})