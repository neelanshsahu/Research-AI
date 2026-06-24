import React, { useState, useCallback } from 'react'
import {
  GitCompare, RotateCcw, ChevronDown, ChevronUp,
  CheckCircle2, TrendingUp, ShieldCheck, Target, Lightbulb,
  ArrowRight, Minus, Sparkles, Zap, Trophy, AlertCircle,
  RefreshCw, ArrowLeftRight, Star
} from 'lucide-react'
import { useResearch } from '../hooks/useResearch'
import ComparePanel from './ComparePanel'

/* ─── Dimension Diff Row ─────────────────────────────────────────── */
function DiffRow({ dimension, topicA, topicB, labelA, labelB }) {
  return (
    <div className="group">
      {/* Dimension label */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
        <span className="text-[11px] font-bold text-amber-400/80 uppercase tracking-widest">{dimension}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Topic A */}
        <div className="p-3 rounded-xl bg-amber-500/6 border border-amber-500/15">
          <p className="text-[9px] font-bold text-amber-500/60 uppercase tracking-widest mb-1.5">{labelA}</p>
          <p className="text-xs text-slate-300 leading-relaxed">{topicA}</p>
        </div>
        {/* Topic B */}
        <div className="p-3 rounded-xl bg-indigo-500/6 border border-indigo-500/15">
          <p className="text-[9px] font-bold text-indigo-400/60 uppercase tracking-widest mb-1.5">{labelB}</p>
          <p className="text-xs text-slate-300 leading-relaxed">{topicB}</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Simple comparison table (metric rows) ─────────────────────── */
function MetricRow({ label, leftVal, rightVal, icon: Icon }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/2 transition-colors">
      <td className="py-3 px-4 text-xs font-medium text-slate-500 whitespace-nowrap">
        <span className="flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-amber-500/70" />}
          {label}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-slate-300 leading-relaxed max-w-xs">{leftVal ?? <Minus className="w-3 h-3 text-slate-700" />}</td>
      <td className="py-3 px-4 text-xs text-slate-300 leading-relaxed max-w-xs">{rightVal ?? <Minus className="w-3 h-3 text-slate-700" />}</td>
    </tr>
  )
}

/* ─── AI Differences Panel ───────────────────────────────────────── */
function AIDifferencesPanel({ leftReport, rightReport, leftTopic, rightTopic }) {
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [expanded, setExpanded]     = useState(true)

  const runComparison = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/research/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_a:  leftTopic,
          topic_b:  rightTopic,
          report_a: leftReport,
          report_b: rightReport,
        }),
      })
      let data
      try {
        data = await res.json()
      } catch (e) {
        throw new Error(`Server returned invalid response: ${res.status} ${res.statusText}`)
      }
      if (!res.ok) {
        let errDetail = 'Comparison failed'
        if (data && data.detail) {
          errDetail = Array.isArray(data.detail) ? data.detail[0].msg : data.detail
        }
        throw new Error(errDetail)
      }
      setComparison(data.comparison)
    } catch (e) {
      setError(e.message || 'Failed to generate comparison')
    }
    setLoading(false)
  }, [leftReport, rightReport, leftTopic, rightTopic])

  return (
    <div className="glass-card overflow-hidden animate-fade-in"
      style={{ border: '1px solid rgba(245,158,11,0.2)', boxShadow: '0 0 40px rgba(245,158,11,0.05)' }}>

      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(99,102,241,0.2))', border: '1px solid rgba(245,158,11,0.3)' }}>
            <ArrowLeftRight className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              AI Differences Analysis
            </h3>
            <p className="text-xs text-slate-500">
              {comparison ? 'Powered by your active AI provider' : 'Click below to generate a deep comparison'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!comparison && !loading && (
            <button
              onClick={runComparison}
              id="run-comparison-btn"
              className="btn-primary text-xs py-2 px-4"
              style={{ fontSize: '12px', padding: '8px 16px' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Analyse Differences
            </button>
          )}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Analysing...
            </div>
          )}
          {comparison && (
            <button onClick={() => { setComparison(null); setError('') }}
              className="btn-secondary text-xs" style={{ fontSize: '11px' }}>
              <RefreshCw className="w-3 h-3" /> Redo
            </button>
          )}
          {comparison && (
            <button onClick={() => setExpanded(v => !v)}
              className="btn-secondary text-xs" style={{ fontSize: '11px', padding: '6px 10px' }}>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="m-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Prompt state */}
      {!comparison && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-xs text-slate-500 text-center max-w-xs leading-relaxed">
            Both topics are researched. Click <strong className="text-amber-400">Analyse Differences</strong> to get an AI-generated breakdown of similarities, key differences, and strengths.
          </p>
        </div>
      )}

      {/* Results */}
      {comparison && expanded && (
        <div className="p-5 space-y-6 animate-fade-in">

          {/* Similarities */}
          {comparison.similarities?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> What they have in common
              </h4>
              <div className="space-y-2">
                {comparison.similarities.map((s, i) => (
                  <div key={i} className="flex gap-2.5 p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                    <p className="text-xs text-slate-300 leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key differences table */}
          {comparison.key_differences?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <ArrowLeftRight className="w-3.5 h-3.5" /> Key differences
              </h4>
              {comparison.key_differences.map((diff, i) => (
                <DiffRow
                  key={i}
                  dimension={diff.dimension}
                  topicA={diff.topic_a}
                  topicB={diff.topic_b}
                  labelA={leftTopic}
                  labelB={rightTopic}
                />
              ))}
            </div>
          )}

          {/* Strengths side by side */}
          {(comparison.topic_a_strengths?.length > 0 || comparison.topic_b_strengths?.length > 0) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Star className="w-3 h-3" /> {leftTopic} strengths
                </h4>
                <div className="space-y-1.5">
                  {comparison.topic_a_strengths?.map((s, i) => (
                    <div key={i} className="flex gap-2 p-2.5 rounded-lg" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
                      <Trophy className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-400 leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Star className="w-3 h-3" /> {rightTopic} strengths
                </h4>
                <div className="space-y-1.5">
                  {comparison.topic_b_strengths?.map((s, i) => (
                    <div key={i} className="flex gap-2 p-2.5 rounded-lg" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                      <Trophy className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-400 leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Verdict */}
          {comparison.verdict && (
            <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(99,102,241,0.08))', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Zap className="w-3 h-3" /> Verdict
              </p>
              <p className="text-sm text-slate-200 leading-relaxed" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {comparison.verdict}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Quick Metrics Table ────────────────────────────────────────── */
function QuickMetricsTable({ leftReport, rightReport, leftTopic, rightTopic }) {
  const [expanded, setExpanded] = useState(false)
  const lf = leftReport?.fact_check
  const rf = rightReport?.fact_check
  const ls = leftReport?.summary
  const rs = rightReport?.summary
  const lr = leftReport?.report
  const rr = rightReport?.report

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between p-4 border-b border-white/8 hover:bg-white/2 transition-colors"
      >
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Quick Metrics
          </span>
          <span className="text-xs text-slate-600">Side-by-side data</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="py-3 px-4 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-wider w-36">Metric</th>
                <th className="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(245,158,11,0.7)' }}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    {leftTopic}
                  </span>
                </th>
                <th className="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(99,102,241,0.7)' }}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    {rightTopic}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <MetricRow label="Confidence" icon={ShieldCheck}
                leftVal={lf ? <span className={`font-bold ${lf.confidence_score >= 0.85 ? 'text-emerald-400' : 'text-amber-400'}`}>{Math.round(lf.confidence_score * 100)}%</span> : null}
                rightVal={rf ? <span className={`font-bold ${rf.confidence_score >= 0.85 ? 'text-emerald-400' : 'text-amber-400'}`}>{Math.round(rf.confidence_score * 100)}%</span> : null}
              />
              <MetricRow label="Summary" icon={Lightbulb} leftVal={ls?.executive_summary} rightVal={rs?.executive_summary} />
              <MetricRow label="Top Insight" icon={TrendingUp} leftVal={ls?.key_insights?.[0]} rightVal={rs?.key_insights?.[0]} />
              <MetricRow label="Key Finding" icon={CheckCircle2} leftVal={leftReport?.research?.key_information?.[0]} rightVal={rightReport?.research?.key_information?.[0]} />
              <MetricRow label="Conclusion" icon={Target} leftVal={lr?.conclusion} rightVal={rr?.conclusion} />
              <MetricRow label="Top Recommendation" icon={ArrowRight} leftVal={lr?.recommendations?.[0]} rightVal={rr?.recommendations?.[0]} />
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ─── CompareView ────────────────────────────────────────────────── */
export default function CompareView({ onExit }) {
  const leftResearch  = useResearch()
  const rightResearch = useResearch()

  const bothDone = leftResearch.phase === 'complete' && rightResearch.phase === 'complete'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">

      {/* Top bar */}
      <div className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(99,102,241,0.2))', border: '1px solid rgba(245,158,11,0.3)' }}>
            <GitCompare className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Multi-Topic Comparison
            </h2>
            <p className="text-xs text-slate-500">Research two topics in parallel · AI-powered differences analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { leftResearch.reset(); rightResearch.reset() }} className="btn-secondary text-xs" id="compare-reset-btn">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={onExit} className="btn-secondary text-xs" id="compare-exit-btn">
            ← Single Mode
          </button>
        </div>
      </div>

      {/* Split panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
        <ComparePanel research={leftResearch}  side="left"  accentColor="amber" />
        <ComparePanel research={rightResearch} side="right" accentColor="indigo" />
      </div>

      {/* Progress hint */}
      {!bothDone && (leftResearch.phase !== 'idle' || rightResearch.phase !== 'idle') && (
        <p className="text-center text-xs text-slate-600 animate-fade-in">
          {leftResearch.phase === 'complete' && rightResearch.phase !== 'complete'
            ? '✅ Topic A done — search Topic B to unlock the AI differences analysis'
            : rightResearch.phase === 'complete' && leftResearch.phase !== 'complete'
            ? '✅ Topic B done — search Topic A to unlock the AI differences analysis'
            : 'Research both topics to unlock the AI differences analysis'}
        </p>
      )}

      {/* When both complete: show AI analysis + quick metrics */}
      {bothDone && (
        <>
          <AIDifferencesPanel
            leftReport={leftResearch.report}
            rightReport={rightResearch.report}
            leftTopic={leftResearch.topic}
            rightTopic={rightResearch.topic}
          />
          <QuickMetricsTable
            leftReport={leftResearch.report}
            rightReport={rightResearch.report}
            leftTopic={leftResearch.topic}
            rightTopic={rightResearch.topic}
          />
        </>
      )}
    </div>
  )
}
