// types/locale.ts
export interface Locale {
  id: string
  code: string
  name: string
  isActive?: boolean
  createdAt?: number
  updatedAt?: number
  deletedAt?: number | null
}

export type LocalesResponse = Locale[] | {
  data: Locale[]
  total?: number
  page?: number
  limit?: number
}