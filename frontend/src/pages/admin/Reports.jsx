import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { reportsAPI } from '../../api/index';
import { Download, Plus, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getAll();
      setReports(response.data.reports);
    } catch (error) {
      toast.error('Failed to load reports');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type) => {
    try {
      setGenerating(type);
      let response;

      if (type === 'monthly') {
        response = await reportsAPI.generateMonthly();
      } else if (type === 'alert_analysis') {
        response = await reportsAPI.generateAlertAnalysis();
      } else if (type === 'health') {
        response = await reportsAPI.generateHealth();
      }

      if (response) {
        toast.success('Report generated successfully');
        fetchReports();
      }
    } catch (error) {
      toast.error('Failed to generate report');
      console.error('Error:', error);
    } finally {
      setGenerating(null);
    }
  };

  const downloadPDF = (report) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 15;

      // Header
      doc.setFontSize(18);
      doc.text(report.title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Report Info
      doc.setFontSize(10);
      doc.text(`Type: ${report.type.replace(/_/g, ' ').toUpperCase()}`, 15, yPosition);
      yPosition += 5;
      doc.text(`Period: ${report.period}`, 15, yPosition);
      yPosition += 5;
      doc.text(`Generated: ${new Date(report.generatedAt).toLocaleString()}`, 15, yPosition);
      yPosition += 10;

      // Summary
      doc.setFontSize(12);
      doc.text('Summary:', 15, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      Object.entries(report.summary).forEach(([key, value]) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 15;
        }
        const label = key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1);
        doc.text(`${label}: ${value}`, 20, yPosition);
        yPosition += 5;
      });

      // Save PDF
      doc.save(`${report.title}.pdf`);
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
      console.error('Download error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await reportsAPI.delete(id);
        toast.success('Report deleted successfully');
        fetchReports();
      } catch (error) {
        toast.error('Failed to delete report');
      }
    }
  };

  const getReportIcon = (type) => {
    const icons = {
      monthly: '📅',
      health: '🏥',
      alert_analysis: '📊'
    };
    return icons[type] || '📋';
  };

  if (loading) {
    return <Layout><div className="text-center py-8">Loading reports...</div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Generate Report Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus size={20} /> Generate New Report
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => generateReport('monthly')}
              disabled={generating === 'monthly'}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-4 px-6 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {generating === 'monthly' ? 'Generating...' : '📅 Monthly Report'}
            </button>
            <button
              onClick={() => generateReport('health')}
              disabled={generating === 'health'}
              className="bg-green-100 hover:bg-green-200 text-green-800 py-4 px-6 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {generating === 'health' ? 'Generating...' : '🏥 Health Report'}
            </button>
            <button
              onClick={() => generateReport('alert_analysis')}
              disabled={generating === 'alert_analysis'}
              className="bg-orange-100 hover:bg-orange-200 text-orange-800 py-4 px-6 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {generating === 'alert_analysis' ? 'Generating...' : '📊 Alert Analysis'}
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Generated Reports</h2>

          {reports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <div key={report.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{getReportIcon(report.type)}</span>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">{report.title}</h3>
                        <p className="text-sm text-gray-600 capitalize">{report.type.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-gray-600 border-y py-3">
                    <div className="flex justify-between">
                      <span>Period:</span>
                      <span className="font-semibold">{report.period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Generated:</span>
                      <span className="font-semibold">{new Date(report.generatedAt).toLocaleDateString()}</span>
                    </div>
                    {report.generatedByUser && (
                      <div className="flex justify-between">
                        <span>By:</span>
                        <span className="font-semibold">{report.generatedByUser.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Summary Preview */}
                  <div className="mb-4 bg-gray-50 p-3 rounded text-sm">
                    <p className="font-semibold text-gray-700 mb-2">Summary:</p>
                    <div className="space-y-1">
                      {Object.entries(report.summary).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-gray-600">
                            {key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1)}:
                          </span>
                          <span className="font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => downloadPDF(report)}
                      className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 py-2 rounded hover:bg-blue-100 transition"
                    >
                      <Download size={16} /> Download
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-600 py-2 rounded hover:bg-red-100 transition"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <p className="text-lg">No reports generated yet</p>
              <p className="text-sm mt-2">Click the buttons above to generate your first report</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
