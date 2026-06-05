import React, { useState, useEffect, useCallback } from 'react'
import { Shield, Wind, Zap, Battery, Wifi, WifiOff, AlertTriangle, Clock, RefreshCw, Phone, User, CheckCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import { dashboardAPI } from '../../api'
import { AlertTypeBadge, SeverityBadge } from '../../components/AlertBadge'

function GaugeMeter({ value, warning, critical, label, unit, icon: Icon }) {
  const max   = critical * 1.6
  const pct   = Math.min(100, (value / max) * 100)
  const isCrit = value >= critical
  const isWarn = value >= warning
  const color  = isCrit ? '#ef4444' : isWarn ? '#eab308' : '#22c55e'
  const label2 = isCrit ? 'DANGER' : isWarn ? 'WARNING' : 'SAFE'
  const borderC = isCrit ? 'border-red-500/30' : isWarn ? 'border-yellow-500/30' : 'border-[#1f1f1f]'
  const bgC     = isCrit ? 'bg-red-500/5' : isWarn ? 'bg-yellow-500/5' : 'bg-[#0f0f0f]'

  return (
    <div className={`rounded-2xl p-5 border ${bgC} ${borderC} ${isCrit ? 'animate-emergency' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} style={{ color }} />}
          <span className="text-sm font-bold text-white">{label}</span>
        </div>
        <span className="text-[10px] font-black px-2.5 py-1 rounded-lg border"
          style={{ color, borderColor: color + '40', background: color + '15' }}>{label2}</span>
      </div>
      <div className="flex items-end gap-2 mb-4">
        <span className="text-5xl font-black tabular-nums" style={{ color }}>{value}</span>
        <span className="text-dark-400 text-lg mb-1">{unit}</span>
      </div>
      <div className="gauge-track h-3 mb-2">
        <div className="gauge-fill" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}60` }} />
      </div>
      <div className="flex justify-between text-[10px] text-dark-500">
        <span>Safe &lt;{warning}</span>
        <span style={{ color: '#eab308' }}>Warn {warning}</span>
        <span style={{ color: '#ef4444' }}>Crit {critical}</span>
      </div>
    </div>
  )
}

export default function WorkerDashboard() {
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [chartData, setChartData] = useState([])

  const fetchData = useCallback(async () => {
    try {
      const res = await dashboardAPI.getWorker()
      setData(res.data)
      setLastUpdate(new Date())
      const history = (res.data.sensorHistory || []).slice(0, 20).reverse()
      setChartData(history.map(h => ({
        time: new Date(h.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
        methane: h.methane,
        toxic:   h.toxic,
      })))
    } catch { if (loading) toast.error('Failed to load') }
    finally  { setLoading(false) }
  }, [loading])

  useEffect(() => { fetchData(); const t = setInterval(fetchData, 6000); return () => clearInterval(t) }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-3">
          <Shield className="w-16 h-16 text-orange-500/20" />
          <RefreshCw className="absolute inset-0 m-auto w-6 h-6 text-orange-500 animate-spin" />
        </div>
        <p className="text-dark-300 text-sm">Loading your dashboard...</p>
      </div>
    </div>
  )

  const { worker, sensorHistory = [], device, supervisor, alerts = [] } = data || {}
  const latest    = sensorHistory[0]
  const isOnline  = device?.status === 'online'
  const isEmergency = latest && (latest.methane >= 500 || latest.toxic >= 350 || latest.fallDetected || latest.sosActivated)

  return (
    <div className="space-y-5 max-w-3xl mx-auto animate-slide-up">

      {/* Emergency Banner */}
      {isEmergency && (
        <div className="p-5 rounded-2xl bg-red-500/10 border-2 border-red-500/50 animate-emergency">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <AlertTriangle size={28} className="text-red-400" />
              <div className="absolute inset-0 animate-ping-ring text-red-500 opacity-50" />
            </div>
            <div>
              <p className="font-black text-red-400 text-lg">🚨 EMERGENCY ALERT</p>
              <p className="text-sm text-red-300 mt-0.5">Dangerous condition detected — Move to safe area immediately. Contact your supervisor.</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">My Safety Dashboard</h1>
          <p className="text-dark-400 text-sm">{worker?.zone} • {worker?.employeeId}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isOnline ? 'bg-green-500/10 border-green-500/20' : 'bg-[#111] border-[#1f1f1f]'}`}>
            {isOnline ? <Wifi size={12} className="text-green-400" /> : <WifiOff size={12} className="text-dark-500" />}
            <span className={`text-xs font-bold ${isOnline ? 'text-green-400' : 'text-dark-500'}`}>
              {isOnline ? 'Helmet Online' : 'Helmet Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Worker Profile Card */}
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-2xl font-black text-white flex-shrink-0 shadow-lg shadow-orange-500/20">
            {worker?.name?.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-white">{worker?.name}</h2>
            <p className="text-sm text-dark-400">{worker?.email}</p>
            <div className="flex flex-wrap gap-3 mt-2">
              <span className="text-xs text-dark-400">ID: <span className="text-white font-semibold">{worker?.employeeId}</span></span>
              <span className="text-xs text-dark-400">Zone: <span className="text-orange-400 font-semibold">{worker?.zone}</span></span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${worker?.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-[#1a1a1a] text-dark-400 border-[#2a2a2a]'}`}>
                {worker?.status?.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            {device && (
              <>
                <div className="flex items-center gap-1.5 justify-end mb-1">
                  <Battery size={14} className={device.batteryLevel > 20 ? 'text-green-400' : 'text-red-400'} />
                  <span className={`text-xl font-black tabular-nums ${device.batteryLevel > 20 ? 'text-green-400' : 'text-red-400'}`}>
                    {Math.round(device.batteryLevel)}%
                  </span>
                </div>
                <p className="text-[10px] text-dark-500">Battery</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Gas Gauges */}
      {latest ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GaugeMeter value={latest.methane} warning={300} critical={500} label="Methane Gas (CH₄)" unit="ppm" icon={Wind} />
          <GaugeMeter value={latest.toxic}   warning={250} critical={350} label="Toxic Gas"         unit="ppm" icon={Zap} />
        </div>
      ) : (
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-10 text-center">
          <WifiOff size={32} className="mx-auto text-dark-600 mb-3" />
          <p className="text-dark-400">No sensor readings available</p>
          <p className="text-xs text-dark-500 mt-1">Check helmet connection</p>
        </div>
      )}

      {/* Fall + SOS */}
      {latest && (
        <div className="grid grid-cols-2 gap-4">
          <div className={`rounded-2xl p-4 border ${latest.fallDetected ? 'bg-red-500/10 border-red-500/30 animate-emergency' : 'bg-[#0f0f0f] border-[#1a1a1a]'}`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className={latest.fallDetected ? 'text-red-400' : 'text-dark-400'} />
              <span className="text-sm font-bold text-white">Fall Detection</span>
            </div>
            <p className={`text-lg font-black ${latest.fallDetected ? 'text-red-400' : 'text-green-400'}`}>
              {latest.fallDetected ? '⚠ FALL DETECTED' : '✓ No Fall'}
            </p>
            <p className="text-[10px] text-dark-500 mt-1">MPU6050 Sensor</p>
          </div>
          <div className={`rounded-2xl p-4 border ${latest.sosActivated ? 'bg-red-600/10 border-red-600/30 animate-emergency' : 'bg-[#0f0f0f] border-[#1a1a1a]'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className={latest.sosActivated ? 'text-red-300' : 'text-dark-400'} />
              <span className="text-sm font-bold text-white">SOS Status</span>
            </div>
            <p className={`text-lg font-black ${latest.sosActivated ? 'text-red-300' : 'text-green-400'}`}>
              {latest.sosActivated ? '🚨 SOS ACTIVE' : '✓ SOS Clear'}
            </p>
            <p className="text-[10px] text-dark-500 mt-1">Emergency Button</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 2 && (
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Gas Level History</h3>
              <p className="text-xs text-dark-400">Last {chartData.length} readings</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-dark-400">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-orange-500 rounded-full inline-block" /> CH₄</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-purple-500 rounded-full inline-block" /> Toxic</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="time" stroke="#333" tick={{ fill: '#52525b', fontSize: 10 }} />
              <YAxis stroke="#333" tick={{ fill: '#52525b', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="methane" name="Methane (ppm)" stroke="#f97316" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="toxic"   name="Toxic (ppm)"   stroke="#a855f7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Supervisor contact */}
      {supervisor && (
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Emergency Contact — My Supervisor</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-lg font-black text-blue-400 flex-shrink-0">
              {supervisor.name?.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">{supervisor.name}</p>
              <p className="text-xs text-dark-400">{supervisor.email}</p>
              <p className="text-xs text-dark-400">{supervisor.phone}</p>
              <p className="text-xs text-dark-500">{supervisor.zone}</p>
            </div>
            <a href={`tel:${supervisor.phone}`}
              className="sg-btn sg-btn-primary text-xs py-2 px-3">
              <Phone size={12} /> Call
            </a>
          </div>
        </div>
      )}

      {/* Safety Instructions */}
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-orange-500" />
          <h3 className="text-sm font-bold text-white">Safety Guidelines</h3>
        </div>
        <div className="space-y-2">
          {[
            'Always wear your IoT helmet before entering the sewer.',
            'If methane exceeds 300 ppm — ventilate the area immediately.',
            'If methane exceeds 500 ppm — evacuate immediately.',
            'Press SOS button in case of any emergency.',
            'Keep your helmet battery above 20% at all times.',
            'Report any helmet malfunction to your supervisor immediately.',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[10px] font-black text-orange-400 flex-shrink-0 mt-0.5">
                {i+1}
              </div>
              <p className="text-xs text-dark-300">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alert history */}
      {alerts.length > 0 && (
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">My Alert History</h3>
          <div className="space-y-2">
            {alerts.map(a => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#141414] border border-[#1f1f1f]">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <AlertTypeBadge type={a.type} />
                    <SeverityBadge severity={a.severity} />
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${a.status === 'active' ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                      {a.status?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-dark-400 mt-1">{a.message}</p>
                  <p className="text-[10px] text-dark-500 mt-0.5">{new Date(a.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last update */}
      <div className="flex items-center justify-center gap-2 text-xs text-dark-500 pb-2">
        <Clock size={11} />
        <span>Last updated: {lastUpdate?.toLocaleString()}</span>
      </div>
    </div>
  )
}
