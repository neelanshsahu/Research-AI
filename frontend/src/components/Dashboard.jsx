import React, { useState, useRef, useEffect } from 'react'
import { Search, ArrowRight, Sparkles, Brain, Cpu, AlertCircle, RotateCcw, GitCompare } from 'lucide-react'
import { SpinnerIcon } from './LoadingSpinner'
import RecentSearches from './RecentSearches'

const PLACEHOLDER_TOPICS = [
  'Artificial Intelligence in Healthcare...',
  'Climate Change & Renewable Energy...',
  'Quantum Computing Breakthroughs...',
  'The Future of Space Exploration...',
  'Blockchain Technology & Web3...',
]

export default function Dashboard({ onSubmit, phase, errorMsg, onReset, onCompareMode }) {
  const [input, setInput]               = useState('')
  const [recentSearches, setRecent]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('recent_searches') || '[]') } catch { return [] }
  })
  const [placeholderIdx, setIdx]        = useState(0)
  const inputRef                        = useRef(null)

  const isLoading   = phase === 'loading' || phase === 'streaming'
  const isIdle      = phase === 'idle'

  // Cycle placeholder text
  useEffect(() => {
    if (!isIdle) return
    const id = setInterval(() => {
      setIdx(i => (i + 1) % PLACEHOLDER_TOPICS.length)
    }, 3000)
    return () => clearInterval(id)
  }, [isIdle])

  const handleSubmit = (e) => {
    e.preventDefault()
    const topic = input.trim()
    if (!topic || isLoading) return
    saveSearch(topic)
    onSubmit(topic)
  }

  const handleSelect = (topic) => {
    setInput(topic)
    inputRef.current?.focus()
  }

  const saveSearch = (topic) => {
    const updated = [topic, ...recentSearches.filter(s => s !== topic)].slice(0, 8)
    setRecent(updated)
    localStorage.setItem('recent_searches', JSON.stringify(updated))
  }

  const clearSearches = () => {
    setRecent([])
    localStorage.removeItem('recent_searches')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* Hero text */}
      {isIdle && (
        <div className="text-center mb-12 animate-slide-up">
          {/* Floating badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Gemini 2.0 Flash
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
            <span className="text-white">AI-Powered</span>
            <br />
            <span className="gradient-text">Research Intelligence</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Enter any topic and watch four specialized AI agents collaborate to deliver
            fact-checked research with executive summaries in seconds.
          </p>

          {/* Feature pills + Compare Mode button */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {[
              { icon: Brain,      text: '4 AI Agents' },
              { icon: Cpu,        text: 'Real-time Pipeline' },
              { icon: Sparkles,   text: 'Fact Verified' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-medium">
                <Icon className="w-3.5 h-3.5" />
                {text}
              </span>
            ))}
          </div>

          {/* Compare mode CTA */}
          {onCompareMode && (
            <button
              onClick={onCompareMode}
              id="hero-compare-btn"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/15
                         text-slate-300 text-sm font-medium hover:bg-cyan-500/10 hover:border-cyan-500/30
                         hover:text-cyan-300 transition-all duration-200 group"
            >
              <GitCompare className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
              Compare Two Topics
              <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold border border-cyan-500/30">NEW</span>
            </button>
          )}
        </div>
      )}

      {/* Search card */}
      <div className="glass-card p-6 sm:p-8 animate-fade-in shadow-2xl shadow-black/30">
        <form onSubmit={handleSubmit} className="flex gap-3" id="research-form">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
            <input
              ref={inputRef}
              id="research-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={PLACEHOLDER_TOPICS[placeholderIdx]}
              className="search-input pl-12"
              disabled={isLoading}
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn-primary"
            id="research-submit-btn"
          >
            {isLoading
              ? <><SpinnerIcon className="w-4 h-4" /> Researching</>
              : <><span className="hidden sm:inline">Research</span><ArrowRight className="w-4 h-4" /></>
            }
          </button>
        </form>
        {/* Error message */}
        {errorMsg && (
          <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-300 text-sm font-medium">Research Failed</p>
              <p className="text-red-400/80 text-xs mt-0.5">{errorMsg}</p>
            </div>
            <button onClick={onReset} className="text-red-400 hover:text-red-300 transition-colors" id="error-reset-btn">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Progress hint during streaming */}
        {isLoading && (
          <div className="mt-4 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Agents are processing...</span>
              <span>Please wait</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full progress-shimmer rounded-full w-full" />
            </div>
          </div>
        )}
      </div>

      {/* Recent searches — only show on idle */}
      {isIdle && (
        <div className="mt-6">
          <RecentSearches
            searches={recentSearches}
            onSelect={handleSelect}
            onClear={clearSearches}
          />
        </div>
      )}
    </div>
  )
}
