'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetEntity: string;
  details: string | null;
  timestamp: string;
  admin: {
    name: string;
    email: string;
  };
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      if (res.ok && data.success) {
        setLogs(data.logs || []);
      } else {
        setError(data.error || 'Failed to retrieve immutable audit logs ledger.');
      }
    } catch (e) {
      setError('An error occurred loading audit logs database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionColor = (action: string) => {
    if (action.includes('SUSPEND') || action.includes('REJECT')) {
      return 'text-red-700 bg-red-50 border border-red-100';
    }
    if (action.includes('APPROVE') || action.includes('VERIFY')) {
      return 'text-secondary bg-secondary/10 border border-secondary/15';
    }
    return 'text-primary bg-[#FCF9F6] border border-[#E5E1D8]';
  };

  return (
    <div className="space-y-6 bg-white p-6 sm:p-8 rounded-xl border border-[#E5E1D8] shadow-md">
      
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-secondary" /> Platform Immutable Audit Logs
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Cryptographically aligned, non-cancellable timeline logs of every administrative intervention.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded text-xs flex gap-2">
          <AlertTriangle className="w-4.5 h-4.5 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
        </div>
      ) : logs.length === 0 ? (
        <p className="text-center py-12 text-xs text-muted-foreground">No administrative audit logs logged yet.</p>
      ) : (
        <div className="overflow-x-auto border border-[#E5E1D8] rounded-xl shadow-sm">
          <table className="w-full text-xs text-left font-sans text-primary">
            <thead>
              <tr className="bg-[#FCF9F6] border-b border-[#E5E1D8] text-muted-foreground">
                <th className="p-3 font-semibold">Timestamp</th>
                <th className="p-3 font-semibold">Administrator</th>
                <th className="p-3 font-semibold">Action Trigger</th>
                <th className="p-3 font-semibold">Target Record</th>
                <th className="p-3 font-semibold">Intervention Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF8F5]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FCF9F6]/25 transition-colors">
                  
                  {/* Timestamp */}
                  <td className="p-3 text-muted-foreground font-medium">
                    {formatDate(log.timestamp)}
                  </td>
                  
                  {/* Admin details */}
                  <td className="p-3 font-bold">
                    {log.admin.name}
                  </td>
                  
                  {/* Action tag */}
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold tracking-wide text-[9px] uppercase ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  
                  {/* Target Entity */}
                  <td className="p-3 font-mono font-medium text-muted-foreground tracking-tight">
                    {log.targetEntity}
                  </td>
                  
                  {/* Details comments */}
                  <td className="p-3 leading-relaxed text-muted-foreground">
                    {log.details || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
