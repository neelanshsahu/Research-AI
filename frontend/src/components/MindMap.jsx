import React, { useState, useRef, useCallback } from 'react'
import { ZoomIn, ZoomOut, Maximize2, Info } from 'lucide-react'

/* ─── Fixed Layout Constants ─────────────────────────────────────────
   ViewBox: 1000 × 700.  All positions are hand-tuned so nodes never
   overlap and every box stays inside the viewBox boundaries.
─────────────────────────────────────────────────────────────────── */
const VW = 1000
const VH = 700
const CX = 500  // center x
const CY = 350  // center y

/* Main branch nodes and their sub-node positions */
const BRANCH_DEFS = [
  /* ── TOP: Research ── */
  {
    key: 'research', label: 'Research', icon: '🔬',
    color: '#22d3ee', bg: 'rgba(34,211,238,0.12)', glow: 'rgba(34,211,238,0.35)',
    mainPos: { x: 500, y: 175 },
    getData: r => (r?.research?.key_information || []).slice(0, 5),
    // Fan out horizontally above the main node
    subPositions: [
      { x: 175, y: 60 },
      { x: 340, y: 38 },
      { x: 500, y: 30 },
      { x: 660, y: 38 },
      { x: 825, y: 60 },
    ],
    // Cubic bezier control points for center→main and main→each-sub
    mainCtrl: [500, 250, 500, 210],
    subCtrls: [
      [500, 110, 310, 60],
      [500, 110, 420, 38],
      [500, 110, 500, 65],
      [500, 110, 580, 38],
      [500, 110, 690, 60],
    ],
  },
  /* ── RIGHT: Verified Facts ── */
  {
    key: 'facts', label: 'Verified Facts', icon: '✅',
    color: '#10b981', bg: 'rgba(16,185,129,0.12)', glow: 'rgba(16,185,129,0.35)',
    mainPos: { x: 760, y: 350 },
    getData: r => (r?.fact_check?.verified_facts || []).slice(0, 4),
    subPositions: [
      { x: 920, y: 165 },
      { x: 968, y: 283 },
      { x: 968, y: 418 },
      { x: 920, y: 535 },
    ],
    mainCtrl: [620, 350, 700, 350],
    subCtrls: [
      [820, 350, 920, 255],
      [870, 350, 968, 316],
      [870, 350, 968, 385],
      [820, 350, 920, 445],
    ],
  },
  /* ── BOTTOM: Key Insights ── */
  {
    key: 'insights', label: 'Key Insights', icon: '💡',
    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', glow: 'rgba(245,158,11,0.35)',
    mainPos: { x: 500, y: 525 },
    getData: r => (r?.summary?.key_insights || []).slice(0, 5),
    subPositions: [
      { x: 175, y: 638 },
      { x: 340, y: 660 },
      { x: 500, y: 668 },
      { x: 660, y: 660 },
      { x: 825, y: 638 },
    ],
    mainCtrl: [500, 450, 500, 492],
    subCtrls: [
      [500, 590, 310, 638],
      [500, 590, 420, 660],
      [500, 590, 500, 635],
      [500, 590, 580, 660],
      [500, 590, 690, 638],
    ],
  },
  /* ── LEFT: Recommendations ── */
  {
    key: 'report', label: 'Recommendations', icon: '📊',
    color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', glow: 'rgba(139,92,246,0.35)',
    mainPos: { x: 240, y: 350 },
    getData: r => (r?.report?.recommendations || []).slice(0, 4),
    subPositions: [
      { x: 80, y: 165 },
      { x: 32, y: 283 },
      { x: 32, y: 418 },
      { x: 80, y: 535 },
    ],
    mainCtrl: [380, 350, 300, 350],
    subCtrls: [
      [180, 350, 80, 255],
      [130, 350, 32, 316],
      [130, 350, 32, 385],
      [180, 350, 80, 445],
    ],
  },
]

/* ─── Helpers ────────────────────────────────────────────────────── */
function mainEdge(bDef) {
  const [cx1, cy1, cx2, cy2] = bDef.mainCtrl
  const m = bDef.mainPos
  return `M ${CX} ${CY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${m.x} ${m.y}`
}

function subEdge(bDef, subIdx) {
  const m = bDef.mainPos
  const s = bDef.subPositions[subIdx]
  const [cx1, cy1, cx2, cy2] = bDef.subCtrls[subIdx]
  return `M ${m.x} ${m.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${s.x} ${s.y}`
}

function wrapLines(text, maxChars = 26) {
  if (!text) return ['']
  if (text.length <= maxChars) return [text]
  // Try to break at a word boundary
  const breakAt = text.lastIndexOf(' ', maxChars)
  if (breakAt < 6) {
    return [text.substring(0, maxChars) + '…']
  }
  const line1 = text.substring(0, breakAt)
  const rest = text.substring(breakAt + 1)
  return [line1, rest.length > maxChars ? rest.substring(0, maxChars - 1) + '…' : rest]
}

/* ─── Sub-node ──────────────────────────────────────────────────── */
function SubNode({ pos, text, color, isHovered, onEnter, onLeave }) {
  const lines = wrapLines(text)
  const BOX_W = 155
  const LINE_H = 13
  const BOX_H = lines.length === 1 ? 34 : 50
  const rx = 7

  return (
    <g onMouseEnter={onEnter} onMouseLeave={onLeave} style={{ cursor: 'pointer' }}>
      {/* Glow halo on hover */}
      {isHovered && (
        <rect
          x={pos.x - BOX_W / 2 - 4} y={pos.y - BOX_H / 2 - 4}
          width={BOX_W + 8} height={BOX_H + 8} rx={rx + 3}
          fill={color} opacity={0.15}
          style={{ filter: `blur(6px)` }}
        />
      )}
      <rect
        x={pos.x - BOX_W / 2} y={pos.y - BOX_H / 2}
        width={BOX_W} height={BOX_H} rx={rx}
        fill={isHovered ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.05)'}
        stroke={color}
        strokeWidth={isHovered ? 1.5 : 0.75}
        strokeOpacity={isHovered ? 0.9 : 0.45}
        style={{ transition: 'all 0.2s' }}
      />
      <text
        x={pos.x}
        y={lines.length === 2 ? pos.y - (LINE_H / 2) + 1 : pos.y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10.5"
        fill={isHovered ? '#e2e8f0' : '#94a3b8'}
        fontFamily="Inter, ui-sans-serif, system-ui"
        style={{ pointerEvents: 'none', transition: 'fill 0.2s' }}
      >
        {lines.map((line, i) => (
          <tspan key={i} x={pos.x} dy={i === 0 ? 0 : LINE_H + 2}>{line}</tspan>
        ))}
      </text>
    </g>
  )
}

/* ─── Main branch node ──────────────────────────────────────────── */
function BranchNode({ bDef, isActive, onEnter, onLeave }) {
  const { mainPos: p, color, bg, glow, icon, label } = bDef
  const R = 42

  return (
    <g onMouseEnter={onEnter} onMouseLeave={onLeave} style={{ cursor: 'default' }}>
      {isActive && (
        <circle cx={p.x} cy={p.y} r={R + 12} fill={glow} opacity={0.25}
          style={{ filter: 'blur(8px)' }} />
      )}
      <circle
        cx={p.x} cy={p.y} r={R}
        fill={isActive ? bg.replace('0.12', '0.22') : bg}
        stroke={color}
        strokeWidth={isActive ? 2 : 1.2}
        style={{ filter: isActive ? `drop-shadow(0 0 10px ${color})` : 'none', transition: 'all 0.25s' }}
      />
      <text x={p.x} y={p.y - 9} textAnchor="middle" dominantBaseline="middle" fontSize="20"
        style={{ pointerEvents: 'none' }}>
        {icon}
      </text>
      <text x={p.x} y={p.y + 16} textAnchor="middle" dominantBaseline="middle"
        fontSize="9.5" fontWeight="700" fill={color}
        fontFamily="Inter, ui-sans-serif, system-ui"
        style={{ pointerEvents: 'none', letterSpacing: '0.02em' }}>
        {label}
      </text>
    </g>
  )
}

/* ─── Center node ───────────────────────────────────────────────── */
function CenterNode({ topic }) {
  const short = !topic ? 'Research'
    : topic.length > 18 ? topic.substring(0, 18) + '…'
    : topic

  return (
    <g>
      <circle cx={CX} cy={CY} r={70} fill="none" stroke="url(#ringGrad)"
        strokeWidth={1} opacity={0.4}
        style={{ animation: 'mmPulse 3s ease-in-out infinite' }}
      />
      <circle cx={CX} cy={CY} r={58}
        fill="rgba(99,102,241,0.14)"
        stroke="url(#centerGrad)"
        strokeWidth={2}
        style={{ filter: 'drop-shadow(0 0 18px rgba(99,102,241,0.45))' }}
      />
      <text x={CX} y={CY - 11} textAnchor="middle" dominantBaseline="middle"
        fontSize="24" style={{ pointerEvents: 'none' }}>🧠</text>
      <text x={CX} y={CY + 13} textAnchor="middle" dominantBaseline="middle"
        fontSize="9" fontWeight="700" fill="#c4b5fd"
        fontFamily="Inter, ui-sans-serif, system-ui"
        style={{ pointerEvents: 'none' }}>
        {short}
      </text>
    </g>
  )
}

/* ─── MindMap ───────────────────────────────────────────────────── */
export default function MindMap({ report, topic }) {
  const [zoom, setZoom]           = useState(1)
  const [pan, setPan]             = useState({ x: 0, y: 0 })
  const [dragging, setDragging]   = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hovered, setHovered]     = useState(null)  // 'branchKey' or 'branchKey-subIdx'
  const [tooltip, setTooltip]     = useState('')

  /* Resolve all data upfront */
  const branches = BRANCH_DEFS.map(b => ({
    ...b,
    items: b.getData(report),
  }))

  /* Controls */
  const changeZoom = delta => setZoom(z => Math.min(2.2, Math.max(0.45, z + delta)))
  const resetView  = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

  /* Pan drag */
  const onMouseDown = e => {
    if (e.button !== 0) return
    setDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }
  const onMouseMove = useCallback(e => {
    if (!dragging) return
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }, [dragging, dragStart])
  const onMouseUp = () => setDragging(false)

  const onWheel = e => { e.preventDefault(); changeZoom(e.deltaY < 0 ? 0.12 : -0.12) }

  const setHoverNode = (key, text) => { setHovered(key); setTooltip(text || '') }
  const clearHover   = () => { setHovered(null); setTooltip('') }

  return (
    <div className="relative w-full rounded-xl bg-slate-900/60 border border-white/10 overflow-hidden"
      style={{ height: '500px' }}>

      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        {[
          { icon: ZoomIn,    fn: () => changeZoom(0.15), title: 'Zoom in' },
          { icon: ZoomOut,   fn: () => changeZoom(-0.15), title: 'Zoom out' },
          { icon: Maximize2, fn: resetView, title: 'Reset view' },
        ].map(({ icon: Icon, fn, title }) => (
          <button key={title} onClick={fn} title={title}
            className="w-8 h-8 rounded-lg bg-black/40 border border-white/15 flex items-center justify-center
                       text-slate-400 hover:text-white hover:bg-white/10 transition-all backdrop-blur-sm">
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>

      {/* Hint */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 text-[10px] text-slate-600 select-none">
        <Info className="w-3 h-3" />
        Drag · Scroll to zoom · Hover for full text
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="absolute top-3 left-3 z-20 glass-card p-3 text-[11px] text-slate-300 leading-relaxed
                        pointer-events-none animate-fade-in max-w-[240px] border border-white/15">
          {tooltip}
        </div>
      )}

      {/* Canvas */}
      <div
        style={{ width: '100%', height: '100%', cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" height="100%"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: dragging ? 'none' : 'transform 0.15s ease-out',
          }}>
          <defs>
            <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#6366f1" />
            </radialGradient>
            <radialGradient id="ringGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </radialGradient>
            {BRANCH_DEFS.map(b => (
              <linearGradient key={b.key} id={`lg-${b.key}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                <stop offset="100%" stopColor={b.color} stopOpacity="0.85" />
              </linearGradient>
            ))}
          </defs>

          {/* Background dot grid */}
          <pattern id="dotgrid" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="18" cy="18" r="1" fill="rgba(255,255,255,0.035)" />
          </pattern>
          <rect width={VW} height={VH} fill="url(#dotgrid)" />

          {/* ── Edges: center → main branch ── */}
          {branches.map(b => {
            const isActive = hovered === b.key || hovered?.startsWith(b.key + '-')
            return (
              <path key={`me-${b.key}`}
                d={mainEdge(b)}
                fill="none"
                stroke={`url(#lg-${b.key})`}
                strokeWidth={isActive ? 2.5 : 1.5}
                strokeLinecap="round"
                opacity={hovered && !isActive ? 0.18 : 0.65}
                style={{ transition: 'all 0.3s' }}
              />
            )
          })}

          {/* ── Edges: main branch → sub-nodes ── */}
          {branches.map(b =>
            b.items.map((_, i) => {
              if (i >= b.subPositions.length) return null
              const subKey = `${b.key}-${i}`
              const isActive = hovered === subKey || hovered === b.key
              return (
                <path key={`se-${b.key}-${i}`}
                  d={subEdge(b, i)}
                  fill="none"
                  stroke={b.color}
                  strokeWidth={isActive ? 1.4 : 0.75}
                  strokeLinecap="round"
                  strokeDasharray={isActive ? '0' : '4 3'}
                  opacity={hovered && !isActive && hovered !== b.key ? 0.10 : 0.4}
                  style={{ transition: 'all 0.3s' }}
                />
              )
            })
          )}

          {/* ── Sub-nodes ── */}
          {branches.map(b =>
            b.items.map((text, i) => {
              if (i >= b.subPositions.length) return null
              const subKey = `${b.key}-${i}`
              return (
                <SubNode
                  key={subKey}
                  pos={b.subPositions[i]}
                  text={text}
                  color={b.color}
                  isHovered={hovered === subKey}
                  onEnter={() => setHoverNode(subKey, text)}
                  onLeave={clearHover}
                />
              )
            })
          )}

          {/* ── Main branch nodes ── */}
          {branches.map(b => (
            <BranchNode
              key={b.key}
              bDef={b}
              isActive={hovered === b.key}
              onEnter={() => setHoverNode(b.key, b.label)}
              onLeave={clearHover}
            />
          ))}

          {/* ── Center node (topmost) ── */}
          <CenterNode topic={topic} />
        </svg>
      </div>

      <style>{`
        @keyframes mmPulse {
          0%, 100% { r: 70; opacity: 0.35; }
          50%       { r: 75; opacity: 0.60; }
        }
      `}</style>
    </div>
  )
}
