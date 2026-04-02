<template>
  <div class="animate-fade-in">
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Job Fairs Management</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage all job fair events in your application.</p>
      </div>
      
      <!-- Add Job Fair Button -->
      <button 
        v-if="!showDeleted"
        @click="openCreateModal"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Add Job Fair
      </button>
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
          :placeholder="showDeleted ? 'Search deleted job fairs...' : 'Search job fairs by title...'"
          class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
          @input="handleSearch"
        />
      </div>

      <!-- Status Filter -->
      <div class="w-48">
        <select
          v-model="statusFilter"
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
          @change="handleFilterChange"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
    </div>

    <!-- Search Info -->
    <div v-if="searchQuery" class="mb-4 text-sm text-slate-500 dark:text-slate-400">
      Searching for "{{ searchQuery }}" • {{ filteredJobFairs.length }} results found
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600 dark:text-red-400">{{ error }}</p>
      <button 
        @click="fetchJobFairs" 
        class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Retry
      </button>
    </div>

    <!-- Not Authenticated -->
    <div v-else-if="!isAuthenticated" class="text-center py-12">
      <p class="text-red-600 dark:text-red-400">You need to be authenticated to view this page.</p>
      <button 
        @click="handleLogin" 
        class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Login
      </button>
    </div>

    <!-- Data Table -->
    <DataTable 
      v-else
      v-model:page="page"
      v-model:perPage="perPage"
      :title="tableTitle"
      :columns="columns" 
      :rows="paginatedJobFairs"
      :loading="loading"
      :totalRows="filteredJobFairs.length"
      @update:page="handlePageChange"
      @update:perPage="handlePerPageChange"
    >
      <!-- Title cell with banner -->
      <template #cell-title="{ row }">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              v-if="row.banner?.url" 
              :src="row.banner.url" 
              :alt="row.title"
              class="w-full h-full object-cover"
            />
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div class="text-sm font-medium text-slate-900 dark:text-white">{{ row.title }}</div>
            <div v-if="row.shortDescription" class="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
              {{ row.shortDescription }}
            </div>
          </div>
        </div>
      </template>

      <!-- Date cell -->
      <template #cell-date="{ row }">
        <div class="text-sm text-slate-600 dark:text-slate-400">
          <div v-if="row.start" class="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ formatDate(row.start) }}
          </div>
          <div v-if="row.finish" class="flex items-center gap-1 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ formatDate(row.finish) }}
          </div>
        </div>
      </template>

      <!-- Status cell -->
      <template #cell-status="{ row }">
        <span 
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="{
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300': row.status === 'DRAFT',
            'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300': row.status === 'PUBLISHED',
            'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300': row.status === 'ONGOING',
            'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300': row.status === 'COMPLETED',
            'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300': row.status === 'CANCELLED',
            'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300': !row.status
          }"
        >
          <span 
            class="w-1.5 h-1.5 rounded-full mr-1.5" 
            :class="{
              'bg-yellow-500': row.status === 'DRAFT',
              'bg-green-500': row.status === 'PUBLISHED',
              'bg-blue-500': row.status === 'ONGOING',
              'bg-purple-500': row.status === 'COMPLETED',
              'bg-red-500': row.status === 'CANCELLED',
              'bg-slate-500': !row.status
            }"
          ></span>
          {{ row.status || 'No Status' }}
        </span>
      </template>

      <!-- Created At cell -->
      <template #cell-createdAt="{ row }">
        <span class="text-sm text-slate-600 dark:text-slate-400">
          {{ formatDate(row.createdAt) }}
        </span>
      </template>

      <!-- Deleted At cell -->
      <template #cell-deletedAt="{ row }">
        <span v-if="showDeleted" class="text-sm text-slate-600 dark:text-slate-400">
          {{ formatDate(row.deletedAt) }}
        </span>
      </template>

      <!-- Actions -->
      <template #cell-actions="{ row }">
        <div class="flex items-center gap-2 justify-end">
          <!-- View button -->
          <button 
            @click="() => viewJobFair(row)"
            class="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
            title="View Details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Edit button (only for active) -->
          <button 
            v-if="!showDeleted"
            @click="() => openEditModal(row)"
            class="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
            title="Edit Job Fair"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          
          <!-- Restore button (only for deleted) -->
          <button 
            v-if="showDeleted"
            @click="() => confirmRestore(row)"
            class="text-slate-600 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 transition-colors"
            title="Restore Job Fair"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <!-- Delete button -->
          <button 
            @click="() => confirmDelete(row)"
            class="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
            :title="showDeleted ? 'Permanently Delete' : 'Delete Job Fair'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </template>

      <!-- Empty state -->
      <template #empty>
        <div class="text-center py-8">
          <div class="text-slate-500 dark:text-slate-400 mb-2">
            {{ emptyStateMessage }}
          </div>
          <button 
            v-if="searchQuery"
            @click="clearSearch" 
            class="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Clear search
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-container modal-lg">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                {{ isEdit ? 'Edit Job Fair' : 'Create New Job Fair' }}
              </h3>
              <button @click="closeModal" class="modal-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <form @submit.prevent="handleSubmit" class="modal-body">
              <div class="space-y-6">
                <!-- Title -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Title <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="form.title" 
                    type="text"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g., Tech Career Fair 2024"
                    required
                  />
                </div>

                <!-- Short Description -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Short Description
                  </label>
                  <input 
                    v-model="form.shortDescription" 
                    type="text"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    placeholder="Brief description of the job fair"
                  />
                </div>

                <!-- Description -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea 
                    v-model="form.description" 
                    rows="4"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    placeholder="Full description of the job fair"
                  ></textarea>
                </div>

                <!-- Date Range -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Start Date
                    </label>
                    <input 
                      v-model="form.start" 
                      type="datetime-local"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Finish Date
                    </label>
                    <input 
                      v-model="form.finish" 
                      type="datetime-local"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <!-- Status -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    v-model="form.status"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">Select Status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <!-- Banner Upload (only for edit) -->
                <div v-if="isEdit" class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Banner Image
                  </label>
                  
                  <!-- Current Banner -->
                  <div v-if="currentBanner" class="mb-4">
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">Current Banner:</p>
                    <div class="relative w-48 h-32 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img :src="currentBanner.url" :alt="form.title" class="w-full h-full object-cover" />
                      <button 
                        @click="handleRemoveBanner"
                        type="button"
                        class="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                        title="Remove Banner"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Upload New Banner -->
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">Upload New Banner:</p>
                    <input 
                      ref="fileInput"
                      type="file"
                      accept="image/*"
                      class="block w-full text-sm text-slate-500 dark:text-slate-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-medium
                        file:bg-primary-50 file:text-primary-700
                        dark:file:bg-primary-900/20 dark:file:text-primary-400
                        hover:file:bg-primary-100 dark:hover:file:bg-primary-900/30"
                      @change="handleFileUpload"
                    />
                    <p v-if="uploadProgress > 0" class="mt-2 text-xs text-primary-600">
                      Uploading: {{ uploadProgress }}%
                    </p>
                  </div>
                </div>
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
                  type="submit" 
                  class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  :disabled="submitting"
                >
                  <span v-if="submitting" class="flex items-center gap-2">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </span>
                  <span v-else>{{ isEdit ? 'Update' : 'Create' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- View Details Modal -->
<Teleport to="body">
  <Transition name="modal-fade">
    <div v-if="showViewModal" class="modal-overlay" @click.self="showViewModal = false">
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Job Fair Details</h3>
          <button @click="showViewModal = false" class="modal-close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div v-if="viewData" class="modal-body">
          <div class="space-y-6">
            <!-- Banner -->
            <div v-if="viewData.banner" class="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <img :src="viewData.banner.url" :alt="viewData.title" class="w-full max-h-64 object-cover" />
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-medium text-slate-500 dark:text-slate-400">ID</label>
                <p class="text-sm text-slate-900 dark:text-white font-mono">{{ viewData.id }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Status</label>
                <p class="text-sm mt-1">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300': viewData.status === 'DRAFT',
                      'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300': viewData.status === 'PUBLISHED',
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300': viewData.status === 'ONGOING',
                      'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300': viewData.status === 'COMPLETED',
                      'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300': viewData.status === 'CANCELLED',
                      'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300': !viewData.status
                    }"
                  >
                    <span 
                      class="w-1.5 h-1.5 rounded-full mr-1.5" 
                      :class="{
                        'bg-yellow-500': viewData.status === 'DRAFT',
                        'bg-green-500': viewData.status === 'PUBLISHED',
                        'bg-blue-500': viewData.status === 'ONGOING',
                        'bg-purple-500': viewData.status === 'COMPLETED',
                        'bg-red-500': viewData.status === 'CANCELLED',
                        'bg-slate-500': !viewData.status
                      }"
                    ></span>
                    {{ viewData.status || 'No Status' }}
                  </span>
                </p>
              </div>
            </div>

            <!-- Title -->
            <div>
              <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Title</label>
              <p class="text-sm text-slate-900 dark:text-white font-medium">{{ viewData.title }}</p>
            </div>

            <!-- Short Description -->
            <div v-if="viewData.shortDescription">
              <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Short Description</label>
              <p class="text-sm text-slate-600 dark:text-slate-400">{{ viewData.shortDescription }}</p>
            </div>

            <!-- Description -->
            <div v-if="viewData.description">
              <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Description</label>
              <p class="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">{{ viewData.description }}</p>
            </div>

            <!-- Dates -->
            <div class="grid grid-cols-2 gap-4">
              <div v-if="viewData.start">
                <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Start Date</label>
                <p class="text-sm text-slate-900 dark:text-white flex items-center gap-1 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDateTime(viewData.start) }}
                </p>
              </div>
              <div v-if="viewData.finish">
                <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Finish Date</label>
                <p class="text-sm text-slate-900 dark:text-white flex items-center gap-1 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDateTime(viewData.finish) }}
                </p>
              </div>
            </div>

            <!-- Timestamps -->
            <div class="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Created At</label>
                <p class="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatDateTime(viewData.createdAt) }}
                </p>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Updated At</label>
                <p class="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {{ formatDateTime(viewData.updatedAt) }}
                </p>
              </div>
            </div>

            <!-- Deleted At (if deleted) -->
            <div v-if="viewData.deletedAt" class="pt-4 border-t border-slate-200 dark:border-slate-700">
              <label class="text-xs font-medium text-red-500 dark:text-red-400">Deleted At</label>
              <p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {{ formatDateTime(viewData.deletedAt) }}
              </p>
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
            v-if="!showDeleted && viewData && !viewData.deletedAt"
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
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                {{ showDeleted ? 'Permanently Delete' : 'Delete' }} Job Fair
              </h3>
              <button @click="showDeleteModal = false" class="modal-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div class="modal-body">
              <p class="text-slate-600 dark:text-slate-400">
                Are you sure you want to {{ showDeleted ? 'permanently delete' : 'delete' }} 
                <span class="font-semibold text-slate-900 dark:text-white">"{{ selectedJobFair?.title }}"</span>?
              </p>
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
                <span v-else>{{ showDeleted ? 'Delete Permanently' : 'Delete' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Restore Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showRestoreModal" class="modal-overlay" @click.self="showRestoreModal = false">
          <div class="modal-container modal-sm">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Restore Job Fair</h3>
              <button @click="showRestoreModal = false" class="modal-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div class="modal-body">
              <p class="text-slate-600 dark:text-slate-400">
                Are you sure you want to restore 
                <span class="font-semibold text-slate-900 dark:text-white">"{{ selectedJobFair?.title }}"</span>?
              </p>
              <p v-if="restoreError" class="mt-2 text-sm text-red-600 dark:text-red-400">
                Error: {{ restoreError }}
              </p>
            </div>

            <div class="modal-footer">
              <button 
                @click="showRestoreModal = false" 
                class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                @click="handleRestore" 
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                :disabled="restoring"
              >
                <span v-if="restoring" class="flex items-center gap-2">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Restoring...
                </span>
                <span v-else>Restore</span>
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
import { useJobFairs, type JobFair, type Asset } from '~/composables/useJobFairs'

const { isAuthenticated } = useAuth()
const { 
  getAllJobFairsWithDeleted,
  getJobFairById, 
  createJobFair, 
  updateJobFair, 
  deleteJobFair,
  restoreJobFair,
  uploadBanner,
  removeBanner: removeBannerApi
} = useJobFairs()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const deleteError = ref<string | null>(null)
const restoreError = ref<string | null>(null)
const allJobFairs = ref<JobFair[]>([])
const submitting = ref(false)
const deleting = ref(false)
const restoring = ref(false)
const showModal = ref(false)
const showViewModal = ref(false)
const showDeleteModal = ref(false)
const showRestoreModal = ref(false)
const selectedJobFair = ref<JobFair | null>(null)
const viewData = ref<JobFair | null>(null)
const isEdit = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const uploadProgress = ref(0)
const currentBanner = ref<Asset | null>(null)

// Filters
const searchQuery = ref('')
const searchTimeout = ref<NodeJS.Timeout | null>(null)
const statusFilter = ref('')
const showDeleted = ref(false)
const page = ref(1)
const perPage = ref(10)

// Form
const form = ref({
  title: '',
  shortDescription: '',
  description: '',
  start: '',
  finish: '',
  status: ''
})

// Handle edit from view modal
const handleEditFromView = () => {
  if (viewData.value) {
    showViewModal.value = false
    openEditModal(viewData.value)
  }
}

// Computed: Filter job fairs berdasarkan tab, search, dan status
const filteredJobFairs = computed<JobFair[]>(() => {
  if (!allJobFairs.value.length) return []
  
  // First filter by tab (active/deleted)
  let filtered = allJobFairs.value.filter(jobFair => {
    if (showDeleted.value) {
      return jobFair.deletedAt !== null && jobFair.deletedAt !== undefined
    } else {
      return jobFair.deletedAt === null || jobFair.deletedAt === undefined
    }
  })
  
  // Then filter by status
  if (statusFilter.value) {
    filtered = filtered.filter(jobFair => jobFair.status === statusFilter.value)
  }
  
  // Then filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter((jobFair: JobFair) => {
      const title = jobFair.title.toLowerCase()
      const shortDesc = jobFair.shortDescription?.toLowerCase() || ''
      const desc = jobFair.description?.toLowerCase() || ''
      
      return title.includes(query) || 
             shortDesc.includes(query) || 
             desc.includes(query)
    })
  }
  
  return filtered
})

// Computed: Paginated job fairs
const paginatedJobFairs = computed<JobFair[]>(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredJobFairs.value.slice(start, end)
})

// Computed: Table title
const tableTitle = computed(() => {
  if (searchQuery.value) {
    return `Search Results for "${searchQuery.value}" (${filteredJobFairs.value.length} found)`
  }
  return showDeleted.value ? 'Deleted Job Fairs' : 'Active Job Fairs'
})

// Computed: Empty state message
const emptyStateMessage = computed(() => {
  if (searchQuery.value) {
    return `No job fairs found matching "${searchQuery.value}"`
  }
  if (statusFilter.value) {
    return `No ${statusFilter.value.toLowerCase()} job fairs found`
  }
  return showDeleted.value ? 'No deleted job fairs found' : 'No job fairs found'
})

// Columns
const columns = computed(() => {
  const cols = [
    { key: 'title', label: 'Job Fair' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' }
  ]
  
  if (showDeleted.value) {
    cols.push({ key: 'deletedAt', label: 'Deleted At' })
  } else {
    cols.push({ key: 'createdAt', label: 'Created' })
  }
  
  cols.push({ key: 'actions', label: 'Actions' })
  return cols
})

// Helpers
const formatDate = (timestamp: number | null | undefined): string => {
  if (!timestamp) return '-'
  return new Date(timestamp * 1000).toLocaleDateString()
}

const formatDateTime = (timestamp: number | null | undefined): string => {
  if (!timestamp) return '-'
  return new Date(timestamp * 1000).toLocaleString()
}

const dateToTimestamp = (dateString: string): number | null => {
  if (!dateString) return null
  return Math.floor(new Date(dateString).getTime() / 1000)
}

const timestampToDateInput = (timestamp: number | null | undefined): string => {
  if (!timestamp) return ''
  const date = new Date(timestamp * 1000)
  return date.toISOString().slice(0, 16)
}

// Search handlers
const handleSearch = () => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    page.value = 1
  }, 500)
}

const handleFilterChange = () => {
  page.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  page.value = 1
}

// Page change handlers
const handlePageChange = (newPage: number) => {
  page.value = newPage
}

const handlePerPageChange = (value: number) => {
  perPage.value = value
  page.value = 1
}

// Fetch data - Fetch ALL data for frontend filtering
const fetchJobFairs = async () => {
  if (!isAuthenticated.value) {
    console.log('User not authenticated, cannot fetch deleted items')
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    // Fetch all job fairs including deleted - butuh autentikasi
    const params: any = {
      page: 1,
      limit: 100 // Fetch more data at once
    }
    
    console.log('Fetching job fairs with auth token...')
    const response = await getAllJobFairsWithDeleted(params)
    allJobFairs.value = response
    
    console.log(`Fetched ${allJobFairs.value.length} job fairs`)
    
  } catch (err: any) {
    console.error('Fetch error:', err)
    
    // Handle specific error messages
    if (err.message?.includes('401') || err.statusCode === 401) {
      error.value = 'Session expired. Please login again.'
    } else if (err.message?.includes('Failed to fetch')) {
      error.value = 'Network error. Please check your connection and try again.'
    } else {
      error.value = err.message || 'Failed to fetch job fairs'
    }
    
    allJobFairs.value = []
  } finally {
    loading.value = false
  }
}

// Modal handlers
const openCreateModal = () => {
  isEdit.value = false
  form.value = {
    title: '',
    shortDescription: '',
    description: '',
    start: '',
    finish: '',
    status: ''
  }
  currentBanner.value = null
  showModal.value = true
}

const openEditModal = async (jobFair: JobFair) => {
  isEdit.value = true
  selectedJobFair.value = jobFair
  currentBanner.value = jobFair.banner || null
  
  try {
    const detailed = await getJobFairById(jobFair.id)
    
    form.value = {
      title: detailed.title,
      shortDescription: detailed.shortDescription || '',
      description: detailed.description || '',
      start: timestampToDateInput(detailed.start),
      finish: timestampToDateInput(detailed.finish),
      status: detailed.status || ''
    }
  } catch (err) {
    console.error('Failed to fetch details:', err)
  }
  
  showModal.value = true
}

const viewJobFair = async (jobFair: JobFair) => {
  try {
    viewData.value = await getJobFairById(jobFair.id)
    showViewModal.value = true
  } catch (err) {
    console.error('Failed to fetch details:', err)
  }
}

const closeModal = () => {
  showModal.value = false
  selectedJobFair.value = null
  currentBanner.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// File upload handlers
const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length || !selectedJobFair.value) return
  
  const file = input.files[0]
  if (!file) return
  
  try {
    uploadProgress.value = 0
    // Simulate progress (actual progress tracking would require XMLHttpRequest)
    const interval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 100)
    
    const asset = await uploadBanner(selectedJobFair.value.id, file)
    
    clearInterval(interval)
    uploadProgress.value = 100
    currentBanner.value = asset
    
    // Refresh data
    await fetchJobFairs()
    
    setTimeout(() => {
      uploadProgress.value = 0
    }, 1000)
    
  } catch (err: any) {
    console.error('Failed to upload banner:', err)
    error.value = err.message || 'Failed to upload banner'
    uploadProgress.value = 0
  }
}

const handleRemoveBanner = async () => {
  if (!selectedJobFair.value) return
  
  if (!confirm('Are you sure you want to remove the banner?')) return
  
  try {
    await removeBannerApi(selectedJobFair.value.id)
    currentBanner.value = null
    await fetchJobFairs()
  } catch (err: any) {
    console.error('Failed to remove banner:', err)
    error.value = err.message || 'Failed to remove banner'
  }
}

// Submit form
const handleSubmit = async () => {
  if (!form.value.title) {
    error.value = 'Title is required'
    return
  }

  submitting.value = true
  error.value = null
  
  try {
    const data: any = {
      title: form.value.title
    }
    
    if (form.value.shortDescription) data.shortDescription = form.value.shortDescription
    if (form.value.description) data.description = form.value.description
    if (form.value.status) data.status = form.value.status
    
    const startTimestamp = dateToTimestamp(form.value.start)
    const finishTimestamp = dateToTimestamp(form.value.finish)
    
    if (startTimestamp) data.start = startTimestamp
    if (finishTimestamp) data.finish = finishTimestamp
    
    if (isEdit.value && selectedJobFair.value) {
      await updateJobFair(selectedJobFair.value.id, data)
    } else {
      await createJobFair(data)
    }
    
    closeModal()
    await fetchJobFairs()
  } catch (err: any) {
    error.value = err.message || 'Failed to save job fair'
  } finally {
    submitting.value = false
  }
}

// Delete
const confirmDelete = (jobFair: JobFair) => {
  selectedJobFair.value = jobFair
  deleteError.value = null
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!selectedJobFair.value) return
  
  deleting.value = true
  deleteError.value = null
  
  try {
    await deleteJobFair(selectedJobFair.value.id)
    showDeleteModal.value = false
    selectedJobFair.value = null
    await fetchJobFairs()
  } catch (err: any) {
    deleteError.value = err.message || 'Failed to delete'
  } finally {
    deleting.value = false
  }
}

// Restore
const confirmRestore = (jobFair: JobFair) => {
  selectedJobFair.value = jobFair
  restoreError.value = null
  showRestoreModal.value = true
}

const handleRestore = async () => {
  if (!selectedJobFair.value) return
  
  restoring.value = true
  restoreError.value = null
  
  try {
    await restoreJobFair(selectedJobFair.value.id)
    showRestoreModal.value = false
    selectedJobFair.value = null
    await fetchJobFairs()
  } catch (err: any) {
    restoreError.value = err.message || 'Failed to restore'
  } finally {
    restoring.value = false
  }
}

const handleLogin = () => navigateTo('/login')

// Watchers
watch(() => isAuthenticated.value, (val) => { if (val) fetchJobFairs() })
watch(showDeleted, () => { 
  page.value = 1
})
watch(statusFilter, () => {
  page.value = 1
})

// Initial fetch
onMounted(() => { if (isAuthenticated.value) fetchJobFairs() })
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
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-container.modal-sm { max-width: 400px; }
.modal-container.modal-lg { max-width: 900px; }
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