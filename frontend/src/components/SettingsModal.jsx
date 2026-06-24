import React, { useState, useEffect, useRef } from 'react'
import {
  Settings, X, Key, Cpu, Save, CheckCircle2,
  Eye, EyeOff, AlertTriangle, ExternalLink, RefreshCw, Zap, Bot
} from 'lucide-react'

/* ─── Provider definitions ───────────────────────────────────────── */
const PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: '✨',
    color: 'cyan',
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-500/10',
    ring: 'ring-cyan-500/40',
    text: 'text-cyan-300',
    badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    keyLink: { label: 'Google AI Studio', url: 'https://aistudio.google.com/app/apikey' },
    keyPlaceholder: 'AIza... or AO...',
    note: 'Free tier available · 15 RPM · 1,500 RPD per model',
    noteColor: 'text-amber-300/80',
    noteBg: 'bg-amber-500/8 border-amber-500/20',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '🤖',
    color: 'emerald',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10',
    ring: 'ring-emerald-500/40',
    text: 'text-emerald-300',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    keyLink: { label: 'OpenAI Platform', url: 'https://platform.openai.com/api-keys' },
    keyPlaceholder: 'sk-...',
    note: 'Paid service · billing required at platform.openai.com',
    noteColor: 'text-blue-300/80',
    noteBg: 'bg-blue-500/8 border-blue-500/20',
  },
]

/* ─── Model lists ────────────────────────────────────────────────── */
const GEMINI_MODELS = [
  { id: 'gemini-2.5-flash',      label: 'Gemini 2.5 Flash',      badge: 'Recommended', color: 'emerald' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', badge: 'Fastest',     color: 'cyan' },
  { id: 'gemini-2.0-flash',      label: 'Gemini 2.0 Flash',      badge: 'Stable',      color: 'violet' },
  { id: 'gemini-2.5-pro',        label: 'Gemini 2.5 Pro',        badge: 'Best Quality', color: 'amber' },
]

const OPENAI_MODELS = [
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', badge: 'Recommended', color: 'emerald' },
  { id: 'gpt-4o',      label: 'GPT-4o',      badge: 'Most Capable', color: 'amber' },
  { id: 'gpt-4-turbo', label: 'GPT-4 Turbo', badge: 'Powerful',     color: 'violet' },
  { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', badge: 'Legacy',    color: 'cyan' },
]

const BADGE = {
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  cyan:    'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  violet:  'bg-violet-500/15 text-violet-400 border-violet-500/30',
  amber:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
}

/* ─── Model Grid ─────────────────────────────────────────────────── */
function ModelGrid({ models, selected, onChange, activeColor }) {
  const activeBorder = activeColor === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/40 shadow-emerald-500/10'
                     : 'bg-cyan-500/10 border-cyan-500/40 shadow-cyan-500/10'
  return (
    <div className="grid grid-cols-2 gap-2">
      {models.map(m => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          id={`settings-model-${m.id}`}
          className={`p-3 rounded-xl border text-left transition-all duration-200
            ${selected === m.id
              ? `${activeBorder} shadow-lg`
              : 'bg-white/3 border-white/10 hover:bg-white/6 hover:border-white/20'}`}
        >
          <div className="flex items-start justify-between gap-1 mb-1">
            <span className={`text-xs font-semibold leading-tight ${selected === m.id ? 'text-white' : 'text-slate-400'}`}>
              {m.label}
            </span>
            {selected === m.id && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
          </div>
          <span className={`inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${BADGE[m.color]}`}>
            {m.badge}
          </span>
        </button>
      ))}
    </div>
  )
}

/* ─── SettingsModal ──────────────────────────────────────────────── */
export default function SettingsModal({ isOpen, onClose }) {
  const [provider, setProvider]       = useState('gemini')
  // Gemini
  const [geminiKey, setGeminiKey]     = useState('')
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash')
  const [showGeminiKey, setShowGK]    = useState(false)
  // OpenAI
  const [openaiKey, setOpenaiKey]     = useState('')
  const [openaiModel, setOpenaiModel] = useState('gpt-4o-mini')
  const [showOpenaiKey, setShowOK]    = useState(false)
  // UI state
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)
  const [testing, setTesting]         = useState(false)
  const [testResult, setTestResult]   = useState(null)   // null | 'ok' | 'error'
  const [testMsg, setTestMsg]         = useState('')
  const overlayRef                    = useRef(null)

  const activeProvider = PROVIDERS.find(p => p.id === provider)
  const models = provider === 'openai' ? OPENAI_MODELS : GEMINI_MODELS
  const activeModel = provider === 'openai' ? openaiModel : geminiModel
  const setActiveModel = provider === 'openai' ? setOpenaiModel : setGeminiModel

  /* Load from localStorage */
  useEffect(() => {
    if (!isOpen) return
    setProvider(localStorage.getItem('provider') || 'gemini')
    setGeminiKey(localStorage.getItem('gemini_api_key') || '')
    setGeminiModel(localStorage.getItem('gemini_model') || 'gemini-2.5-flash')
    setOpenaiKey(localStorage.getItem('openai_api_key') || '')
    setOpenaiModel(localStorage.getItem('openai_model') || 'gpt-4o-mini')
    setSaved(false)
    setTestResult(null)
  }, [isOpen])

  /* Close on overlay / Escape */
  const handleOverlayClick = e => { if (e.target === overlayRef.current) onClose() }
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  /* Save */
  const handleSave = async () => {
    setSaving(true)
    localStorage.setItem('provider', provider)
    localStorage.setItem('gemini_api_key', geminiKey)
    localStorage.setItem('gemini_model', geminiModel)
    localStorage.setItem('openai_api_key', openaiKey)
    localStorage.setItem('openai_model', openaiModel)

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          api_key:        geminiKey,
          model:          geminiModel,
          openai_api_key: openaiKey,
          openai_model:   openaiModel,
        }),
      })
    } catch (_) {}

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  /* Test */
  const handleTest = async () => {
    const key = provider === 'openai' ? openaiKey : geminiKey
    if (!key.trim()) {
      setTestResult('error')
      setTestMsg('Please enter an API key first.')
      return
    }
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          api_key:        geminiKey,
          model:          geminiModel,
          openai_api_key: openaiKey,
          openai_model:   openaiModel,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setTestResult('ok')
        setTestMsg(`✅ Connected! Model "${data.model}" responded: "${data.response}"`)
      } else {
        setTestResult('error')
        setTestMsg(data.error || 'Connection failed.')
      }
    } catch {
      setTestResult('error')
      setTestMsg('Could not reach backend. Is the server running?')
    }
    setTesting(false)
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-lg glass-card border border-white/15 shadow-2xl shadow-black/50 animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border border-cyan-500/30 flex items-center justify-center">
              <Settings className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Settings</h2>
              <p className="text-xs text-slate-500">Configure your AI provider and model</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            id="settings-close-btn">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scroll">

          {/* ── Provider Toggle ── */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
              <Bot className="w-3.5 h-3.5 text-violet-400" />
              AI Provider
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PROVIDERS.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setProvider(p.id); setTestResult(null) }}
                  id={`settings-provider-${p.id}`}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200
                    ${provider === p.id
                      ? `${p.bg} ${p.border} ring-1 ${p.ring} shadow-lg`
                      : 'bg-white/3 border-white/10 hover:bg-white/6 hover:border-white/20'}`}
                >
                  <span className="text-2xl">{p.icon}</span>
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${provider === p.id ? p.text : 'text-slate-400'}`}>
                      {p.name}
                    </p>
                    {provider === p.id && (
                      <p className="text-[10px] text-slate-500">Active provider</p>
                    )}
                  </div>
                  {provider === p.id && (
                    <CheckCircle2 className={`w-4 h-4 ml-auto flex-shrink-0 ${p.text}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── API Key (dynamic by provider) ── */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              {activeProvider.name} API Key
            </label>
            <div className="relative">
              <input
                id={`settings-${provider}-key-input`}
                type={(provider === 'openai' ? showOpenaiKey : showGeminiKey) ? 'text' : 'password'}
                value={provider === 'openai' ? openaiKey : geminiKey}
                onChange={e => provider === 'openai' ? setOpenaiKey(e.target.value) : setGeminiKey(e.target.value)}
                placeholder={activeProvider.keyPlaceholder}
                className="search-input pr-12 font-mono text-sm"
              />
              <button
                onClick={() => provider === 'openai' ? setShowOK(v => !v) : setShowGK(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                id="settings-toggle-key-visibility">
                {(provider === 'openai' ? showOpenaiKey : showGeminiKey)
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-slate-600">
                Get your key from{' '}
                <a href={activeProvider.keyLink.url} target="_blank" rel="noopener noreferrer"
                  className="text-cyan-600 hover:text-cyan-400 inline-flex items-center gap-1 transition-colors">
                  {activeProvider.keyLink.label} <ExternalLink className="w-3 h-3" />
                </a>
              </p>
              <button
                onClick={handleTest}
                disabled={testing}
                className="flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 disabled:opacity-50 transition-colors"
                id="settings-test-btn">
                <RefreshCw className={`w-3 h-3 ${testing ? 'animate-spin' : ''}`} />
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {/* Test result */}
            {testResult && (
              <div className={`mt-3 p-3 rounded-lg text-xs animate-fade-in flex items-start gap-2
                ${testResult === 'ok'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                  : 'bg-red-500/10 border border-red-500/20 text-red-300'}`}>
                {testResult === 'ok'
                  ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  : <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
                {testMsg}
              </div>
            )}
          </div>

          {/* ── Model Selection (dynamic by provider) ── */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              Active Model
            </label>
            <ModelGrid
              models={models}
              selected={activeModel}
              onChange={setActiveModel}
              activeColor={activeProvider.color}
            />
          </div>

          {/* ── Provider note ── */}
          <div className={`p-3 rounded-xl border ${activeProvider.noteBg}`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className={`text-xs ${activeProvider.noteColor}`}>{activeProvider.note}</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/10">
          {/* Active provider indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="text-base">{activeProvider.icon}</span>
            <span>Using <span className={`font-semibold ${activeProvider.text}`}>{activeProvider.name}</span></span>
            <span className="text-slate-700">·</span>
            <span className="font-mono text-slate-600">{activeModel}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn-secondary text-sm" id="settings-cancel-btn">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm" id="settings-save-btn">
              {saved
                ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                : saving
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                : <><Save className="w-4 h-4" /> Save Settings</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
