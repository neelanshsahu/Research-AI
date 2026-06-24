import React, { useState } from 'react'
import { useResearch } from './hooks/useResearch'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import AgentPipeline from './components/AgentPipeline'
import ResearchOutput from './components/ResearchOutput'
import CompareView from './components/CompareView'
import { RotateCcw, BookOpen, GitCompare, Zap } from 'lucide-react'

export default function App() {
  const { phase, topic, agents, report, errorMsg, startResearch, reset } = useResearch()
  const [mode, setMode] = useState('single') // 'single' | 'compare'

  const showPipeline = phase !== 'idle'
  const showOutput   = phase === 'streaming' || phase === 'complete'

  const switchToCompare = () => {
    reset()
    setMode('compare')
  }
  const switchToSingle = () => {
    setMode('single')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onReset={() => { reset(); setMode('single') }} showReset={phase !== 'idle' || mode === 'compare'} />

      <main className="flex-1">

        {/* ── Compare Mode ─────────────────────────────── */}
        {mode === 'compare' && (
          <CompareView onExit={switchToSingle} />
        )}

        {/* ── Single Research Mode ──────────────────────── */}
        {mode === 'single' && (
          <>
            {/* Active research banner */}
            {showPipeline && (
              <div className="border-b border-white/8 bg-slate-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <BookOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Research Topic</p>
                        <h2 className="text-sm sm:text-base font-semibold text-white truncate">{topic}</h2>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={switchToCompare}
                        className="btn-secondary text-xs hidden sm:flex"
                        id="switch-to-compare-btn"
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                        Compare Mode
                      </button>
                      <button
                        onClick={reset}
                        className="btn-secondary text-xs"
                        id="new-research-btn"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">New Research</span>
                        <span className="sm:hidden">Reset</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search dashboard */}
            <Dashboard
              onSubmit={startResearch}
              phase={phase}
              errorMsg={errorMsg}
              onReset={reset}
              onCompareMode={switchToCompare}
            />

            {/* Agent pipeline + output */}
            {showPipeline && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
                <AgentPipeline agents={agents} phase={phase} />
                {showOutput && (
                  <ResearchOutput report={report} phase={phase} />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/8 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-600">
            © 2024 ResearchAI — Multi-Agent Research Platform
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-600" />
              Gemini 2.5 Flash
            </span>
            <span>·</span>
            <span>FastAPI · React · Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
