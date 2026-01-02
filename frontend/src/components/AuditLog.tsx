'use client';

import { useState, useEffect } from 'react';
import { FileText, Filter, Download, Loader2, AlertCircle } from 'lucide-react';
import { getAuditLogs, getAuditSummary } from '@/lib/api';

interface AuditLogProps {
  queryCount: number;
}

export default function AuditLog({ queryCount }: AuditLogProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [hours, setHours] = useState<number>(24);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const [logsData, summaryData] = await Promise.all([
        getAuditLogs(hours, filter === 'all' ? undefined : filter),
        getAuditSummary(hours)
      ]);
      setLogs(logsData.entries);
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [hours, filter, queryCount]);

  const downloadLogs = () => {
    const dataStr = JSON.stringify({ logs, summary }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_logs_${new Date().toISOString()}.json`;
    link.click();
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'medical_query':
        return 'bg-blue-100 text-blue-800';
      case 'attestation_verification':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'api_request':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <FileText className="w-8 h-8 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            HIPAA-Compliant Audit Log
          </h2>
        </div>
        <p className="text-gray-600">
          All operations are logged without exposing Protected Health Information (PHI)
        </p>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-500 font-semibold uppercase mb-1">
              Total Events
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {summary.totals?.total_events || 0}
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-500 font-semibold uppercase mb-1">
              Medical Queries
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {summary.totals?.medical_queries || 0}
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-500 font-semibold uppercase mb-1">
              Avg Response Time
            </div>
            <div className="text-2xl font-bold text-green-600">
              {summary.performance?.average_processing_time_ms?.toFixed(0) || 0}ms
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-500 font-semibold uppercase mb-1">
              Errors
            </div>
            <div className="text-2xl font-bold text-red-600">
              {summary.totals?.errors || 0}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Events</option>
            <option value="medical_query">Medical Queries</option>
            <option value="attestation_verification">Attestations</option>
            <option value="error">Errors</option>
            <option value="api_request">API Requests</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Last</span>
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={1}>1 hour</option>
            <option value={24}>24 hours</option>
            <option value={168}>7 days</option>
          </select>
        </div>

        <div className="flex-1" />

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>

        <button
          onClick={downloadLogs}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && logs.length === 0 && (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading audit logs...</p>
        </div>
      )}

      {/* Logs Table */}
      {logs.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Event Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getEventTypeColor(log.event_type)}`}>
                        {log.event_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="max-w-md">
                        {Object.entries(log.details).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <span className="font-medium">{key}:</span>
                            <span className="truncate">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {logs.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No audit logs found for the selected filters</p>
        </div>
      )}

      {/* Compliance Note */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-2">
          ✓ HIPAA Compliant Logging
        </h3>
        <ul className="space-y-1 text-sm text-green-800">
          <li>• No Protected Health Information (PHI) stored in logs</li>
          <li>• All identifiers are hashed for privacy</li>
          <li>• Tamper-proof structured logging (JSONL format)</li>
          <li>• Complete audit trail for compliance review</li>
        </ul>
      </div>
    </div>
  );
}
