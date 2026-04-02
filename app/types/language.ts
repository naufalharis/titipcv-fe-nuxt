// app/types/language.ts
// Shared type definitions for languages.

export interface Language {
  id: string
  code: string
  name: string
  createdAt?: number
  updatedAt?: number
  deletedAt?: number | null
  createdBy?: string | null
  updatedBy?: string | null
  deletedBy?: string | null
}

export type LanguagesResponse = Language[] | { data: Language[] }
