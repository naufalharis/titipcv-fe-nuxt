<template>
  <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">

    <!-- Header -->
    <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
        {{ title }}
      </h2>

      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          type="text"
          placeholder="Search..."
          class="pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-64 transition-colors"
          :value="search"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            <th v-for="col in columns" :key="col.key" class="p-4 whitespace-nowrap">
              {{ col.label }}
            </th>
            <th v-if="!hasActionsColumn" class="p-4 text-right">
              Actions
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">

          <tr
            v-for="(row, idx) in paginatedRows"
            :key="idx"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="p-4 text-sm text-slate-700 dark:text-slate-300"
            >
              <slot :name="`cell-${col.key}`" :row="row">
                {{ row[col.key] }}
              </slot>
            </td>

            <td v-if="!hasActionsColumn" class="p-4 text-right">
              <slot name="cell-actions" :row="row" />
            </td>
          </tr>

          <tr v-if="paginatedRows.length === 0">
            <td :colspan="columns.length + 1" class="p-8 text-center text-slate-500 dark:text-slate-400">
              No records found.
            </td>
          </tr>

        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalRows > 0"
      class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm"
    >
      <div class="text-slate-500 dark:text-slate-400">
        Showing
        <span class="font-medium text-slate-900 dark:text-slate-200">
          {{ startRow }}
        </span>
        to
        <span class="font-medium text-slate-900 dark:text-slate-200">
          {{ endRow }}
        </span>
        of
        <span class="font-medium text-slate-900 dark:text-slate-200">
          {{ totalRows }}
        </span>
        results
      </div>

      <div class="flex items-center gap-4">

        <!-- Per Page -->
        <div class="flex items-center gap-2">
          <span>Show</span>
          <select
            v-model="perPageLocal"
            @change="handlePerPageChange"
            class="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-sm"
          >
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
          <span>entries</span>
        </div>

        <!-- Pagination Buttons -->
        <div class="flex gap-2">

          <button
            class="px-3 py-1 border rounded-lg disabled:opacity-50"
            :disabled="props.page <= 1"
            @click="goToPreviousPage"
          >
            Previous
          </button>

          <template v-for="(p, index) in visiblePages" :key="index">
            <button
              v-if="p !== '...'"
              class="px-3 py-1 rounded-lg"
              :class="props.page === p ? 'bg-primary-600 text-white' : ''"
              @click="goToPage(p as number)"
            >
              {{ p }}
            </button>

            <span v-else class="px-2">...</span>
          </template>

          <button
            class="px-3 py-1 border rounded-lg disabled:opacity-50"
            :disabled="props.page >= totalPages"
            @click="goToNextPage"
          >
            Next
          </button>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type Column = {
  key: string
  label: string
}

interface Props {
  title?: string
  columns: Column[]
  rows: any[]
  total?: number
  page?: number
  perPage?: number
  search?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Data Table',
  total: 0,
  page: 1,
  perPage: 10,
  search: ''
})

const emit = defineEmits([
  'update:page',
  'update:perPage',
  'update:search'
])

const perPageLocal = ref(props.perPage)

watch(() => props.perPage, (val) => {
  perPageLocal.value = val
})

const totalRows = computed(() => {
  return props.total > 0 ? props.total : props.rows.length
})

const totalPages = computed(() => {
  if (perPageLocal.value <= 0) return 1
  return Math.max(1, Math.ceil(totalRows.value / perPageLocal.value))
})

watch([totalPages, () => props.page], ([tp, page]) => {
  if (page > tp) emit('update:page', tp)
  if (page < 1) emit('update:page', 1)
})

const startRow = computed(() => {
  if (totalRows.value === 0) return 0
  return (props.page - 1) * perPageLocal.value + 1
})

const endRow = computed(() => {
  return Math.min(props.page * perPageLocal.value, totalRows.value)
})

const paginatedRows = computed(() => {
  if (props.total > 0) {
    return props.rows
  }
  const start = (props.page - 1) * perPageLocal.value
  return props.rows.slice(start, start + perPageLocal.value)
})

const visiblePages = computed<(number | string)[]>(() => {
  const pages: (number | string)[] = []
  const delta = 2

  for (let i = 1; i <= totalPages.value; i++) {
    if (
      i === 1 ||
      i === totalPages.value ||
      (i >= props.page - delta && i <= props.page + delta)
    ) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return pages
})

const hasActionsColumn = computed(() =>
  props.columns.some(c => c.key === 'actions')
)

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    emit('update:page', page)
  }
}

const goToPreviousPage = () => {
  if (props.page > 1) {
    emit('update:page', props.page - 1)
  }
}

const goToNextPage = () => {
  if (props.page < totalPages.value) {
    emit('update:page', props.page + 1)
  }
}

const handlePerPageChange = () => {
  emit('update:perPage', Number(perPageLocal.value))
  emit('update:page', 1)
}
</script>