// app/types/user.ts
// Shared user-related type definitions used across the project.

export interface User {
  id: string
  email: string
  username: string
  name?: string
  role?: string
  department?: string
  // API may return either a freeform status string or a boolean flag.
  status?: string
  isActive?: boolean
  avatar?: string
  [key: string]: any
}

// API may return array directly or an object with a data property.
export type UsersResponse = User[] | { data: User[] }
