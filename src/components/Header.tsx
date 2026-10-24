import { Menu, LogOut, Sparkles } from 'lucide-react'
import type { UserProfile } from '../types'

interface HeaderProps {
  onToggleSidebar: () => void
  user: UserProfile
  onOpenAuth: (mode: 'login' | 'register') => void
  onLogout: () => void
  onOpenSettings?: () => void
  sidebarOpen: boolean
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  user,
  onOpenAuth,
  onLogout,
  sidebarOpen,
}) => {
  return (
    <header className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-[#172138] bg-[#0c101c]/90 backdrop-blur-md sticky top-0 z-30">
      {/* Left side: Hamburger + ShivGPT title (hidden when sidebar is open) */}
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <>
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a243d] transition-colors focus:outline-none"
              title="Open sidebar"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2 select-none">
              <span className="text-xl md:text-2xl font-bold tracking-tight text-[#4b6bfb] drop-shadow-sm hover:opacity-95 transition-opacity cursor-pointer">
                ShivGPT
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                AI
              </span>
            </div>
          </>
        )}
      </div>


      {/* Right side: Register & Login (or Logged In User) */}
      <div className="flex items-center gap-2.5">


        {user.isLoggedIn ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#162038] border border-[#233152]">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-200 hidden sm:inline">
                {user.name}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#1f273d] transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAuth('register')}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-200 bg-[#12192a] hover:bg-[#1b253e] border border-[#233252] hover:border-slate-500 transition-all cursor-pointer shadow-sm"
            >
              Register
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className="px-4 py-1.5 rounded-lg text-sm font-medium text-white bg-[#4f46e5] hover:bg-[#4338ca] active:scale-95 transition-all cursor-pointer shadow-md shadow-indigo-600/30"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
