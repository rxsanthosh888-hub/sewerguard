import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, X, Save, RefreshCw, UserCheck, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { supervisorsAPI } from '../../api'

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-slide-up">
      <div className="w-full max-w-lg bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
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

const EMPTY = { name: '', email: '', password: '', phone: '', zone: '', status: 'active' }

export default function AdminSupervisors() {
  const [supervisors, setSupervisors] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [modal, setModal]             = useState(null)
  const [selected, setSelected]       = useState(null)
  const [form, setForm]               = useState(EMPTY)
  const [saving, setSaving]           = useState(false)

  const load = async () => {
    try {
      const res = await supervisorsAPI.getAll()
      setSupervisors(res.data)
    } catch { toast.error('Failed to load') }
    finally  { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd  = ()  => { setForm(EMPTY); setModal('add') }
  const openEdit = (s) => { setSelected(s); setForm({ ...s, password: '' }); setModal('edit') }
  const close    = ()  => { setModal(null); setSelected(null); setForm(EMPTY) }

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error('Name and email required')
    if (modal === 'add' && !form.password) return toast.error('Password required')
    setSaving(true)
    try {
      if (modal === 'add') { await supervisorsAPI.create(form); toast.success('Supervisor added') }
      else                 { await supervisorsAPI.update(selected.id, form); toast.success('Supervisor updated') }
      close(); load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete ${s.name}?`)) return
    try { await supervisorsAPI.delete(s.id); toast.success('Deleted'); load() }
    catch { toast.error('Delete failed') }
  }

  const filtered = supervisors.filter(s =>
    !search || [s.name, s.email, s.zone].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="w-6 h-6 text-orange-500 animate-spin" /></div>

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Supervisors</h1>
          <p className="text-dark-400 text-sm">{supervisors.length} total supervisors</p>
        </div>
        <button onClick={openAdd} className="sg-btn sg-btn-primary"><Plus size={16} /> Add Supervisor</button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search supervisors..." className="sg-input pl-9" />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => (
          <div key={s.id} className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-5 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-700/10 border border-blue-500/20 flex items-center justify-center text-base font-black text-blue-400">
                  {s.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{s.name}</p>
                  <p className="text-[10px] text-dark-400">{s.email}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${s.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-[#1a1a1a] text-dark-400 border-[#2a2a2a]'}`}>
                {s.status?.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {[
                ['Zone', s.zone || 'Unassigned'],
                ['Phone', s.phone || '—'],
                ['Workers', `${s.assignedWorkers?.length || s.workerCount || 0} assigned`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-[10px] text-dark-500 uppercase tracking-wider">{k}</span>
                  <span className="text-xs font-semibold text-dark-200">{v}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, ((s.assignedWorkers?.length || 0) / 5) * 100)}%` }} />
              </div>
              <span className="text-[10px] text-dark-400">{s.assignedWorkers?.length || 0}/5</span>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => openEdit(s)} className="sg-btn sg-btn-ghost flex-1 justify-center text-xs py-2">
                <Edit2 size={12} /> Edit
              </button>
              <button onClick={() => handleDelete(s)} className="p-2 rounded-lg hover:bg-red-500/10 text-dark-400 hover:text-red-400 transition-colors border border-[#1f1f1f]">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-dark-400">
            <UserCheck size={32} className="mx-auto mb-3 opacity-30" />
            <p>No supervisors found</p>
          </div>
        )}
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Supervisor' : `Edit — ${selected?.name}`} onClose={close}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="sg-input" placeholder="Jane Smith" />
              </div>
              <div>
                <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-1.5">Zone</label>
                <input value={form.zone} onChange={e => setForm(f => ({...f, zone: e.target.value}))} className="sg-input" placeholder="Zone A - Downtown" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-1.5">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="sg-input" placeholder="supervisor@sewerguard.com" />
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
                <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className="sg-input" placeholder="+1-555-0000" />
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
              <button onClick={close} className="sg-btn sg-btn-ghost">Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
