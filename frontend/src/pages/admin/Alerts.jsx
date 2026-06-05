import React, { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, RefreshCw, Filter, Bell, Search, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { alertsAPI } from '../../api'
import { AlertTypeBadge, SeverityBadge, StatusBadge } from '../../components/AlertBadge'

export default function AdminAlerts() {
  const [alerts, setAlerts]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [typeFilter, setType]   = useState('all')
  const [statusFilter, setStatus] = useState('all')
  const [resolving, setResolving] = useState(null)

  const load = async () => {
    try {
      const res = await alertsAPI.getAll({ limit: 100 })
      setAlerts(res.data)
    } catch { toast.error('Failed to load alerts') }
    finally  { setLoading(false) }
  }

  useEffect(() => { load(); const t = setInterval(load, 8000); return () => clearInterval(t) }, [])

  const handleResolve = async (id) => {
    setResolving(id)
    try {
      await alertsAPI.resolve(id)
      toast.success('Alert resolved')
      load()
    } catch { toast.error('Failed to resolve') }
    finally  { setResolving(null) }
  }

  const filtered = alerts.filter(a => {
    const matchSearch = !search || [a.workerName, a.message].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    const matchType   = typeFilter === 'all' || a.type === typeFilter
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  const stats = {
    total:    alerts.length,
    active:   alerts.filter(a => a.status === 'active').length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  }

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="w-6 h-6 text-orange-500 animate-spin" /></div>

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Alert Center</h1>
          <p className="text-dark-400 text-sm">Emergency and safety alerts management</p>
        </div>
        <button onClick={load} className="sg-btn sg-btn-ghost">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Alerts', value: stats.total,    color: 'bg-[#111] border-[#1f1f1f] text-white' },
          { label: 'Active',       value: stats.active,   color: 'bg-red-500/10 border-red-500/30 text-red-400' },
          { label: 'Critical',     value: stats.critical, color: 'bg-orange-500/10 border-orange-500/30 text-orange-400' },
          { label: 'Resolved',     value: stats.resolved, color: 'bg-green-500/10 border-green-500/30 text-green-400' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 border ${s.color}`}>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{s.label}</p>
            <p className="text-3xl font-black tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Active critical banner */}
      {stats.active > 0 && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 animate-emergency flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
          <p className="text-sm font-bold text-red-400">{stats.active} active alert{stats.active > 1 ? 's' : ''} — immediate attention required</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alerts..." className="sg-input pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all','methane','toxic','fall','sos'].map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all capitalize ${typeFilter === t ? 'bg-orange-500 text-white' : 'bg-[#111] border border-[#1f1f1f] text-dark-300 hover:text-white'}`}>
              {t}
            </button>
          ))}
          <div className="w-px bg-[#2a2a2a]" />
          {['all','active','resolved'].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all capitalize ${statusFilter === s ? 'bg-orange-500 text-white' : 'bg-[#111] border border-[#1f1f1f] text-dark-300 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Alert list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl text-dark-400">
            <Bell size={32} className="mx-auto mb-3 opacity-30" />
            <p>No alerts found</p>
          </div>
        )}
        {filtered.map(alert => (
          <div key={alert.id}
            className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
              alert.severity === 'critical' && alert.status === 'active'
                ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                : alert.severity === 'warning' && alert.status === 'active'
                ? 'bg-yellow-500/5 border-yellow-500/20'
                : 'bg-[#0f0f0f] border-[#1a1a1a] hover:border-[#2a2a2a]'
            }`}>

            {/* Severity dot */}
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-2 ${
              alert.severity === 'critical' ? 'bg-red-500' : alert.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
            } ${alert.status === 'active' ? 'animate-pulse' : ''}`} />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <p className="text-sm font-bold text-white">{alert.workerName}</p>
                  <p className="text-xs text-dark-400 mt-0.5">{alert.message}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <AlertTypeBadge type={alert.type} />
                  <SeverityBadge severity={alert.severity} />
                  <StatusBadge status={alert.status} />
                </div>
              </div>
              <p className="text-[10px] text-dark-500 mt-2">
                {new Date(alert.timestamp).toLocaleString()}
                {alert.value && <span className="ml-2 text-dark-400">Value: <span className="font-bold">{alert.value} ppm</span></span>}
              </p>
            </div>

            {/* Action */}
            {alert.status === 'active' && (
              <button onClick={() => handleResolve(alert.id)} disabled={resolving === alert.id}
                className="sg-btn text-xs px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 flex-shrink-0">
                {resolving === alert.id
                  ? <RefreshCw size={12} className="animate-spin" />
                  : <><CheckCircle size={12} /> Resolve</>}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
