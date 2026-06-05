import React, { useState, useEffect, useCallback } from 'react'
import {
  Users, UserCheck, Activity, AlertTriangle, Cpu, TrendingUp,
  RefreshCw, Bell, Shield, Zap, Wind, Eye, ChevronRight
} from 'lucide-react'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import toast from 'react-hot-toast'
import { dashboardAPI, alertsAPI } from '../../api'
import StatCard from '../../components/StatCard'
import SensorCard from '../../components/SensorCard'
import { AlertTypeBadge, SeverityBadge, StatusBadge } from '../../components/AlertBadge'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-3 shadow-2xl">
      <p className="text-xs text-dark-300 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-dark-300">{p.name}:</span>
          <span className="font-bold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// Emergency alert popup
function EmergencyPopup({ alert, onClose, onResolve }) {
  if (!alert) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-slide-up">
      <div className="w-full max-w-md bg-[#0f0f0f] border-2 border-red-500/50 rounded-2xl p-6 animate-emergency shadow-2xl shadow-red-500/20">
        {/* Flashing header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <AlertTriangle size={24} className="text-white" />
            </div>
            <div className="absolute inset-0 bg-red-500 rounded-xl animate-ping opacity-30" />
          </div>
          <div>
            <p className="text-xs font-black text-red-400 tracking-widest uppercase">🚨 SewerGuard Critical Alert</p>
            <p className="text-lg font-black text-white">Emergency Detected</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {[
            ['Worker', alert.workerName],
            ['Alert Type', alert.type?.toUpperCase()],
            ['Severity', alert.severity?.toUpperCase()],
            ['Time', new Date(alert.timestamp).toLocaleString()],
            ['Status', 'IMMEDIATE ATTENTION REQUIRED'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center py-2 border-b border-[#1f1f1f]">
              <span className="text-xs text-dark-400 uppercase tracking-wider">{k}</span>
              <span className={`text-sm font-bold ${k === 'Status' ? 'text-red-400' : 'text-white'}`}>{v}</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-dark-300 bg-red-500/10 rounded-xl p-3 mb-5 border border-red-500/20">
          {alert.message}
        </p>

        <div className="flex gap-3">
          <button onClick={() => onResolve(alert.id)}
            className="sg-btn sg-btn-danger flex-1 justify-center">
            Mark Resolved
          </button>
          <button onClick={onClose} className="sg-btn sg-btn-ghost flex-1 justify-center">
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [chartData, setChartData]   = useState([])
  const [barData, setBarData]       = useState([])
  const [emergency, setEmergency]   = useState(null)
  const [shownAlerts, setShownAlerts] = useState(new Set())

  const fetchData = useCallback(async () => {
    try {
      const res = await dashboardAPI.getAdmin()
      setData(res.data)
      setLastUpdate(new Date())

      // Build live chart point
      const workers = res.data.workers || []
      const active  = workers.filter(w => w.status === 'active' && w.sensorData)
      const avg = (key) => active.length
        ? Math.round(active.reduce((s, w) => s + (w.sensorData?.[key] || 0), 0) / active.length)
        : 0

      setChartData(prev => [...prev.slice(-19), {
        time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        methane: avg('methane'),
        toxic:   avg('toxic'),
      }])

      // Check for new critical alerts
      const critical = (res.data.recentAlerts || []).filter(a => a.severity === 'critical' && a.status === 'active')
      if (critical.length > 0) {
        const newest = critical[0]
        if (!shownAlerts.has(newest.id)) {
          setEmergency(newest)
          setShownAlerts(prev => new Set([...prev, newest.id]))
        }
      }
    } catch {
      if (loading) toast.error('Dashboard load failed')
    } finally {
      setLoading(false)
    }
  }, [loading, shownAlerts])

  // Build weekly bar data
  useEffect(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    setBarData(days.map(d => ({
      day: d,
      incidents: Math.floor(Math.random() * 8),
      resolved:  Math.floor(Math.random() * 6),
    })))
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleResolve = async (id) => {
    try {
      await alertsAPI.resolve(id)
      setEmergency(null)
      toast.success('Alert marked as resolved')
      fetchData()
    } catch {
      toast.error('Failed to resolve alert')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <div className="relative w-16 h-16 mx-auto">
          <Shield className="w-16 h-16 text-orange-500/20" />
          <RefreshCw className="absolute inset-0 m-auto w-6 h-6 text-orange-500 animate-spin" />
        </div>
        <p className="text-dark-300 text-sm">Loading dashboard...</p>
      </div>
    </div>
  )

  const { stats, recentAlerts = [], workers = [] } = data || {}
  const activeWorkers  = workers.filter(w => w.status === 'active')
  const criticalWorkers = workers.filter(w =>
    w.sensorData && (w.sensorData.methane >= 500 || w.sensorData.toxic >= 350 ||
    w.sensorData.fallDetected || w.sensorData.sosActivated))

  return (
    <div className="space-y-6 animate-slide-up">
      <EmergencyPopup alert={emergency} onClose={() => setEmergency(null)} onResolve={handleResolve} />

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Command Center</h1>
          <p className="text-dark-400 text-sm mt-0.5">Real-time IoT safety monitoring • All zones</p>
        </div>
        <div className="flex items-center gap-2">
          {criticalWorkers.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 animate-pulse">
              <AlertTriangle size={14} className="text-red-400" />
              <span className="text-xs font-bold text-red-400">{criticalWorkers.length} Critical</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111111] border border-[#1f1f1f]">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-dark-300">Live • {lastUpdate?.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Critical banner */}
      {criticalWorkers.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 animate-emergency">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-red-400">⚠ Active Emergency — {criticalWorkers.length} worker{criticalWorkers.length > 1 ? 's' : ''} in critical condition</p>
              <p className="text-sm text-red-300/70 mt-0.5">
                {criticalWorkers.map(w => w.name).join(', ')} — Immediate attention required
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Workers"   value={stats?.totalWorkers || 0}   icon={Users}         color="blue"   subtitle="All registered" />
        <StatCard title="Active Workers"  value={stats?.activeWorkers || 0}  icon={Activity}      color="green"  subtitle="Currently deployed" progress={(stats?.activeWorkers / stats?.totalWorkers) * 100} />
        <StatCard title="Supervisors"     value={stats?.totalSupervisors || 0} icon={UserCheck}   color="orange" subtitle="On duty" />
        <StatCard title="Critical Alerts" value={stats?.criticalAlerts || 0} icon={AlertTriangle} color="red"    subtitle="Needs attention" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Online Devices"  value={`${stats?.onlineDevices || 0}/${stats?.totalDevices || 0}`} icon={Cpu}    color="purple" />
        <StatCard title="Offline Workers" value={stats?.inactiveWorkers || 0} icon={Users}  color="yellow" />
        <StatCard title="Today's Alerts"  value={recentAlerts.length}         icon={Bell}   color="orange" />
        <StatCard title="System Health"   value="99.9%"                       icon={Shield} color="green"  subtitle="Operational" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live gas trend */}
        <div className="lg:col-span-2 bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-white">Live Gas Level Trends</h3>
              <p className="text-xs text-dark-400">Average across all active workers</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-orange-500 rounded-full inline-block" /> Methane</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-purple-500 rounded-full inline-block" /> Toxic</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="time" stroke="#333" tick={{ fill: '#52525b', fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis stroke="#333" tick={{ fill: '#52525b', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="methane" name="Methane (ppm)" stroke="#f97316" fill="url(#g1)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="toxic"   name="Toxic (ppm)"  stroke="#a855f7" fill="url(#g2)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly incidents */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-5">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-white">Weekly Incidents</h3>
            <p className="text-xs text-dark-400">This week overview</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
              <XAxis dataKey="day" stroke="#333" tick={{ fill: '#52525b', fontSize: 10 }} />
              <YAxis stroke="#333" tick={{ fill: '#52525b', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="incidents" name="Incidents" fill="#ef4444" radius={[4,4,0,0]} fillOpacity={0.8} />
              <Bar dataKey="resolved"  name="Resolved"  fill="#22c55e" radius={[4,4,0,0]} fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Worker Grid + Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Workers */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">Live Worker Monitoring</h3>
            <span className="text-xs text-dark-400">{activeWorkers.length} active</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {workers.map(w => (
              <SensorCard key={w.id} worker={w} sensorData={w.sensorData} device={w.device} />
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Alerts</h3>
              <p className="text-xs text-dark-400">Latest incidents</p>
            </div>
            {recentAlerts.filter(a => a.status === 'active').length > 0 && (
              <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5 font-bold">
                {recentAlerts.filter(a => a.status === 'active').length} active
              </span>
            )}
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {recentAlerts.length === 0 && (
              <div className="text-center py-8">
                <Shield size={24} className="mx-auto text-dark-600 mb-2" />
                <p className="text-xs text-dark-500">No alerts — all clear</p>
              </div>
            )}
            {recentAlerts.map(alert => (
              <div key={alert.id}
                className={`p-3 rounded-xl border transition-colors ${
                  alert.severity === 'critical' && alert.status === 'active'
                    ? 'bg-red-500/5 border-red-500/20'
                    : 'bg-[#141414] border-[#1f1f1f]'
                }`}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-xs font-bold text-white truncate">{alert.workerName}</p>
                  <StatusBadge status={alert.status} />
                </div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <AlertTypeBadge type={alert.type} />
                  <SeverityBadge severity={alert.severity} />
                </div>
                <p className="text-[10px] text-dark-400 truncate">{alert.message}</p>
                <p className="text-[10px] text-dark-500 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Worker table */}
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1a1a1a] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Worker Monitoring Table</h3>
            <p className="text-xs text-dark-400">Live readings for all workers</p>
          </div>
          <TrendingUp size={16} className="text-orange-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Zone</th>
                <th>Methane</th>
                <th>Toxic Gas</th>
                <th>Battery</th>
                <th>Status</th>
                <th>Last Update</th>
              </tr>
            </thead>
            <tbody>
              {workers.map(w => {
                const s = w.sensorData
                const st = !s ? 'offline'
                  : (s.sosActivated || s.fallDetected || s.methane >= 500 || s.toxic >= 350) ? 'critical'
                  : (s.methane >= 300 || s.toxic >= 250) ? 'warning' : 'safe'
                return (
                  <tr key={w.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-400">
                          {w.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{w.name}</p>
                          <p className="text-[10px] text-dark-400">{w.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="text-xs text-dark-300">{w.zone}</span></td>
                    <td>
                      <span className={`text-sm font-bold tabular-nums ${!s ? 'text-dark-500' : s.methane >= 500 ? 'text-red-400' : s.methane >= 300 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {s ? `${s.methane} ppm` : '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`text-sm font-bold tabular-nums ${!s ? 'text-dark-500' : s.toxic >= 350 ? 'text-red-400' : s.toxic >= 250 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {s ? `${s.toxic} ppm` : '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`text-xs font-bold tabular-nums ${(w.device?.batteryLevel || 0) > 20 ? 'text-green-400' : 'text-red-400'}`}>
                        {w.device ? `${Math.round(w.device.batteryLevel)}%` : '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${
                        st === 'critical' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                        st === 'warning'  ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                        st === 'safe'     ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        'bg-[#1a1a1a] text-dark-400 border-[#2a2a2a]'
                      }`}>
                        {st.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="text-[10px] text-dark-500 tabular-nums">
                        {s ? new Date(s.timestamp).toLocaleTimeString() : 'N/A'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
