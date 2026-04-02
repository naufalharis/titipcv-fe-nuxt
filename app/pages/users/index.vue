<template>
  <div class="animate-fade-in">
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Users Management</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">View and manage all registered users in your application.</p>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex gap-2">
        <!-- View Toggle -->
        <button 
          @click="toggleView"
          class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
          :title="viewMode === 'active' ? 'View Deleted Users' : 'View Active Users'"
        >
          <svg v-if="viewMode === 'active'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path d="M2 10c0 4.418 3.582 8 8 8s8-3.582 8-8-3.582-8-8-8-8 3.582-8 8zm8-6a6 6 0 110 12 6 6 0 010-12z" />
            <path d="M10 6v4l2 2" />
          </svg>
          <span class="text-sm">{{ viewMode === 'active' ? 'Users' : 'Deleted Users' }}</span>
        </button>

        <!-- Add User Button -->
        <button 
          @click="openCreateModal"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Add User
        </button>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="mb-6">
      <div class="relative">
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Search users by name, email, or username..."
          class="w-full px-4 py-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
          @input="handleSearch"
        />
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-2.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
        <button 
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
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
        @click="fetchUsers" 
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
      v-model:page="page"
      v-model:perPage="perPage"
      :title="viewMode === 'active' ? 'Users' : 'Deleted Users'" 
      :columns="columns" 
      :rows="displayedUsers"
    >
      <!-- Customizing the User cell to show avatar and name/email -->
      <template #cell-user="{ row }">
        <div class="flex items-center">
          <div class="h-10 w-10 flex-shrink-0">
            <img 
              class="h-10 w-10 rounded-full bg-slate-200 border-2 border-white dark:border-slate-800" 
              :src="(row as User).avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((row as User).name || (row as User).username)}&background=random`" 
              alt="" 
            />
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-slate-900 dark:text-white">{{ (row as User).name || (row as User).username }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">{{ (row as User).email }}</div>
          </div>
        </div>
      </template>

      <!-- Customizing the Status cell -->
      <template #cell-status="{ row }">
        <span 
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="{
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300':
              ((row as User).isActive === true) ||
              (['active','Active'].includes((row as User).status || '')),
            'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300':
              (['pending','Pending'].includes((row as User).status || '')),
            'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300':
              ((row as User).isActive === false) ||
              !(row as User).status ||
              (['inactive','Offline'].includes((row as User).status || '')),
            'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300': (row as User).deletedAt
          }"
        >
          <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="{
            'bg-emerald-500':
              ((row as User).isActive === true) ||
              (['active','Active'].includes((row as User).status || '')),
            'bg-amber-500':
              (['pending','Pending'].includes((row as User).status || '')),
            'bg-slate-500':
              ((row as User).isActive === false) ||
              !(row as User).status ||
              (['inactive','Offline'].includes((row as User).status || '')),
            'bg-red-500': (row as User).deletedAt
          }"></span>
          {{ (row as User).deletedAt ? 'Deleted' : formatStatus((row as User).isActive ?? (row as User).status) }}
        </span>
      </template>

      <!-- Customizing the Role cell -->
      <template #cell-role="{ row }">
        <span class="text-sm text-slate-600 dark:text-slate-400">{{ (row as User).role || 'User' }}</span>
      </template>

      <!-- Deleted At cell (for deleted users view) -->
      <template #cell-deletedAt="{ row }">
        <span v-if="(row as User).deletedAt" class="text-sm text-slate-600 dark:text-slate-400">
          {{ formatDate((row as User).deletedAt) }}
        </span>
      </template>

      <!-- Actions -->
      <template #cell-actions="{ row }">
        <div class="flex items-center gap-2">
          <!-- Edit button (only for active users) -->
          <button 
            v-if="viewMode === 'active' && !(row as User).deletedAt"
            @click="openEditModal(row as User)"
            class="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
            title="Edit User"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>

          <!-- Restore button (for deleted users) -->
          <button 
            v-if="viewMode === 'deleted' || (row as User).deletedAt"
            @click="confirmRestore(row as User)"
            class="text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
            title="Restore User"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Delete/Soft Delete button -->
          <button 
            @click="viewMode === 'active' ? confirmDelete(row as User) : confirmPermanentDelete(row as User)"
            class="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
            :title="viewMode === 'active' ? 'Delete User' : 'Permanently Delete User'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- User Form Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" @click.self="closeModal">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modal-slide-up">
            <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                {{ isEdit ? 'Edit User' : 'Create New User' }}
              </h3>
              <button @click="closeModal" class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <form @submit.prevent="handleSubmit" class="p-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="form.email" 
                    type="email"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Username <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="form.username" 
                    type="text"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Name
                  </label>
                  <input 
                    v-model="form.name" 
                    type="text"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Role
                  </label>
                  <select 
                    v-model="form.role"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                <div v-if="!isEdit">
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Password <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="form.password" 
                    type="password"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    :required="!isEdit"
                  />
                </div>

                <div v-if="isEdit">
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    New Password (optional)
                  </label>
                  <input 
                    v-model="form.password" 
                    type="password"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    placeholder="Leave empty to keep current"
                  />
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
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

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" @click.self="showDeleteModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md animate-modal-slide-up">
            <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                {{ deleteModalTitle }}
              </h3>
              <button @click="showDeleteModal = false" class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div class="p-6">
              <p class="text-slate-600 dark:text-slate-400">
                {{ deleteModalMessage }}
              </p>
            </div>

            <div class="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
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

    <!-- Restore Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showRestoreModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" @click.self="showRestoreModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md animate-modal-slide-up">
            <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Restore User</h3>
              <button @click="showRestoreModal = false" class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div class="p-6">
              <p class="text-slate-600 dark:text-slate-400">
                Are you sure you want to restore user "{{ selectedUser?.name || selectedUser?.username }}"?
                This will reactivate the user account.
              </p>
            </div>

            <div class="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <button 
                @click="showRestoreModal = false"
                class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                @click="handleRestore"
                class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
import { useUsers } from '~/composables/useUsers'

// Types
import type { User } from '~/types/user'

interface FormData {
  id: string
  email: string
  username: string
  name: string
  role: string
  password: string
}

const { isAuthenticated } = useAuth()
const { 
  getUsers, 
  getDeletedUsers,
  searchUsers,
  createUser, 
  updateUser, 
  deleteUser,
  restoreUser,
  permanentDeleteUser
} = useUsers()

// State
const loading = ref<boolean>(false)
const error = ref<string | null>(null)
const users = ref<User[]>([])
const deletedUsers = ref<User[]>([])
const submitting = ref<boolean>(false)
const deleting = ref<boolean>(false)
const restoring = ref<boolean>(false)
const showModal = ref<boolean>(false)
const showDeleteModal = ref<boolean>(false)
const showRestoreModal = ref<boolean>(false)
const selectedUser = ref<User | null>(null)
const isEdit = ref<boolean>(false)
const viewMode = ref<'active' | 'deleted'>('active')
const searchQuery = ref<string>('')
const searchTimeout = ref<NodeJS.Timeout | null>(null)
const isPermanentDelete = ref<boolean>(false)

// Form state
const form = ref<FormData>({
  id: '',
  email: '',
  username: '',
  name: '',
  role: 'User',
  password: ''
})

const page = ref(1)
const perPage = ref(10)

// Table columns based on view mode
const columns = computed(() => {
  const baseColumns = [
    { key: 'user', label: 'User' },
    { key: 'role', label: 'Role' },
  ]

  if (viewMode.value === 'deleted') {
    return [
      ...baseColumns,
      { key: 'deletedAt', label: 'Deleted At' }
    ]
  }

  return [
    ...baseColumns,
    { key: 'status', label: 'Status' }
  ]
})

// Displayed users based on view mode and search
const displayedUsers = computed(() => {
  if (viewMode.value === 'deleted') {
    return deletedUsers.value
  }
  return users.value
})

// Modal titles and messages
const deleteModalTitle = computed(() => {
  return isPermanentDelete.value ? 'Permanently Delete User' : 'Delete User'
})

const deleteModalMessage = computed(() => {
  const userName = selectedUser.value?.name || selectedUser.value?.username
  if (isPermanentDelete.value) {
    return `Are you sure you want to permanently delete user "${userName}"? This action cannot be undone and all data will be lost.`
  }
  return `Are you sure you want to delete user "${userName}"? This action can be undone by restoring the user.`
})

// Helper function to format status
const formatStatus = (value: string | boolean | undefined): string => {
  if (value === true) return 'Active'
  if (value === false || value == null) return 'Inactive'

  const status = String(value)
  const statusMap: Record<string, string> = {
    'active': 'Active',
    'Active': 'Active',
    'pending': 'Pending',
    'Pending': 'Pending',
    'inactive': 'Inactive',
    'Offline': 'Offline'
  }
  return statusMap[status] || status
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Fetch users from API
const fetchUsers = async (): Promise<void> => {
  if (!isAuthenticated.value) return
  
  loading.value = true
  error.value = null
  
  try {
    const response = await getUsers()
    users.value = Array.isArray(response) ? response : (response.data || [])
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch users'
    console.error('Failed to fetch users:', err)
    
    if (err?.response?.status === 401) {
      error.value = 'Session expired. Please login again.'
    }
  } finally {
    loading.value = false
  }
}

// Fetch deleted users
const fetchDeletedUsers = async (): Promise<void> => {
  if (!isAuthenticated.value) return
  
  loading.value = true
  error.value = null
  
  try {
    const response = await getDeletedUsers()
    deletedUsers.value = Array.isArray(response) ? response : (response.data || [])
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch deleted users'
    console.error('Failed to fetch deleted users:', err)
  } finally {
    loading.value = false
  }
}

// Handle search with debounce
const handleSearch = (): void => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = setTimeout(async () => {
    if (searchQuery.value.trim()) {
      await performSearch()
    } else {
      // Reset to normal view
      if (viewMode.value === 'active') {
        await fetchUsers()
      } else {
        await fetchDeletedUsers()
      }
    }
  }, 500)
}

// Perform search
const performSearch = async (): Promise<void> => {
  if (!searchQuery.value.trim()) return

  loading.value = true
  error.value = null

  try {
    const response = await searchUsers(searchQuery.value)
    const searchResults = Array.isArray(response) ? response : (response.data || [])
    
    users.value = searchResults
    deletedUsers.value = searchResults.filter(user => user.deletedAt)
  } catch (err: any) {
    error.value = err.message || 'Failed to search users'
    console.error('Failed to search users:', err)
  } finally {
    loading.value = false
  }
}

// Clear search
const clearSearch = (): void => {
  searchQuery.value = ''
  fetchUsers()
  fetchDeletedUsers()
}

// Toggle view between active and deleted users
const toggleView = async (): Promise<void> => {
  viewMode.value = viewMode.value === 'active' ? 'deleted' : 'active'
  searchQuery.value = ''
  
  if (viewMode.value === 'deleted') {
    await fetchDeletedUsers()
  } else {
    await fetchUsers()
  }
}

// Modal handlers
const openCreateModal = (): void => {
  isEdit.value = false
  form.value = {
    id: '',
    email: '',
    username: '',
    name: '',
    role: 'User',
    password: ''
  }
  showModal.value = true
}

const openEditModal = (user: User): void => {
  isEdit.value = true
  selectedUser.value = user
  form.value = {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name || '',
    role: user.role || 'User',
    password: ''
  }
  showModal.value = true
}

const closeModal = (): void => {
  showModal.value = false
  selectedUser.value = null
}

// Form submission
const handleSubmit = async (): Promise<void> => {
  if (!form.value.email || !form.value.username) {
    error.value = 'Please fill in all required fields'
    return
  }

  submitting.value = true
  error.value = null
  
  try {
    if (isEdit.value && selectedUser.value) {
      await updateUser(form.value.id, {
        email: form.value.email,
        username: form.value.username,
        name: form.value.name,
        role: form.value.role,
        ...(form.value.password && { password: form.value.password })
      })
    } else {
      await createUser({
        email: form.value.email,
        username: form.value.username,
        name: form.value.name,
        role: form.value.role,
        password: form.value.password
      })
    }
    
    closeModal()
    await fetchUsers()
  } catch (err: any) {
    error.value = err.message || `Failed to ${isEdit.value ? 'update' : 'create'} user`
    console.error('Failed to save user:', err)
  } finally {
    submitting.value = false
  }
}

// Delete handlers
const confirmDelete = (user: User): void => {
  selectedUser.value = user
  isPermanentDelete.value = false
  showDeleteModal.value = true
}

const confirmPermanentDelete = (user: User): void => {
  selectedUser.value = user
  isPermanentDelete.value = true
  showDeleteModal.value = true
}

const handleDelete = async (): Promise<void> => {
  if (!selectedUser.value) return
  
  deleting.value = true
  error.value = null
  
  try {
    if (isPermanentDelete.value) {
      await permanentDeleteUser(selectedUser.value.id)
    } else {
      await deleteUser(selectedUser.value.id)
    }
    
    showDeleteModal.value = false
    selectedUser.value = null
    
    if (viewMode.value === 'active') {
      await fetchUsers()
      if (!isPermanentDelete.value) {
        fetchDeletedUsers()
      }
    } else {
      await fetchDeletedUsers()
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to delete user'
    console.error('Failed to delete user:', err)
  } finally {
    deleting.value = false
  }
}

// Restore handlers
const confirmRestore = (user: User): void => {
  selectedUser.value = user
  showRestoreModal.value = true
}

const handleRestore = async (): Promise<void> => {
  if (!selectedUser.value) return
  
  restoring.value = true
  error.value = null
  
  try {
    await restoreUser(selectedUser.value.id)
    showRestoreModal.value = false
    selectedUser.value = null
    
    await fetchDeletedUsers()
    await fetchUsers()
  } catch (err: any) {
    error.value = err.message || 'Failed to restore user'
    console.error('Failed to restore user:', err)
  } finally {
    restoring.value = false
  }
}

// Login handler
const handleLogin = async (): Promise<void> => {
  await navigateTo('/login')
}

// Initial fetch
onMounted(() => {
  if (isAuthenticated.value) {
    fetchUsers()
  }
})

// Watch for authentication changes
watch(() => isAuthenticated.value, (newValue) => {
  if (newValue) {
    fetchUsers()
  }
})

// Watch for view mode changes
watch(viewMode, () => {
  searchQuery.value = ''
})
</script>

<!-- Hapus tag <style scoped> karena sudah menggunakan Tailwind -->