import React from 'react'
import { X, Plus, MessageSquare, Trash2 } from 'lucide-react'
import type { ChatSession, UserProfile } from '../types'
import { RobotAvatar } from './RobotAvatar'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  user: UserProfile
  sessions: ChatSession[]
  currentSessionId: string
  onSelectSession: (id: string) => void
  onNewChat: () => void
  onDeleteSession: (id: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  user,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#0c101c] border-r border-[#19233a] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-[#18233b]">
          <div className="flex items-center gap-2.5">
            {/* Rounded purple badge with robot icon */}
            <div className="w-9 h-9 rounded-xl bg-[#5252e8] flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <RobotAvatar size={22} className="text-white" />
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-bold text-white tracking-wide">
                ShivGPT
              </span>
              <span className="text-[10px] font-semibold text-slate-400 ml-0.5">
                1.9.0
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a253e] transition-colors"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Welcome Section */}
        <div className="px-5 py-4">
          <div className="text-lg font-medium tracking-tight">
            <span className="text-[#f43f5e] font-semibold">Welcome </span>
            <span className="text-[#38bdf8] font-semibold">{user.name}</span>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="px-4 pb-3">
          <button
            onClick={() => {
              onNewChat()
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#162038] hover:bg-[#1e2c4d] border border-[#243455] text-slate-200 text-sm font-medium transition-all shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Recent Chats
          </div>

          {sessions.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-slate-500">
              No recent conversations yet.
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === currentSessionId
              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-[#1a2540] text-indigo-200 font-medium border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-[#131b2e] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MessageSquare
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-indigo-400' : 'text-slate-500'
                      }`}
                    />
                    <span className="truncate">{session.title}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteSession(session.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 rounded transition-opacity"
                    title="Delete chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Owner Credit Card (from Screenshot 2) */}
        <div className="p-4 mx-3 mb-4 rounded-xl bg-[#0f1526] border border-[#1b2640] text-center flex flex-col items-center">
          <div className="text-sm text-cyan-400 font-medium space-y-0.5">
            <div className="text-[#38bdf8]">Made</div>
            <div className="text-[#38bdf8]">with</div>
            <div className="text-xl">❤️</div>
            <div className="text-[#38bdf8]">by</div>
            <div className="text-base font-semibold text-[#38bdf8]">
              Divyanshu
            </div>
            <div className="text-base font-semibold text-[#38bdf8]">
              Jaiswal
            </div>
          </div>

          <div className="mt-2.5">
            <span className="inline-block px-3 py-0.5 rounded-md bg-[#192238] border border-[#2b3a5d] text-xs font-medium text-slate-200 tracking-wide">
              <a href="http://divyanshujaiswal.netlify.app/" target="_blank" rel="noopener noreferrer">Owner</a>
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}
