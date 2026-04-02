<template>
  <div class="min-h-screen w-full flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
    <main class="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute inset-y-0 w-full h-full pointer-events-none overflow-hidden -z-10 bg-slate-50 dark:bg-slate-900">
        <div class="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-primary-50/50 to-transparent dark:from-primary-900/10 rounded-full blur-3xl transform rotate-12"></div>
        <div class="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-blue-50/50 to-transparent dark:from-blue-900/10 rounded-full blur-3xl transform -rotate-12"></div>
      </div>
      
      <div class="sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10 animate-fade-in text-center mb-8 flex flex-col items-center">
        <!-- Logo placeholder -->
        <div class="inline-flex items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-primary-600 dark:text-primary-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <slot name="header" />
      </div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl py-8 px-4 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 sm:rounded-2xl sm:px-10">
          <slot />
        </div>
      </div>
    </main>
    
    <!-- Dark Mode Toggle positioned absolutely for the guest layout -->
    <div class="absolute top-4 right-4 sm:top-6 sm:right-6">
      <div class="bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 p-1">
        <DarkModeToggle />
      </div>
    </div>
  </div>
</template>
