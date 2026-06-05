import React, { useState, useEffect } from 'react'
import { FileText, Download, RefreshCw, TrendingUp, Users, AlertTriangle, Cpu, FileSpreadsheet } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import toast from 'react-hot-toast'
import { reportsAPI } from '../../api'

const COLORS = ['#f97316','#ef4444','#a855f7','#3b82f6','#22c55e']

export default function AdminReports() {
  const [summary, setSummary]   = useState(null)
  const [workers, setWorkers]   = useState([])
  const [alerts, setAlerts]     = useState([])
  const [loading, setLoading]   = useState(true)

  const load = async () => {
    try {
      const [s, w, a] = await Promise.all([reportsAPI.getSummary(), reportsAPI.getWorkers(), reportsAPI.getAlerts()])
      setSummary(s.data); setWorkers(w.data); setAlerts(a.data)
    } catch { toast.error('Failed to load reports') }
    finally  { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const downloadPDF = async () => {
    toast.loading('Generating PDF...', { id: 'pdf' })
    try {
      const { default: jsPDF }       = await import('jspdf')
      const { default: autoTable }   = await import('jspdf-autotable')
      const doc = new jsPDF()

      // Header
      doc.setFillColor(249, 115, 22)
      doc.rect(0, 0, 210, 25, 'F')
      doc.setTextColor(255,255,255)
      doc.setFontSize(18)
      doc.setFont('helvetica','bold')
      doc.text('SewerGuard — Safety Report', 14, 16)
      doc.setFontSize(9)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 140, 16)

      // Summary
      doc.setTextColor(0,0,0)
      doc.setFontSize(13); doc.setFont('helvetica','bold')
      doc.text('Executive Summary', 14, 38)
      autoTable(doc, {
        startY: 43,
        head: [['Metric','Value']],
        body: [
          ['Total Workers', summary?.totalWorkers],
          ['Active Workers', summary?.activeWorkers],
          ['Total Supervisors', summary?.totalSupervisors],
          ['Online Devices', summary?.onlineDevices],
          ['Total Alerts', summary?.totalAlerts],
          ['Critical Alerts', summary?.criticalAlerts],
        ],
        theme: 'grid',
        headStyles: { fillColor: [249,115,22] },
        styles: { fontSize: 9 }
      })

      // Workers
      doc.setFontSize(13); doc.setFont('helvetica','bold')
      doc.text('Worker Registry', 14, doc.lastAutoTable.finalY + 15)
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Name','Employee ID','Zone','Supervisor','Status','Alerts']],
        body: workers.map(w => [w.name, w.employeeId, w.zone, w.supervisorName, w.status, w.alertCount]),
        theme: 'striped',
        headStyles: { fillColor: [249,115,22] },
        styles: { fontSize: 8 }
      })

      // Alerts
      if (alerts.length > 0) {
        doc.addPage()
        doc.setFontSize(13); doc.setFont('helvetica','bold')
        doc.text('Alert History', 14, 20)
        autoTable(doc, {
          startY: 25,
          head: [['Worker','Type','Severity','Status','Timestamp']],
          body: alerts.slice(0,50).map(a => [a.workerName, a.type, a.severity, a.status, new Date(a.timestamp).toLocaleString()]),
          theme: 'striped',
          headStyles: { fillColor: [239,68,68] },
          styles: { fontSize: 8 }
        })
      }

      doc.save(`SewerGuard-Report-${new Date().toISOString().slice(0,10)}.pdf`)
      toast.success('PDF downloaded!', { id: 'pdf' })
    } catch(e) { toast.error('PDF generation failed', { id: 'pdf' }) }
  }

  const downloadExcel = async () => {
    toast.loading('Generating Excel...', { id: 'xls' })
    try {
      const XLSX = await import('xlsx')
      const wb   = XLSX.utils.book_new()

      // Summary sheet
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['SewerGuard Safety Report'],
        ['Generated', new Date().toLocaleString()],
        [],
        ['Metric', 'Value'],
        ['Total Workers',    summary?.totalWorkers],
        ['Active Workers',   summary?.activeWorkers],
        ['Total Supervisors',summary?.totalSupervisors],
        ['Online Devices',   summary?.onlineDevices],
        ['Total Alerts',     summary?.totalAlerts],
        ['Critical Alerts',  summary?.criticalAlerts],
      ]), 'Summary')

      // Workers
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
        workers.map(w => ({ Name: w.name, 'Employee ID': w.employeeId, Zone: w.zone, Supervisor: w.supervisorName, Status: w.status, Alerts: w.alertCount }))
      ), 'Workers')

      // Alerts
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
        alerts.map(a => ({ Worker: a.workerName, Type: a.type, Severity: a.severity, Status: a.status, Message: a.message, Timestamp: new Date(a.timestamp).toLocaleString() }))
      ), 'Alerts')

      XLSX.writeFile(wb, `SewerGuard-Report-${new Date().toISOString().slice(0,10)}.xlsx`)
      toast.success('Excel downloaded!', { id: 'xls' })
    } catch { toast.error('Excel generation failed', { id: 'xls' }) }
  }

  const alertByType = summary?.alertsByType
    ? Object.entries(summary.alertsByType).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
    : []

  const workerStatus = [
    { name: 'Active',   value: summary?.activeWorkers || 0 },
    { name: 'Inactive', value: summary?.inactiveWorkers || 0 },
  ]

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="w-6 h-6 text-orange-500 animate-spin" /></div>

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Reports & Analytics</h1>
          <p className="text-dark-400 text-sm">System-wide safety performance overview</p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadPDF}   className="sg-btn sg-btn-primary"><Download size={14} /> PDF</button>
          <button onClick={downloadExcel} className="sg-btn sg-btn-ghost"><FileSpreadsheet size={14} /> Excel</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Workers',  value: summary?.totalWorkers,   icon: Users,          color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Active Workers', value: summary?.activeWorkers,  icon: TrendingUp,     color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20' },
          { label: 'Total Alerts',   value: summary?.totalAlerts,    icon: AlertTriangle,  color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
          { label: 'Online Devices', value: `${summary?.onlineDevices}/${summary?.totalDevices}`, icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 border ${s.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-dark-400">{s.label}</p>
              <s.icon size={16} className={s.color} />
            </div>
            <p className={`text-3xl font-black tabular-nums ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alert by type */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Alerts by Type</h3>
          {alertByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={alertByType} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {alertByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '8px' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#71717a' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-dark-500 py-16 text-sm">No alert data</p>}
        </div>

        {/* Worker status */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Worker Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={workerStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
              <XAxis dataKey="name" stroke="#333" tick={{ fill: '#52525b', fontSize: 11 }} />
              <YAxis stroke="#333" tick={{ fill: '#52525b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '8px' }} />
              <Bar dataKey="value" name="Workers" radius={[6,6,0,0]}>
                {workerStatus.map((_, i) => <Cell key={i} fill={i === 0 ? '#22c55e' : '#ef4444'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Workers table */}
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1a1a1a]">
          <h3 className="text-sm font-bold text-white">Worker Report</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Worker</th><th>Employee ID</th><th>Zone</th><th>Supervisor</th><th>Status</th><th>Total Alerts</th></tr>
            </thead>
            <tbody>
              {workers.map(w => (
                <tr key={w.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-400">
                        {w.name?.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-white">{w.name}</span>
                    </div>
                  </td>
                  <td><span className="text-xs font-mono text-dark-300">{w.employeeId}</span></td>
                  <td><span className="text-xs text-dark-300">{w.zone}</span></td>
                  <td><span className="text-xs text-dark-300">{w.supervisorName}</span></td>
                  <td>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${w.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-[#1a1a1a] text-dark-400 border-[#2a2a2a]'}`}>
                      {w.status?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`text-sm font-bold tabular-nums ${w.alertCount > 0 ? 'text-orange-400' : 'text-dark-400'}`}>
                      {w.alertCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
