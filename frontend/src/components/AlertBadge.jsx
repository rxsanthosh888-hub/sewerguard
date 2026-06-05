import React from 'react'

const TYPE_CONFIG = {
  methane: { label: 'Methane Gas',  cls: 'bg-orange-500/15 text-orange-400 border-orange-500/30', dot: 'bg-orange-500' },
  toxic:   { label: 'Toxic Gas',    cls: 'bg-purple-500/15 text-purple-400 border-purple-500/30', dot: 'bg-purple-500' },
  fall:    { label: 'Fall Detected',cls: 'bg-red-500/15 text-red-400 border-red-500/30',           dot: 'bg-red-500'    },
  sos:     { label: 'SOS Alert',    cls: 'bg-red-600/20 text-red-300 border-red-600/40',           dot: 'bg-red-600'    },
}
const SEV_CONFIG = {
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  warning:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  info:     'bg-blue-500/15 text-blue-400 border-blue-500/30',
}
const STATUS_CONFIG = {
  active:   'bg-red-500/15 text-red-400 border-red-500/30',
  resolved: 'bg-green-500/15 text-green-400 border-green-500/30',
}

export function AlertTypeBadge({ type }) {
  const c = TYPE_CONFIG[type] || { label: type, cls: 'bg-gray-500/15 text-gray-400 border-gray-500/30' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${c.cls}`}>
      {c.dot && <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />}
      {c.label}
    </span>
  )
}

export function SeverityBadge({ severity }) {
  return (
    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${SEV_CONFIG[severity] || SEV_CONFIG.info}`}>
      {severity?.toUpperCase()}
    </span>
  )
}

export function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${STATUS_CONFIG[status] || 'bg-gray-500/15 text-gray-400 border-gray-500/30'}`}>
      {status?.toUpperCase()}
    </span>
  )
}
