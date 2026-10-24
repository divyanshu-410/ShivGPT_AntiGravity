import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Check, Volume2, VolumeX, RotateCcw, User } from 'lucide-react'
import type { Message } from '../types'
import { RobotAvatar } from './RobotAvatar'

interface ChatMessageProps {
  message: Message
  onRegenerate?: () => void
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRegenerate,
}) => {
  const isAssistant = message.role === 'assistant'
  const [copied, setCopied] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    window.speechSynthesis.cancel()
    const cleanText = message.content.replace(/[#*`_~\[\]()]/g, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 1.0
    utterance.pitch = 1.0

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }

  // --- USER (Me) MESSAGE: ALIGNED ON RIGHT SIDE ---
  if (!isAssistant) {
    return (
      <div className="w-[95%] mx-auto flex justify-end py-2 animate-in fade-in duration-200">
        <div className="flex items-start gap-2.5 max-w-[85%] md:max-w-[70%] flex-row-reverse">
          {/* User Avatar */}
          <div className="shrink-0 mt-1 w-8 h-8 rounded-xl bg-[#1e2a44] border border-[#2e4067] flex items-center justify-center text-indigo-300 shadow-sm">
            <User className="w-4 h-4" />
          </div>

          {/* User Bubble */}
          <div className="flex flex-col items-end min-w-0">
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-[11px] text-slate-500">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="font-semibold text-xs text-slate-300">You</span>
            </div>

            <div className="bg-[#182238] border border-[#243455] rounded-2xl rounded-tr-sm px-4 py-3 text-slate-100 text-sm md:text-base leading-relaxed break-words shadow-md shadow-black/25">
              {message.content}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- AI (ShivGPT) MESSAGE: ALIGNED ON LEFT SIDE ---
  return (
    <div className="w-[95%] mx-auto flex justify-start py-3 animate-in fade-in duration-200">
      <div className="flex items-start gap-3 md:gap-4 max-w-[95%] md:max-w-[85%]">
        {/* Robot Avatar */}
        <div className="shrink-0 mt-1 w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
          <RobotAvatar size={20} className="text-white" />
        </div>

        {/* Content Box */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-slate-200">ShivGPT</span>
            <span className="text-[11px] text-slate-500">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <div className="markdown-content text-slate-200 text-sm md:text-base leading-relaxed break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '')
                  const codeString = String(children).replace(/\n$/, '')

                  if (!inline && match) {
                    return <CodeBlock language={match[1]} code={codeString} />
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                },
              }}
            >
              {message.content}
            </ReactMarkdown>

            {message.isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse rounded-sm align-middle" />
            )}
          </div>

          {/* Action buttons */}
          {!message.isStreaming && (
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#172036]">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-slate-400 hover:text-slate-200 hover:bg-[#16213a] transition-colors"
                title="Copy message"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSpeak}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-slate-400 hover:text-slate-200 hover:bg-[#16213a] transition-colors"
                title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-indigo-400">Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Read aloud</span>
                  </>
                )}
              </button>

              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-slate-400 hover:text-slate-200 hover:bg-[#16213a] transition-colors"
                  title="Regenerate response"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-[#1e2a44] bg-[#0b0f19]">
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#141d33] border-b border-[#1e2a44] text-xs text-slate-400 font-mono">
        <span className="font-semibold text-slate-300">{language}</span>
        <button
          onClick={copyCode}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs md:text-sm font-mono overflow-x-auto text-indigo-100">
        <code>{code}</code>
      </pre>
    </div>
  )
}
