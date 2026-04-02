<template>
  <div>
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Debug Panel -->
      <div v-if="showDebug" class="mb-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono">
        <div class="font-bold mb-1">🔍 DEBUG INFO:</div>
        <div>Profile Loaded: {{ debugInfo.profileLoaded ? 'Yes' : 'No' }}</div>
        <div>User ID: {{ debugInfo.userId || '-' }}</div>
        <div>Work Experiences: {{ debugInfo.workExperiencesCount }}</div>
        <div>Organizational Experiences: {{ debugInfo.organizationalExperiencesCount }}</div>
        <div>Certificates: {{ debugInfo.certificatesCount }}</div>
        <div>Last Error: {{ debugInfo.lastError || 'None' }}</div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <!-- Profile Content -->
      <div v-else-if="profile" class="space-y-6">
        <!-- Profile Header Card -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div class="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
            <div class="flex flex-col md:flex-row items-center gap-6">
              <!-- Profile Photo -->
              <div class="relative group">
                <div class="w-28 h-28 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden border-4 border-white/20">
                  <img 
                    v-if="profile.photo?.url" 
                    :src="profile.photo.url" 
                    :alt="getFullName()"
                    class="w-full h-full object-cover"
                  />
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-14 w-14 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <button 
                  @click="triggerPhotoUpload"
                  class="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Change photo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input 
                  ref="photoInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handlePhotoUpload"
                />
              </div>
              
              <div class="flex-1 text-center md:text-left">
                <h1 class="text-2xl md:text-3xl font-bold text-white">{{ getFullName() }}</h1>
                <p class="text-white/80 mt-1">{{ profile.summary || 'No summary added yet' }}</p>
                <div class="flex flex-wrap gap-3 mt-3 justify-center md:justify-start">
                  <span v-if="profile.isReadyToWork" class="px-2 py-1 bg-emerald-500/20 text-emerald-100 rounded-full text-xs font-medium">
                    Available for work
                  </span>
                  <span v-else class="px-2 py-1 bg-amber-500/20 text-amber-100 rounded-full text-xs font-medium">
                    Not available
                  </span>
                  <span v-if="profile.experience" class="px-2 py-1 bg-white/10 text-white rounded-full text-xs font-medium">
                    {{ profile.experience }} years experience
                  </span>
                </div>
              </div>
              
              <button 
                @click="editMode = !editMode"
                class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
              >
                {{ editMode ? 'Cancel' : 'Edit Profile' }}
              </button>
            </div>
          </div>
          
          <!-- Contact Info -->
          <div class="p-6 border-b border-slate-200 dark:border-slate-800">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Email</p>
                  <p class="text-sm text-slate-900 dark:text-white">{{ profile.user?.email || 'Not provided' }}</p>
                </div>
              </div>
              
              <div class="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Location</p>
                  <p class="text-sm text-slate-900 dark:text-white">{{ getLocation() }}</p>
                </div>
              </div>
              
              <div class="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Member since</p>
                  <p class="text-sm text-slate-900 dark:text-white">{{ formatDate(profile.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Profile Form -->
        <div v-if="editMode" class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Edit Profile</h2>
          <form @submit.prevent="saveProfile" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                <input v-model="editForm.firstName" type="text" class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                <input v-model="editForm.lastName" type="text" class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Professional Summary</label>
                <textarea v-model="editForm.summary" rows="3" class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg" placeholder="Tell us about yourself..."></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
                <input v-model="editForm.city" type="text" class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Province</label>
                <input v-model="editForm.province" type="text" class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Years of Experience</label>
                <input v-model.number="editForm.experience" type="number" min="0" class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                <select v-model="editForm.gender" class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg">
                  <option value="">Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Birth Date</label>
                <input v-model="editForm.birthDate" type="date" class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Birth Place</label>
                <input v-model="editForm.birthPlace" type="text" class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg" />
              </div>
              <div class="flex items-center gap-2">
                <input v-model="editForm.isReadyToWork" type="checkbox" id="readyToWork" class="rounded" />
                <label for="readyToWork" class="text-sm">I am ready to work</label>
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="editMode = false" class="px-4 py-2 border rounded-lg">Cancel</button>
              <button type="submit" :disabled="saving" class="px-4 py-2 bg-primary-600 text-white rounded-lg">Save Changes</button>
            </div>
          </form>
        </div>

        <!-- CV Section -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Resume / CV</h2>
            <button @click="triggerCVUpload" class="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
              Upload CV
            </button>
            <input ref="cvInput" type="file" accept=".pdf,.doc,.docx" class="hidden" @change="handleCVUpload" />
          </div>
          
          <div v-if="profile.cv" class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p class="text-sm font-medium text-slate-900 dark:text-white">Current CV</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Uploaded {{ formatRelativeTime(profile.updatedAt) }}</p>
              </div>
            </div>
            <a :href="profile.cv" target="_blank" class="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Download</a>
          </div>
          <div v-else class="text-center py-8 text-slate-500 dark:text-slate-400">
            <p>No CV uploaded yet. Click "Upload CV" to add your resume.</p>
          </div>
        </div>

        <!-- Work Experience Section -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Work Experience</h2>
            <button @click="showExperienceModal = true" class="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
              Add Experience
            </button>
          </div>
          
          <div v-if="workExperiences.length > 0" class="space-y-4">
            <div v-for="exp in workExperiences" :key="exp.id" class="p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="font-semibold text-slate-900 dark:text-white">{{ exp.position || 'Position not specified' }}</h3>
                  <p class="text-sm text-slate-600 dark:text-slate-400">{{ exp.companyName || 'Company not specified' }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    {{ formatWorkPeriod(exp.monthStart, exp.yearStart, exp.monthFinish, exp.yearFinish, exp.isCurrent) }}
                  </p>
                  <p v-if="exp.location" class="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {{ exp.location }}
                  </p>
                  <div v-if="exp.workPlace || exp.workType" class="flex flex-wrap gap-2 mt-2">
                    <span v-if="exp.workPlace" class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                      {{ exp.workPlace.name }}
                    </span>
                    <span v-if="exp.workType" class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
                      {{ exp.workType.name }}
                    </span>
                  </div>
                  <p v-if="exp.description" class="text-sm text-slate-600 dark:text-slate-400 mt-2">{{ exp.description }}</p>
                </div>
                <button @click="deleteWorkExperienceItem(exp.id)" class="p-1 text-slate-400 hover:text-red-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-slate-500 dark:text-slate-400">
            <p>No work experience added yet.</p>
          </div>
        </div>

        <!-- Organizational Experience Section -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Organizational Experience</h2>
            <button @click="showOrganizationalModal = true" class="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
              Add Experience
            </button>
          </div>
          
          <div v-if="organizationalExperiences.length > 0" class="space-y-4">
            <div v-for="exp in organizationalExperiences" :key="exp.id" class="p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="font-semibold text-slate-900 dark:text-white">{{ exp.organizationName }}</h3>
                    <span 
                      class="px-2 py-0.5 text-xs rounded-full"
                      :class="{
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': exp.type === 'ORGANIZATION',
                        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400': exp.type === 'COMMITTEE',
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': exp.type === 'VOLUNTEER'
                      }"
                    >
                      {{ getTypeLabel(exp.type) }}
                    </span>
                  </div>
                  <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">{{ exp.role }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    {{ formatOrganizationalPeriod(exp.monthStart, exp.yearStart, exp.monthFinish, exp.yearFinish, exp.isCurrent) }}
                  </p>
                  <p v-if="exp.description" class="text-sm text-slate-600 dark:text-slate-400 mt-2">{{ exp.description }}</p>
                </div>
                <button @click="deleteOrganizationalItem(exp.id)" class="p-1 text-slate-400 hover:text-red-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-slate-500 dark:text-slate-400">
            <p>No organizational experience added yet.</p>
          </div>
        </div>

        <!-- Skills Section -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Skills</h2>
            <button @click="showSkillModal = true" class="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
              Add Skill
            </button>
          </div>
          
          <div v-if="skills.length > 0" class="flex flex-wrap gap-2">
            <span v-for="skill in skills" :key="skill.id" class="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm flex items-center gap-2">
              {{ skill.skill?.name || 'Skill' }}
              <span v-if="skill.proficiencyLevel !== undefined" class="ml-1 text-xs text-slate-500 dark:text-slate-400">
                ({{ skill.proficiencyLevel === 1 ? 'Beginner' : skill.proficiencyLevel === 2 ? 'Intermediate' : skill.proficiencyLevel === 3 ? 'Advanced' : skill.proficiencyLevel }})
              </span>
              <button @click="deleteSkillItem(skill.id)" class="hover:text-red-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
          <div v-else class="text-center py-8 text-slate-500 dark:text-slate-400">
            <p>No skills added yet. Add your skills to help employers find you.</p>
          </div>
        </div>

        <!-- Certificates Section -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Certificates</h2>
            <button @click="showCertificateModal = true" class="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
              Add Certificate
            </button>
          </div>
          
          <div v-if="certificates.length > 0" class="space-y-4">
            <div v-for="cert in certificates" :key="cert.id" class="p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="font-semibold text-slate-900 dark:text-white">{{ cert.name }}</h3>
                  <p class="text-sm text-slate-600 dark:text-slate-400">{{ cert.organization || 'Organization not specified' }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    {{ formatCertificatePeriod(cert.issueMonthStart, cert.issueYearStart, cert.issueMonthFinish, cert.issueYearFinish) }}
                  </p>
                  <div v-if="cert.credentialId || cert.credentialUrl" class="mt-2 space-y-1">
                    <p v-if="cert.credentialId" class="text-xs text-slate-500 dark:text-slate-400">
                      Credential ID: {{ cert.credentialId }}
                    </p>
                    <a v-if="cert.credentialUrl" :href="cert.credentialUrl" target="_blank" class="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                      View Certificate →
                    </a>
                  </div>
                </div>
                <button @click="deleteCertificateItem(cert.id)" class="p-1 text-slate-400 hover:text-red-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-slate-500 dark:text-slate-400">
            <p>No certificates added yet. Add your certificates to showcase your qualifications.</p>
          </div>
        </div>

        <!-- Languages Section -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Languages</h2>
            <button @click="showLanguageModal = true" class="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
              Add Language
            </button>
          </div>
          
          <div v-if="languages.length > 0" class="overflow-x-auto">
            <!-- Header Row -->
            <div class="grid grid-cols-3 gap-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2 min-w-full">
              <div>Language</div>
              <div>Proficiency Level</div>
              <div class="text-right">Action</div>
            </div>
            <!-- Data Rows -->
            <div v-for="lang in languages" :key="lang.id" class="grid grid-cols-3 gap-4 items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg mb-2">
              <div class="truncate text-slate-900 dark:text-white font-medium">{{ lang.language?.name || 'Language' }}</div>
              <div class="text-sm text-slate-600 dark:text-slate-400">
                {{ getProficiencyLevel(lang.proficiencyLevel) }}
              </div>
              <div class="flex justify-end">
                <button @click="deleteLanguageItem(lang.id)" class="p-1 text-slate-400 hover:text-red-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-slate-500 dark:text-slate-400">
            <p>No languages added yet.</p>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600 dark:text-red-400">{{ error }}</p>
      </div>
    </div>

    <!-- Work Experience Modal -->
    <div v-if="showExperienceModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Add Work Experience</h2>
        </div>
        <form @submit.prevent="addWorkExperience" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Position / Job Title *</label>
            <input v-model="newExperience.position" type="text" required class="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Senior Frontend Developer" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name *</label>
            <input v-model="newExperience.companyName" type="text" required class="w-full px-3 py-2 border rounded-lg" placeholder="e.g., PT Tech Company" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
            <input v-model="newExperience.location" type="text" class="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Jakarta, Indonesia" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Work Place</label>
            <select v-model="newExperience.workPlaceId" class="w-full px-3 py-2 border rounded-lg">
              <option value="">Select work place</option>
              <option v-for="workPlace in workPlaces" :key="workPlace.id" :value="workPlace.id">
                {{ workPlace.translations?.find(t => t.locale?.code === 'en')?.name || workPlace.translations?.find(t => t.locale?.code === 'id')?.name || workPlace.slug }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Work Type</label>
            <select v-model="newExperience.workTypeId" class="w-full px-3 py-2 border rounded-lg">
              <option value="">Select work type</option>
              <option v-for="workType in workTypes" :key="workType.id" :value="workType.id">
                {{ workType.translations?.find(t => t.locale?.code === 'en')?.name || workType.translations?.find(t => t.locale?.code === 'id')?.name || workType.slug }}
              </option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Month</label>
              <select v-model="newExperience.monthStart" class="w-full px-3 py-2 border rounded-lg">
                <option :value="null">Select month</option>
                <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Year</label>
              <select v-model="newExperience.yearStart" class="w-full px-3 py-2 border rounded-lg">
                <option :value="null">Select year</option>
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Month</label>
              <select v-model="newExperience.monthFinish" :disabled="newExperience.isCurrent" class="w-full px-3 py-2 border rounded-lg">
                <option :value="null">Select month</option>
                <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Year</label>
              <select v-model="newExperience.yearFinish" :disabled="newExperience.isCurrent" class="w-full px-3 py-2 border rounded-lg">
                <option :value="null">Select year</option>
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <input v-model="newExperience.isCurrent" type="checkbox" id="currentJob" />
            <label for="currentJob" class="text-sm text-slate-700 dark:text-slate-300">I currently work here</label>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea v-model="newExperience.description" rows="3" class="w-full px-3 py-2 border rounded-lg" placeholder="Describe your responsibilities and achievements..."></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="showExperienceModal = false" class="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" :disabled="adding" class="px-4 py-2 bg-primary-600 text-white rounded-lg">Add Experience</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Organizational Experience Modal -->
    <div v-if="showOrganizationalModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Add Organizational Experience</h2>
        </div>
        <form @submit.prevent="addOrganizationalExperience" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Organization Name *</label>
            <input v-model="newOrganizational.organizationName" type="text" required class="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Google Developer Student Club" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role / Position *</label>
            <input v-model="newOrganizational.role" type="text" required class="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Lead Coordinator" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type *</label>
            <select v-model="newOrganizational.type" required class="w-full px-3 py-2 border rounded-lg">
              <option value="">Select type</option>
              <option value="ORGANIZATION">Organization</option>
              <option value="COMMITTEE">Committee</option>
              <option value="VOLUNTEER">Volunteer</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Month</label>
              <select v-model="newOrganizational.monthStart" class="w-full px-3 py-2 border rounded-lg">
                <option :value="null">Select month</option>
                <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Year</label>
              <select v-model="newOrganizational.yearStart" class="w-full px-3 py-2 border rounded-lg">
                <option :value="null">Select year</option>
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Month</label>
              <select v-model="newOrganizational.monthFinish" :disabled="newOrganizational.isCurrent" class="w-full px-3 py-2 border rounded-lg">
                <option :value="null">Select month</option>
                <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Year</label>
              <select v-model="newOrganizational.yearFinish" :disabled="newOrganizational.isCurrent" class="w-full px-3 py-2 border rounded-lg">
                <option :value="null">Select year</option>
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <input v-model="newOrganizational.isCurrent" type="checkbox" id="currentOrganizational" />
            <label for="currentOrganizational" class="text-sm text-slate-700 dark:text-slate-300">I currently hold this position</label>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea v-model="newOrganizational.description" rows="3" class="w-full px-3 py-2 border rounded-lg" placeholder="Describe your responsibilities and achievements..."></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="showOrganizationalModal = false" class="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" :disabled="addingOrganizational" class="px-4 py-2 bg-primary-600 text-white rounded-lg">Add Experience</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Skill Modal -->
    <div v-if="showSkillModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Add Skill</h2>
        </div>
        <form @submit.prevent="addSkill" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Skill *</label>
            <select v-model="newSkillId" required class="w-full px-3 py-2 border rounded-lg">
              <option value="">Select a skill</option>
              <option v-for="skill in allSkills" :key="skill.id" :value="skill.id">{{ skill.name }}</option>
            </select>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="showSkillModal = false" class="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg">Add</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Certificate Modal -->
    <div v-if="showCertificateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Add Certificate</h2>
        </div>
        <form @submit.prevent="addCertificate" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Certificate Name *</label>
            <input v-model="newCertificate.name" type="text" required class="w-full px-3 py-2 border rounded-lg" placeholder="e.g., AWS Certified Solutions Architect" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Issuing Organization</label>
            <input v-model="newCertificate.organization" type="text" class="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Amazon Web Services" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Issue Month</label>
              <select v-model="newCertificate.monthStart" class="w-full px-3 py-2 border rounded-lg">
                <option :value="null">Select month</option>
                <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Issue Year</label>
              <select v-model="newCertificate.yearStart" class="w-full px-3 py-2 border rounded-lg">
                <option :value="null">Select year</option>
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry Month</label>
              <select v-model="newCertificate.monthFinish" class="w-full px-3 py-2 border rounded-lg">
                <option :value="null">Select month</option>
                <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry Year</label>
              <select v-model="newCertificate.yearFinish" class="w-full px-3 py-2 border rounded-lg">
                <option :value="null">Select year</option>
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Credential ID</label>
            <input v-model="newCertificate.credentialId" type="text" class="w-full px-3 py-2 border rounded-lg" placeholder="e.g., ABC123456" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Credential URL</label>
            <input v-model="newCertificate.credentialUrl" type="url" class="w-full px-3 py-2 border rounded-lg" placeholder="https://..." />
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="showCertificateModal = false" class="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" :disabled="addingCertificate" class="px-4 py-2 bg-primary-600 text-white rounded-lg">Add Certificate</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Language Modal -->
    <div v-if="showLanguageModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Add Language</h2>
        </div>
        <form @submit.prevent="addLanguage" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Language *</label>
            <select v-model="newLanguage.languageId" required class="w-full px-3 py-2 border rounded-lg">
              <option value="">Select a language</option>
              <option v-for="lang in availableLanguages" :key="lang.id" :value="lang.id">{{ lang.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Proficiency Level *</label>
            <select v-model="newLanguage.proficiencyLevel" required class="w-full px-3 py-2 border rounded-lg">
              <option value="">Select level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="native">Native</option>
            </select>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="showLanguageModal = false" class="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg">Add</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useUserProfile, type UserProfile, type UserSkill, type UserLanguage } from '~/composables/useUserProfile'
import { useUserWorkExperience, type UserWorkExperience, type CreateWorkExperienceRequest } from '~/composables/useUserWorkExperience'
import { useUserOrganizational, type UserOrganizationalExperience, type CreateOrganizationalRequest } from '~/composables/useUserOrganizational'
import { useUserCertificate, type UserCertificate, type CreateCertificateRequest } from '~/composables/useUserCertificate'
import { useWorkPlaces, type WorkPlace } from '~/composables/useWorkPlaces'
import { useWorkTypes, type WorkType } from '~/composables/useWorkTypes'
import { useSkills, type Skill } from '~/composables/useSkills'
import { useLanguages } from '~/composables/useLanguages'
import type { Language } from '~/types/language'

const { user } = useAuth()

const { 
  getMyProfile, 
  updateUserProfile, 
  uploadProfilePhoto, 
  uploadCV, 
  getUserSkills, 
  getAllSkills, 
  addUserSkill, 
  deleteUserSkill, 
  getUserLanguages,
  addUserLanguage,
  deleteUserLanguage
} = useUserProfile()

const {
  getUserWorkExperiences,
  createWorkExperience,
  deleteWorkExperience
} = useUserWorkExperience()

const {
  getUserOrganizationalExperiences,
  createOrganizationalExperience,
  deleteOrganizationalExperience
} = useUserOrganizational()

const {
  getUserCertificates,
  createCertificate,
  deleteCertificate
} = useUserCertificate()

const {
  getWorkPlaces
} = useWorkPlaces()

const {
  getWorkTypes
} = useWorkTypes()

const {
  getSkills
} = useSkills()

// State
const profile = ref<UserProfile | null>(null)
const workExperiences = ref<UserWorkExperience[]>([])
const organizationalExperiences = ref<UserOrganizationalExperience[]>([])
const certificates = ref<UserCertificate[]>([])
const skills = ref<UserSkill[]>([])
const languages = ref<UserLanguage[]>([])
const allSkills = ref<Skill[]>([])
const availableLanguages = ref<Language[]>([])
const workPlaces = ref<WorkPlace[]>([])
const workTypes = ref<WorkType[]>([])
const loading = ref(true)
const saving = ref(false)
const adding = ref(false)
const addingOrganizational = ref(false)
const addingCertificate = ref(false)
const error = ref('')
const editMode = ref(false)

// Debug state
const showDebug = ref(false)
const debugInfo = ref({
  profileLoaded: false,
  userId: '',
  workExperiencesCount: 0,
  organizationalExperiencesCount: 0,
  certificatesCount: 0,
  lastError: '',
  workExperiencesData: [] as any[],
  organizationalExperiencesData: [] as any[],
  certificatesData: [] as any[]
})

// Years for select
const currentYear = new Date().getFullYear()
const years = computed(() => {
  const yrs = []
  for (let i = currentYear + 10; i >= currentYear - 50; i--) {
    yrs.push(i)
  }
  return yrs
})

// Form
const editForm = reactive({
  firstName: '',
  lastName: '',
  summary: '',
  city: '',
  province: '',
  experience: undefined as number | undefined,
  gender: '',
  birthDate: '',
  birthPlace: '',
  isReadyToWork: false
})

// Modals
const showExperienceModal = ref(false)
const showOrganizationalModal = ref(false)
const showCertificateModal = ref(false)
const showSkillModal = ref(false)
const showLanguageModal = ref(false)

// New work experience data
const newExperience = reactive({
  companyName: '',
  position: '',
  location: '',
  workPlaceId: '',
  workTypeId: '',
  monthStart: null as number | null,
  yearStart: null as number | null,
  monthFinish: null as number | null,
  yearFinish: null as number | null,
  isCurrent: false,
  description: ''
})

// New organizational experience data
const newOrganizational = reactive({
  organizationName: '',
  role: '',
  type: '' as 'ORGANIZATION' | 'COMMITTEE' | 'VOLUNTEER' | '',
  monthStart: null as number | null,
  yearStart: null as number | null,
  monthFinish: null as number | null,
  yearFinish: null as number | null,
  isCurrent: false,
  description: ''
})

// New certificate data
const newCertificate = reactive({
  name: '',
  organization: '',
  monthStart: null as number | null,
  yearStart: null as number | null,
  monthFinish: null as number | null,
  yearFinish: null as number | null,
  credentialId: '',
  credentialUrl: ''
})

const newSkillId = ref('')
const newLanguage = reactive({
  languageId: '',
  proficiencyLevel: ''
})


// File inputs
const photoInput = ref<HTMLInputElement>()
const cvInput = ref<HTMLInputElement>()

// Helper functions
const getMonthName = (month: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months[month - 1]
}

const getTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    'ORGANIZATION': 'Organization',
    'COMMITTEE': 'Committee',
    'VOLUNTEER': 'Volunteer'
  }
  return types[type] || type
}

const formatWorkPeriod = (monthStart?: number | null, yearStart?: number | null, monthFinish?: number | null, yearFinish?: number | null, isCurrent?: boolean) => {
  const start = monthStart && yearStart ? `${getMonthName(monthStart)} ${yearStart}` : (yearStart ? `${yearStart}` : 'Start date not set')
  const end = isCurrent ? 'Present' : (monthFinish && yearFinish ? `${getMonthName(monthFinish)} ${yearFinish}` : (yearFinish ? `${yearFinish}` : 'End date not set'))
  if (start && end) return `${start} - ${end}`
  if (start) return start
  return 'Date not specified'
}

const formatOrganizationalPeriod = (monthStart?: number | null, yearStart?: number | null, monthFinish?: number | null, yearFinish?: number | null, isCurrent?: boolean) => {
  const start = monthStart && yearStart ? `${getMonthName(monthStart)} ${yearStart}` : (yearStart ? `${yearStart}` : 'Start date not set')
  const end = isCurrent ? 'Present' : (monthFinish && yearFinish ? `${getMonthName(monthFinish)} ${yearFinish}` : (yearFinish ? `${yearFinish}` : 'End date not set'))
  if (start && end) return `${start} - ${end}`
  if (start) return start
  return 'Date not specified'
}

const formatCertificatePeriod = (monthStart?: number | null, yearStart?: number | null, monthFinish?: number | null, yearFinish?: number | null) => {
  const start = monthStart && yearStart ? `${getMonthName(monthStart)} ${yearStart}` : (yearStart ? `${yearStart}` : 'Issue date not set')
  const end = monthFinish && yearFinish ? `${getMonthName(monthFinish)} ${yearFinish}` : (yearFinish ? `${yearFinish}` : 'Expiry date not set')
  if (start && end) return `${start} - ${end}`
  if (start) return start
  return 'Date not specified'
}

const getFullName = () => {
  if (!profile.value) return 'Job Seeker'
  return `${profile.value.firstName || ''} ${profile.value.lastName || ''}`.trim() || 'Job Seeker'
}

const getLocation = () => {
  if (!profile.value) return 'Not specified'
  const parts = [profile.value.city, profile.value.province].filter(p => p)
  return parts.length > 0 ? parts.join(', ') : 'Not specified'
}

const getProficiencyLevel = (level: string) => {
  const levels: Record<string, string> = {
    'beginner': 'Beginner',
    'intermediate': 'Intermediate',
    'advanced': 'Advanced',
    'native': 'Native'
  }
  return levels[level] || level
}

const formatDate = (timestamp: number) => {
  if (!timestamp) return 'N/A'
  return new Date(timestamp * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}

const formatRelativeTime = (timestamp: number) => {
  if (!timestamp) return 'N/A'
  const now = Date.now() / 1000
  const diff = now - timestamp
  if (diff < 86400) return 'today'
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
  return formatDate(timestamp)
}

// Load data
const loadProfile = async () => {
  debugInfo.value.profileLoaded = false
  try {
    console.log('🔄 Loading profile...')
    const data = await getMyProfile()
    console.log('✅ Profile loaded:', data)
    
    profile.value = data
    debugInfo.value.profileLoaded = true
    debugInfo.value.userId = user.value?.id || ''
    
    editForm.firstName = data.firstName || ''
    editForm.lastName = data.lastName || ''
    editForm.summary = data.summary || ''
    editForm.city = data.city || ''
    editForm.province = data.province || ''
    editForm.experience = data.experience
    editForm.gender = data.gender || ''
    editForm.birthDate = data.birthDate || ''
    editForm.birthPlace = data.birthPlace || ''
    editForm.isReadyToWork = data.isReadyToWork || false
  } catch (err: any) {
    console.error('❌ Error loading profile:', err)
    error.value = 'Failed to load profile'
    debugInfo.value.lastError = err?.message || 'Unknown error'
  }
}

const loadWorkExperiences = async () => {
  const userId = user.value?.id
  
  if (!userId) {
    workExperiences.value = []
    debugInfo.value.workExperiencesCount = 0
    return
  }
  
  try {
    const experiences = await getUserWorkExperiences(userId)
    workExperiences.value = experiences || []
    debugInfo.value.workExperiencesCount = workExperiences.value.length
    debugInfo.value.workExperiencesData = workExperiences.value
  } catch (err: any) {
    console.error('Error loading work experiences:', err)
    workExperiences.value = []
    debugInfo.value.workExperiencesCount = 0
  }
}

const loadOrganizationalExperiences = async () => {
  const userId = user.value?.id
  
  if (!userId) {
    organizationalExperiences.value = []
    debugInfo.value.organizationalExperiencesCount = 0
    return
  }
  
  try {
    const experiences = await getUserOrganizationalExperiences(userId)
    organizationalExperiences.value = experiences || []
    debugInfo.value.organizationalExperiencesCount = organizationalExperiences.value.length
    debugInfo.value.organizationalExperiencesData = organizationalExperiences.value
  } catch (err: any) {
    console.error('Error loading organizational experiences:', err)
    organizationalExperiences.value = []
    debugInfo.value.organizationalExperiencesCount = 0
  }
}

const loadCertificates = async () => {
  const userId = user.value?.id
  
  if (!userId) {
    certificates.value = []
    debugInfo.value.certificatesCount = 0
    return
  }
  
  try {
    const certs = await getUserCertificates(userId)
    certificates.value = certs || []
    debugInfo.value.certificatesCount = certificates.value.length
    debugInfo.value.certificatesData = certificates.value
  } catch (err: any) {
    console.error('Error loading certificates:', err)
    certificates.value = []
    debugInfo.value.certificatesCount = 0
  }
}

const loadWorkPlaces = async () => {
  try {
    workPlaces.value = await getWorkPlaces()
  } catch (err: any) {
    console.error('Error loading work places:', err)
    workPlaces.value = []
  }
}

const loadWorkTypes = async () => {
  try {
    workTypes.value = await getWorkTypes()
  } catch (err: any) {
    console.error('Error loading work types:', err)
    workTypes.value = []
  }
}

const loadSkills = async () => {
  const userId = user.value?.id
  if (!userId) {
    skills.value = []
    return
  }
  try {
    skills.value = await getUserSkills(userId)
  } catch (err) {
    console.error('Error loading skills:', err)
    skills.value = []
  }
}

const { getLanguages } = useLanguages()

const loadAllSkills = async () => {
  try {
    // Skill master data from useSkills, then user-languages from user profile
    allSkills.value = await getSkills()
    const languagesResponse = await getLanguages()
    if (Array.isArray(languagesResponse)) {
      availableLanguages.value = languagesResponse
    } else if (languagesResponse && 'data' in languagesResponse && Array.isArray(languagesResponse.data)) {
      availableLanguages.value = languagesResponse.data
    } else {
      availableLanguages.value = []
    }
  } catch (err) {
    console.error('Error loading skills and languages:', err)
    allSkills.value = []
    availableLanguages.value = []
  }
}

const loadLanguages = async () => {
  const userId = user.value?.id
  if (!userId) {
    languages.value = []
    return
  }
  try {
    languages.value = await getUserLanguages(userId)
  } catch (err) {
    console.error('Error loading languages:', err)
    languages.value = []
  }
}

// Save profile
const saveProfile = async () => {
  saving.value = true
  try {
    const updateData: Partial<UserProfile> = {
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      summary: editForm.summary,
      city: editForm.city,
      province: editForm.province,
      gender: editForm.gender,
      birthDate: editForm.birthDate,
      birthPlace: editForm.birthPlace,
      isReadyToWork: editForm.isReadyToWork
    }
    
    if (editForm.experience !== undefined) {
      updateData.experience = editForm.experience
    }
    
    await updateUserProfile(updateData)
    await loadProfile()
    editMode.value = false
  } catch (err) {
    console.error('Error saving profile:', err)
  } finally {
    saving.value = false
  }
}

// Photo upload
const triggerPhotoUpload = () => {
  photoInput.value?.click()
}

const handlePhotoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  try {
    await uploadProfilePhoto(file)
    await loadProfile()
  } catch (err) {
    console.error('Error uploading photo:', err)
  }
}

// CV upload
const triggerCVUpload = () => {
  cvInput.value?.click()
}

const handleCVUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  try {
    await uploadCV(file)
    await loadProfile()
  } catch (err) {
    console.error('Error uploading CV:', err)
  }
}

// Work experience
const addWorkExperience = async () => {
  if (!newExperience.position || !newExperience.companyName || !newExperience.yearStart) {
    alert('Please fill in Position, Company Name, and Start Year')
    return
  }
  
  const userId = user.value?.id
  if (!userId) {
    alert('User ID not found. Please refresh the page.')
    return
  }
  
  adding.value = true
  try {
    const experienceData: CreateWorkExperienceRequest = {
      userId: userId,
      companyName: newExperience.companyName,
      position: newExperience.position,
      location: newExperience.location || null,
      workPlaceId: newExperience.workPlaceId || null,
      workTypeId: newExperience.workTypeId || null,
      monthStart: newExperience.monthStart,
      yearStart: newExperience.yearStart,
      monthFinish: newExperience.isCurrent ? null : newExperience.monthFinish,
      yearFinish: newExperience.isCurrent ? null : newExperience.yearFinish,
      isCurrent: newExperience.isCurrent,
      description: newExperience.description || null
    }
    
    await createWorkExperience(experienceData)
    await loadWorkExperiences()
    showExperienceModal.value = false
    
    Object.assign(newExperience, {
      companyName: '',
      position: '',
      location: '',
      workPlaceId: '',
      workTypeId: '',
      monthStart: null,
      yearStart: null,
      monthFinish: null,
      yearFinish: null,
      isCurrent: false,
      description: ''
    })
    
    alert('Work experience added successfully!')
  } catch (err: unknown) {
    const message = (err as any)?.message || 'Unknown error'
    console.error('Error adding work experience:', err)
    alert('Failed to add work experience: ' + message)
  } finally {
    adding.value = false
  }
}

const deleteWorkExperienceItem = async (id: string) => {
  if (!confirm('Are you sure you want to delete this work experience?')) return
  try {
    await deleteWorkExperience(id)
    await loadWorkExperiences()
  } catch (err) {
    console.error('Error deleting work experience:', err)
  }
}

// Organizational experience
const addOrganizationalExperience = async () => {
  if (!newOrganizational.organizationName || !newOrganizational.role || !newOrganizational.type) {
    alert('Please fill in Organization Name, Role, and Type')
    return
  }
  
  const userId = user.value?.id
  if (!userId) {
    alert('User ID not found. Please refresh the page.')
    return
  }
  
  addingOrganizational.value = true
  try {
    const experienceData: CreateOrganizationalRequest = {
      userId: userId,
      organizationName: newOrganizational.organizationName,
      role: newOrganizational.role,
      type: newOrganizational.type as 'ORGANIZATION' | 'COMMITTEE' | 'VOLUNTEER',
      monthStart: newOrganizational.monthStart,
      yearStart: newOrganizational.yearStart,
      monthFinish: newOrganizational.isCurrent ? null : newOrganizational.monthFinish,
      yearFinish: newOrganizational.isCurrent ? null : newOrganizational.yearFinish,
      isCurrent: newOrganizational.isCurrent,
      description: newOrganizational.description || null
    }
    
    await createOrganizationalExperience(experienceData)
    await loadOrganizationalExperiences()
    showOrganizationalModal.value = false
    
    Object.assign(newOrganizational, {
      organizationName: '',
      role: '',
      type: '',
      monthStart: null,
      yearStart: null,
      monthFinish: null,
      yearFinish: null,
      isCurrent: false,
      description: ''
    })
    
    alert('Organizational experience added successfully!')
  } catch (err: unknown) {
    const message = (err as any)?.message || 'Unknown error'
    console.error('Error adding organizational experience:', err)
    alert('Failed to add organizational experience: ' + message)
  } finally {
    addingOrganizational.value = false
  }
}

const deleteOrganizationalItem = async (id: string) => {
  if (!confirm('Are you sure you want to delete this organizational experience?')) return
  try {
    await deleteOrganizationalExperience(id)
    await loadOrganizationalExperiences()
  } catch (err) {
    console.error('Error deleting organizational experience:', err)
  }
}

// Certificates
const addCertificate = async () => {
  if (!newCertificate.name) {
    alert('Please fill in Certificate Name')
    return
  }
  
  const userId = user.value?.id
  if (!userId) {
    alert('User ID not found. Please refresh the page.')
    return
  }
  
  addingCertificate.value = true
  try {
    const certificateData: CreateCertificateRequest = {
      userId: userId,
      name: newCertificate.name,
      organization: newCertificate.organization || null,
      issueMonthStart: newCertificate.monthStart,
      issueYearStart: newCertificate.yearStart,
      issueMonthFinish: newCertificate.monthFinish,
      issueYearFinish: newCertificate.yearFinish,
      credentialId: newCertificate.credentialId || null,
      credentialUrl: newCertificate.credentialUrl || null
    }
    
    await createCertificate(certificateData)
    await loadCertificates()
    showCertificateModal.value = false
    
    Object.assign(newCertificate, {
      name: '',
      organization: '',
      monthStart: null,
      yearStart: null,
      monthFinish: null,
      yearFinish: null,
      credentialId: '',
      credentialUrl: ''
    })
    
    alert('Certificate added successfully!')
  } catch (err: unknown) {
    const message = (err as any)?.message || 'Unknown error'
    console.error('Error adding certificate:', err)
    alert('Failed to add certificate: ' + message)
  } finally {
    addingCertificate.value = false
  }
}

const deleteCertificateItem = async (id: string) => {
  if (!confirm('Are you sure you want to delete this certificate?')) return
  try {
    await deleteCertificate(id)
    await loadCertificates()
  } catch (err) {
    console.error('Error deleting certificate:', err)
  }
}

// Skills
const addSkill = async () => {
  if (!newSkillId.value) {
    alert('Please select a skill.')
    return
  }

  const existing = skills.value.find(s => s.skillId === newSkillId.value)
  if (existing) {
    alert('Skill already added.')
    return
  }

  try {
    await addUserSkill(newSkillId.value)
    await loadSkills()
    showSkillModal.value = false
    newSkillId.value = ''
  } catch (err: unknown) {
    const message = (err as any)?.message || 'Unknown error'
    console.error('Error adding skill:', err)
    alert('Failed to add skill: ' + message)
  }
}

const deleteSkillItem = async (id: string) => {
  if (!confirm('Are you sure you want to remove this skill?')) return
  try {
    await deleteUserSkill(id)
    await loadSkills()
  } catch (err) {
    console.error('Error deleting skill:', err)
  }
}

// Languages
const addLanguage = async () => {
  if (!newLanguage.languageId || !newLanguage.proficiencyLevel) return
  
  try {
    await addUserLanguage(newLanguage.languageId, newLanguage.proficiencyLevel)
    await loadLanguages()
    showLanguageModal.value = false
    newLanguage.languageId = ''
    newLanguage.proficiencyLevel = ''
  } catch (err) {
    console.error('Error adding language:', err)
  }
}

const deleteLanguageItem = async (id: string) => {
  if (!confirm('Are you sure you want to remove this language?')) return
  try {
    await deleteUserLanguage(id)
    await loadLanguages()
  } catch (err) {
    console.error('Error deleting language:', err)
  }
}

// Watch for user changes
watch(() => user.value?.id, (newUserId) => {
  if (newUserId) {
    loadWorkExperiences()
    loadOrganizationalExperiences()
    loadCertificates()
    loadSkills()
    loadLanguages()
  }
})

onMounted(async () => {
  console.log('🚀 Profile page mounted')
  await loadProfile()
  
  const userId = user.value?.id
  debugInfo.value.userId = userId || ''
  
  if (userId) {
    await Promise.all([
      loadWorkExperiences(),
      loadOrganizationalExperiences(),
      loadCertificates(),
      loadSkills(),
      loadLanguages()
    ])
  }
  
  await loadAllSkills()
  await loadWorkPlaces()
  await loadWorkTypes()
  loading.value = false
  
  console.log('🏁 Final work experiences count:', workExperiences.value.length)
  console.log('🏁 Final organizational experiences count:', organizationalExperiences.value.length)
  console.log('🏁 Final certificates count:', certificates.value.length)
})
</script>