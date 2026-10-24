import { useState, useEffect, useRef } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { HeroGreeting } from './components/HeroGreeting'
import { ChatMessage } from './components/ChatMessage'
import { ChatInput } from './components/ChatInput'
import { AuthModal } from './components/AuthModal'
import { SettingsModal } from './components/SettingsModal'
import type { ChatSession, Message, UserProfile, AppSettings } from './types'
import { generateGeminiResponse } from './services/gemini'

const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  model: 'gemini-3.8-flash',
  temperature: 0.7,
  systemPrompt:
    'You are ShivGPT, an intelligent AI assistant. When someone asks "who are you" (or about your identity or name), you must state: "I am ShivGPT". When asked about your owner, creator, or who made you, state clearly that your owner and creator is Divyanshu Jaiswal. Always provide complete, unabridged, and fully working code with all methods and examples fully implemented. Never truncate code mid-solution.',
}

function createNewSession(): ChatSession {
  const id = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)
  return {
    id,
    title: 'New conversation',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  }
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768
    }
    return false
  })

  // Keep sidebar open on desktop mode by default, and handle viewport resize
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(min-width: 768px)')
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setSidebarOpen(e.matches)
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange)
      return () => mediaQuery.removeEventListener('change', handleMediaChange)
    } else {
      mediaQuery.addListener(handleMediaChange)
      return () => mediaQuery.removeListener(handleMediaChange)
    }
  }, [])
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('shivgpt_sessions')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.error(e)
    }
    return [createNewSession()]
  })

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return sessions[0]?.id || ''
  })

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('shivgpt_user')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
    return { name: 'Guest', isLoggedIn: false }
  })

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('shivgpt_settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (!parsed.systemPrompt || !parsed.systemPrompt.includes('Divyanshu Jaiswal')) {
          parsed.systemPrompt = DEFAULT_SETTINGS.systemPrompt
        }
        return { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch (e) {
      console.error(e)
    }
    return DEFAULT_SETTINGS
  })


  const [authModal, setAuthModal] = useState<{
    isOpen: boolean
    mode: 'login' | 'register'
  }>({
    isOpen: false,
    mode: 'login',
  })

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const abortControllerRef = useRef<boolean>(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shivgpt_sessions', JSON.stringify(sessions))
    } catch (e) {
      console.error(e)
    }
  }, [sessions])

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shivgpt_settings', JSON.stringify(settings))
    } catch (e) {
      console.error(e)
    }
  }, [settings])

  // Auto-scroll chat area when new messages arrive
  const activeSession =
    sessions.find((s) => s.id === currentSessionId) || sessions[0]

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeSession?.messages, isStreaming])

  const handleNewChat = () => {
    const newSession = createNewSession()
    setSessions((prev) => [newSession, ...prev])
    setCurrentSessionId(newSession.id)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id)
      if (filtered.length === 0) {
        const fresh = createNewSession()
        setCurrentSessionId(fresh.id)
        return [fresh]
      }
      if (currentSessionId === id) {
        setCurrentSessionId(filtered[0].id)
      }
      return filtered
    })
  }

  const handleSendMessage = async (promptText: string) => {
    if (!promptText.trim() || isStreaming) return

    let sessionId = currentSessionId
    if (!sessions.some((s) => s.id === sessionId)) {
      const newSession = createNewSession()
      setSessions((prev) => [newSession, ...prev])
      sessionId = newSession.id
      setCurrentSessionId(sessionId)
    }

    const userMessage: Message = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: promptText,
      timestamp: Date.now(),
    }

    const assistantPlaceholderId = 'msg_asst_' + Date.now()
    const assistantMessage: Message = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    }

    // Add user message & empty assistant placeholder
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const isFirstMessage = s.messages.length === 0
          const updatedTitle = isFirstMessage
            ? promptText.slice(0, 30) + (promptText.length > 30 ? '...' : '')
            : s.title
          return {
            ...s,
            title: updatedTitle,
            updatedAt: Date.now(),
            messages: [...s.messages, userMessage, assistantMessage],
          }
        }
        return s
      })
    )

    setIsStreaming(true)
    abortControllerRef.current = false

    try {
      const history = activeSession?.messages || []
      let accumulated = ''

      await generateGeminiResponse(
        promptText,
        history,
        settings,
        (chunk: string) => {
          if (abortControllerRef.current) return
          accumulated += chunk
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id === sessionId) {
                return {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantPlaceholderId
                      ? { ...m, content: accumulated, isStreaming: true }
                      : m
                  ),
                }
              }
              return s
            })
          )
        }
      )

      // Finish streaming
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === sessionId) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? { ...m, isStreaming: false }
                  : m
              ),
            }
          }
          return s
        })
      )
    } catch (err: any) {
      console.error(err)
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === sessionId) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? {
                      ...m,
                      content:
                        m.content ||
                        `An error occurred while generating response: ${err.message}`,
                      isStreaming: false,
                    }
                  : m
              ),
            }
          }
          return s
        })
      )
    } finally {
      setIsStreaming(false)
    }
  }

  const handleStopStreaming = () => {
    abortControllerRef.current = true
    setIsStreaming(false)
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: s.messages.map((m) =>
              m.isStreaming ? { ...m, isStreaming: false } : m
            ),
          }
        }
        return s
      })
    )
  }

  const handleRegenerate = () => {
    if (!activeSession || activeSession.messages.length === 0) return
    const lastUserMsg = [...activeSession.messages]
      .reverse()
      .find((m) => m.role === 'user')
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content)
    }
  }

  const handleLogout = () => {
    const guestUser: UserProfile = { name: 'Guest', isLoggedIn: false }
    setUser(guestUser)
    localStorage.removeItem('shivgpt_user')
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0f19] text-slate-100 font-sans">
      {/* Sidebar Component */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => {
          setCurrentSessionId(id)
          if (window.innerWidth < 768) setSidebarOpen(false)
        }}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />

      {/* Main Chat Interface */}
      <div
        className={`flex-1 flex flex-col h-full min-w-0 transition-all duration-300 ${
          sidebarOpen ? 'md:ml-72' : 'ml-0'
        }`}
      >
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          user={user}
          onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
          onLogout={handleLogout}
          onOpenSettings={() => setIsSettingsOpen(true)}
          sidebarOpen={sidebarOpen}
        />

        {/* Scrollable Chat Area - ONLY THIS SCROLLS */}
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
          {!activeSession || activeSession.messages.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center">
              <HeroGreeting onSelectPrompt={handleSendMessage} />
            </div>
          ) : (
            <div className="py-6 flex-1 flex flex-col justify-start space-y-2">
              {activeSession.messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onRegenerate={
                    msg.role === 'assistant' ? handleRegenerate : undefined
                  }
                />
              ))}
              <div ref={chatBottomRef} />
            </div>
          )}
        </div>

        {/* Fixed Pinned Bottom Typebox - DOES NOT SCROLL */}
        <div className="shrink-0 w-full bg-[#0b0f19] z-20">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isStreaming}
            isStreaming={isStreaming}
            onStopStreaming={handleStopStreaming}
          />
        </div>
      </div>


      {/* Authentication Modal (Register / Login) */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
        onSuccess={(profile) => setUser(profile)}
      />

      {/* Settings Modal (Gemini API Configuration) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(newSettings) => setSettings(newSettings)}
      />
    </div>
  )
}
