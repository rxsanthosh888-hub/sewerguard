import React, { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, RefreshCw, Bell, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { alertsAPI } from '../../api'
import { AlertTypeBadge, SeverityBadge, StatusBadge } from '../../components/AlertBadge'

export default function SupervisorAlerts() {
  const [alerts, setAlerts]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [statusF, setStatusF]   = useState('all')
  const [resolving, setResolving] = useState(null)

  const load = async () => {
    try { const res = await alertsAPI.getAll({ limit: 80 }); setAlerts(res.data) }
    catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load(); const t = setInterval(load, 8000); return () => clearInterval(t) }, [])

  const handleResolve = async (id) => {
    setResolving(id)
    try { await alertsAPI.resolve(id); toast.success('Resolved'); load() }
    catch { toast.error('Failed') }
    finally { setResolving(null) }
  }

  const filtered = alerts.filter(a => {
    const ms = !search || [a.workerName, a.message].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    const mf = statusF === 'all' || a.status === statusF
    return ms && mf
  })

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="w-6 h-6 text-orange-500 animate-spin" /></div>

  const active = alerts.filter(a => a.status === 'active').length

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Alert History</h1>
          <p className="text-dark-400 text-sm">Your team's safety incidents</p>
        </div>
        {active > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 animate-pulse">
            <AlertTriangle size={14} className="text-red-400" />
            <span className="text-xs font-bold text-red-400">{active} Active</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alerts..." className="sg-input pl-9" />
        </div>
        <div className="flex gap-2">
          {['all','active','resolved'].map(s => (
            <button key={s} onClick={() => setStatusF(s)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all capitalize ${statusF === s ? 'bg-orange-500 text-white' : 'bg-[#111] border border-[#1f1f1f] text-dark-300 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl">
            <Bell size={28} className="mx-auto text-dark-600 mb-2" />
            <p className="text-dark-400">No alerts found</p>
          </div>
        )}
        {filtered.map(a => (
          <div key={a.id}
            className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${
              a.severity === 'critical' && a.status === 'active' ? 'bg-red-500/5 border-red-500/20' : 'bg-[#0f0f0f] border-[#1a1a1a]'
            }`}>
            <div className={`w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 ${a.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'} ${a.status === 'active' ? 'animate-pulse' : ''}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <p className="text-sm font-bold text-white">{a.workerName}</p>
                  <p className="text-xs text-dark-400 mt-0.5">{a.message}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <AlertTypeBadge type={a.type} />
                  <SeverityBadge severity={a.severity} />
                  <StatusBadge status={a.status} />
                </div>
              </div>
              <p className="text-[10px] text-dark-500 mt-1.5">{new Date(a.timestamp).toLocaleString()}</p>
            </div>
            {a.status === 'active' && (
              <button onClick={() => handleResolve(a.id)} disabled={resolving === a.id}
                className="sg-btn text-xs px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 flex-shrink-0">
                {resolving === a.id ? <RefreshCw size={11} className="animate-spin" /> : <><CheckCircle size={11} /> Resolve</>}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
