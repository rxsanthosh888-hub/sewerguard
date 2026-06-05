import React, { useState, useEffect } from 'react'
import { Cpu, Wifi, WifiOff, Battery, RefreshCw, Power, Activity } from 'lucide-react'
import toast from 'react-hot-toast'
import { devicesAPI } from '../../api'

export default function AdminDevices() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(null)

  const load = async () => {
    try { const res = await devicesAPI.getAll(); setDevices(res.data) }
    catch { toast.error('Failed to load devices') }
    finally { setLoading(false) }
  }

  useEffect(() => { load(); const t = setInterval(load, 8000); return () => clearInterval(t) }, [])

  const handleToggle = async (id) => {
    setToggling(id)
    try { await devicesAPI.toggle(id); toast.success('Device status updated'); load() }
    catch { toast.error('Toggle failed') }
    finally { setToggling(null) }
  }

  const online  = devices.filter(d => d.status === 'online').length
  const offline = devices.filter(d => d.status === 'offline').length
  const lowBat  = devices.filter(d => d.batteryLevel < 20).length

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="w-6 h-6 text-orange-500 animate-spin" /></div>

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">IoT Helmet Devices</h1>
          <p className="text-dark-400 text-sm">ESP32 device management and health monitoring</p>
        </div>
        <button onClick={load} className="sg-btn sg-btn-ghost"><RefreshCw size={14} /> Refresh</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Devices', value: devices.length, color: 'text-white',   bg: 'bg-[#111] border-[#1f1f1f]' },
          { label: 'Online',        value: online,         color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
          { label: 'Offline',       value: offline,        color: 'text-red-400',   bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Low Battery',   value: lowBat,         color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 border ${s.bg}`}>
            <p className="text-xs font-bold uppercase tracking-wider text-dark-400 mb-1">{s.label}</p>
            <p className={`text-3xl font-black tabular-nums ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map(d => {
          const isOnline = d.status === 'online'
          const batColor = d.batteryLevel > 50 ? 'text-green-400' : d.batteryLevel > 20 ? 'text-yellow-400' : 'text-red-400'
          const batBg    = d.batteryLevel > 50 ? 'bg-green-500' : d.batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
          return (
            <div key={d.id} className={`bg-[#0f0f0f] border rounded-2xl p-5 card-hover transition-all ${isOnline ? 'border-[#1a1a1a] hover:border-green-500/20' : 'border-[#1a1a1a] hover:border-red-500/20'}`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`relative w-11 h-11 rounded-xl border flex items-center justify-center ${isOnline ? 'bg-green-500/10 border-green-500/20' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`}>
                    <Cpu size={20} className={isOnline ? 'text-green-400' : 'text-dark-500'} />
                    {isOnline && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f0f0f] animate-pulse" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{d.id}</p>
                    <p className="text-[10px] text-dark-400 font-mono">{d.macAddress}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${isOnline ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-[#1a1a1a] text-dark-500 border-[#2a2a2a]'}`}>
                  {d.status?.toUpperCase()}
                </span>
              </div>

              {/* Worker */}
              <div className="mb-4 p-3 rounded-xl bg-[#141414] border border-[#1f1f1f]">
                <p className="text-[10px] text-dark-500 uppercase tracking-wider mb-1">Assigned Worker</p>
                <p className="text-sm font-bold text-white">{d.workerName || 'Unassigned'}</p>
              </div>

              {/* Battery */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Battery size={12} className={batColor} />
                    <span className="text-xs text-dark-400">Battery</span>
                  </div>
                  <span className={`text-xs font-black tabular-nums ${batColor}`}>{Math.round(d.batteryLevel)}%</span>
                </div>
                <div className="gauge-track h-2">
                  <div className={`gauge-fill ${batBg}`} style={{ width: `${d.batteryLevel}%` }} />
                </div>
              </div>

              {/* Info */}
              <div className="flex items-center justify-between text-[10px] text-dark-500 mb-4">
                <span>FW {d.firmwareVersion}</span>
                <span>Last: {new Date(d.lastSeen).toLocaleTimeString()}</span>
              </div>

              {/* Toggle */}
              <button onClick={() => handleToggle(d.id)} disabled={toggling === d.id}
                className={`sg-btn w-full justify-center text-xs py-2 ${isOnline ? 'sg-btn-ghost text-red-400 border-red-500/20 hover:bg-red-500/10' : 'sg-btn-ghost text-green-400 border-green-500/20 hover:bg-green-500/10'}`}>
                {toggling === d.id
                  ? <RefreshCw size={12} className="animate-spin" />
                  : <><Power size={12} /> {isOnline ? 'Disable Device' : 'Enable Device'}</>}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
