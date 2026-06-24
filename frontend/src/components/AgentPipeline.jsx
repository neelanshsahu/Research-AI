import React from 'react'
import {
  Search, Microscope, ShieldCheck, FileText, BarChart3,
  CheckCircle2, Clock, XCircle, Zap, ArrowRight
} from 'lucide-react'
import { PulsingDot, SpinnerIcon } from './LoadingSpinner'

const AGENT_CONFIG = [
  {
    key: 'research',
    name: 'Research Agent',
    role: 'Information Extraction',
    icon: Microscope,
    color: 'amber',
    description: 'Scans knowledge domains and extracts key facts',
  },
  {
    key: 'fact_check',
    name: 'Fact Check Agent',
    role: 'Data Validation',
    icon: ShieldCheck,
    color: 'indigo',
    description: 'Cross-validates findings for accuracy',
  },
  {
    key: 'summary',
    name: 'Summary Agent',
    role: 'Insight Generation',
    icon: FileText,
    color: 'emerald',
    description: 'Synthesizes concise executive insights',
  },
  {
    key: 'report',
    name: 'Report Agent',
    role: 'Report Compilation',
    icon: BarChart3,
    color: 'rose',
    description: 'Compiles final report & recommendations',
  },
]

const COLOR_MAP = {
  amber:   { ring: 'ring-amber-500/30',   bg: 'bg-amber-500/12',   icon: 'text-amber-400',   border: 'border-amber-500/30',   glow: 'shadow-amber-500/20',  dot: 'bg-amber-400' },
  indigo:  { ring: 'ring-indigo-500/30',  bg: 'bg-indigo-500/12',  icon: 'text-indigo-400',  border: 'border-indigo-500/30',  glow: 'shadow-indigo-500/20', dot: 'bg-indigo-400' },
  emerald: { ring: 'ring-emerald-500/30', bg: 'bg-emerald-500/12', icon: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20',dot: 'bg-emerald-400' },
  rose:    { ring: 'ring-rose-500/30',    bg: 'bg-rose-500/12',    icon: 'text-rose-400',    border: 'border-rose-500/30',    glow: 'shadow-rose-500/20',   dot: 'bg-rose-400' },
}

function StatusBadge({ status }) {
  if (status === 'running') return (
    <span className="badge-running">
      <PulsingDot color="bg-amber-400" />
      Running
    </span>
  )
  if (status === 'done') return (
    <span className="badge-done">
      <CheckCircle2 className="w-3 h-3" />
      Done
    </span>
  )
  if (status === 'error') return (
    <span className="badge-error">
      <XCircle className="w-3 h-3" />
      Error
    </span>
  )
  return (
    <span className="badge-idle">
      <Clock className="w-3 h-3" />
      Idle
    </span>
  )
}

function AgentCard({ config, agentState, index }) {
  const { key, name, role, icon: Icon, color } = config
  const { status, message } = agentState
  const colors = COLOR_MAP[color]

  const isRunning = status === 'running'
  const isDone    = status === 'done'
  const isIdle    = status === 'idle'

  return (
    <div
      className={`
        relative flex flex-col glass-card p-5 transition-all duration-500
        ${isRunning ? `border ${colors.border} shadow-xl ${colors.glow} ring-2 ${colors.ring}` : ''}
        ${isDone ? `border ${colors.border} opacity-90` : ''}
        ${isIdle ? 'opacity-50' : ''}
      `}
      style={{ animationDelay: `${index * 0.1}s` }}
      id={`agent-card-${key}`}
    >
      {/* Step badge */}
      <div className={`absolute -top-3 -left-3 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border
        ${isDone
          ? 'bg-emerald-500 text-white border-emerald-400'
          : isRunning
          ? `${colors.bg} ${colors.icon} ${colors.border}`
          : 'bg-slate-900 text-slate-600 border-slate-700'}`}>
        {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : index + 1}
      </div>

      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-4
        ${isRunning ? 'ring-pulse' : ''} transition-all duration-300`}>
        {isRunning
          ? <SpinnerIcon className={`w-5 h-5 ${colors.icon}`} />
          : <Icon className={`w-5 h-5 ${isDone ? colors.icon : 'text-slate-600'}`} />
        }
      </div>

      {/* Name & Role */}
      <h3 className={`font-semibold text-sm mb-0.5 transition-colors duration-300 ${isDone || isRunning ? 'text-white' : 'text-slate-500'}`}
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        {name}
      </h3>
      <p className={`text-xs mb-3 transition-colors duration-300 ${isRunning ? colors.icon : isDone ? 'text-slate-500' : 'text-slate-700'}`}>
        {role}
      </p>

      <StatusBadge status={status} />

      {message && (isRunning || isDone) && (
        <p className="mt-3 text-xs text-slate-600 leading-relaxed line-clamp-2">{message}</p>
      )}

      {/* Done indicator bar */}
      {isDone && (
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl opacity-50`}
          style={{ background: `linear-gradient(90deg, transparent, var(--tw-gradient-stops))` }}
        />
      )}
    </div>
  )
}

export default function AgentPipeline({ agents, phase }) {
  return (
    <div className="glass-card p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <Zap className="w-4 h-4 text-amber-400" />
            Agent Pipeline
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {phase === 'streaming' ? 'Agents are processing your research...' : 'Four specialized agents working in sequence'}
          </p>
        </div>
        {phase === 'complete' && (
          <span className="badge-done animate-fade-in">
            <CheckCircle2 className="w-3 h-3" />
            All agents complete
          </span>
        )}
      </div>

      {/* Agent cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-3 relative">
        {AGENT_CONFIG.map((config, idx) => (
          <React.Fragment key={config.key}>
            <AgentCard config={config} agentState={agents[config.key]} index={idx} />
            {idx < AGENT_CONFIG.length - 1 && (
              <div className="hidden lg:flex absolute items-center"
                style={{ left: `calc(${(idx + 1) * 25}% - 8px)`, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
                <ArrowRight className={`w-4 h-4 transition-colors duration-500
                  ${agents[AGENT_CONFIG[idx + 1].key]?.status !== 'idle' ? 'text-amber-500' : 'text-slate-800'}`}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Coordinator message */}
      {agents.coordinator?.status === 'running' && (
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 animate-fade-in">
          <SpinnerIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>{agents.coordinator.message || 'Coordinator is orchestrating the pipeline...'}</span>
        </div>
      )}
    </div>
  )
}
