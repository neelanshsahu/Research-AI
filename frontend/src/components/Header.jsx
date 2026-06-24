import React, { useState, useEffect } from 'react'
import { Brain, Zap, Github, Settings } from 'lucide-react'
import SettingsModal from './SettingsModal'

/* Reads provider + model from localStorage — updates whenever settings are saved */
function useActiveProvider() {
  const read = () => ({
    provider: localStorage.getItem('provider') || 'gemini',
    model:
      localStorage.getItem('provider') === 'openai'
        ? localStorage.getItem('openai_model') || 'gpt-4o-mini'
        : localStorage.getItem('gemini_model') || 'gemini-2.5-flash',
  })

  const [info, setInfo] = useState(read)

  // Re-read when settings modal saves (storage event fires on other tabs;
  // for same-tab we refresh when modal closes via settingsOpen toggle)
  useEffect(() => {
    const handler = () => setInfo(read())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return [info, () => setInfo(read())]
}

const PROVIDER_STYLE = {
  gemini: {
    icon: '✨',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  openai: {
    icon: '🤖',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
}

export default function Header({ onReset, showReset }) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [providerInfo, refreshProvider] = useActiveProvider()

  const style = PROVIDER_STYLE[providerInfo.provider] || PROVIDER_STYLE.gemini
  // Show short model name
  const shortModel = providerInfo.model
    .replace(/^gemini-/, 'Gemini ')
    .replace(/^gpt-/, 'GPT-')
    .replace(/-/g, ' ')

  const handleSettingsClose = () => {
    setSettingsOpen(false)
    refreshProvider()   // re-read localStorage after save
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/8 backdrop-blur-xl bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <button
              onClick={showReset ? onReset : undefined}
              className="flex items-center gap-3 group cursor-pointer"
              id="header-logo-btn"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-all duration-300">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse-slow" />
              </div>
              <div>
                <span className="text-lg font-bold gradient-text">ResearchAI</span>
                <div className="text-xs text-slate-500 font-medium -mt-0.5">Multi-Agent Platform</div>
              </div>
            </button>

            {/* Center — live provider + model badge */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${style.bg}`}>
              <span className="text-sm leading-none">{style.icon}</span>
              <span className={`text-xs font-medium ${style.color}`}>{shortModel}</span>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm hidden sm:flex"
                id="header-github-link"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              <button
                onClick={() => setSettingsOpen(true)}
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all duration-200"
                id="header-settings-btn"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </header>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={handleSettingsClose}
      />
    </>
  )
}
