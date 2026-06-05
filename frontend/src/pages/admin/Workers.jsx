import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, X, Save, RefreshCw, Eye, UserCheck, UserX, ArrowRightLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { workersAPI, supervisorsAPI } from '../../api'

function Modal({ title, onClose, children, size = 'md' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-slide-up">
      <div className={`w-full ${size === 'lg' ? 'max-w-2xl' : 'max-w-lg'} bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a] sticky top-0 bg-[#0f0f0f]">
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#1a1a1a] text-dark-300 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

const EMPTY = { name: '', email: '', password: '', phone: '', employeeId: '', supervisorId: '', zone: '', status: 'active', role: 'worker' }

export default function AdminWorkers() {
  const [workers, setWorkers]         = useState([])
  const [supervisors, setSupervisors] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filter, setFilter]           = useState('all')
  const [modal, setModal]             = useState(null)
  const [selected, setSelected]       = useState(null)
  const [form, setForm]               = useState(EMPTY)
  const [saving, setSaving]           = useState(false)

  const load = async () => {
    try {
      const [w, s] = await Promise.all([workersAPI.getAll(), supervisorsAPI.getAll()])
      setWorkers(w.data)
      setSupervisors(s.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd   = ()  => { setForm(EMPTY); setModal('add') }
  const openEdit  = (w) => { setSelected(w); setForm({ ...w, password: '' }); setModal('edit') }
  const openView  = (w) => { setSelected(w); setModal('view') }
  const openRole  = (w) => { setSelected(w); setForm({ ...w, password: '' }); setModal('role') }
  const closeModal = () => { setModal(null); setSelected(null); setForm(EMPTY) }

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error('Name and email required')
    if (modal === 'add' && !form.password) return toast.error('Password required')
    setSaving(true)
    try {
      if (modal === 'add') {
        await workersAPI.create(form)
        toast.success('Worker added!')
      } else {
        await workersAPI.update(selected.id, form)
        toast.success('Worker updated!')
      }
      closeModal(); load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleRoleChange = async () => {
    setSaving(true)
    try {
      await workersAPI.update(selected.id, {
        role: form.role,
        supervisorId: form.supervisorId,
        status: form.status,
        zone: form.zone
      })
      toast.success(`Role updated to ${form.role}!`)
      closeModal(); load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async (w) => {
    if (!window.confirm(`Delete ${w.name}?`)) return
    try { await workersAPI.delete(w.id); toast.success('Deleted'); load() }
    catch { toast.error('Delete failed') }
  }

  const handleToggleStatus = async (w) => {
    const newStatus = w.status === 'active' ? 'inactive' : 'active'
    try {
      await workersAPI.update(w.id, { status: newStatus })
      toast.success(`${w.name} marked ${newStatus}`)
      load()
    } catch { toast.error('Update failed') }
  }

  const filtered = workers.filter(w => {
    const matchSearch = !search || [w.name, w.email, w.employeeId, w.zone].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    const matchFilter = filter === 'all' || w.status === filter
    return matchSearch && matchFilter
  })

  const supName = (id) => supervisors.find(s => s.id === id)?.name || 'Unassigned'

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="w-6 h-6 text-orange-500 animate-spin" /></div>

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Workers</h1>
          <p className="text-dark-400 text-sm">{workers.length} total • {workers.filter(w => w.status === 'active').length} active</p>
        </div>
        <button onClick={openAdd} className="sg-btn sg-btn-primary"><Plus size={16} /> Add Worker</button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, ID, zone..." className="sg-input pl-9" />
        </div>
        <div className="flex gap-2">
          {['all','active','inactive'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${filter === f ? 'bg-orange-500 text-white' : 'bg-[#111] border border-[#1f1f1f] text-dark-300 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#1a1a1a] flex items-center justify-between">
          <span className="text-sm font-bold text-white">{filtered.length} workers</span>
          <button onClick={load} className="p-1.5 rounded-lg hover:bg-[#1a1a1a] text-dark-400 hover:text-white">
            <RefreshCw size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Role</th>
                <th>Zone</th>
                <th>Supervisor</th>
                <th>Status</th>
                <th>Sensor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-dark-400">No workers found</td></tr>
              )}
              {filtered.map(w => {
                const s = w.sensorData
                const sensorStatus = !s ? 'NO DATA'
                  : (s.methane >= 500 || s.toxic >= 350 || s.fallDetected || s.sosActivated) ? 'CRITICAL'
                  : (s.methane >= 300 || s.toxic >= 250) ? 'WARNING' : 'SAFE'
                const sensorColor = sensorStatus === 'CRITICAL' ? 'text-red-400' : sensorStatus === 'WARNING' ? 'text-yellow-400' : sensorStatus === 'SAFE' ? 'text-green-400' : 'text-dark-500'
                return (
                  <tr key={w.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-xs font-black text-orange-400 flex-shrink-0">
                          {w.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{w.name}</p>
                          <p className="text-[10px] text-dark-400">{w.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${
                        w.role === 'supervisor' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
                        w.role === 'admin'      ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                        'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}>{w.role?.toUpperCase()}</span>
                    </td>
                    <td><span className="text-xs text-dark-300">{w.zone || '—'}</span></td>
                    <td><span className="text-xs text-dark-300">{supName(w.supervisorId)}</span></td>
                    <td>
                      <button onClick={() => handleToggleStatus(w)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border cursor-pointer transition-all hover:opacity-80 ${
                          w.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-[#1a1a1a] text-dark-400 border-[#2a2a2a]'
                        }`}>
                        {w.status?.toUpperCase()}
                      </button>
                    </td>
                    <td><span className={`text-xs font-bold ${sensorColor}`}>{sensorStatus}</span></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openView(w)} title="View" className="p-1.5 rounded-lg hover:bg-blue-500/10 text-dark-400 hover:text-blue-400 transition-colors">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => openRole(w)} title="Change Role / Assign Supervisor" className="p-1.5 rounded-lg hover:bg-purple-500/10 text-dark-400 hover:text-purple-400 transition-colors">
                          <ArrowRightLeft size={13} />
                        </button>
                        <button onClick={() => openEdit(w)} title="Edit" className="p-1.5 rounded-lg hover:bg-orange-500/10 text-dark-400 hover:text-orange-400 transition-colors">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(w)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-500/10 text-dark-400 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Role Change Modal ── */}
      {modal === 'role' && selected && (
        <Modal title={`Change Role — ${selected.name}`} onClose={closeModal}>
          <div className="space-y-5">
            {/* Current info */}
            <div className="flex items-center gap-3 p-4 bg-[#141414] rounded-xl border border-[#1f1f1f]">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-lg font-black text-orange-400">
                {selected.name?.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-white">{selected.name}</p>
                <p className="text-xs text-dark-400">{selected.email}</p>
                <p className="text-xs text-dark-500 mt-0.5">Current role: <span className="text-orange-400 font-bold">{selected.role?.toUpperCase()}</span></p>
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-3">Change Role To</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'worker',     label: '👷 Worker',     desc: 'Field safety worker', color: 'border-green-500/30 bg-green-500/5 text-green-400' },
                  { value: 'supervisor', label: '👔 Supervisor', desc: 'Team supervisor',       color: 'border-blue-500/30 bg-blue-500/5 text-blue-400' },
                ].map(r => (
                  <button key={r.value} type="button" onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      form.role === r.value ? r.color + ' border-2' : 'border-[#2a2a2a] bg-[#141414] text-dark-300 hover:border-[#3a3a3a]'
                    }`}>
                    <p className="font-bold text-sm">{r.label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Assign supervisor (only if role = worker) */}
            {form.role === 'worker' && (
              <div>
                <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-1.5">Assign Supervisor</label>
                <select value={form.supervisorId || ''} onChange={e => setForm(f => ({...f, supervisorId: e.target.value}))} className="sg-input">
                  <option value="">— No Supervisor —</option>
                  {supervisors.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.zone})</option>
                  ))}
                </select>
                {form.supervisorId && (
                  <div className="mt-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
                    <UserCheck size={12} className="text-blue-400" />
                    <span className="text-xs text-blue-400">Assigned to: <strong>{supName(form.supervisorId)}</strong></span>
                    <button onClick={() => setForm(f => ({...f, supervisorId: ''}))} className="ml-auto text-dark-400 hover:text-red-400">
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Zone */}
            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-1.5">Zone</label>
              <input value={form.zone || ''} onChange={e => setForm(f => ({...f, zone: e.target.value}))} className="sg-input" placeholder="Zone A - Downtown" />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-1.5">Account Status</label>
              <div className="flex gap-3">
                {['active', 'inactive'].map(s => (
                  <button key={s} type="button" onClick={() => setForm(f => ({...f, status: s}))}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all capitalize ${
                      form.status === s
                        ? s === 'active' ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'
                        : 'bg-[#141414] text-dark-400 border-[#2a2a2a] hover:border-[#3a3a3a]'
                    }`}>
                    {s === 'active' ? '✅ Active' : '❌ Inactive'}
                  </button>
                ))}
              </div>
            </div>

            {/* Warning if removing supervisor role */}
            {selected.role === 'supervisor' && form.role === 'worker' && (
              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-xs text-yellow-400 font-bold">⚠ Role Downgrade Warning</p>
                <p className="text-xs text-dark-300 mt-1">This person will lose supervisor access and assigned workers will be unassigned.</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={handleRoleChange} disabled={saving} className="sg-btn sg-btn-primary flex-1 justify-center">
                {saving ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : <><ArrowRightLeft size={14} /> Apply Changes</>}
              </button>
              <button onClick={closeModal} className="sg-btn sg-btn-ghost">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Add / Edit Modal ── */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add New Worker' : `Edit — ${selected?.name}`} onClose={closeModal}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="sg-input" placeholder="John Smith" />
              </div>
              <div>
                <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-1.5">Employee ID</label>
                <input value={form.employeeId} onChange={e => setForm(f => ({...f, employeeId: e.target.value}))} className="sg-input" placeholder="EMP-001" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-1.5">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="sg-input" placeholder="worker@sewerguard.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-1.5">
                Password {modal === 'edit' && <span className="font-normal text-dark-500">(leave blank to keep)</span>}
              </label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} className="sg-input" placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-1.5">Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className="sg-input" placeholder="+91-9999999999" />
              </div>
              <div>
                <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-1.5">Zone</label>
                <input value={form.zone} onChange={e => setForm(f => ({...f, zone: e.target.value}))} className="sg-input" placeholder="Zone A" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-1.5">Assign Supervisor</label>
                <select value={form.supervisorId || ''} onChange={e => setForm(f => ({...f, supervisorId: e.target.value}))} className="sg-input">
                  <option value="">None</option>
                  {supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} className="sg-input">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="sg-btn sg-btn-primary flex-1 justify-center">
                {saving ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save</>}
              </button>
              <button onClick={closeModal} className="sg-btn sg-btn-ghost">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── View Modal ── */}
      {modal === 'view' && selected && (
        <Modal title="Worker Details" onClose={closeModal}>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[#141414] rounded-xl border border-[#1f1f1f]">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-2xl font-black text-white">
                {selected.name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selected.name}</h3>
                <p className="text-sm text-dark-400">{selected.email}</p>
                <p className="text-xs text-orange-400 font-semibold mt-1">{selected.employeeId} • {selected.zone}</p>
              </div>
            </div>
            {[
              ['Role',       selected.role],
              ['Phone',      selected.phone || '—'],
              ['Supervisor', supName(selected.supervisorId)],
              ['Status',     selected.status],
              ['Joined',     new Date(selected.createdAt).toLocaleDateString()],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-[#141414]">
                <span className="text-xs text-dark-400 uppercase tracking-wider">{k}</span>
                <span className="text-sm font-semibold text-white capitalize">{v}</span>
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => { closeModal(); openRole(selected) }} className="sg-btn sg-btn-primary flex-1 justify-center">
                <ArrowRightLeft size={14} /> Change Role
              </button>
              <button onClick={() => { closeModal(); openEdit(selected) }} className="sg-btn sg-btn-ghost flex-1 justify-center">
                <Edit2 size={14} /> Edit
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
