import React, { useState } from 'react'
import {
  FileText, Search, ShieldCheck, BarChart3, CheckCircle2,
  TrendingUp, AlertTriangle, Target, Lightbulb, Star, Download, Network
} from 'lucide-react'
import { SkeletonBlock } from './LoadingSpinner'
import MindMap from './MindMap'

const TABS = [
  { id: 'summary',   label: 'Executive Summary', icon: FileText },
  { id: 'findings',  label: 'Key Findings',       icon: Search },
  { id: 'facts',     label: 'Verified Facts',      icon: ShieldCheck },
  { id: 'report',    label: 'Final Report',        icon: BarChart3 },
  { id: 'mindmap',   label: 'Mind Map',            icon: Network },
]

function ConfidenceBar({ score }) {
  const pct = Math.round(score * 100)
  const color = pct >= 85 ? 'from-emerald-500 to-emerald-400'
              : pct >= 70 ? 'from-amber-500 to-amber-400'
              : 'from-red-500 to-red-400'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold ${pct >= 85 ? 'text-emerald-400' : pct >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
        {pct}%
      </span>
    </div>
  )
}

function SummaryTab({ data }) {
  if (!data?.summary) return <SkeletonBlock />
  const { executive_summary, key_insights } = data.summary
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Executive summary */}
      <div className="p-5 rounded-2xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-amber-300" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Executive Summary
          </h3>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{executive_summary}</p>
      </div>

      {/* Key insights grid */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Key Insights
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {key_insights?.map((insight, i) => (
            <div key={i} className="glass-card p-4 transition-all duration-200 hover:border-amber-500/25 group">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full text-amber-400 text-xs font-bold flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                  {i + 1}
                </span>
                <p className="text-slate-300 text-sm leading-relaxed">{insight}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FindingsTab({ data }) {
  if (!data?.research) return <SkeletonBlock />
  const { key_information, sources_summary } = data.research
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          Key Information
        </h3>
        <div className="space-y-2">
          {key_information?.map((item, i) => (
            <div key={i} className="flex gap-3 p-4 glass-card hover:border-indigo-500/25 transition-all duration-200">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-slate-300 text-sm leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>
      {sources_summary && (
        <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <p className="text-xs font-bold text-indigo-400 mb-1.5 uppercase tracking-widest">Sources Overview</p>
          <p className="text-slate-400 text-sm leading-relaxed">{sources_summary}</p>
        </div>
      )}
    </div>
  )
}

function FactsTab({ data }) {
  if (!data?.fact_check) return <SkeletonBlock />
  const { verified_facts, confidence_score, caveats } = data.fact_check
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Confidence bar */}
      <div className="p-5 rounded-2xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-bold text-emerald-300" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Fact-Check Confidence
          </span>
        </div>
        <ConfidenceBar score={confidence_score ?? 0} />
      </div>

      {/* Verified facts */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Verified Facts
        </h3>
        <div className="space-y-2">
          {verified_facts?.map((fact, i) => (
            <div key={i} className="flex gap-3 p-4 glass-card hover:border-emerald-500/25 transition-all duration-200">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-2" />
              <p className="text-slate-300 text-sm leading-relaxed">{fact}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Caveats */}
      {caveats?.length > 0 && (
        <div className="p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-amber-300" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Caveats & Limitations
            </span>
          </div>
          <ul className="space-y-1.5">
            {caveats.map((caveat, i) => (
              <li key={i} className="text-slate-400 text-sm leading-relaxed flex gap-2">
                <span className="text-amber-500 flex-shrink-0">•</span>
                {caveat}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function ReportTab({ data }) {
  if (!data?.report) return <SkeletonBlock />
  const { conclusion, recommendations } = data.report
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Conclusion */}
      <div className="p-5 rounded-2xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-amber-300" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Final Conclusion
          </h3>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{conclusion}</p>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          Recommendations
        </h3>
        <div className="space-y-2">
          {recommendations?.map((rec, i) => (
            <div key={i} className="flex gap-3 p-4 glass-card hover:border-indigo-500/25 transition-all duration-200">
              <span className="flex-shrink-0 w-6 h-6 rounded-full text-indigo-400 text-xs font-bold flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                {i + 1}
              </span>
              <p className="text-slate-300 text-sm leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ResearchOutput({ report, phase }) {
  const [activeTab, setActiveTab] = useState('summary')
  const isLoading = phase === 'streaming' || phase === 'loading'

  const handleExport = () => {
    if (!report) return
    const text = JSON.stringify(report, null, 2)
    const blob = new Blob([text], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `research-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="glass-card p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-white flex items-center gap-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <FileText className="w-4 h-4 text-indigo-400" />
          Research Output
        </h2>
        {phase === 'complete' && (
          <button onClick={handleExport} className="btn-secondary text-xs" id="export-report-btn">
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-5 overflow-x-auto" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            id={`tab-${id}`}
            className={`tab-item flex items-center gap-1.5 whitespace-nowrap flex-1 justify-center
              ${activeTab === id ? 'tab-item-active' : ''}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="custom-scroll overflow-y-auto" style={{ maxHeight: '500px' }}>
        {isLoading && !report ? (
          <div className="space-y-4 animate-fade-in">
            <p className="text-xs text-slate-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Generating research output...
            </p>
            <SkeletonBlock /><SkeletonBlock />
          </div>
        ) : (
          <>
            {activeTab === 'summary'  && <SummaryTab  data={report} />}
            {activeTab === 'findings' && <FindingsTab data={report} />}
            {activeTab === 'facts'    && <FactsTab    data={report} />}
            {activeTab === 'report'   && <ReportTab   data={report} />}
            {activeTab === 'mindmap'  && (
              <div className="animate-fade-in">
                <p className="text-xs text-slate-600 mb-3 flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5" />
                  Interactive mind map — drag to pan, scroll to zoom, hover nodes for full text
                </p>
                <MindMap report={report} topic={report?.topic || 'Research'} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
