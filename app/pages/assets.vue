<!-- pages/assets/index.vue -->
<template>
  <div class="animate-fade-in">
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Asset Library</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage all uploaded files and media assets.</p>
      </div>
      
      <!-- Upload Button -->
      <button 
        @click="showUploadModal = true"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
        Upload Asset
      </button>
    </div>

    <!-- Search and Filter -->
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
          placeholder="Search assets by name or type..."
          class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
          @input="debouncedSearch"
        />
      </div>

      <!-- Filter by MIME Type -->
      <select
        v-model="mimeTypeFilter"
        class="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white min-w-[150px]"
        @change="fetchAssets"
      >
        <option value="">All Types</option>
        <option value="image/">Images</option>
        <option value="video/">Videos</option>
        <option value="audio/">Audio</option>
        <option value="application/pdf">PDF</option>
        <option value="application/msword">Word</option>
        <option value="application/vnd.ms-excel">Excel</option>
        <option value="application/vnd.openxmlformats-officedocument">Office</option>
        <option value="text/">Text</option>
        <option value="application/zip">Archive</option>
      </select>

      <!-- View Toggle -->
      <div class="flex border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
        <button 
          @click="viewMode = 'grid'"
          class="px-3 py-2"
          :class="viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
        <button 
          @click="viewMode = 'list'"
          class="px-3 py-2"
          :class="viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
          </svg>
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
        @click="fetchAssets" 
        class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Retry
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="assets.length === 0" class="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-slate-900 dark:text-white">No assets found</h3>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Upload your first asset to get started.</p>
      <button 
        @click="showUploadModal = true"
        class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
        Upload First Asset
      </button>
    </div>

    <!-- Assets Grid View -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="asset in assets" :key="asset.id" class="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
        <!-- Asset Preview -->
        <div class="aspect-square bg-slate-100 dark:bg-slate-700 flex items-center justify-center relative group">
          <template v-if="asset.mimeType?.startsWith('image/')">
            <img :src="asset.url" :alt="asset.originalName" class="w-full h-full object-cover" />
          </template>
          <template v-else>
            <span class="text-6xl">{{ getFileIcon(asset.mimeType) }}</span>
          </template>
          
          <!-- Overlay Actions -->
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button @click="viewAsset(asset)" class="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors" title="View">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-700" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
            </button>
            <button @click="copyUrl(asset.url)" class="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors" title="Copy URL">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-700" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            </button>
            <button @click="confirmDelete(asset)" class="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors" title="Delete">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Asset Info -->
        <div class="p-3">
          <div class="text-sm font-medium text-slate-900 dark:text-white truncate" :title="asset.originalName">
            {{ asset.originalName }}
          </div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mt-1 flex justify-between">
            <span>{{ formatFileSize(asset.size) }}</span>
            <span>{{ new Date(asset.createdAt * 1000).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Assets List View -->
    <div v-else class="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead class="bg-slate-50 dark:bg-slate-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Preview</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Type</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Size</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Uploaded</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          <tr v-for="asset in assets" :key="asset.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                <template v-if="asset.mimeType?.startsWith('image/')">
                  <img :src="asset.url" :alt="asset.originalName" class="w-full h-full object-cover rounded" />
                </template>
                <template v-else>
                  <span class="text-xl">{{ getFileIcon(asset.mimeType) }}</span>
                </template>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-slate-900 dark:text-white">{{ asset.originalName }}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400">{{ asset.fileName }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
              {{ asset.mimeType }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
              {{ formatFileSize(asset.size) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
              {{ formatDate(asset.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex items-center gap-2">
                <button @click="viewAsset(asset)" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="View">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button @click="copyUrl(asset.url)" class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300" title="Copy URL">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
                <button @click="confirmDelete(asset)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Delete">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="assets.length > 0" class="mt-6 px-6 py-4 bg-white dark:bg-slate-800 rounded-lg shadow">
      <div class="flex items-center justify-between">
        <div class="text-sm text-slate-700 dark:text-slate-300">
          Showing {{ (pagination.page - 1) * pagination.pageSize + 1 }} to 
          {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }} of {{ pagination.total }} assets
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
            Page {{ pagination.page }} of {{ pagination.totalPages }}
          </span>
          <button
            @click="currentPage++"
            :disabled="currentPage === pagination.totalPages"
            class="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showUploadModal" class="modal-overlay" @click.self="showUploadModal = false">
          <div class="modal-container modal-md">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Upload Asset</h3>
              <button @click="showUploadModal = false" class="modal-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div class="modal-body">
              <div v-if="uploadError" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p class="text-sm text-red-600 dark:text-red-400">{{ uploadError }}</p>
              </div>

              <div class="space-y-4">
                <!-- Folder Selection -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Folder (Optional)</label>
                  <select
                    v-model="uploadFolder"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">Root</option>
                    <option value="banners">Banners</option>
                    <option value="logos">Logos</option>
                    <option value="documents">Documents</option>
                    <option value="images">Images</option>
                  </select>
                </div>

                <!-- File Upload Area -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">File</label>
                  <div 
                    class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
                    @click="triggerFileInput"
                    @dragover.prevent
                    @drop.prevent="handleFileDrop"
                  >
                    <input 
                      ref="fileInput"
                      type="file" 
                      class="hidden"
                      @change="handleFileSelect"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {{ selectedFile ? selectedFile.name : 'Click or drag file to upload' }}
                    </p>
                    <p v-if="selectedFile" class="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {{ formatFileSize(selectedFile.size) }}
                    </p>
                  </div>
                </div>

                <!-- File Preview -->
                <div v-if="selectedFile && selectedFile.type.startsWith('image/')" class="mt-4">
                  <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Preview:</p>
                  <img: src="previewUrl" class="max-h-48 rounded-lg border border-slate-200 dark:border-slate-700" />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button 
                @click="showUploadModal = false" 
                class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                @click="handleUpload" 
                :disabled="uploading || !selectedFile"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span v-if="uploading" class="flex items-center gap-2">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </span>
                <span v-else>Upload</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- View Asset Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showViewModal" class="modal-overlay" @click.self="showViewModal = false">
          <div class="modal-container modal-lg">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Asset Details</h3>
              <button @click="showViewModal = false" class="modal-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div v-if="viewData" class="modal-body">
              <div class="space-y-6">
                <!-- Asset Preview -->
                <div class="bg-slate-100 dark:bg-slate-700 rounded-lg p-6 flex justify-center">
                  <template v-if="viewData.mimeType?.startsWith('image/')">
                    <img :src="viewData.url" :alt="viewData.originalName" class="max-h-96 rounded-lg" />
                  </template>
                  <template v-else>
                    <div class="text-center">
                      <span class="text-8xl">{{ getFileIcon(viewData.mimeType) }}</span>
                      <p class="mt-4 text-slate-600 dark:text-slate-400">Preview not available</p>
                    </div>
                  </template>
                </div>

                <!-- Asset Info -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Original Name</p>
                    <p class="text-sm font-medium">{{ viewData.originalName }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">File Name</p>
                    <p class="text-sm">{{ viewData.fileName }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">MIME Type</p>
                    <p class="text-sm">{{ viewData.mimeType }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Size</p>
                    <p class="text-sm">{{ formatFileSize(viewData.size) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Location</p>
                    <p class="text-sm">{{ viewData.location }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">ID</p>
                    <p class="text-sm text-xs">{{ viewData.id }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Created At</p>
                    <p class="text-sm">{{ formatDateTime(viewData.createdAt) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Updated At</p>
                    <p class="text-sm">{{ formatDateTime(viewData.updatedAt) }}</p>
                  </div>
                </div>

                <!-- URL -->
                <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">URL</p>
                  <div class="flex items-center gap-2">
                    <input 
                      :value="viewData.url" 
                      type="text" 
                      readonly
                      class="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm"
                    />
                    <button @click="copyUrl(viewData.url)" class="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                      Copy
                    </button>
                  </div>
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
              <a 
                :href="viewData?.url" 
                target="_blank" 
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                Open
              </a>
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
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Delete Asset</h3>
              <button @click="showDeleteModal = false" class="modal-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div class="modal-body">
              <p class="text-slate-600 dark:text-slate-400">
                Are you sure you want to delete 
                <span class="font-semibold text-slate-900 dark:text-white">"{{ selectedAsset?.originalName }}"</span>?
              </p>
              <p class="mt-2 text-sm text-red-600 dark:text-red-400">This action can be undone (soft delete).</p>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAssets, type Asset } from '~/composables/useAssets'

const { 
  listAllAssets,
  searchAssets,
  uploadAsset,
  deleteAsset,
  getAsset,
  formatFileSize,
  getFileIcon
} = useAssets()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const assets = ref<Asset[]>([])
const pagination = ref({
  page: 1,
  pageSize: 12,
  total: 0,
  totalPages: 0
})
const currentPage = ref(1)
const searchQuery = ref('')
const searchTimeout = ref<NodeJS.Timeout | null>(null)
const mimeTypeFilter = ref('')
const viewMode = ref<'grid' | 'list'>('grid')

// Upload modal
const showUploadModal = ref(false)
const uploading = ref(false)
const uploadError = ref<string | null>(null)
const selectedFile = ref<File | null>(null) // Ubah menjadi null, bukan undefined
const uploadFolder = ref<string>('') // Ubah menjadi string, bukan undefined
const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)

// View modal
const showViewModal = ref(false)
const viewData = ref<Asset | null>(null)

// Delete modal
const showDeleteModal = ref(false)
const selectedAsset = ref<Asset | null>(null)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

// Fetch assets
const fetchAssets = async () => {
  loading.value = true
  error.value = null
  
  try {
    let response
    
    if (searchQuery.value || mimeTypeFilter.value) {
      // Use search endpoint
      response = await searchAssets({
        q: searchQuery.value || undefined,
        mimeType: mimeTypeFilter.value || undefined,
        page: currentPage.value,
        pageSize: pagination.value.pageSize
      })
    } else {
      // Use list all endpoint
      response = await listAllAssets({
        page: currentPage.value,
        pageSize: pagination.value.pageSize
      })
    }
    
    assets.value = response.data
    pagination.value = response.pagination
    
  } catch (err: any) {
    console.error('Error fetching assets:', err)
    error.value = err.message || 'Failed to fetch assets'
  } finally {
    loading.value = false
  }
}

// Debounced search
const debouncedSearch = () => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1
    fetchAssets()
  }, 500)
}

// Watch for filter changes
watch(mimeTypeFilter, () => {
  currentPage.value = 1
  fetchAssets()
})

// Watch page changes
watch(currentPage, () => {
  fetchAssets()
})

// Format date
const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString()
}

const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString()
}

// Copy URL to clipboard
const copyUrl = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    alert('URL copied to clipboard')
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Upload methods
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0] as File // Type assertion
    
    // Create preview URL for images
    if (selectedFile.value.type.startsWith('image/')) {
      previewUrl.value = URL.createObjectURL(selectedFile.value)
    } else {
      previewUrl.value = null
    }
  }
}

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    selectedFile.value = event.dataTransfer.files[0] as File // Type assertion
    
    // Create preview URL for images
    if (selectedFile.value.type.startsWith('image/')) {
      previewUrl.value = URL.createObjectURL(selectedFile.value)
    } else {
      previewUrl.value = null
    }
  }
}

const handleUpload = async () => {
  if (!selectedFile.value) return
  
  uploading.value = true
  uploadError.value = null
  
  try {
    // Pastikan uploadFolder tidak undefined, gunakan empty string jika null
    const folder = uploadFolder.value || undefined
    await uploadAsset(selectedFile.value, folder)
    
    showUploadModal.value = false
    selectedFile.value = null
    uploadFolder.value = ''
    previewUrl.value = null
    
    // Refresh assets
    await fetchAssets()
    
  } catch (err: any) {
    console.error('Upload error:', err)
    uploadError.value = err.message || 'Failed to upload asset'
  } finally {
    uploading.value = false
  }
}

// View asset
const viewAsset = async (asset: Asset) => {
  try {
    const detailed = await getAsset(asset.id)
    viewData.value = detailed
    showViewModal.value = true
  } catch (err) {
    console.error('Error fetching asset details:', err)
    error.value = 'Failed to load asset details'
  }
}

// Delete asset
const confirmDelete = (asset: Asset) => {
  selectedAsset.value = asset
  deleteError.value = null
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!selectedAsset.value) return
  
  deleting.value = true
  deleteError.value = null
  
  try {
    await deleteAsset(selectedAsset.value.id)
    showDeleteModal.value = false
    selectedAsset.value = null
    await fetchAssets()
  } catch (err: any) {
    deleteError.value = err.message || 'Failed to delete asset'
  } finally {
    deleting.value = false
  }
}

// Clean up preview URL
watch(showUploadModal, (val) => {
  if (!val && previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
    selectedFile.value = null
    uploadFolder.value = ''
  }
})

// Initial fetch
onMounted(() => {
  fetchAssets()
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
.modal-container.modal-md { max-width: 500px; }
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