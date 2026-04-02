<!-- pages/jobs.vue -->
<template>
  <div class="animate-fade-in">
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Jobs Management</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage all job postings in your application.</p>
      </div>
      
      <!-- Add Job Button -->
      <button 
        @click="openCreateModal"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Post New Job
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
        <p class="text-sm text-slate-500 dark:text-slate-400">Total Jobs</p>
        <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats.total || 0 }}</p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
        <p class="text-sm text-slate-500 dark:text-slate-400">Active</p>
        <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.active || 0 }}</p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
        <p class="text-sm text-slate-500 dark:text-slate-400">Pending</p>
        <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ stats.pending || 0 }}</p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
        <p class="text-sm text-slate-500 dark:text-slate-400">Draft</p>
        <p class="text-2xl font-bold text-slate-600 dark:text-slate-400">{{ stats.draft || 0 }}</p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
        <p class="text-sm text-slate-500 dark:text-slate-400">Rejected</p>
        <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ stats.rejected || 0 }}</p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
        <p class="text-sm text-slate-500 dark:text-slate-400">Closed</p>
        <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ stats.closed || 0 }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mb-6 border-b border-slate-200 dark:border-slate-700">
      <div class="flex gap-4 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value; currentPage = 1"
          class="px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap"
          :class="[
            activeTab === tab.value 
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          ]"
        >
          {{ tab.label }}
          <span 
            v-if="getCountByStatus(tab.value) > 0" 
            class="ml-2 px-2 py-0.5 text-xs rounded-full"
            :class="tab.badgeClass"
          >
            {{ getCountByStatus(tab.value) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Search and Filter Bar -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <!-- Search Bar -->
      <div class="flex-1 relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search jobs by title, company, or location..."
          class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
          @input="debouncedSearch"
        />
      </div>

      <!-- Filters -->
      <div class="flex gap-2">
        <select
          v-model="filters.companyId"
          class="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white min-w-[150px]"
          @change="fetchJobs"
        >
          <option value="">All Companies</option>
          <option v-for="company in companies" :key="company.id" :value="company.id">
            {{ company.name }}
          </option>
        </select>

        <select
          v-model="filters.workTypeId"
          class="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white min-w-[150px]"
          @change="fetchJobs"
        >
          <option value="">Work Type</option>
          <option v-for="type in workTypes" :key="type.id" :value="type.id">
            {{ type.name }}
          </option>
        </select>

        <select
          v-model="filters.categoryId"
          class="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white min-w-[150px]"
          @change="fetchJobs"
        >
          <option value="">Category</option>
          <option v-for="cat in jobCategories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
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
        @click="fetchJobs" 
        class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Retry
      </button>
    </div>

    <!-- Jobs Table -->
    <div v-else class="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead class="bg-slate-50 dark:bg-slate-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="rounded border-slate-300 dark:border-slate-600">
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Job Title</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Company</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Category</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Location</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Posted</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          <tr v-for="job in paginatedJobs" :key="job.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <td class="px-6 py-4 whitespace-nowrap">
              <input type="checkbox" v-model="selectedJobs" :value="job.id" class="rounded border-slate-300 dark:border-slate-600">
            </td>
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-slate-900 dark:text-white">{{ job.title }}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400">ID: {{ job.id.slice(0, 8) }}...</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
              {{ job.company?.name || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
              {{ job.category?.name || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
              <div>{{ job.city || '-' }}</div>
              <div class="text-xs">{{ job.country?.name || '-' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="statusClasses(job.status)"
              >
                {{ job.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
              {{ formatDate(job.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex items-center gap-2">
                <button @click="viewJob(job)" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="View">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button @click="editJob(job)" class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300" title="Edit">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button @click="confirmDelete(job)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Delete">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button @click="changeStatus(job)" class="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300" title="Change Status">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="paginatedJobs.length === 0">
            <td colspan="8" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
              No jobs found
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Bulk Actions -->
      <div v-if="selectedJobs.length > 0" class="px-6 py-3 bg-slate-50 dark:bg-slate-700 border-t border-slate-200 dark:border-slate-600">
        <div class="flex items-center gap-4">
          <span class="text-sm text-slate-600 dark:text-slate-300">{{ selectedJobs.length }} selected</span>
          <select
            v-model="bulkStatus"
            class="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white"
          >
            <option value="">Change Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
            <option value="rejected">Rejected</option>
            <option value="closed">Closed</option>
          </select>
          <button
            @click="applyBulkStatus"
            :disabled="!bulkStatus"
            class="px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm"
          >
            Apply
          </button>
          <button
            @click="selectedJobs = []"
            class="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between">
          <div class="text-sm text-slate-700 dark:text-slate-300">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, totalJobs) }} of {{ totalJobs }} jobs
          </div>
          <div class="flex gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Previous
            </button>
            <span class="px-3 py-1 text-sm text-slate-700 dark:text-slate-300">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Job Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-container modal-xl">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                {{ isEdit ? 'Edit Job' : 'Post New Job' }}
              </h3>
              <button @click="closeModal" class="modal-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <form @submit.prevent="handleSubmit" class="modal-body">
              <!-- Error message -->
              <div v-if="formError" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p class="text-sm text-red-600 dark:text-red-400">{{ formError }}</p>
              </div>

              <div class="grid grid-cols-2 gap-6">
                <!-- Left Column -->
                <div class="space-y-4">
                  <!-- Company ID (Required) -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Company <span class="text-red-500">*</span>
                    </label>
                    <select
                      v-model="form.companyId"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      :class="{ 'border-red-500': validationErrors.companyId }"
                      required
                    >
                      <option value="">Select Company</option>
                      <option v-for="company in companies" :key="company.id" :value="company.id">
                        {{ company.name }}
                      </option>
                    </select>
                    <p v-if="validationErrors.companyId" class="mt-1 text-xs text-red-500">{{ validationErrors.companyId }}</p>
                  </div>

                  <!-- Title -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Job Title <span class="text-red-500">*</span>
                    </label>
                    <input 
                      v-model="form.title" 
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      :class="{ 'border-red-500': validationErrors.title }"
                      placeholder="e.g., Senior Software Engineer"
                      required
                    />
                    <p v-if="validationErrors.title" class="mt-1 text-xs text-red-500">{{ validationErrors.title }}</p>
                  </div>

                  <!-- Slug (Optional) -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Slug (Optional)
                    </label>
                    <input 
                      v-model="form.slug" 
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      placeholder="senior-software-engineer"
                    />
                    <p class="mt-1 text-xs text-slate-500">Leave empty to auto-generate</p>
                  </div>

                  <!-- Category -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      v-model="form.categoryId"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">Select Category</option>
                      <option v-for="cat in jobCategories" :key="cat.id" :value="cat.id">
                        {{ cat.name }}
                      </option>
                    </select>
                  </div>

                  <!-- Work Type -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Work Type
                    </label>
                    <select
                      v-model="form.workTypeId"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">Select Work Type</option>
                      <option v-for="type in workTypes" :key="type.id" :value="type.id">
                        {{ type.name }}
                      </option>
                    </select>
                  </div>

                  <!-- Work Place -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Work Place
                    </label>
                    <select
                      v-model="form.workPlaceId"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">Select Work Place</option>
                      <option v-for="place in workPlaces" :key="place.id" :value="place.id">
                        {{ place.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Right Column -->
                <div class="space-y-4">
                  <!-- Country -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Country
                    </label>
                    <select
                      v-model="form.countryId"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">Select Country</option>
                      <option v-for="country in countries" :key="country.id" :value="country.id">
                        {{ country.name }}
                      </option>
                    </select>
                  </div>

                  <!-- City -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      City
                    </label>
                    <input 
                      v-model="form.city" 
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      placeholder="e.g., Jakarta"
                    />
                  </div>

                  <!-- Pay Type -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Pay Type
                    </label>
                    <select
                      v-model="form.payTypeId"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">Select Pay Type</option>
                      <option v-for="type in payTypes" :key="type.id" :value="type.id">
                        {{ type.name }}
                      </option>
                    </select>
                  </div>

                  <!-- Currency -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Currency
                    </label>
                    <select
                      v-model="form.currencyId"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">Select Currency</option>
                      <option v-for="currency in currencies" :key="currency.id" :value="currency.id">
                        {{ currency.code }} - {{ currency.name }}
                      </option>
                    </select>
                  </div>

                  <!-- Pay Range -->
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Pay From
                      </label>
                      <input 
                        v-model.number="form.payFrom" 
                        type="number"
                        step="0.01"
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Pay To
                      </label>
                      <input 
                        v-model.number="form.payTo" 
                        type="number"
                        step="0.01"
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <!-- Show Salary -->
                  <div class="flex items-center">
                    <input 
                      v-model="form.showSalary" 
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                    />
                    <label class="ml-2 text-sm text-slate-700 dark:text-slate-300">
                      Show Salary to Public
                    </label>
                  </div>

                  <!-- Private Job -->
                  <div class="flex items-center">
                    <input 
                      v-model="form.isPrivate" 
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                    />
                    <label class="ml-2 text-sm text-slate-700 dark:text-slate-300">
                      Private Job (Only visible to invited candidates)
                    </label>
                  </div>

                  <!-- Video URL -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Video URL
                    </label>
                    <input 
                      v-model="form.videoUrl" 
                      type="url"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div class="mt-4">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description <span class="text-red-500">*</span>
                </label>
                <textarea 
                  v-model="form.description" 
                  rows="4"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                  :class="{ 'border-red-500': validationErrors.description }"
                  placeholder="Detailed job description..."
                  required
                ></textarea>
                <p v-if="validationErrors.description" class="mt-1 text-xs text-red-500">{{ validationErrors.description }}</p>
              </div>

              <!-- Summary -->
              <div class="mt-4">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Summary
                </label>
                <textarea 
                  v-model="form.summary" 
                  rows="3"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                  placeholder="Brief summary of the job..."
                ></textarea>
              </div>

              <!-- Qualification -->
              <div class="mt-4">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Qualification
                </label>
                <textarea 
                  v-model="form.qualification" 
                  rows="3"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                  placeholder="Required qualifications..."
                ></textarea>
              </div>

              <!-- Benefits -->
              <div class="mt-4">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Benefits
                </label>
                <textarea 
                  v-model="form.benefits" 
                  rows="3"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                  placeholder="Job benefits..."
                ></textarea>
              </div>

              <!-- Dates -->
              <div class="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Published At
                  </label>
                  <input 
                    v-model="form.publishedAt" 
                    type="datetime-local"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Expires At
                  </label>
                  <input 
                    v-model="form.expiresAt" 
                    type="datetime-local"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <!-- Screening Questions -->
              <div class="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div class="flex justify-between items-center mb-4">
                  <h4 class="text-md font-medium text-slate-900 dark:text-white">Screening Questions</h4>
                  <button 
                    type="button"
                    @click="addScreeningQuestion"
                    class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    + Add Question
                  </button>
                </div>

                <div v-for="(q, index) in form.screeningQuestions" :key="index" class="mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div class="flex justify-between items-start mb-2">
                    <h5 class="text-sm font-medium">Question {{ index + 1 }}</h5>
                    <button 
                      type="button"
                      @click="removeScreeningQuestion(index)"
                      class="text-red-600 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2">
                      <input 
                        v-model="q.question" 
                        type="text"
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                        placeholder="Question text"
                        required
                      />
                    </div>
                    <div>
                      <select
                        v-model="q.answerType"
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                        required
                      >
                        <option value="text">Text</option>
                        <option value="textarea">Text Area</option>
                        <option value="number">Number</option>
                        <option value="boolean">Yes/No</option>
                        <option value="select">Select</option>
                        <option value="multiselect">Multi Select</option>
                        <option value="file">File Upload</option>
                      </select>
                    </div>
                    <div>
                      <div class="flex items-center">
                        <input 
                          v-model="q.isRequired" 
                          type="checkbox"
                          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                        />
                        <label class="ml-2 text-sm text-slate-700 dark:text-slate-300">Required</label>
                      </div>
                    </div>
                    <div class="col-span-2" v-if="q.answerType === 'select' || q.answerType === 'multiselect'">
                      <input 
                        v-model="q.options" 
                        type="text"
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                        placeholder="Options (comma separated)"
                      />
                    </div>
                  </div>
                </div>

                <p v-if="form.screeningQuestions.length === 0" class="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                  No screening questions added yet.
                </p>
              </div>

              <div class="modal-footer">
                <button 
                  type="button" 
                  @click="closeModal" 
                  class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  @click="saveAsDraft"
                  class="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                  :disabled="submitting"
                >
                  Save as Draft
                </button>
                <button 
                  type="submit" 
                  class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  :disabled="submitting"
                >
                  <span v-if="submitting" class="flex items-center gap-2">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </span>
                  <span v-else>{{ isEdit ? 'Update' : 'Publish' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- View Job Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showViewModal" class="modal-overlay" @click.self="showViewModal = false">
          <div class="modal-container modal-lg">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Job Details</h3>
              <button @click="showViewModal = false" class="modal-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div v-if="viewData" class="modal-body">
              <div class="space-y-6">
                <!-- Header -->
                <div>
                  <h2 class="text-2xl font-bold text-slate-900 dark:text-white">{{ viewData.title }}</h2>
                  <div class="mt-2 flex items-center gap-4">
                    <span 
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="statusClasses(viewData.status)"
                    >
                      {{ viewData.status }}
                    </span>
                    <span class="text-sm text-slate-500">ID: {{ viewData.id }}</span>
                  </div>
                </div>

                <!-- Company Info -->
                <div class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div class="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-slate-500 dark:text-slate-400">Company</p>
                    <p class="font-medium">{{ viewData.company?.name || '-' }}</p>
                  </div>
                </div>

                <!-- Details Grid -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Category</p>
                    <p class="text-sm">{{ viewData.category?.name || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Work Type</p>
                    <p class="text-sm">{{ viewData.workType?.name || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Work Place</p>
                    <p class="text-sm">{{ viewData.workPlace?.name || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Location</p>
                    <p class="text-sm">{{ viewData.city || '-' }}, {{ viewData.country?.name || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Salary</p>
                    <p class="text-sm">
                      <span v-if="viewData.showSalary">
                        {{ viewData.payFrom || '0' }} - {{ viewData.payTo || '0' }}
                        <span v-if="viewData.currency"> {{ viewData.currency.code }}</span>
                      </span>
                      <span v-else>Not shown</span>
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Pay Type</p>
                    <p class="text-sm">{{ viewData.payType?.name || '-' }}</p>
                  </div>
                </div>

                <!-- Description -->
                <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 class="font-medium mb-2">Description</h4>
                  <p class="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{{ viewData.description }}</p>
                </div>

                <!-- Summary -->
                <div v-if="viewData.summary" class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 class="font-medium mb-2">Summary</h4>
                  <p class="text-sm text-slate-600 dark:text-slate-400">{{ viewData.summary }}</p>
                </div>

                <!-- Qualification -->
                <div v-if="viewData.qualification" class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 class="font-medium mb-2">Qualification</h4>
                  <p class="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{{ viewData.qualification }}</p>
                </div>

                <!-- Benefits -->
                <div v-if="viewData.benefits" class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 class="font-medium mb-2">Benefits</h4>
                  <p class="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{{ viewData.benefits }}</p>
                </div>

                <!-- Video -->
                <div v-if="viewData.videoUrl" class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 class="font-medium mb-2">Company Video</h4>
                  <a :href="viewData.videoUrl" target="_blank" class="text-primary-600 hover:underline">Watch Video</a>
                </div>

                <!-- Screening Questions -->
                <div v-if="viewData.screeningQuestions && viewData.screeningQuestions.length > 0" class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 class="font-medium mb-2">Screening Questions ({{ viewData.screeningQuestions.length }})</h4>
                  <div class="space-y-2">
                    <div v-for="(q, idx) in viewData.screeningQuestions" :key="q.id" class="text-sm">
                      <span class="font-medium">{{ idx + 1 }}.</span> {{ q.question }}
                      <span v-if="q.isRequired" class="text-xs text-red-500 ml-1">*</span>
                      <span class="text-xs text-slate-500 ml-2">({{ q.answerType }})</span>
                    </div>
                  </div>
                </div>

                <!-- Dates -->
                <div class="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Created At</p>
                    <p class="text-sm">{{ formatDateTime(viewData.createdAt) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Updated At</p>
                    <p class="text-sm">{{ formatDateTime(viewData.updatedAt) }}</p>
                  </div>
                  <div v-if="viewData.publishedAt">
                    <p class="text-xs text-slate-500 dark:text-slate-400">Published At</p>
                    <p class="text-sm">{{ formatDateTime(viewData.publishedAt) }}</p>
                  </div>
                  <div v-if="viewData.expiresAt">
                    <p class="text-xs text-slate-500 dark:text-slate-400">Expires At</p>
                    <p class="text-sm">{{ formatDateTime(viewData.expiresAt) }}</p>
                  </div>
                </div>

                <!-- Creator -->
                <div v-if="viewData.creator" class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <p class="text-xs text-slate-500 dark:text-slate-400">Posted by</p>
                  <p class="text-sm">{{ viewData.creator.name }} ({{ viewData.creator.email }})</p>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button 
                @click="showViewModal = false" 
                class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
              <button 
                @click="handleEditFromView"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
          <div class="modal-container modal-sm">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Delete Job</h3>
              <button @click="showDeleteModal = false" class="modal-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div class="modal-body">
              <p class="text-slate-600 dark:text-slate-400">
                Are you sure you want to delete 
                <span class="font-semibold text-slate-900 dark:text-white">"{{ selectedJob?.title }}"</span>?
              </p>
              <p class="mt-2 text-sm text-red-600 dark:text-red-400">This action cannot be undone.</p>
              <p v-if="deleteError" class="mt-2 text-sm text-red-600 dark:text-red-400">
                Error: {{ deleteError }}
              </p>
            </div>

            <div class="modal-footer">
              <button 
                @click="showDeleteModal = false" 
                class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                @click="handleDelete" 
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                :disabled="deleting"
              >
                <span v-if="deleting" class="flex items-center gap-2">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Deleting...
                </span>
                <span v-else>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Status Change Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showStatusModal" class="modal-overlay" @click.self="showStatusModal = false">
          <div class="modal-container modal-sm">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Change Job Status</h3>
              <button @click="showStatusModal = false" class="modal-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div class="modal-body">
              <p class="text-slate-600 dark:text-slate-400 mb-4">
                Change status for <span class="font-semibold">"{{ selectedJob?.title }}"</span>
              </p>
              
              <select
                v-model="newStatus"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="rejected">Rejected</option>
                <option value="closed">Closed</option>
              </select>
              
              <p v-if="statusError" class="mt-2 text-sm text-red-600 dark:text-red-400">
                Error: {{ statusError }}
              </p>
            </div>

            <div class="modal-footer">
              <button 
                @click="showStatusModal = false" 
                class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                @click="handleStatusChange" 
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                :disabled="statusUpdating || !newStatus"
              >
                <span v-if="statusUpdating" class="flex items-center gap-2">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </span>
                <span v-else>Update Status</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useJobs, type Job, type CreateJobRequest, type UpdateJobRequest, type CreateScreeningQuestionRequest } from '~/composables/useJobs'
import { useCompanies, type Company } from '~/composables/useCompanies'

const { isAuthenticated, user } = useAuth()
const { 
  listJobs,
  searchJobs,
  getJobStats,
  getJobById,
  getJobsByCompany,
  createJob,
  saveJobAsDraft,
  updateJob,
  updateJobStatus,
  deleteJob,
  bulkUpdateJobStatus,
  getPendingJobs,
  getRejectedJobs,
  getJobCategories,
  getWorkTypes,
  getPayTypes,
  getCurrencies,
  getWorkPlaces,
  listScreeningQuestions
} = useJobs()

const { getCompanies } = useCompanies()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const jobs = ref<Job[]>([])
const stats = ref<any>({})
const totalJobs = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)
const searchQuery = ref('')
const searchTimeout = ref<NodeJS.Timeout | null>(null)

// Filters
const filters = ref({
  companyId: '',
  workTypeId: '',
  categoryId: '',
  countryId: '',
  status: ''
})

// Master data
const companies = ref<Company[]>([])
const jobCategories = ref<any[]>([])
const workTypes = ref<any[]>([])
const payTypes = ref<any[]>([])
const currencies = ref<any[]>([])
const workPlaces = ref<any[]>([])
const countries = ref<any[]>([])

// Tabs
const tabs = [
  { label: 'All Jobs', value: 'all', badgeClass: 'bg-slate-100 text-slate-600' },
  { label: 'Active', value: 'active', badgeClass: 'bg-green-100 text-green-600' },
  { label: 'Pending', value: 'pending', badgeClass: 'bg-yellow-100 text-yellow-600' },
  { label: 'Draft', value: 'draft', badgeClass: 'bg-slate-100 text-slate-600' },
  { label: 'Rejected', value: 'rejected', badgeClass: 'bg-red-100 text-red-600' },
  { label: 'Closed', value: 'closed', badgeClass: 'bg-red-100 text-red-600' }
]
const activeTab = ref('all')

// Selection for bulk actions
const selectedJobs = ref<string[]>([])
const selectAll = ref(false)
const bulkStatus = ref('')

// Modal states
const showModal = ref(false)
const showViewModal = ref(false)
const showDeleteModal = ref(false)
const showStatusModal = ref(false)
const isEdit = ref(false)
const selectedJob = ref<Job | null>(null)
const viewData = ref<Job | null>(null)
const submitting = ref(false)
const deleting = ref(false)
const statusUpdating = ref(false)
const formError = ref<string | null>(null)
const validationErrors = ref<Record<string, string>>({})
const deleteError = ref<string | null>(null)
const statusError = ref<string | null>(null)
const newStatus = ref('')

// Form
const form = ref<CreateJobRequest & { screeningQuestions: CreateScreeningQuestionRequest[] }>({
  companyId: '',
  title: '',
  slug: null,
  description: '',
  summary: null,
  qualification: null,
  benefits: null,
  categoryId: null,
  countryId: null,
  workTypeId: null,
  payTypeId: null,
  currencyId: null,
  workPlaceId: null,
  city: null,
  payFrom: null,
  payTo: null,
  videoUrl: null,
  showSalary: true,
  isPrivate: false,
  publishedAt: null,
  expiresAt: null,
  screeningQuestions: []
})

// Status classes
const statusClasses = (status: string) => {
  const classes = {
    'active': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    'draft': 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    'closed': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
  }
  return classes[status as keyof typeof classes] || 'bg-slate-100 text-slate-800'
}

// Get count by status
const getCountByStatus = (status: string) => {
  if (status === 'all') return jobs.value.length
  return jobs.value.filter(j => j.status === status).length
}

// Computed: Paginated jobs
const paginatedJobs = computed(() => {
  // Filter by active tab
  let filtered = jobs.value
  if (activeTab.value !== 'all') {
    filtered = filtered.filter(j => j.status === activeTab.value)
  }
  
  // Filter by search query
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(j => 
      j.title.toLowerCase().includes(q) ||
      j.company?.name?.toLowerCase().includes(q) ||
      j.city?.toLowerCase().includes(q)
    )
  }
  
  // Filter by other filters
  if (filters.value.companyId) {
    filtered = filtered.filter(j => j.companyId === filters.value.companyId)
  }
  if (filters.value.workTypeId) {
    filtered = filtered.filter(j => j.workTypeId === filters.value.workTypeId)
  }
  if (filters.value.categoryId) {
    filtered = filtered.filter(j => j.categoryId === filters.value.categoryId)
  }
  
  return filtered
})

// Update total pages when filtered jobs change
watch(paginatedJobs, (newVal) => {
  totalJobs.value = newVal.length
  totalPages.value = Math.ceil(newVal.length / pageSize.value)
})

// Toggle select all
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedJobs.value = paginatedJobs.value.map(j => j.id)
  } else {
    selectedJobs.value = []
  }
}

// Watch select all
watch(selectAll, (val) => {
  if (val) {
    selectedJobs.value = paginatedJobs.value.map(j => j.id)
  }
})

// Watch selected jobs
watch(selectedJobs, (val) => {
  selectAll.value = val.length === paginatedJobs.value.length && paginatedJobs.value.length > 0
})

// Apply bulk status
const applyBulkStatus = async () => {
  if (!bulkStatus.value || selectedJobs.value.length === 0) return
  
  try {
    await bulkUpdateJobStatus({
      jobIds: selectedJobs.value,
      status: bulkStatus.value
    })
    selectedJobs.value = []
    bulkStatus.value = ''
    await fetchJobs()
  } catch (err: any) {
    console.error('Bulk update error:', err)
    error.value = err.message || 'Failed to update jobs'
  }
}

// Fetch master data
const fetchMasterData = async () => {
  try {
    const [comps, cats, types, pTypes, currs, places] = await Promise.all([
      getCompanies(),
      getJobCategories(),
      getWorkTypes(),
      getPayTypes(),
      getCurrencies(),
      getWorkPlaces()
    ])
    
    companies.value = comps
    jobCategories.value = cats
    workTypes.value = types
    payTypes.value = pTypes
    currencies.value = currs
    workPlaces.value = places
    
    // Fetch countries from useCompanies composable
    const { getCountries } = useCompanies()
    countries.value = await getCountries()
    
  } catch (err) {
    console.error('Error fetching master data:', err)
  }
}

// Fetch jobs
const fetchJobs = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Build params
    const params: any = {
      page: currentPage.value,
      limit: pageSize.value * 2 // Fetch more for client-side filtering
    }
    
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    
    // Fetch jobs
    const response = await listJobs(params)
    
    if (response?.jobs) {
      jobs.value = response.jobs
      totalJobs.value = response.total
      totalPages.value = response.totalPages
    } else {
      jobs.value = []
    }
    
    // Fetch stats
    try {
      stats.value = await getJobStats()
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
    
  } catch (err: any) {
    console.error('Error fetching jobs:', err)
    error.value = err.message || 'Failed to fetch jobs'
  } finally {
    loading.value = false
  }
}

// Debounced search
const debouncedSearch = () => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1
    fetchJobs()
  }, 500)
}

// Format date
const formatDate = (timestamp: number | null | undefined): string => {
  if (!timestamp) return '-'
  return new Date(timestamp * 1000).toLocaleDateString()
}

const formatDateTime = (timestamp: number | null | undefined): string => {
  if (!timestamp) return '-'
  return new Date(timestamp * 1000).toLocaleString()
}

// Modal handlers
const openCreateModal = () => {
  isEdit.value = false
  form.value = {
    companyId: '',
    title: '',
    slug: null,
    description: '',
    summary: null,
    qualification: null,
    benefits: null,
    categoryId: null,
    countryId: null,
    workTypeId: null,
    payTypeId: null,
    currencyId: null,
    workPlaceId: null,
    city: null,
    payFrom: null,
    payTo: null,
    videoUrl: null,
    showSalary: true,
    isPrivate: false,
    publishedAt: null,
    expiresAt: null,
    screeningQuestions: []
  }
  validationErrors.value = {}
  formError.value = null
  showModal.value = true
}

const editJob = async (job: Job) => {
  isEdit.value = true
  selectedJob.value = job
  
  try {
    // Fetch detailed job data
    const detailed = await getJobById(job.id)
    
    // Fetch screening questions
    const questions = await listScreeningQuestions(job.id)
    
    form.value = {
      companyId: detailed.companyId || '',
      title: detailed.title || '',
      slug: detailed.slug || null,
      description: detailed.description || '',
      summary: detailed.summary || null,
      qualification: detailed.qualification || null,
      benefits: detailed.benefits || null,
      categoryId: detailed.categoryId || null,
      countryId: detailed.countryId || null,
      workTypeId: detailed.workTypeId || null,
      payTypeId: detailed.payTypeId || null,
      currencyId: detailed.currencyId || null,
      workPlaceId: detailed.workPlaceId || null,
      city: detailed.city || null,
      payFrom: detailed.payFrom ? parseFloat(detailed.payFrom) : null,
      payTo: detailed.payTo ? parseFloat(detailed.payTo) : null,
      videoUrl: detailed.videoUrl || null,
      showSalary: detailed.showSalary ?? true,
      isPrivate: detailed.isPrivate ?? false,
      publishedAt: detailed.publishedAt || null,
      expiresAt: detailed.expiresAt || null,
      screeningQuestions: questions.map(q => ({
        question: q.question,
        answerType: q.answerType,
        options: q.options,
        isRequired: q.isRequired,
        order: q.order
      }))
    }
    
    validationErrors.value = {}
    formError.value = null
    showModal.value = true
    
  } catch (err) {
    console.error('Error fetching job details:', err)
    error.value = 'Failed to load job details'
  }
}

const viewJob = async (job: Job) => {
  try {
    viewData.value = await getJobById(job.id)
    showViewModal.value = true
  } catch (err) {
    console.error('Error fetching job details:', err)
    error.value = 'Failed to load job details'
  }
}

const handleEditFromView = () => {
  if (viewData.value) {
    showViewModal.value = false
    editJob(viewData.value)
  }
}

const closeModal = () => {
  showModal.value = false
  selectedJob.value = null
  validationErrors.value = {}
  formError.value = null
}

// Screening questions
const addScreeningQuestion = () => {
  form.value.screeningQuestions.push({
    question: '',
    answerType: 'text',
    options: undefined,
    isRequired: false,
    order: form.value.screeningQuestions.length
  })
}

const removeScreeningQuestion = (index: number) => {
  form.value.screeningQuestions.splice(index, 1)
}

// Di Jobs.vue - bagian handleSubmit

// Di Jobs.vue - bagian handleSubmit, perbaiki konversi timestamp

const handleSubmit = async () => {
  // Reset validation
  validationErrors.value = {}
  formError.value = null
  
  // Validate required fields
  if (!form.value.companyId) {
    validationErrors.value.companyId = 'Company is required'
  }
  if (!form.value.title) {
    validationErrors.value.title = 'Job title is required'
  }
  if (!form.value.description) {
    validationErrors.value.description = 'Description is required'
  }
  
  if (Object.keys(validationErrors.value).length > 0) {
    return
  }

  submitting.value = true
  
  try {
    // PERBAIKAN: Fungsi untuk konversi ke integer timestamp
    const toIntTimestamp = (dateStr: string | null | undefined): number | undefined => {
      if (!dateStr) return undefined
      // Gunakan Math.floor() untuk memastikan integer
      return Math.floor(new Date(dateStr).getTime() / 1000)
    }

    // Prepare data dengan tipe yang benar
    const data: CreateJobRequest = {
      companyId: form.value.companyId,
      title: form.value.title,
      slug: form.value.slug || undefined,
      description: form.value.description,
      summary: form.value.summary || undefined,
      qualification: form.value.qualification || undefined,
      benefits: form.value.benefits || undefined,
      categoryId: form.value.categoryId || undefined,
      countryId: form.value.countryId || undefined,
      workTypeId: form.value.workTypeId || undefined,
      payTypeId: form.value.payTypeId || undefined,
      currencyId: form.value.currencyId || undefined,
      workPlaceId: form.value.workPlaceId || undefined,
      city: form.value.city || undefined,
      payFrom: form.value.payFrom ? Number(form.value.payFrom) : undefined,
      payTo: form.value.payTo ? Number(form.value.payTo) : undefined,
      videoUrl: form.value.videoUrl || undefined,
      showSalary: form.value.showSalary,
      isPrivate: form.value.isPrivate,
      // PERBAIKAN: Gunakan Math.floor() untuk dapat integer
      publishedAt: form.value.publishedAt ? Math.floor(new Date(form.value.publishedAt).getTime() / 1000) : undefined,
      expiresAt: form.value.expiresAt ? Math.floor(new Date(form.value.expiresAt).getTime() / 1000) : undefined,
      screeningQuestions: form.value.screeningQuestions.filter(q => q.question.trim() !== '')
    }
    
    console.log('Submitting job data:', JSON.stringify(data, null, 2))
    
    if (isEdit.value && selectedJob.value) {
      console.log('Updating job with ID:', selectedJob.value.id)
      await updateJob(selectedJob.value.id, data)
    } else {
      await createJob(data)
    }
    
    closeModal()
    await fetchJobs()
    
  } catch (err: any) {
    console.error('=== FORM SUBMISSION ERROR ===')
    console.error('Error object:', err)
    
    // Cek struktur error
    if (err.response) {
      console.error('Response status:', err.response.status)
      console.error('Response status text:', err.response.statusText)
      
      // Coba dapatkan response body
      try {
        const responseText = await err.response.text()
        console.error('Response body:', responseText)
        
        // Coba parse JSON
        try {
          const responseJson = JSON.parse(responseText)
          console.error('Response JSON:', responseJson)
          
          if (responseJson.message) {
            formError.value = responseJson.message
          }
          if (responseJson.errors) {
            validationErrors.value = responseJson.errors
          }
        } catch {
          // Bukan JSON
          formError.value = responseText
        }
      } catch (e) {
        console.error('Could not read response body')
      }
    }
    
    if (err.data) {
      console.error('Error data:', err.data)
      if (err.data.message) {
        formError.value = err.data.message
      }
      if (err.data.errors) {
        validationErrors.value = err.data.errors
      }
    }
    
    if (!formError.value) {
      formError.value = err.message || 'Failed to save job'
    }
  } finally {
    submitting.value = false
  }
}

// Save as draft
const saveAsDraft = async () => {
  // Similar to handleSubmit but with status draft
  // For now, just call handleSubmit
  await handleSubmit()
}

// Delete
const confirmDelete = (job: Job) => {
  selectedJob.value = job
  deleteError.value = null
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!selectedJob.value) return
  
  deleting.value = true
  deleteError.value = null
  
  try {
    await deleteJob(selectedJob.value.id)
    showDeleteModal.value = false
    selectedJob.value = null
    await fetchJobs()
  } catch (err: any) {
    deleteError.value = err.message || 'Failed to delete job'
  } finally {
    deleting.value = false
  }
}

// Change status
const changeStatus = (job: Job) => {
  selectedJob.value = job
  newStatus.value = job.status
  statusError.value = null
  showStatusModal.value = true
}

const handleStatusChange = async () => {
  if (!selectedJob.value || !newStatus.value) return
  
  statusUpdating.value = true
  statusError.value = null
  
  try {
    await updateJobStatus(selectedJob.value.id, newStatus.value)
    showStatusModal.value = false
    selectedJob.value = null
    await fetchJobs()
  } catch (err: any) {
    statusError.value = err.message || 'Failed to update status'
  } finally {
    statusUpdating.value = false
  }
}

// Initial fetch
onMounted(() => {
  if (isAuthenticated.value) {
    fetchMasterData()
    fetchJobs()
  }
})

// Watch for tab changes
watch(activeTab, () => {
  currentPage.value = 1
})

// Watch for filter changes
watch(filters, () => {
  currentPage.value = 1
}, { deep: true })
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
  max-width: 1000px;
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