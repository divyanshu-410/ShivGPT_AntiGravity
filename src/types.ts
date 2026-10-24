export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  isStreaming?: boolean
}

export interface ChatSession {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messages: Message[]
}

export interface UserProfile {
  name: string
  email?: string
  isLoggedIn: boolean
}

export interface AppSettings {
  geminiApiKey: string
  model: string
  temperature: number
  systemPrompt: string
}
