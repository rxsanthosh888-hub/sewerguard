import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Shield, Loader2, AlertCircle, Wifi, Lock, UserPlus, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../api'
import { useAuth } from '../context/AuthContext'

const ROLES = [
  { id: 'admin',      label: 'Admin',      color: 'text-red-400',   desc: 'Full system control' },
  { id: 'supervisor', label: 'Supervisor', color: 'text-blue-400',  desc: 'Team monitoring' },
  { id: 'worker',     label: 'Worker',     color: 'text-green-400', desc: 'Personal dashboard' },
]

export default function Login() {
  const [mode, setMode]           = useState('login')   // 'login' | 'register'
  const [role, setRole]           = useState('admin')
  const [form, setForm]           = useState({ name: '', email: '', password: '', phone: '', zone: '' })
  const [showPw, setShowPw]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const { login }                 = useAuth()
  const navigate                  = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    setLoading(true)
    try {
      const res = await authAPI.login({ email: form.email, password: form.password, role })
      login(res.data.user, res.data.token)
      toast.success(`Welcome, ${res.data.user.name}!`, { icon: '🛡️' })
      navigate(`/${res.data.user.role}`, { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!form.name || !form.email || !form.password) return setError('All fields required')
    if (['admin'].includes(role)) return setError('Admin accounts cannot self-register')
    setLoading(true)
    try {
      await authAPI.register({ ...form, role })
      setSuccess('Registration submitted! Wait for admin approval before logging in.')
      setForm({ name: '', email: '', password: '', phone: '', zone: '' })
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl mb-4 shadow-lg shadow-orange-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white">SewerGuard</h1>
          <p className="text-dark-400 text-sm mt-1">IoT Smart Safety Monitoring Platform</p>
        </div>

        <div className="glass border border-[#1f1f1f] rounded-2xl p-8 shadow-2xl">
          {/* Mode toggle */}
          <div className="flex gap-2 p-1 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] mb-6">
            <button onClick={() => { setMode('login'); setError(''); setSuccess('') }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${mode === 'login' ? 'bg-orange-500 text-white shadow-lg' : 'text-dark-300 hover:text-white'}`}>
              <Lock size={12} /> Sign In
            </button>
            <button onClick={() => { setMode('register'); setError(''); setSuccess(''); setRole('worker') }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${mode === 'register' ? 'bg-orange-500 text-white shadow-lg' : 'text-dark-300 hover:text-white'}`}>
              <UserPlus size={12} /> Register
            </button>
          </div>

          {/* Role selector */}
          <div className="flex gap-2 p-1 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] mb-6">
            {ROLES.filter(r => mode === 'login' || r.id !== 'admin').map(r => (
              <button key={r.id} type="button" onClick={() => setRole(r.id)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all ${
                  role === r.id ? 'bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-lg' : 'text-dark-300 hover:text-white hover:bg-[#1a1a1a]'
                }`}>
                {r.label}
              </button>
            ))}
          </div>

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  className="sg-input" placeholder="your@email.com" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm(f => ({...f, password: e.target.value}))}
                    className="sg-input pr-10" placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                  <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="sg-btn sg-btn-primary w-full justify-center py-3 text-sm">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : <><Shield size={16} /> Sign In</>}
              </button>

              {/* No hints shown for security */}
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {success ? (
                <div className="text-center py-6">
                  <CheckCircle size={40} className="mx-auto text-green-400 mb-3" />
                  <p className="text-green-400 font-bold text-sm">{success}</p>
                  <button onClick={() => { setMode('login'); setSuccess('') }}
                    className="sg-btn sg-btn-primary mt-4 mx-auto">
                    Go to Login
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-xs text-yellow-400 font-semibold">⚠ Requires Admin Approval</p>
                    <p className="text-xs text-dark-400 mt-0.5">Your account will be active only after admin reviews and approves it.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-1.5">Full Name *</label>
                    <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="sg-input" placeholder="Your full name" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-1.5">Email *</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="sg-input" placeholder="your@email.com" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-1.5">Password *</label>
                    <div className="relative">
                      <input type={showPw ? 'text' : 'password'} value={form.password}
                        onChange={e => setForm(f => ({...f, password: e.target.value}))}
                        className="sg-input pr-10" placeholder="••••••••" required />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white">
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
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

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                      <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="sg-btn sg-btn-primary w-full justify-center py-3 text-sm">
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><UserPlus size={16} /> Submit for Approval</>}
                  </button>
                </>
              )}
            </form>
          )}
        </div>

        <p className="text-center text-xs text-dark-500 mt-4">
          SewerGuard v2.0 • Industrial IoT Safety Platform
        </p>
      </div>
    </div>
  )
}
