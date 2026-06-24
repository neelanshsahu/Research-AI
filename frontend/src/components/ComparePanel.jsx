import React from 'react'
import {
  Search, Microscope, ShieldCheck, FileText, BarChart3,
  CheckCircle2, Clock, XCircle, ArrowRight, Lightbulb,
  Target, TrendingUp
} from 'lucide-react'
import { PulsingDot, SpinnerIcon, SkeletonBlock } from './LoadingSpinner'

/* ─── Mini Agent Row ─────────────────────────────────────────────── */
const AGENTS = [
  { key: 'research',   label: 'Research',    icon: Microscope,  color: 'cyan' },
  { key: 'fact_check', label: 'Fact Check',  icon: ShieldCheck, color: 'violet' },
  { key: 'summary',    label: 'Summary',     icon: FileText,    color: 'amber' },
  { key: 'report',     label: 'Report',      icon: BarChart3,   color: 'emerald' },
]

const COLORS = {
  cyan:    { icon: 'text-cyan-400',    border: 'border-cyan-500/40',    bg: 'bg-cyan-500/15' },
  violet:  { icon: 'text-violet-400',  border: 'border-violet-500/40',  bg: 'bg-violet-500/15' },
  amber:   { icon: 'text-amber-400',   border: 'border-amber-500/40',   bg: 'bg-amber-500/15' },
  emerald: { icon: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/15' },
}

function MiniAgentBar({ agents }) {
  return (
    <div className="flex gap-1.5">
      {AGENTS.map((a, idx) => {
        const state = agents[a.key]
        const c = COLORS[a.color]
        const isRunning = state?.status === 'running'
        const isDone    = state?.status === 'done'
        return (
          <React.Fragment key={a.key}>
            <div className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-300
              ${isRunning ? `${c.bg} ${c.border} ring-1 ring-current ring-opacity-30` : isDone ? `${c.bg} ${c.border} opacity-80` : 'bg-white/3 border-white/8 opacity-40'}`}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-black/20">
                {isRunning
                  ? <SpinnerIcon className={`w-3.5 h-3.5 ${c.icon}`} />
                  : isDone
                  ? <CheckCircle2 className={`w-3.5 h-3.5 ${c.icon}`} />
                  : <a.icon className="w-3.5 h-3.5 text-slate-600" />
                }
              </div>
              <span className={`text-[9px] font-medium leading-none ${isDone || isRunning ? 'text-slate-300' : 'text-slate-600'}`}>
                {a.label}
              </span>
              {isRunning && <PulsingDot color={`bg-${a.color}-400`} />}
              {isDone    && <div className={`w-1.5 h-1.5 rounded-full ${c.bg.replace('bg-', 'bg-')} ${c.icon.replace('text-', 'bg-').replace('400', '400')}`} />}
            </div>
            {idx < AGENTS.length - 1 && (
              <div className="flex items-center">
                <ArrowRight className={`w-2.5 h-2.5 transition-colors duration-300 ${isDone ? c.icon : 'text-slate-700'}`} />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

/* ─── Mini Output ─────────────────────────────────────────────────── */
function MiniOutput({ report }) {
  if (!report) return null

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Executive Summary */}
      {report.summary?.executive_summary && (
        <div className="p-3 rounded-xl bg-cyan-500/8 border border-cyan-500/20">
          <p className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" /> Summary
          </p>
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
            {report.summary.executive_summary}
          </p>
        </div>
      )}

      {/* Key Insights */}
      {report.summary?.key_insights?.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Key Insights
          </p>
          <div className="space-y-1.5">
            {report.summary.key_insights.slice(0, 3).map((insight, i) => (
              <div key={i} className="flex gap-2 p-2 rounded-lg bg-white/4 border border-white/8">
                <span className="w-4 h-4 rounded-full bg-violet-500/20 text-violet-400 text-[9px] font-bold flex items-center justify-center flex-shrink-0 border border-violet-500/30">
                  {i + 1}
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conclusion */}
      {report.report?.conclusion && (
        <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
          <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <Target className="w-3 h-3" /> Conclusion
          </p>
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
            {report.report.conclusion}
          </p>
        </div>
      )}

      {/* Confidence */}
      {report.fact_check?.confidence_score !== undefined && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/4 border border-white/8">
          <span className="text-[10px] text-slate-500 font-medium">Fact-check confidence</span>
          <span className={`text-xs font-bold ${report.fact_check.confidence_score >= 0.85 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {Math.round(report.fact_check.confidence_score * 100)}%
          </span>
        </div>
      )}
    </div>
  )
}

/* ─── ComparePanel ────────────────────────────────────────────────── */
export default function ComparePanel({ research, side, accentColor }) {
  const { phase, topic, agents, report, errorMsg, startResearch } = research
  const [inputVal, setInputVal] = React.useState('')
  const label = side === 'left' ? 'Topic A' : 'Topic B'
  const isLoading = phase === 'loading' || phase === 'streaming'
  const isDone = phase === 'complete'

  const borderColor = accentColor === 'amber'
    ? 'border-amber-500/30 shadow-amber-500/10'
    : 'border-indigo-500/30 shadow-indigo-500/10'
  const textColor = accentColor === 'amber' ? 'text-amber-400' : 'text-indigo-400'
  const badgeBg = accentColor === 'amber' ? 'bg-amber-500/15 border-amber-500/30' : 'bg-indigo-500/15 border-indigo-500/30'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputVal.trim() || isLoading) return
    startResearch(inputVal.trim())
  }

  return (
    <div className={`flex flex-col glass-card border ${isDone ? borderColor + ' shadow-lg' : ''} overflow-hidden`}>
      {/* Panel header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8">
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeBg} ${textColor}`}>
          {label}
        </span>
        {topic && (
          <span className="text-xs text-slate-400 truncate font-medium">{topic}</span>
        )}
        {isDone && <CheckCircle2 className={`w-3.5 h-3.5 ml-auto flex-shrink-0 ${textColor}`} />}
      </div>

      {/* Search */}
      <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-b border-white/8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder={`Enter ${label} topic...`}
            disabled={isLoading}
            className="search-input pl-9 py-2.5 text-sm"
            id={`compare-input-${side}`}
          />
        </div>
        <button
          type="submit"
          disabled={!inputVal.trim() || isLoading}
          className="btn-primary py-2 px-3 text-sm"
          id={`compare-submit-${side}`}
        >
          {isLoading ? <SpinnerIcon className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
        </button>
      </form>

      {/* Content */}
      <div className="flex-1 p-3 overflow-y-auto custom-scroll" style={{ minHeight: '300px', maxHeight: '520px' }}>
        {phase === 'idle' && (
          <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
            <div className={`w-10 h-10 rounded-xl ${badgeBg} border ${borderColor.split(' ')[0]} flex items-center justify-center`}>
              <Search className={`w-5 h-5 ${textColor}`} />
            </div>
            <p className="text-xs text-slate-500">Enter a topic above to start research</p>
          </div>
        )}

        {(isLoading || isDone) && (
          <div className="space-y-3">
            <MiniAgentBar agents={agents} />
            {/* Loading skeleton */}
            {isLoading && !report && (
              <div className="mt-3 space-y-2">
                <SkeletonBlock />
              </div>
            )}
            {/* Results */}
            {report && <MiniOutput report={report} />}
          </div>
        )}

        {phase === 'error' && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
            <XCircle className="w-3.5 h-3.5 inline mr-1.5" />
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  )
}
