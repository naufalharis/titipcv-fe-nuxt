<template>
  <div class="animate-fade-in">
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Companies Management</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage all companies in your application.</p>
      </div>
      
      <!-- Add Company Button -->
      <button 
        v-if="!showDeleted"
        @click="openCreateModal"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Add Company
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
          :placeholder="showDeleted ? 'Search deleted companies...' : 'Search companies by name...'"
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
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>
    </div>

    <!-- Search Info -->
    <div v-if="searchQuery" class="mb-4 text-sm text-slate-500 dark:text-slate-400">
      Searching for "{{ searchQuery }}" • {{ filteredCompanies.length }} results found
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600 dark:text-red-400">{{ error }}</p>
      <button 
        @click="fetchCompanies" 
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
      :rows="paginatedCompanies"
      :loading="loading"
      :totalRows="filteredCompanies.length"
      @update:page="handlePageChange"
      @update:perPage="handlePerPageChange"
    >
      <!-- Name cell with logo -->
      <template #cell-name="{ row }">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              v-if="row.companyLogo?.url" 
              :src="row.companyLogo.url" 
              :alt="row.name"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          </div>
          <div>
            <div class="text-sm font-medium text-slate-900 dark:text-white">{{ row.name }}</div>
            <div v-if="row.email" class="text-xs text-slate-500 dark:text-slate-400">{{ row.email }}</div>
          </div>
        </div>
      </template>

      <!-- Industry cell -->
      <template #cell-industry="{ row }">
        <span class="text-sm text-slate-600 dark:text-slate-400">
          {{ row.industry || '-' }}
        </span>
      </template>

      <!-- Status cell -->
      <template #cell-status="{ row }">
        <span 
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="{
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300': row.status === 'PENDING',
            'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300': row.status === 'APPROVED',
            'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300': row.status === 'REJECTED',
            'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300': !row.status
          }"
        >
          <span 
            class="w-1.5 h-1.5 rounded-full mr-1.5" 
            :class="{
              'bg-yellow-500': row.status === 'PENDING',
              'bg-green-500': row.status === 'APPROVED',
              'bg-red-500': row.status === 'REJECTED',
              'bg-slate-500': !row.status
            }"
          ></span>
          {{ row.status || 'No Status' }}
        </span>
      </template>

      <!-- PIC cell -->
      <template #cell-pic="{ row }">
        <div class="text-sm text-slate-600 dark:text-slate-400">
          <div v-if="row.pic_name" class="font-medium">{{ row.pic_name }}</div>
          <div v-if="row.pic_email" class="text-xs">{{ row.pic_email }}</div>
          <div v-if="row.pic_whatsapp" class="text-xs">{{ row.pic_whatsapp }}</div>
        </div>
      </template>

      <!-- Jobs count cell -->
      <template #cell-jobs="{ row }">
        <div class="text-sm text-slate-600 dark:text-slate-400">
          <div>Active: {{ row.activeJobsCount || 0 }}</div>
          <div class="text-xs">Total: {{ row.totalJobsCount || 0 }}</div>
        </div>
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
            @click="() => viewCompany(row)"
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
            title="Edit Company"
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
            title="Restore Company"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <!-- Delete button -->
          <button 
            @click="() => confirmDelete(row)"
            class="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
            :title="showDeleted ? 'Permanently Delete' : 'Delete Company'"
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
          <div class="modal-container modal-xl">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                {{ isEdit ? 'Edit Company' : 'Create New Company' }}
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
                  <!-- Name (Required) -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Company Name <span class="text-red-500">*</span>
                    </label>
                    <input 
                      v-model="form.name" 
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      :class="{ 'border-red-500': validationErrors.name }"
                      placeholder="e.g., PT Antiq"
                      required
                    />
                    <p v-if="validationErrors.name" class="mt-1 text-xs text-red-500">{{ validationErrors.name }}</p>
                  </div>

                  <!-- Industry -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Industry
                    </label>
                    <input 
                      v-model="form.industry" 
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      placeholder="e.g., Financial Technology"
                    />
                  </div>

                  <!-- Company Size -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Company Size
                    </label>
                    <select
                      v-model="form.size"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">Select Size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  </div>

                  <!-- Website -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Website
                    </label>
                    <input 
                      v-model="form.website" 
                      type="url"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      placeholder="https://www.Antiq.co.id"
                    />
                  </div>

                  <!-- Company Email -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Company Email
                    </label>
                    <input 
                      v-model="form.email" 
                      type="email"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      placeholder="info@Antiq.co.id"
                    />
                  </div>

                  <!-- Phone -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Phone
                    </label>
                    <input 
                      v-model="form.phone" 
                      type="tel"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      placeholder="+62813123456741"
                    />
                  </div>
                </div>

                <!-- Right Column - PIC Information -->
                <div class="space-y-4">
                  <!-- PIC Name -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      PIC Name
                    </label>
                    <input 
                      v-model="form.pic_name" 
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      placeholder="billy"
                    />
                  </div>

                  <!-- PIC Position -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      PIC Position
                    </label>
                    <input 
                      v-model="form.pic_position" 
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      placeholder="HR Supervisor"
                    />
                  </div>

                  <!-- PIC WhatsApp -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      PIC WhatsApp
                    </label>
                    <input 
                      v-model="form.pic_whatsapp" 
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      placeholder="+6281312345681"
                    />
                  </div>

                  <!-- PIC Email -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      PIC Email
                    </label>
                    <input 
                      v-model="form.pic_email" 
                      type="email"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      placeholder="billy.adl@Antiq.co.id"
                    />
                  </div>

                  <!-- Status (for edit only) -->
                  <div v-if="isEdit">
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Status
                    </label>
                    <select
                      v-model="form.status"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                  <div v-else>
                    <input type="hidden" v-model="form.status" />
                  </div>
                </div>
              </div>

              <!-- Address Section -->
              <div class="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h4 class="text-md font-medium text-slate-900 dark:text-white mb-4">Address Information</h4>
                <div class="grid grid-cols-2 gap-4">
                  <!-- Country Dropdown -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Country <span class="text-red-500">*</span>
                    </label>
                    <select
                      v-model="form.countryId"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      :class="{ 'border-red-500': validationErrors.countryId }"
                      :disabled="countriesLoading"
                      required
                    >
                      <option value="">
                        {{ countriesLoading ? 'Loading countries...' : 'Select Country' }}
                      </option>
                      <option 
                        v-for="country in countries" 
                        :key="country.id" 
                        :value="country.id"
                      >
                        {{ country.name }} {{ country.code ? `(${country.code})` : '' }}
                      </option>
                    </select>
                    <p v-if="validationErrors.countryId" class="mt-1 text-xs text-red-500">{{ validationErrors.countryId }}</p>
                  </div>

                  <!-- Province -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Province
                    </label>
                    <input 
                      v-model="form.province" 
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      placeholder="Jawa Barat"
                    />
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
                      placeholder="Bogor"
                    />
                  </div>

                  <!-- District -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      District
                    </label>
                    <input 
                      v-model="form.district" 
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      placeholder="Lengkong"
                    />
                  </div>

                  <!-- Address -->
                  <div class="col-span-2">
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Address
                    </label>
                    <textarea 
                      v-model="form.address" 
                      rows="3"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                      placeholder="Jl. Cisarua No. 45"
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- About Section -->
              <div class="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  About Company
                </label>
                <textarea 
                  v-model="form.about" 
                  rows="4"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                  placeholder="Perusahaan Antiq no 1 di dunia."
                ></textarea>
              </div>

              <!-- Video URL -->
              <div class="mt-4">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Video URL (YouTube/Vimeo)
                </label>
                <input 
                  v-model="form.videoUrl" 
                  type="url"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                  placeholder="https://youtube.com/watch?v=Antiq"
                />
              </div>

              <!-- Logo Upload (only for edit) -->
              <div v-if="isEdit" class="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Company Logo
                </label>
                
                <!-- Current Logo -->
                <div v-if="currentLogo" class="mb-4">
                  <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">Current Logo:</p>
                  <div class="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img :src="currentLogo.url" :alt="form.name" class="w-full h-full object-cover" />
                    <button 
                      @click="handleRemoveLogo"
                      type="button"
                      class="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      title="Remove Logo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Upload New Logo -->
                <div>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">Upload New Logo:</p>
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
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Company Details</h3>
              <button @click="showViewModal = false" class="modal-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div v-if="viewData" class="modal-body">
              <div class="space-y-6">
                <!-- Logo and Basic Info -->
                <div class="flex items-start gap-6">
                  <div class="flex-shrink-0 w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-lg overflow-hidden">
                    <img 
                      v-if="viewData.companyLogo?.url" 
                      :src="viewData.companyLogo.url" 
                      :alt="viewData.name"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1">
                    <h2 class="text-2xl font-bold text-slate-900 dark:text-white">{{ viewData.name }}</h2>
                    <div class="mt-2 flex items-center gap-4">
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="{
                          'bg-yellow-100 text-yellow-800': viewData.status === 'PENDING',
                          'bg-green-100 text-green-800': viewData.status === 'APPROVED',
                          'bg-red-100 text-red-800': viewData.status === 'REJECTED'
                        }"
                      >
                        {{ viewData.status }}
                      </span>
                      <span class="text-sm text-slate-500">ID: {{ viewData.id }}</span>
                    </div>
                  </div>
                </div>

                <!-- Stats Cards -->
                <div class="grid grid-cols-3 gap-4">
                  <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                    <p class="text-sm text-slate-500 dark:text-slate-400">Active Jobs</p>
                    <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ viewData.activeJobsCount || 0 }}</p>
                  </div>
                  <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                    <p class="text-sm text-slate-500 dark:text-slate-400">Total Jobs</p>
                    <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ viewData.totalJobsCount || 0 }}</p>
                  </div>
                  <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                    <p class="text-sm text-slate-500 dark:text-slate-400">Industry</p>
                    <p class="text-lg font-medium text-slate-900 dark:text-white">{{ viewData.industry || '-' }}</p>
                  </div>
                </div>

                <!-- Contact Information -->
                <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 class="font-medium mb-3">Contact Information</h4>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Email</label>
                      <p class="text-sm text-slate-900 dark:text-white">{{ viewData.email || '-' }}</p>
                    </div>
                    <div>
                      <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Phone</label>
                      <p class="text-sm text-slate-900 dark:text-white">{{ viewData.phone || '-' }}</p>
                    </div>
                    <div>
                      <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Website</label>
                      <p class="text-sm text-slate-900 dark:text-white">
                        <a v-if="viewData.website" :href="viewData.website" target="_blank" class="text-primary-600 hover:underline">{{ viewData.website }}</a>
                        <span v-else>-</span>
                      </p>
                    </div>
                    <div>
                      <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Company Size</label>
                      <p class="text-sm text-slate-900 dark:text-white">{{ viewData.size || '-' }}</p>
                    </div>
                  </div>
                </div>

                <!-- PIC Information -->
                <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 class="font-medium mb-3">Person in Charge (PIC)</h4>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Name</label>
                      <p class="text-sm text-slate-900 dark:text-white">{{ viewData.pic_name || '-' }}</p>
                    </div>
                    <div>
                      <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Position</label>
                      <p class="text-sm text-slate-900 dark:text-white">{{ viewData.pic_position || '-' }}</p>
                    </div>
                    <div>
                      <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Email</label>
                      <p class="text-sm text-slate-900 dark:text-white">{{ viewData.pic_email || '-' }}</p>
                    </div>
                    <div>
                      <label class="text-xs font-medium text-slate-500 dark:text-slate-400">WhatsApp</label>
                      <p class="text-sm text-slate-900 dark:text-white">{{ viewData.pic_whatsapp || '-' }}</p>
                    </div>
                  </div>
                </div>

                <!-- Address Information -->
                <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 class="font-medium mb-3">Address</h4>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Country</label>
                      <p class="text-sm text-slate-900 dark:text-white">{{ getCountryName(viewData.countryId) || viewData.countryId || '-' }}</p>
                    </div>
                    <div>
                      <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Province</label>
                      <p class="text-sm text-slate-900 dark:text-white">{{ viewData.province || '-' }}</p>
                    </div>
                    <div>
                      <label class="text-xs font-medium text-slate-500 dark:text-slate-400">City</label>
                      <p class="text-sm text-slate-900 dark:text-white">{{ viewData.city || '-' }}</p>
                    </div>
                    <div>
                      <label class="text-xs font-medium text-slate-500 dark:text-slate-400">District</label>
                      <p class="text-sm text-slate-900 dark:text-white">{{ viewData.district || '-' }}</p>
                    </div>
                    <div class="col-span-2">
                      <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Full Address</label>
                      <p class="text-sm text-slate-900 dark:text-white">{{ viewData.address || '-' }}</p>
                    </div>
                  </div>
                </div>

                <!-- About -->
                <div v-if="viewData.about" class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 class="font-medium mb-3">About</h4>
                  <p class="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{{ viewData.about }}</p>
                </div>

                <!-- Video -->
                <div v-if="viewData.videoUrl" class="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 class="font-medium mb-3">Company Video</h4>
                  <a :href="viewData.videoUrl" target="_blank" class="text-primary-600 hover:underline">Watch Video</a>
                </div>

                <!-- Timestamps -->
                <div class="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Created At</label>
                    <p class="text-sm text-slate-600 dark:text-slate-400">{{ formatDateTime(viewData.createdAt) }}</p>
                  </div>
                  <div>
                    <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Updated At</label>
                    <p class="text-sm text-slate-600 dark:text-slate-400">{{ formatDateTime(viewData.updatedAt) }}</p>
                  </div>
                </div>

                <!-- Deleted At -->
                <div v-if="viewData.deletedAt" class="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <label class="text-xs font-medium text-red-500 dark:text-red-400">Deleted At</label>
                  <p class="text-sm text-red-600 dark:text-red-400">{{ formatDateTime(viewData.deletedAt) }}</p>
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
                {{ showDeleted ? 'Permanently Delete' : 'Delete' }} Company
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
                <span class="font-semibold text-slate-900 dark:text-white">"{{ selectedCompany?.name }}"</span>?
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
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Restore Company</h3>
              <button @click="showRestoreModal = false" class="modal-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div class="modal-body">
              <p class="text-slate-600 dark:text-slate-400">
                Are you sure you want to restore 
                <span class="font-semibold text-slate-900 dark:text-white">"{{ selectedCompany?.name }}"</span>?
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
import { useCompanies, type Company, type Asset, type Country } from '~/composables/useCompanies'

const { isAuthenticated } = useAuth()
const { 
  getAllCompaniesWithDeleted,
  getCompanyById, 
  createCompany, 
  updateCompany, 
  deleteCompany,
  restoreCompany,
  uploadLogo,
  removeLogo,
  getCountries  
} = useCompanies()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const deleteError = ref<string | null>(null)
const restoreError = ref<string | null>(null)
const allCompanies = ref<Company[]>([])
const submitting = ref(false)
const deleting = ref(false)
const restoring = ref(false)
const showModal = ref(false)
const showViewModal = ref(false)
const showDeleteModal = ref(false)
const showRestoreModal = ref(false)
const selectedCompany = ref<Company | null>(null)
const viewData = ref<Company | null>(null)
const isEdit = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const uploadProgress = ref(0)
const currentLogo = ref<Asset | null>(null)
const countries = ref<Country[]>([])
const countriesLoading = ref(false)
const formError = ref<string | null>(null)
const validationErrors = ref<Record<string, string>>({})

// Filters
const searchQuery = ref('')
const searchTimeout = ref<NodeJS.Timeout | null>(null)
const statusFilter = ref('')
const showDeleted = ref(false)
const page = ref(1)
const perPage = ref(10)

// Form - semua field sesuai contoh
const form = ref({
  name: '',
  about: '',
  industry: '',
  size: '',
  website: '',
  email: '',
  phone: '',
  pic_name: '',
  pic_position: '',
  pic_whatsapp: '',
  pic_email: '',
  countryId: '',
  address: '',
  province: '',
  district: '',
  city: '',
  videoUrl: '',
  status: 'PENDING',
  userId: ''
})

// Fetch countries
const fetchCountries = async () => {
  countriesLoading.value = true
  try {
    countries.value = await getCountries()
    console.log('Countries loaded:', countries.value.length)
  } catch (err) {
    console.error('Failed to fetch countries:', err)
  } finally {
    countriesLoading.value = false
  }
}

// Get country name by ID
const getCountryName = (countryId: string | null | undefined): string => {
  if (!countryId) return '-'
  const country = countries.value.find(c => c.id === countryId)
  return country ? country.name : countryId
}

// Submit form
const handleSubmit = async () => {
  // Reset validation
  validationErrors.value = {}
  formError.value = null
  
  // Validasi required fields
  if (!form.value.name) {
    validationErrors.value.name = 'Company name is required'
  }
  if (!form.value.countryId) {
    validationErrors.value.countryId = 'Country is required'
  }
  
  if (Object.keys(validationErrors.value).length > 0) {
    return
  }

  submitting.value = true
  error.value = null
  
  try {
    // Buat data object dengan semua field (sesuai contoh)
    const data: any = {
      name: form.value.name,
      about: form.value.about || null,
      industry: form.value.industry || null,
      size: form.value.size || null,
      website: form.value.website || null,
      email: form.value.email || null,
      phone: form.value.phone || null,
      pic_name: form.value.pic_name || null,
      pic_position: form.value.pic_position || null,
      pic_whatsapp: form.value.pic_whatsapp || null,
      pic_email: form.value.pic_email || null,
      countryId: form.value.countryId,
      address: form.value.address || null,
      province: form.value.province || null,
      district: form.value.district || null,
      city: form.value.city || null,
      videoUrl: form.value.videoUrl || null,
      status: form.value.status || 'PENDING',
    }
    
    // Hanya tambah userId kalau ada (optional)
    if (form.value.userId) {
      data.userId = form.value.userId
    }
    
    console.log('=== SUBMITTING FORM DATA ===')
    console.log('Raw form:', JSON.stringify(form.value, null, 2))
    console.log('Processed data:', JSON.stringify(data, null, 2))
    
    if (isEdit.value && selectedCompany.value) {
      await updateCompany(selectedCompany.value.id, data)
    } else {
      await createCompany(data)
    }
    
    closeModal()
    await fetchCompanies()
    
  } catch (err: any) {
    console.error('=== FORM SUBMISSION ERROR ===')
    console.error('Error:', err)
    
    // Handle validation errors from server
    if (err.data) {
      console.error('Server error data:', err.data)
      
      if (err.data.message) {
        formError.value = err.data.message
      }
      
      if (err.data.errors) {
        validationErrors.value = err.data.errors
        // Convert object to string for display
        const errorMessages = Object.values(err.data.errors).join(', ')
        formError.value = errorMessages || 'Validation error'
      }
    }
    
    error.value = err.message || 'Failed to save company'
    if (!formError.value) {
      formError.value = error.value
    }
  } finally {
    submitting.value = false
  }
}

// Handle edit from view modal
const handleEditFromView = () => {
  if (viewData.value) {
    showViewModal.value = false
    openEditModal(viewData.value)
  }
}

// Handle image error
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// Computed: Filter companies berdasarkan tab, search, dan status
const filteredCompanies = computed<Company[]>(() => {
  if (!allCompanies.value.length) return []
  
  // First filter by tab (active/deleted)
  let filtered = allCompanies.value.filter(company => {
    if (showDeleted.value) {
      return company.deletedAt !== null && company.deletedAt !== undefined
    } else {
      return company.deletedAt === null || company.deletedAt === undefined
    }
  })
  
  // Then filter by status
  if (statusFilter.value) {
    filtered = filtered.filter(company => company.status === statusFilter.value)
  }
  
  // Then filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter((company: Company) => {
      const name = company.name?.toLowerCase() || ''
      const email = company.email?.toLowerCase() || ''
      const industry = company.industry?.toLowerCase() || ''
      
      return name.includes(query) || 
             email.includes(query) || 
             industry.includes(query)
    })
  }
  
  return filtered
})

// Computed: Paginated companies
const paginatedCompanies = computed<Company[]>(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredCompanies.value.slice(start, end)
})
// Computed: Table title
const tableTitle = computed(() => {
  if (searchQuery.value) {
    return `Search Results for "${searchQuery.value}" (${filteredCompanies.value.length} found)`
  }
  return showDeleted.value ? 'Deleted Companies' : 'Active Companies'
})

// Computed: Empty state message
const emptyStateMessage = computed(() => {
  if (searchQuery.value) {
    return `No companies found matching "${searchQuery.value}"`
  }
  if (statusFilter.value) {
    return `No ${statusFilter.value.toLowerCase()} companies found`
  }
  return showDeleted.value ? 'No deleted companies found' : 'No companies found'
})

// Columns
const columns = computed(() => {
  const cols = [
    { key: 'name', label: 'Company' },
    { key: 'industry', label: 'Industry' },
    { key: 'status', label: 'Status' },
    { key: 'pic', label: 'PIC' },
    { key: 'jobs', label: 'Jobs' }
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

// Tab switch handler
const switchTab = (deleted: boolean) => {
  showDeleted.value = deleted
  page.value = 1
  searchQuery.value = ''
  statusFilter.value = ''
}

// Page change handlers
const handlePageChange = (newPage: number) => {
  page.value = newPage
}

const handlePerPageChange = (value: number) => {
  perPage.value = value
  page.value = 1
}

// Fetch data
const fetchCompanies = async () => {
  if (!isAuthenticated.value) return
  
  loading.value = true
  error.value = null
  
  try {
    const params: any = {
      page: 1,
      limit: 100
    }
    
    const response = await getAllCompaniesWithDeleted(params)
    allCompanies.value = response
    
    console.log(`Fetched ${allCompanies.value.length} companies`)
    
  } catch (err: any) {
    console.error('Fetch error:', err)
    error.value = err.message || 'Failed to fetch companies'
    allCompanies.value = []
  } finally {
    loading.value = false
  }
}

// Modal handlers
const openCreateModal = () => {
  isEdit.value = false
  form.value = {
    name: '',
    about: '',
    industry: '',
    size: '',
    website: '',
    email: '',
    phone: '',
    pic_name: '',
    pic_position: '',
    pic_whatsapp: '',
    pic_email: '',
    countryId: '',
    address: '',
    province: '',
    district: '',
    city: '',
    videoUrl: '',
    status: 'PENDING',
    userId: ''
  }
  currentLogo.value = null
  validationErrors.value = {}
  formError.value = null
  showModal.value = true
}

const openEditModal = async (company: Company) => {
  isEdit.value = true
  selectedCompany.value = company
  currentLogo.value = company.companyLogo || null
  validationErrors.value = {}
  formError.value = null
  
  try {
    const detailed = await getCompanyById(company.id)
    
    form.value = {
      name: detailed.name || '',
      about: detailed.about || '',
      industry: detailed.industry || '',
      size: detailed.size || '',
      website: detailed.website || '',
      email: detailed.email || '',
      phone: detailed.phone || '',
      pic_name: detailed.pic_name || '',
      pic_position: detailed.pic_position || '',
      pic_whatsapp: detailed.pic_whatsapp || '',
      pic_email: detailed.pic_email || '',
      countryId: detailed.countryId || '',
      address: detailed.address || '',
      province: detailed.province || '',
      district: detailed.district || '',
      city: detailed.city || '',
      videoUrl: detailed.videoUrl || '',
      status: detailed.status || 'PENDING',
      userId: detailed.userId || ''
    }
    
    console.log('Edit modal - loaded data:', form.value)
    
  } catch (err) {
    console.error('Failed to fetch details:', err)
  }
  
  showModal.value = true
}

const viewCompany = async (company: Company) => {
  try {
    viewData.value = await getCompanyById(company.id)
    showViewModal.value = true
  } catch (err) {
    console.error('Failed to fetch details:', err)
  }
}

const closeModal = () => {
  showModal.value = false
  selectedCompany.value = null
  currentLogo.value = null
  validationErrors.value = {}
  formError.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// File upload handlers
const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length || !selectedCompany.value) return
  
  const file = input.files[0]
  if (!file) return
  
  // Validasi file
  if (!file.type.startsWith('image/')) {
    error.value = 'File must be an image'
    input.value = ''
    return
  }
  
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    error.value = 'File size must be less than 5MB'
    input.value = ''
    return
  }
  
  try {
    uploadProgress.value = 0
    error.value = null
    
    const interval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 200)
    
    const asset = await uploadLogo(selectedCompany.value.id, file)
    
    clearInterval(interval)
    uploadProgress.value = 100
    currentLogo.value = asset
    
    await fetchCompanies()
    
    setTimeout(() => {
      uploadProgress.value = 0
    }, 1000)
    
  } catch (err: any) {
    console.error('Failed to upload logo:', err)
    error.value = err.message || 'Failed to upload logo'
    uploadProgress.value = 0
  } finally {
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const handleRemoveLogo = async () => {
  if (!selectedCompany.value) return
  
  if (!confirm('Are you sure you want to remove the logo?')) return
  
  try {
    await removeLogo(selectedCompany.value.id)
    currentLogo.value = null
    await fetchCompanies()
  } catch (err: any) {
    console.error('Failed to remove logo:', err)
    error.value = err.message || 'Failed to remove logo'
  }
}

// Delete
const confirmDelete = (company: Company) => {
  selectedCompany.value = company
  deleteError.value = null
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!selectedCompany.value) return
  
  deleting.value = true
  deleteError.value = null
  
  try {
    await deleteCompany(selectedCompany.value.id)
    showDeleteModal.value = false
    selectedCompany.value = null
    await fetchCompanies()
  } catch (err: any) {
    deleteError.value = err.message || 'Failed to delete'
  } finally {
    deleting.value = false
  }
}

// Restore
const confirmRestore = (company: Company) => {
  selectedCompany.value = company
  restoreError.value = null
  showRestoreModal.value = true
}

const handleRestore = async () => {
  if (!selectedCompany.value) return
  
  restoring.value = true
  restoreError.value = null
  
  try {
    await restoreCompany(selectedCompany.value.id)
    showRestoreModal.value = false
    selectedCompany.value = null
    await fetchCompanies()
  } catch (err: any) {
    restoreError.value = err.message || 'Failed to restore'
  } finally {
    restoring.value = false
  }
}

const handleLogin = () => navigateTo('/login')

// Watchers
watch(() => isAuthenticated.value, (val) => { if (val) fetchCompanies() })
watch(showDeleted, () => { page.value = 1 })
watch(statusFilter, () => { page.value = 1 })

// Initial fetch
onMounted(() => { 
  if (isAuthenticated.value) {
    fetchCompanies()
    fetchCountries()
  }
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