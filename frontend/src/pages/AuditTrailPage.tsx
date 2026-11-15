import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  FileCheck2,
  Lock,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  FileText,
  Upload,
  Fingerprint,
  Calendar,
  UserCheck
} from 'lucide-react';
import { getAuditLogs, verifyCustodyHash } from '../services/api';
import { AuditLogItem } from '../types';

export const AuditTrailPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Hash Verifier State
  const [claimedHash, setClaimedHash] = useState('');
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const fetchLogs = async () => {
    try {
      const res = await getAuditLogs(100, 0, eventTypeFilter || undefined);
      setLogs(res.items);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [eventTypeFilter]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyFile && !claimedHash.trim()) return;

    setVerifying(true);
    setVerificationResult(null);
    try {
      const res = await verifyCustodyHash(
        verifyFile || undefined,
        claimedHash.trim() || undefined
      );
      setVerificationResult(res);
      fetchLogs(); // Refresh log to show verification entry
    } catch (err: any) {
      setVerificationResult({
        verified: false,
        computed_sha256: claimedHash || 'N/A',
        assessment: err?.response?.data?.detail || err?.message || 'Verification failed',
      });
    } finally {
      setVerifying(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      (log.file_hash && log.file_hash.toLowerCase().includes(q)) ||
      (log.investigation_id && log.investigation_id.toLowerCase().includes(q)) ||
      log.actor.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#1E293B] pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1]">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Chain of Custody & Audit Trail</h1>
            <p className="text-sm text-[#94A3B8]">
              Cryptographic integrity records, append-only operational events, and SHA-256 verification
            </p>
          </div>
        </div>
      </div>

      {/* Cryptographic Hash Verification Card */}
      <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-semibold text-base">
          <Fingerprint className="w-5 h-5 text-[#06B6D4]" />
          <h3>Cryptographic Asset Integrity Verifier</h3>
        </div>
        <p className="text-xs text-[#94A3B8]">
          Re-calculate the cryptographic SHA-256 digest of a media file or input an existing hash to attest
          chain-of-custody authenticity against the immutable forensic audit log.
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-[#94A3B8] block mb-1.5">
                Upload Target File (Calculates SHA-256 Locally)
              </label>
              <input
                type="file"
                onChange={(e) => setVerifyFile(e.target.files?.[0] || null)}
                className="w-full text-xs font-mono text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#6366F1] file:text-white hover:file:bg-[#4F46E5] bg-[#080D18] border border-[#1E293B] rounded-lg p-1.5"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[#94A3B8] block mb-1.5">
                Or Enter Claimed SHA-256 Digest
              </label>
              <input
                type="text"
                placeholder="64-character hexadecimal digest..."
                value={claimedHash}
                onChange={(e) => setClaimedHash(e.target.value)}
                className="w-full text-xs font-mono bg-[#080D18] border border-[#1E293B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6366F1]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-[#64748B]">
              Verification confirms media ingestion, processing chain, and tamper-free preservation.
            </span>
            <button
              type="submit"
              disabled={verifying || (!verifyFile && !claimedHash.trim())}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#06B6D4] to-[#0891B2] hover:from-[#0891B2] hover:to-[#0e7490] text-white text-xs font-bold shadow-md shadow-[#06B6D4]/20 transition-all disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying Digest...
                </>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  Verify Chain of Custody
                </>
              )}
            </button>
          </div>
        </form>

        {verificationResult && (
          <div
            className={`p-4 rounded-xl border font-mono text-xs mt-4 ${
              verificationResult.verified
                ? 'bg-[#22C55E]/5 border-[#22C55E]/30 text-slate-200'
                : 'bg-[#EF4444]/5 border-[#EF4444]/30 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold mb-2">
              {verificationResult.verified ? (
                <CheckCircle className="w-4 h-4 text-[#22C55E]" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
              )}
              <span className={verificationResult.verified ? 'text-[#22C55E]' : 'text-[#EF4444]'}>
                {verificationResult.assessment}
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-[#94A3B8]">
              <p>Computed SHA-256: <span className="text-white">{verificationResult.computed_sha256}</span></p>
              {verificationResult.matched_record && (
                <>
                  <p>Registered Asset: <span className="text-white">{verificationResult.matched_record.original_filename}</span> ({verificationResult.matched_record.file_size} bytes)</p>
                  <p>Ingestion Date: <span className="text-white">{verificationResult.matched_record.upload_timestamp}</span></p>
                  <p>Investigation ID: <span className="text-[#06B6D4]">{verificationResult.matched_record.investigation_id}</span></p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search by action, hash, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-[#111827] border border-[#1E293B] rounded-lg text-white focus:outline-none focus:border-[#6366F1]"
            />
          </div>

          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="text-xs font-mono bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6366F1]"
          >
            <option value="">All Event Types</option>
            <option value="UPLOAD">UPLOAD</option>
            <option value="ANALYSIS_START">ANALYSIS_START</option>
            <option value="STAGE_COMPLETE">STAGE_COMPLETE</option>
            <option value="HASH_VERIFIED">HASH_VERIFIED</option>
            <option value="REPORT_DOWNLOADED">REPORT_DOWNLOADED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="DELETED">DELETED</option>
          </select>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111827] border border-[#1E293B] text-xs font-mono text-[#94A3B8] hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Log
        </button>
      </div>

      {/* Immutable Audit Trail Table */}
      <div className="bg-[#111827] rounded-xl border border-[#1E293B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#080D18]/80 text-[#94A3B8] font-mono uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Action / Observation</th>
                <th className="py-3 px-4">Investigation ID</th>
                <th className="py-3 px-4">SHA-256 Digest</th>
                <th className="py-3 px-4">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#94A3B8]">
                    Loading chain of custody ledger...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#94A3B8]">
                    No audit records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-[#94A3B8] whitespace-nowrap">
                      {log.timestamp.replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        log.event_type === 'UPLOAD'
                          ? 'bg-[#06B6D4]/10 border-[#06B6D4]/30 text-[#06B6D4]'
                          : log.event_type === 'STAGE_COMPLETE'
                          ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
                          : log.event_type === 'CANCELLED' || log.event_type === 'DELETED'
                          ? 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
                          : 'bg-[#6366F1]/10 border-[#6366F1]/30 text-[#6366F1]'
                      }`}>
                        {log.event_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white max-w-sm font-sans truncate" title={log.action}>
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-[#06B6D4] whitespace-nowrap">
                      {log.investigation_id ? log.investigation_id.substring(0, 8) + '...' : '—'}
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8] whitespace-nowrap" title={log.file_hash}>
                      {log.file_hash ? log.file_hash.substring(0, 12) + '...' : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {log.actor}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

