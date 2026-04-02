// types/job-category.ts
export interface JobCategoryTranslation {
  id?: string
  categoryId?: string
  localeId: string
  languageCode?: string
  name: string
  description?: string
}

export interface JobCategory {
  id: string
  slug: string
  parentId: string | null
  isActive: boolean
  translations: JobCategoryTranslation[]
  createdAt: number
  updatedAt: number
  deletedAt?: number | null
  createdBy?: string | null
  updatedBy?: string | null
  deletedBy?: string | null
}

export interface JobCategoriesResponse {
  status: string
  message: string
  data: {
    categories: JobCategory[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}