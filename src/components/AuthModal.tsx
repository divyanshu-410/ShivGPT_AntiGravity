import React, { useState } from 'react'
import { X, Lock, User, Mail } from 'lucide-react'
import confetti from 'canvas-confetti'
import type { UserProfile } from '../types'
import { RobotAvatar } from './RobotAvatar'

interface AuthModalProps {
  isOpen: boolean
  initialMode: 'login' | 'register'
  onClose: () => void
  onSuccess: (profile: UserProfile) => void
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your name.')
        return
      }
      if (!password.trim()) {
        setError('Please enter a password.')
        return
      }

      // Save user profile
      const newProfile: UserProfile = {
        name: name.trim(),
        email: email.trim() || undefined,
        isLoggedIn: true,
      }
      localStorage.setItem('shivgpt_user', JSON.stringify(newProfile))
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } })
      onSuccess(newProfile)
      onClose()
    } else {
      // Login mode
      const displayName = name.trim() || email.split('@')[0] || 'User'
      if (!password.trim()) {
        setError('Please enter your password.')
        return
      }
      const newProfile: UserProfile = {
        name: displayName,
        email: email.trim() || undefined,
        isLoggedIn: true,
      }
      localStorage.setItem('shivgpt_user', JSON.stringify(newProfile))
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } })
      onSuccess(newProfile)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0f1526] border border-[#1e2c47] rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a253d] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-indigo-600/30">
            <RobotAvatar size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {mode === 'register' ? 'Join ShivGPT' : 'Welcome back'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'register'
              ? 'Create an account to personalize your AI workspace'
              : 'Sign in to access your saved chats and preferences'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {mode === 'register' ? 'Your Name' : 'Username or Name'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={mode === 'register' ? 'e.g. Divyanshu' : 'Enter your name'}
                className="w-full bg-[#151f36] border border-[#233152] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none"
                required={mode === 'register'}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email (optional)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#151f36] border border-[#233152] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#151f36] border border-[#233152] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/30 active:scale-[0.98] cursor-pointer mt-2"
          >
            {mode === 'register' ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Mode switcher */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {mode === 'register' ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-indigo-400 hover:underline font-medium"
              >
                Log In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-indigo-400 hover:underline font-medium"
              >
                Register
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
