import React from 'react'
import { GraduationCap, Briefcase, Newspaper, Baby } from 'lucide-react'

export const PERSONAS = [
  {
    id: 'academic',
    label: 'Academic',
    icon: GraduationCap,
    emoji: '🎓',
    description: 'Scholarly · Citations · Peer-reviewed',
    tone: 'Rigorous research with empirical evidence and methodology references.',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    border: 'border-blue-500/40',
    glow: 'shadow-blue-500/20',
    text: 'text-blue-300',
    badge: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    ring: 'ring-blue-500/50',
  },
  {
    id: 'executive',
    label: 'Executive',
    icon: Briefcase,
    emoji: '💼',
    description: 'Strategic · ROI-focused · Action-driven',
    tone: 'Business-oriented insights framed around competitive advantage and organizational impact.',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/40',
    glow: 'shadow-emerald-500/20',
    text: 'text-emerald-300',
    badge: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
    ring: 'ring-emerald-500/50',
  },
  {
    id: 'journalist',
    label: 'Journalist',
    icon: Newspaper,
    emoji: '📰',
    description: 'Narrative · Human impact · Story-driven',
    tone: 'Compelling stories covering who, what, why & how with real-world implications.',
    gradient: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/40',
    glow: 'shadow-amber-500/20',
    text: 'text-amber-300',
    badge: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    ring: 'ring-amber-500/50',
  },
  {
    id: 'eli5',
    label: 'ELI5',
    icon: Baby,
    emoji: '🧒',
    description: 'Simple · Analogies · Zero jargon',
    tone: 'Easy-to-understand explanations with relatable analogies for any audience.',
    gradient: 'from-pink-500/20 to-rose-500/20',
    border: 'border-pink-500/40',
    glow: 'shadow-pink-500/20',
    text: 'text-pink-300',
    badge: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
    ring: 'ring-pink-500/50',
  },
]

export default function PersonaSelector({ selected, onChange }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 mb-2.5 flex items-center gap-1.5">
        <span className="text-slate-600">●</span>
        Research Persona
        <span className="ml-auto text-[10px] text-slate-600 font-normal">Shapes the AI's tone &amp; focus</span>
      </p>
      <div className="grid grid-cols-4 gap-2">
        {PERSONAS.map(p => {
          const isActive = selected === p.id
          return (
            <button
              key={p.id}
              onClick={() => onChange(p.id)}
              id={`persona-${p.id}`}
              title={p.tone}
              className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 group
                ${isActive
                  ? `bg-gradient-to-b ${p.gradient} ${p.border} shadow-lg ${p.glow} ring-1 ${p.ring}`
                  : 'bg-white/3 border-white/10 hover:bg-white/6 hover:border-white/20'}`}
            >
              {/* Active checkmark */}
              {isActive && (
                <div className={`absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center ${p.badge} border text-[8px]`}>
                  ✓
                </div>
              )}

              {/* Icon */}
              <span className="text-xl leading-none">{p.emoji}</span>

              {/* Label */}
              <span className={`text-[11px] font-semibold leading-none transition-colors
                ${isActive ? p.text : 'text-slate-500 group-hover:text-slate-300'}`}>
                {p.label}
              </span>

              {/* Description tags */}
              <div className="hidden sm:flex flex-wrap justify-center gap-0.5 mt-0.5">
                {p.description.split(' · ').map(tag => (
                  <span key={tag}
                    className={`text-[8px] font-medium px-1 py-0.5 rounded-full border
                      ${isActive ? p.badge : 'bg-white/4 border-white/8 text-slate-600'}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {/* Active persona tone hint */}
      {selected && (
        <p className="mt-2 text-[10px] text-slate-600 text-center animate-fade-in">
          {PERSONAS.find(p => p.id === selected)?.tone}
        </p>
      )}
    </div>
  )
}
