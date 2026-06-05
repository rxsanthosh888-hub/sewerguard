import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, UserCheck, Cpu, Bell, FileText, Settings,
  LogOut, Menu, X, Shield, Activity, ChevronRight, Wifi, Battery,
  AlertTriangle, Clock, TrendingUp
} from 'lucide-react'

const navConfig = {
  admin: [
    { path: '/admin',             label: 'Dashboard',   icon: LayoutDashboard, end: true },
    { path: '/admin/workers',     label: 'Workers',     icon: Users },
    { path: '/admin/supervisors', label: 'Supervisors', icon: UserCheck },
    { path: '/admin/devices',     label: 'Devices',     icon: Cpu },
    { path: '/admin/alerts',      label: 'Alerts',      icon: Bell, badge: true },
    { path: '/admin/reports',     label: 'Reports',     icon: FileText },
    { path: '/admin/settings',    label: 'Settings',    icon: Settings },
  ],
  supervisor: [
    { path: '/supervisor',          label: 'Dashboard', icon: LayoutDashboard, end: true },
    { path: '/supervisor/workers',  label: 'Workers',   icon: Users },
    { path: '/supervisor/alerts',   label: 'Alerts',    icon: Bell, badge: true },
  ],
  worker: [
    { path: '/worker', label: 'My Dashboard', icon: LayoutDashboard, end: true },
  ],
}

const roleMeta = {
  admin:      { label: 'System Admin',    color: 'from-red-500 to-red-700',    badge: 'bg-red-500/20 text-red-400' },
  supervisor: { label: 'Supervisor',      color: 'from-blue-500 to-blue-700',  badge: 'bg-blue-500/20 text-blue-400' },
  worker:     { label: 'Field Worker',    color: 'from-green-500 to-green-700', badge: 'bg-green-500/20 text-green-400' },
}

export default function Layout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [time, setTime]               = useState(new Date())
  const [alertCount, setAlertCount]   = useState(0)
  const { user, logout }              = useAuth()
  const navigate                      = useNavigate()
  const location                      = useLocation()
  const meta                          = roleMeta[role] || roleMeta.worker
  const navItems                      = navConfig[role] || []

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const pageTitle = navItems.find(n =>
    n.end ? location.pathname === n.path : location.pathname.startsWith(n.path)
  )?.label || 'Dashboard'

  return (
    <div className="flex h-screen bg-[#080808] overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col
        bg-[#0a0a0a] border-r border-[#1a1a1a]
        transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[#1a1a1a]">
          <div className="relative">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-lg`}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0a]">
              <div className="w-full h-full bg-green-400 rounded-full animate-ping-ring opacity-75" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold text-white">SewerGuard</h1>
            <p className="text-[10px] text-orange-500 font-semibold tracking-widest uppercase">Safety Platform</p>
          </div>
        </div>

        {/* User card */}
        <div className="px-4 py-4 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#111111] border border-[#1f1f1f]">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.badge}`}>
                {meta.label}
              </span>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 animate-pulse" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="text-[10px] font-bold text-dark-400 uppercase tracking-widest px-3 mb-3">Navigation</p>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 relative
                ${isActive
                  ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/5 text-orange-400 border border-orange-500/20'
                  : 'text-dark-300 hover:text-white hover:bg-[#141414]'}
              `}>
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-orange-500 rounded-r-full" />}
                  <item.icon size={16} className={isActive ? 'text-orange-400' : 'text-dark-400 group-hover:text-white'} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && alertCount > 0 && (
                    <span className="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                      {alertCount}
                    </span>
                  )}
                  <ChevronRight size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100 text-orange-400' : ''}`} />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* System status */}
        <div className="px-4 py-3 border-t border-[#1a1a1a]">
          <div className="flex items-center justify-between text-xs text-dark-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Wifi size={10} className="text-green-400" />
              System Online
            </span>
            <span className="text-dark-500">{time.toLocaleTimeString()}</span>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium text-dark-300 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center justify-between px-4 lg:px-6 py-3 bg-[#0a0a0a] border-b border-[#1a1a1a] flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-dark-300 hover:text-white hover:bg-[#1a1a1a] transition-colors">
              <Menu size={18} />
            </button>
            <div>
              <h2 className="text-base font-bold text-white">{pageTitle}</h2>
              <p className="text-xs text-dark-400 hidden sm:block">
                {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] border border-[#1f1f1f]">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400 font-medium">Live</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] border border-[#1f1f1f]">
              <Activity size={12} className="text-orange-400" />
              <span className="text-xs text-dark-300">{time.toLocaleTimeString()}</span>
            </div>
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-xs font-bold text-white`}>
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
