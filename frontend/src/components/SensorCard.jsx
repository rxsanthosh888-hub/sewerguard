import React from 'react'
import { Wind, Zap, AlertTriangle, Battery, Wifi, WifiOff, Clock, Shield } from 'lucide-react'

function GaugeBar({ value, warning, critical }) {
  const max = critical * 1.5
  const pct = Math.min(100, (value / max) * 100)
  const color = value >= critical ? '#ef4444' : value >= warning ? '#eab308' : '#22c55e'
  return (
    <div className="gauge-track h-1.5 w-full">
      <div className="gauge-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function getStatusConfig(methane, toxic, fallDetected, sosActivated) {
  if (sosActivated || fallDetected) return { label: 'EMERGENCY', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/40', dot: 'bg-red-500' }
  if (methane >= 500 || toxic >= 350)  return { label: 'CRITICAL',  color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', dot: 'bg-red-500' }
  if (methane >= 300 || toxic >= 250)  return { label: 'WARNING',   color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', dot: 'bg-yellow-500' }
  return { label: 'SAFE', color: 'text-green-400', bg: 'bg-green-500/5 border-green-500/20', dot: 'bg-green-500' }
}

export default function SensorCard({ worker, sensorData, device, onClick }) {
  const isOnline = device?.status === 'online'
  const s = sensorData
  const status = s
    ? getStatusConfig(s.methane, s.toxic, s.fallDetected, s.sosActivated)
    : { label: 'OFFLINE', color: 'text-dark-400', bg: 'border-[#1a1a1a]', dot: 'bg-dark-500' }

  const isEmergency = s && (s.sosActivated || s.fallDetected || s.methane >= 500 || s.toxic >= 350)

  return (
    <div onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl p-4 cursor-pointer
        bg-[#0f0f0f] border transition-all duration-300
        hover:shadow-xl hover:transform hover:-translate-y-1
        ${isEmergency ? 'animate-emergency border-red-500/40' : `border-[#1a1a1a] hover:border-orange-500/30 hover:shadow-orange-500/10`}
      `}>

      {/* Emergency pulse */}
      {isEmergency && (
        <div className="absolute inset-0 rounded-2xl border-2 border-red-500/50 animate-ping-ring pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`relative w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-700/10 border border-orange-500/20 flex items-center justify-center text-sm font-bold text-orange-400 flex-shrink-0`}>
            {worker.name?.charAt(0)}
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${status.dot} rounded-full border border-[#0f0f0f] ${isOnline ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{worker.name}</p>
            <p className="text-[10px] text-dark-400">{worker.employeeId}</p>
          </div>
        </div>
        <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${status.bg} ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Zone */}
      <p className="text-[10px] text-dark-400 mb-3 flex items-center gap-1">
        <Shield size={9} className="text-orange-500" />
        {worker.zone || 'Unassigned'}
      </p>

      {s ? (
        <>
          {/* Gas readings */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Methane */}
            <div className="bg-[#141414] rounded-xl p-2.5 border border-[#1f1f1f]">
              <div className="flex items-center gap-1 mb-1.5">
                <Wind size={10} className={s.methane >= 500 ? 'text-red-400' : s.methane >= 300 ? 'text-yellow-400' : 'text-green-400'} />
                <span className="text-[9px] text-dark-400 font-semibold uppercase">CH₄</span>
              </div>
              <p className={`text-base font-black tabular-nums ${s.methane >= 500 ? 'text-red-400' : s.methane >= 300 ? 'text-yellow-400' : 'text-green-400'}`}>
                {s.methane}
              </p>
              <p className="text-[9px] text-dark-500">ppm</p>
              <GaugeBar value={s.methane} warning={300} critical={500} />
            </div>

            {/* Toxic */}
            <div className="bg-[#141414] rounded-xl p-2.5 border border-[#1f1f1f]">
              <div className="flex items-center gap-1 mb-1.5">
                <Zap size={10} className={s.toxic >= 350 ? 'text-red-400' : s.toxic >= 250 ? 'text-yellow-400' : 'text-green-400'} />
                <span className="text-[9px] text-dark-400 font-semibold uppercase">Toxic</span>
              </div>
              <p className={`text-base font-black tabular-nums ${s.toxic >= 350 ? 'text-red-400' : s.toxic >= 250 ? 'text-yellow-400' : 'text-green-400'}`}>
                {s.toxic}
              </p>
              <p className="text-[9px] text-dark-500">ppm</p>
              <GaugeBar value={s.toxic} warning={250} critical={350} />
            </div>
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${s.fallDetected ? 'bg-red-500/20 text-red-400' : 'bg-green-500/10 text-green-500'}`}>
              {s.fallDetected ? '⚠ FALL' : '✓ Stable'}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${s.sosActivated ? 'bg-red-600/20 text-red-300 animate-pulse' : 'bg-[#1a1a1a] text-dark-400'}`}>
              {s.sosActivated ? '🚨 SOS' : 'SOS —'}
            </span>
          </div>

          {/* Battery + time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {isOnline ? <Wifi size={10} className="text-green-400" /> : <WifiOff size={10} className="text-dark-500" />}
              <span className={`text-[10px] font-semibold ${isOnline ? 'text-green-400' : 'text-dark-500'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Battery size={10} className={device?.batteryLevel > 20 ? 'text-green-400' : 'text-red-400'} />
              <span className={`text-[10px] font-bold tabular-nums ${device?.batteryLevel > 20 ? 'text-green-400' : 'text-red-400'}`}>
                {Math.round(device?.batteryLevel || 0)}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-2">
            <Clock size={9} className="text-dark-500" />
            <p className="text-[9px] text-dark-500">{new Date(s.timestamp).toLocaleTimeString()}</p>
          </div>
        </>
      ) : (
        <div className="py-6 text-center">
          <WifiOff size={20} className="mx-auto text-dark-600 mb-2" />
          <p className="text-xs text-dark-500">No signal</p>
        </div>
      )}
    </div>
  )
}
