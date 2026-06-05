import React, { useState, useEffect, useCallback } from 'react'
import { Users, AlertTriangle, Activity, RefreshCw, CheckCircle, TrendingUp, Shield } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import toast from 'react-hot-toast'
import { dashboardAPI, alertsAPI } from '../../api'
import StatCard from '../../components/StatCard'
import SensorCard from '../../components/SensorCard'
import { AlertTypeBadge, SeverityBadge, StatusBadge } from '../../components/AlertBadge'

export default function SupervisorDashboard() {
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [chartData, setChartData] = useState([])
  const [resolving, setResolving] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await dashboardAPI.getSupervisor()
      setData(res.data)
      setLastUpdate(new Date())
      const workers = res.data.workers || []
      const active  = workers.filter(w => w.sensorData)
      setChartData(prev => [...prev.slice(-19), {
        time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
        methane: active.length ? Math.round(active.reduce((s,w) => s + (w.sensorData?.methane||0), 0) / active.length) : 0,
        toxic:   active.length ? Math.round(active.reduce((s,w) => s + (w.sensorData?.toxic||0), 0) / active.length) : 0,
      }])
    } catch { if (loading) toast.error('Failed to load') }
    finally  { setLoading(false) }
  }, [loading])

  useEffect(() => { fetchData(); const t = setInterval(fetchData, 6000); return () => clearInterval(t) }, [])

  const handleResolve = async (id) => {
    setResolving(id)
    try { await alertsAPI.resolve(id); toast.success('Alert resolved'); fetchData() }
    catch { toast.error('Failed') }
    finally { setResolving(null) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="w-6 h-6 text-orange-500 animate-spin" /></div>

  const { supervisor, workers = [], alerts = [] } = data || {}
  const activeAlerts   = alerts.filter(a => a.status === 'active')
  const criticalWorkers = workers.filter(w => w.activeAlerts?.length > 0)

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Emergency banner */}
      {criticalWorkers.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 animate-emergency flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
          <div>
            <p className="font-bold text-red-400">⚠ {criticalWorkers.length} worker(s) need immediate attention!</p>
            <p className="text-xs text-red-300/70 mt-0.5">{criticalWorkers.map(w => w.name).join(', ')}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">My Command Center</h1>
          <p className="text-dark-400 text-sm mt-0.5">{supervisor?.zone} • {workers.length} assigned workers</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111] border border-[#1f1f1f]">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-dark-300">Live • {lastUpdate?.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Workers"      value={workers.length}                          icon={Users}         color="blue" />
        <StatCard title="Active Now"      value={workers.filter(w=>w.status==='active').length} icon={Activity} color="green" />
        <StatCard title="Active Alerts"   value={activeAlerts.length}                     icon={AlertTriangle} color="red" />
        <StatCard title="All Clear"       value={workers.filter(w=>!w.activeAlerts?.length).length} icon={Shield} color="green" />
      </div>

      {/* Chart */}
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-white">Team Gas Level Trend</h3>
            <p className="text-xs text-dark-400">Average across your workers</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-dark-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-orange-500 rounded-full inline-block" /> Methane</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-purple-500 rounded-full inline-block" /> Toxic</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="sg1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis dataKey="time" stroke="#333" tick={{ fill: '#52525b', fontSize: 10 }} />
            <YAxis stroke="#333" tick={{ fill: '#52525b', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff' }} />
            <Area type="monotone" dataKey="methane" name="Methane" stroke="#f97316" fill="url(#sg1)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="toxic"   name="Toxic"   stroke="#a855f7" fill="url(#sg2)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Workers + Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Worker cards */}
        <div className="xl:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-white">Live Worker Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {workers.map(w => (
              <SensorCard key={w.id} worker={w} sensorData={w.sensorData} device={w.device} />
            ))}
            {workers.length === 0 && (
              <div className="col-span-2 text-center py-10 text-dark-400 bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl">
                <Users size={24} className="mx-auto mb-2 opacity-30" />
                <p>No workers assigned</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Active Alerts</h3>
            {activeAlerts.length > 0 && (
              <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5 font-bold">{activeAlerts.length}</span>
            )}
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activeAlerts.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle size={24} className="mx-auto text-green-500/30 mb-2" />
                <p className="text-xs text-dark-500">All clear — no active alerts</p>
              </div>
            )}
            {activeAlerts.map(a => (
              <div key={a.id} className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold text-white">{a.workerName}</p>
                  <AlertTypeBadge type={a.type} />
                </div>
                <p className="text-[10px] text-dark-400 mb-2">{a.message}</p>
                <p className="text-[10px] text-dark-500 mb-2">{new Date(a.timestamp).toLocaleString()}</p>
                <button onClick={() => handleResolve(a.id)} disabled={resolving === a.id}
                  className="sg-btn text-[10px] px-2 py-1 w-full justify-center bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20">
                  {resolving === a.id ? <RefreshCw size={10} className="animate-spin" /> : <><CheckCircle size={10} /> Resolve</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
