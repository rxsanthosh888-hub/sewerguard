import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const THEMES = {
  orange: {
    icon: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    glow: 'hover:shadow-orange-500/10',
    bar:  'bg-orange-500',
    border: 'hover:border-orange-500/30',
  },
  green: {
    icon: 'bg-green-500/10 text-green-400 border-green-500/20',
    glow: 'hover:shadow-green-500/10',
    bar:  'bg-green-500',
    border: 'hover:border-green-500/30',
  },
  red: {
    icon: 'bg-red-500/10 text-red-400 border-red-500/20',
    glow: 'hover:shadow-red-500/10',
    bar:  'bg-red-500',
    border: 'hover:border-red-500/30',
  },
  blue: {
    icon: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    glow: 'hover:shadow-blue-500/10',
    bar:  'bg-blue-500',
    border: 'hover:border-blue-500/30',
  },
  yellow: {
    icon: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    glow: 'hover:shadow-yellow-500/10',
    bar:  'bg-yellow-500',
    border: 'hover:border-yellow-500/30',
  },
  purple: {
    icon: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    glow: 'hover:shadow-purple-500/10',
    bar:  'bg-purple-500',
    border: 'hover:border-purple-500/30',
  },
}

export default function StatCard({ title, value, icon: Icon, color = 'orange', subtitle, trend, trendValue, progress }) {
  const t = THEMES[color] || THEMES.orange

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-5
      bg-[#0f0f0f] border border-[#1a1a1a]
      transition-all duration-300 cursor-default
      hover:shadow-lg ${t.glow} ${t.border}
      card-hover group animate-count
    `}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 blur-2xl"
        style={{ background: `var(--${color === 'orange' ? 'orange' : color}, #f97316)` }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-bold text-dark-300 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-3xl font-black text-white tabular-nums">{value}</p>
            {subtitle && <p className="text-xs text-dark-400 mt-1">{subtitle}</p>}
          </div>
          {Icon && (
            <div className={`p-3 rounded-xl border ${t.icon} flex-shrink-0`}>
              <Icon size={20} />
            </div>
          )}
        </div>

        {/* Progress bar */}
        {progress !== undefined && (
          <div className="gauge-track h-1.5 mb-2">
            <div className={`gauge-fill ${t.bar}`} style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
        )}

        {/* Trend */}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(trendValue || trend)}% {trend >= 0 ? 'increase' : 'decrease'}</span>
            <span className="text-dark-400 font-normal ml-1">vs last hour</span>
          </div>
        )}
      </div>
    </div>
  )
}
