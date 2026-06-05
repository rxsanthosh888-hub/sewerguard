import React, { useState, useEffect } from 'react'
import { Search, RefreshCw, Wind, Zap, Battery, Wifi, WifiOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { workersAPI } from '../../api'

export default function SupervisorWorkers() {
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  const load = async () => {
    try { const res = await workersAPI.getAll(); setWorkers(res.data) }
    catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load(); const t = setInterval(load, 8000); return () => clearInterval(t) }, [])

  const filtered = workers.filter(w =>
    !search || [w.name, w.employeeId, w.zone].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="w-6 h-6 text-orange-500 animate-spin" /></div>

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">My Workers</h1>
          <p className="text-dark-400 text-sm">{workers.length} assigned workers</p>
        </div>
        <button onClick={load} className="sg-btn sg-btn-ghost"><RefreshCw size={14} /> Refresh</button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search workers..." className="sg-input pl-9" />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map(w => {
          const s = w.sensorData; const d = w.device
          const isOnline = d?.status === 'online'
          const statusLabel = !s ? 'NO DATA'
            : (s.sosActivated || s.fallDetected || s.methane>=500 || s.toxic>=350) ? 'CRITICAL'
            : (s.methane>=300 || s.toxic>=250) ? 'WARNING' : 'SAFE'
          const statusStyle = statusLabel === 'CRITICAL' ? 'bg-red-500/15 text-red-400 border-red-500/30 animate-emergency'
            : statusLabel === 'WARNING'  ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
            : statusLabel === 'SAFE'     ? 'bg-green-500/10 text-green-400 border-green-500/20'
            : 'bg-[#1a1a1a] text-dark-400 border-[#2a2a2a]'
          return (
            <div key={w.id} className={`bg-[#0f0f0f] border rounded-2xl p-5 transition-all ${statusLabel === 'CRITICAL' ? 'border-red-500/30' : 'border-[#1a1a1a] hover:border-orange-500/20'}`}>
              <div className="flex items-start justify-between flex-wrap gap-3">
                {/* Worker info */}
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-lg font-black text-orange-400 flex-shrink-0">
                    {w.name?.charAt(0)}
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0f0f0f] ${isOnline ? 'bg-green-500' : 'bg-dark-500'}`} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">{w.name}</p>
                    <p className="text-xs text-dark-400">{w.employeeId} • {w.zone}</p>
                    <p className="text-xs text-dark-500">{w.phone}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl border ${statusStyle}`}>{statusLabel}</span>
              </div>

              {s ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {[
                    { label: 'Methane', value: s.methane, unit: 'ppm', warn: 300, crit: 500, icon: Wind },
                    { label: 'Toxic',   value: s.toxic,   unit: 'ppm', warn: 250, crit: 350, icon: Zap  },
                  ].map(m => {
                    const color = m.value >= m.crit ? 'text-red-400' : m.value >= m.warn ? 'text-yellow-400' : 'text-green-400'
                    return (
                      <div key={m.label} className="bg-[#141414] rounded-xl p-3 border border-[#1f1f1f]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <m.icon size={11} className={color} />
                          <span className="text-[10px] text-dark-400 font-semibold uppercase">{m.label}</span>
                        </div>
                        <p className={`text-xl font-black tabular-nums ${color}`}>{m.value}</p>
                        <p className="text-[9px] text-dark-500">{m.unit}</p>
                      </div>
                    )
                  })}
                  <div className="bg-[#141414] rounded-xl p-3 border border-[#1f1f1f]">
                    <p className="text-[10px] text-dark-400 uppercase mb-1">Fall / SOS</p>
                    <p className={`text-xs font-bold ${s.fallDetected ? 'text-red-400' : 'text-green-400'}`}>{s.fallDetected ? '⚠ FALL' : '✓ OK'}</p>
                    <p className={`text-xs font-bold mt-1 ${s.sosActivated ? 'text-red-300 animate-pulse' : 'text-dark-400'}`}>{s.sosActivated ? '🚨 SOS' : '— SOS'}</p>
                  </div>
                  <div className="bg-[#141414] rounded-xl p-3 border border-[#1f1f1f]">
                    <div className="flex items-center gap-1 mb-1">
                      <Battery size={11} className={d?.batteryLevel > 20 ? 'text-green-400' : 'text-red-400'} />
                      <span className="text-[10px] text-dark-400 uppercase">Battery</span>
                    </div>
                    <p className={`text-xl font-black tabular-nums ${d?.batteryLevel > 20 ? 'text-green-400' : 'text-red-400'}`}>
                      {Math.round(d?.batteryLevel || 0)}%
                    </p>
                    <p className="text-[9px] text-dark-500">{new Date(s.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-4 text-dark-500">
                  <WifiOff size={14} />
                  <span className="text-xs">No sensor data available</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
