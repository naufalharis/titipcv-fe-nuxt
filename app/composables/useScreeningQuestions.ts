import { useAuth } from './useAuth'

export type ScreeningQuestionType = 'TEXT' | 'TEXTAREA' | 'MULTIPLE_CHOICE' | 'CHECKBOX' | 'YES_NO' | 'NUMBER' | 'DATE'

export interface ScreeningQuestion {
  id: string
  jobId: string
  question: string
  answerType: ScreeningQuestionType
  options?: string[]
  isRequired: boolean
  sortOrder: number
  correctAnswer?: string
  createdAt: number
  updatedAt: number
  createdBy?: string
  updatedBy?: string
}

export interface CreateScreeningQuestionRequest {
  question: string
  answerType: ScreeningQuestionType
  options?: string[]
  isRequired?: boolean
  sortOrder?: number
  correctAnswer?: string
}

export interface UpdateScreeningQuestionRequest {
  question?: string
  answerType?: ScreeningQuestionType
  options?: string[]
  isRequired?: boolean
  sortOrder?: number
  correctAnswer?: string
}

export interface ReorderQuestionsRequest {
  questionIds: string[]
}

export const useScreeningQuestions = () => {
  const { accessToken } = useAuth()
  const runtimeConfig = useRuntimeConfig()
  const baseURL = runtimeConfig.public.apiBaseUrl || 'http://localhost:3335/api/v1'

  const getHeaders = (contentType = true) => {
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    }
    
    if (accessToken.value) {
      headers['Authorization'] = `Bearer ${accessToken.value}`
    }
    
    if (contentType) {
      headers['Content-Type'] = 'application/json'
    }
    
    return headers
  }

  // Get all screening questions for a job
  const getScreeningQuestions = async (jobId: string): Promise<ScreeningQuestion[]> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs/${jobId}/screening-questions`
      
      console.log('🔍 GET screening questions - URL:', url)
      
      const response = await $fetch<any>(url, { headers })
      
      console.log('📦 GET screening questions - Response:', response)
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data
      }
      if (Array.isArray(response)) {
        return response
      }
      
      return []
    } catch (error: any) {
      console.error('❌ Error fetching screening questions:', error?.message)
      return []
    }
  }

  // Get a single screening question
  const getScreeningQuestion = async (jobId: string, questionId: string): Promise<ScreeningQuestion> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs/${jobId}/screening-questions/${questionId}`
      
      console.log('🔍 GET screening question - URL:', url)
      
      const response = await $fetch<any>(url, { headers })
      
      return response?.data || response
    } catch (error: any) {
      console.error('❌ Error fetching screening question:', error?.message)
      throw error
    }
  }

  // Create a screening question
  const createScreeningQuestion = async (jobId: string, data: CreateScreeningQuestionRequest): Promise<ScreeningQuestion> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs/${jobId}/screening-questions`
      
      const payload = {
        question: data.question,
        answerType: data.answerType,
        options: data.options || [],
        isRequired: data.isRequired !== undefined ? data.isRequired : true,
        sortOrder: data.sortOrder || 0,
        correctAnswer: data.correctAnswer || null
      }
      
      console.log('🔍 POST create screening question - URL:', url)
      console.log('📦 Payload:', payload)
      
      const response = await $fetch<any>(url, {
        method: 'POST',
        headers,
        body: payload
      })
      
      console.log('📦 POST create screening question - Response:', response)
      
      return response?.data || response
    } catch (error: any) {
      console.error('❌ Error creating screening question:', error?.message)
      throw error
    }
  }

  // Update a screening question
  const updateScreeningQuestion = async (jobId: string, questionId: string, data: UpdateScreeningQuestionRequest): Promise<ScreeningQuestion> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs/${jobId}/screening-questions/${questionId}`
      
      const payload: any = {}
      if (data.question !== undefined) payload.question = data.question
      if (data.answerType !== undefined) payload.answerType = data.answerType
      if (data.options !== undefined) payload.options = data.options
      if (data.isRequired !== undefined) payload.isRequired = data.isRequired
      if (data.sortOrder !== undefined) payload.sortOrder = data.sortOrder
      if (data.correctAnswer !== undefined) payload.correctAnswer = data.correctAnswer
      
      console.log('🔍 PATCH update screening question - URL:', url)
      console.log('📦 Payload:', payload)
      
      const response = await $fetch<any>(url, {
        method: 'PATCH',
        headers,
        body: payload
      })
      
      return response?.data || response
    } catch (error: any) {
      console.error('❌ Error updating screening question:', error?.message)
      throw error
    }
  }

  // Delete a screening question
  const deleteScreeningQuestion = async (jobId: string, questionId: string): Promise<void> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs/${jobId}/screening-questions/${questionId}`
      
      console.log('🔍 DELETE screening question - URL:', url)
      
      await $fetch(url, {
        method: 'DELETE',
        headers
      })
    } catch (error: any) {
      console.error('❌ Error deleting screening question:', error?.message)
      throw error
    }
  }

  // Reorder screening questions
  const reorderScreeningQuestions = async (jobId: string, questionIds: string[]): Promise<ScreeningQuestion[]> => {
    try {
      const headers = getHeaders()
      const url = `${baseURL}/jobs/${jobId}/screening-questions/reorder`
      
      const payload = { questionIds }
      
      console.log('🔍 PATCH reorder screening questions - URL:', url)
      console.log('📦 Payload:', payload)
      
      const response = await $fetch<any>(url, {
        method: 'PATCH',
        headers,
        body: payload
      })
      
      return response?.data || response
    } catch (error: any) {
      console.error('❌ Error reordering screening questions:', error?.message)
      throw error
    }
  }

  const bulkCreateScreeningQuestions = async (
  jobId: string,
  questions: CreateScreeningQuestionRequest[]
): Promise<ScreeningQuestion[]> => {
  try {
    const results: ScreeningQuestion[] = []

    for (const [i, q] of questions.entries()) {
      const validQuestion: CreateScreeningQuestionRequest = {
        question: q.question || '',
        answerType: q.answerType || 'TEXT',
        isRequired: q.isRequired !== undefined ? q.isRequired : true,
        sortOrder: q.sortOrder !== undefined ? q.sortOrder : i,
        options: q.options || [],
        correctAnswer: q.correctAnswer || undefined
      }

      if (!validQuestion.question) {
        console.warn('Skipping empty question at index', i)
        continue
      }

      const result = await createScreeningQuestion(jobId, validQuestion)
      results.push(result)
    }

    return results
  } catch (error) {
    console.error('Error bulk creating screening questions:', error)
    throw error
  }
}
  // Bulk delete screening questions
  const bulkDeleteScreeningQuestions = async (jobId: string, questionIds: string[]): Promise<void> => {
    try {
      await Promise.all(questionIds.map(id => deleteScreeningQuestion(jobId, id)))
    } catch (error) {
      console.error('Error bulk deleting screening questions:', error)
      throw error
    }
  }

  return {
    getScreeningQuestions,
    getScreeningQuestion,
    createScreeningQuestion,
    updateScreeningQuestion,
    deleteScreeningQuestion,
    reorderScreeningQuestions,
    bulkCreateScreeningQuestions,
    bulkDeleteScreeningQuestions
  }
}