import React from 'react'
import { RobotAvatar } from './RobotAvatar'

interface HeroGreetingProps {
  onSelectPrompt?: (prompt: string) => void
}


export const HeroGreeting: React.FC<HeroGreetingProps> = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 w-full text-center select-none">
      {/* Center robot circle from screenshot */}
      <div className="mb-6">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#5252e8] flex items-center justify-center text-white shadow-2xl shadow-indigo-600/40 hover:scale-105 transition-transform duration-300">
          <RobotAvatar size={48} className="text-white" />
        </div>
      </div>

      {/* Main heading from screenshot */}
      <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
        <span className="text-[#ec4899]">Hello,</span>{' '}
        <span className="text-[#6366f1]">Welcome to ShivGPT</span>
      </h1>

      {/* Subtitle from screenshot */}
      <p className="text-slate-400 text-base md:text-xl font-normal mt-2.5 max-w-xl">
        How can I help you today?
      </p>
    </div>
  )
}

