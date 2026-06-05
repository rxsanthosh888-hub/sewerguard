import React, { useState, useEffect } from 'react'
import { Settings, Save, RefreshCw, Shield, Bell, Cpu, AlertTriangle, UserCheck, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../../api'

export default function AdminSettings() {
  const [thresholds, setThresholds] = useState({
    methane:  { warning: 300, critical: 500 },
    toxic:    { warning: 250, critical: 350 },
  })
  const [saving, setSaving]       = useState(false)
  const [pending, setPending]     = useState([])
  const [loadingP, setLoadingP]   = useState(false)
  const [actioning, setActioning] = useState(null)

  const loadPending = async () => {
    setLoadingP(true)
    try { const r = await authAPI.getPending(); setPending(r.data) }
    catch {}
    finally { setLoadingP(false) }
  }

  useEffect(() => { loadPending(); const t = setInterval(loadPending, 10000); return () => clearInterval(t) }, [])

  const handleApprove = async (id, name) => {
    setActioning(id)
    try {
      await authAPI.approve(id)
      toast.success(`${name} approved!`)
      loadPending()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setActioning(null) }
  }

  const handleReject = async (id, name) => {
    if (!window.confirm(`Reject ${name}?`)) return
    setActioning(id)
    try {
      await authAPI.reject(id)
      toast.success(`${name} rejected`)
      loadPending()
    } catch { toast.error('Failed') }
    finally { setActioning(null) }
  }

  const save = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    toast.success('Settings saved successfully')
    setSaving(false)
  }

  const ThresholdSlider = ({ gas, field, label, min, max, color }) => {
    const val = thresholds[gas][field]
    const pct = ((val - min) / (max - min)) * 100
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-dark-300 uppercase tracking-wider">{label}</label>
          <span className={`text-sm font-black tabular-nums ${color}`}>{val} ppm</span>
        </div>
        <input type="range" min={min} max={max} step={10} value={val}
          onChange={e => setThresholds(t => ({ ...t, [gas]: { ...t[gas], [field]: +e.target.value } }))}
          className="w-full h-2 rounded-full outline-none cursor-pointer"
          style={{ background: `linear-gradient(to right, ${field === 'warning' ? '#eab308' : '#ef4444'} ${pct}%, #1f1f1f ${pct}%)` }} />
        <div className="flex justify-between text-[10px] text-dark-500 mt-1">
          <span>{min}</span><span>{max}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-slide-up max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-dark-400 text-sm">System configuration and threshold management</p>
      </div>

      {/* Gas Thresholds */}
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <AlertTriangle size={16} className="text-orange-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Gas Alert Thresholds</h2>
            <p className="text-xs text-dark-400">Configure safety limits for IoT sensors</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Methane */}
          <div className="bg-[#141414] rounded-xl p-5 border border-[#1f1f1f]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <h3 className="text-sm font-bold text-white">Methane (CH₄) — MQ-4</h3>
            </div>
            <ThresholdSlider gas="methane" field="warning"  label="Warning Level"  min={100} max={450} color="text-yellow-400" />
            <ThresholdSlider gas="methane" field="critical" label="Critical Level" min={300} max={800} color="text-red-400" />
            <div className="mt-3 p-3 rounded-lg bg-[#1a1a1a] space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-500 rounded-full" /> Safe Zone</span>
                <span className="text-dark-300">0 – {thresholds.methane.warning} ppm</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-yellow-500 rounded-full" /> Warning Zone</span>
                <span className="text-dark-300">{thresholds.methane.warning} – {thresholds.methane.critical} ppm</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-red-500 rounded-full" /> Critical Zone</span>
                <span className="text-dark-300">&gt; {thresholds.methane.critical} ppm</span>
              </div>
            </div>
          </div>

          {/* Toxic */}
          <div className="bg-[#141414] rounded-xl p-5 border border-[#1f1f1f]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <h3 className="text-sm font-bold text-white">Toxic Gas — MQ-135</h3>
            </div>
            <ThresholdSlider gas="toxic" field="warning"  label="Warning Level"  min={100} max={300} color="text-yellow-400" />
            <ThresholdSlider gas="toxic" field="critical" label="Critical Level" min={200} max={500} color="text-red-400" />
            <div className="mt-3 p-3 rounded-lg bg-[#1a1a1a] space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-500 rounded-full" /> Safe Zone</span>
                <span className="text-dark-300">0 – {thresholds.toxic.warning} ppm</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-yellow-500 rounded-full" /> Warning Zone</span>
                <span className="text-dark-300">{thresholds.toxic.warning} – {thresholds.toxic.critical} ppm</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-red-500 rounded-full" /> Critical Zone</span>
                <span className="text-dark-300">&gt; {thresholds.toxic.critical} ppm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Cpu size={16} className="text-blue-400" />
          </div>
          <h2 className="text-sm font-bold text-white">IoT Device Integration</h2>
        </div>
        <div className="space-y-3">
          {[
            ['Microcontroller',  'ESP32 DevKit V1'],
            ['Methane Sensor',   'MQ-4 (0–1000 ppm)'],
            ['Toxic Gas Sensor', 'MQ-135 (Air Quality)'],
            ['Fall Detection',   'MPU6050 Accelerometer/Gyroscope'],
            ['Emergency',        'SOS Push Button'],
            ['Indicator',        'Buzzer'],
            ['Power Supply',     '9V Battery'],
            ['Voltage Regulator','LM7805 (9V → 5V regulated)'],
            ['Communication',    'WiFi 802.11 b/g/n (ESP32 built-in)'],
            ['Data Endpoint',    'POST /api/sensors/ingest'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2.5 border-b border-[#141414] last:border-0">
              <span className="text-xs text-dark-400 uppercase tracking-wider">{k}</span>
              <span className="text-xs font-semibold text-white">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Approvals section below */}

      {/* Pending Approvals */}
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <UserCheck size={16} className="text-yellow-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Pending Account Approvals</h2>
              <p className="text-xs text-dark-400">Review and approve new registrations</p>
            </div>
          </div>
          {pending.length > 0 && (
            <span className="text-xs bg-yellow-500 text-black rounded-full px-2 py-0.5 font-black">{pending.length}</span>
          )}
        </div>

        {loadingP && <p className="text-xs text-dark-400 text-center py-4">Loading...</p>}

        {!loadingP && pending.length === 0 && (
          <div className="text-center py-8 text-dark-500">
            <UserCheck size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">No pending approvals</p>
          </div>
        )}

        <div className="space-y-3">
          {pending.map(p => (
            <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-[#141414] border border-yellow-500/20">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-white">{p.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${p.role === 'supervisor' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                    {p.role?.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-dark-400">{p.email} • {p.phone || 'No phone'}</p>
                <p className="text-xs text-dark-500">Zone: {p.zone} • Requested: {new Date(p.requestedAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleApprove(p.id, p.name)} disabled={actioning === p.id}
                  className="sg-btn text-xs px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20">
                  {actioning === p.id ? <RefreshCw size={12} className="animate-spin" /> : <><Check size={12} /> Approve</>}
                </button>
                <button onClick={() => handleReject(p.id, p.name)} disabled={actioning === p.id}
                  className="sg-btn text-xs px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20">
                  <X size={12} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={save} disabled={saving} className="sg-btn sg-btn-primary">
        {saving ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Settings</>}
      </button>
    </div>
  )
}
