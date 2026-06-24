import React from 'react'
import { Clock, Search, X, TrendingUp } from 'lucide-react'

const SUGGESTIONS = [
  'Artificial Intelligence in Healthcare',
  'Quantum Computing Breakthroughs',
  'Climate Change Solutions 2024',
  'Blockchain & Web3 Future',
  'Space Exploration Milestones',
  'Renewable Energy Trends',
]

export default function RecentSearches({ searches, onSelect, onClear }) {
  const displayList = searches.length > 0 ? searches : SUGGESTIONS

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {searches.length > 0 ? (
            <>
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-300">Recent Searches</h3>
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-slate-300">Suggested Topics</h3>
            </>
          )}
        </div>
        {searches.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
            id="clear-recent-searches-btn"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {displayList.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(item)}
            id={`recent-search-${idx}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                       bg-white/5 border border-white/10 text-slate-400
                       hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-300
                       transition-all duration-200 group"
          >
            <Search className="w-3 h-3 opacity-60 group-hover:opacity-100" />
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}
