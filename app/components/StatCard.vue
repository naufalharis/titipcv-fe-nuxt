<template>
  <div class="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{{ title }}</p>
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white">{{ value }}</h3>
      </div>
      <div 
        class="p-3 rounded-lg flex items-center justify-center transition-colors duration-300"
        :class="iconBgClass"
      >
        <slot name="icon">
           <!-- Default Icon if none provided -->
           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" :class="iconColorClass" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </slot>
      </div>
    </div>
    
    <div class="mt-4 flex items-center text-sm">
      <span v-if="trendType === 'up'" class="text-emerald-500 font-medium flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        {{ trend }}
      </span>
      <span v-else-if="trendType === 'down'" class="text-rose-500 font-medium flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
        </svg>
        {{ trend }}
      </span>
      <span v-else class="text-slate-500 dark:text-slate-400 font-medium">
        {{ trend }}
      </span>
      <span class="text-slate-500 dark:text-slate-400 ml-2">{{ trendText }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  trend: { type: String, default: '' },
  trendType: { type: String, default: 'neutral', validator: (v) => ['up', 'down', 'neutral'].includes(v) },
  trendText: { type: String, default: 'vs last month' },
  colorRef: { type: String, default: 'primary' } // 'primary', 'blue', 'amber', 'rose'
})

const iconBgClass = computed(() => {
  const map = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40',
    blue: 'bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40',
    amber: 'bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/40',
    rose: 'bg-rose-100 dark:bg-rose-900/30 group-hover:bg-rose-200 dark:group-hover:bg-rose-800/40',
  }
  return map[props.colorRef] || map.primary
})

const iconColorClass = computed(() => {
  const map = {
    primary: 'text-primary-600 dark:text-primary-400',
    blue: 'text-blue-600 dark:text-blue-400',
    amber: 'text-amber-600 dark:text-amber-400',
    rose: 'text-rose-600 dark:text-rose-400',
  }
  return map[props.colorRef] || map.primary
})
</script>
