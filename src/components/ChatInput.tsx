import React, { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, StopCircle } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
  isStreaming?: boolean
  onStopStreaming?: () => void
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Ask ShivGPT...',
  isStreaming = false,
  onStopStreaming,
}) => {
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`
    }
  }, [input])

  const handleSend = () => {
    if (!input.trim() || disabled) return
    onSendMessage(input.trim())
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Speech Recognition support
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.')
      return
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => setIsListening(true)
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
        setIsListening(false)
      }
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.error(err)
      setIsListening(false)
    }
  }

  return (
    <div className="w-[95%] mx-auto pb-4 pt-2">
      <div className="relative flex items-end bg-[#131929] border border-[#1f2b45] focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500/40 rounded-xl md:rounded-2xl shadow-xl shadow-black/40 transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled && !isStreaming}
          className="flex-1 py-3.5 pl-4 md:pl-5 pr-24 bg-transparent text-slate-100 placeholder-slate-500 text-sm md:text-base resize-none focus:outline-none max-h-44 leading-relaxed overflow-y-auto"

        />

        {/* Action buttons inside the right side of the pill */}
        <div className="absolute right-3 bottom-2.5 flex items-center gap-1.5">
          {/* Voice input button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-600/30 text-rose-400 animate-pulse border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a253e]'
            }`}
            title={isListening ? 'Listening... click to stop' : 'Voice input'}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          {/* Send / Stop button */}
          {isStreaming ? (
            <button
              type="button"
              onClick={onStopStreaming}
              className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-600/20 active:scale-95"
              title="Stop generating"
            >
              <StopCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || disabled}
              className={`p-2 rounded-xl transition-all ${
                input.trim() && !disabled
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 active:scale-95 cursor-pointer'
                  : 'text-slate-500 hover:text-slate-400 bg-transparent'
              }`}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

