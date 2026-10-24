import React, { useState } from 'react'
import { X, Key, Cpu, Check } from 'lucide-react'
import type { AppSettings } from '../types'

interface SettingsModalProps {
  isOpen: boolean
  settings: AppSettings
  onClose: () => void
  onSave: (settings: AppSettings) => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSave,
}) => {
  const [apiKey, setApiKey] = useState(settings.geminiApiKey || '')
  const [model, setModel] = useState(settings.model || 'gemini-1.5-flash')
  const [temperature, setTemperature] = useState(settings.temperature ?? 0.7)
  const [systemPrompt, setSystemPrompt] = useState(
    settings.systemPrompt ||
      'You are ShivGPT, an intelligent, helpful AI assistant inspired by Google Gemini.'
  )
  const [savedNotice, setSavedNotice] = useState(false)

  if (!isOpen) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      geminiApiKey: apiKey.trim(),
      model,
      temperature,
      systemPrompt,
    })
    setSavedNotice(true)
    setTimeout(() => {
      setSavedNotice(false)
      onClose()
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0f1526] border border-[#1e2c47] rounded-2xl shadow-2xl p-6 text-slate-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a253d] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-1">
          ShivGPT Settings
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          Configure Gemini API connectivity and AI behavior.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Gemini API Key */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Google Gemini API Key (Optional)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy... (Leave empty to use built-in smart engine)"
                className="w-full bg-[#151f36] border border-[#233152] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Leave blank to use the instant built-in engine, or get a free API key from{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 underline hover:text-indigo-300"
              >
                Google AI Studio
              </a>
              .
            </p>
          </div>

          {/* Model selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              AI Model
            </label>
            <div className="relative">
              <Cpu className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-[#151f36] border border-[#233152] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none cursor-pointer"
              >
                <option value="gemini-3.8-flash">Gemini 3.8 Flash (Recommended)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-1.5-flash-latest">Gemini 1.5 Flash Latest</option>
                <option value="gemini-1.5-pro-latest">Gemini 1.5 Pro</option>


              </select>
            </div>
          </div>

          {/* Temperature Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Creativity (Temperature)
              </label>
              <span className="text-xs font-mono text-indigo-400">
                {temperature}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-[#151f36] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>Precise (0.0)</span>
              <span>Creative (1.0)</span>
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              System Instruction
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              className="w-full bg-[#151f36] border border-[#233152] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1a253e]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-[#151f36] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-md shadow-indigo-600/30"
            >
              {savedNotice ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
