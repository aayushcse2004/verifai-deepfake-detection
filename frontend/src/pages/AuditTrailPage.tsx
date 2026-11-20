import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  FileCheck2,
  Lock,
  Search,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Fingerprint,
  Link2,
} from 'lucide-react';
import { getAuditLogs, verifyCustodyHash, verifyAuditHashChain } from '../services/api';
import { AuditLogItem } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { TableSkeleton } from '../components/common/Skeleton';
import { useToast } from '../components/common/ToastContext';

export const AuditTrailPage: React.FC = () => {
  const { addToast } = useToast();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Hash Verifier State
  const [claimedHash, setClaimedHash] = useState('');
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Chain of Custody Integrity State
  const [verifyingChain, setVerifyingChain] = useState(false);
  const [chainResult, setChainResult] = useState<any>(null);

  const handleVerifyChain = async () => {
    setVerifyingChain(true);
    setChainResult(null);
    try {
      const res = await verifyAuditHashChain();
      setChainResult(res);
      addToast({
        type: res.valid ? 'success' : 'error',
        title: res.valid ? 'Cryptographic Chain Validated' : 'Hash Chain Disparity Detected',
        message: res.message || (res.valid ? 'All blocks intact.' : 'Potential tampering detected.'),
      });
    } catch (err: any) {
      setChainResult({
        valid: false,
        error: err?.message || 'Failed to verify chain',
      });
    } finally {
      setVerifyingChain(false);
    }
  };

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
      fetchLogs();
      addToast({
        type: res.verified ? 'success' : 'warning',
        title: res.verified ? 'Asset Authenticated' : 'Hash Not Found',
        message: res.assessment,
      });
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
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Management' },
          { label: 'Audit Trail' },
        ]}
      />

      <PageHeader
        title="Chain of Custody & Audit Trail"
        subtitle="Cryptographic integrity records, append-only operational events, and sequential SHA-256 hash chaining"
        icon={<Lock className="w-5 h-5" />}
        actions={
          <Button variant="outline" size="sm" onClick={fetchLogs}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh Ledger
          </Button>
        }
      />

      {/* Hash Chain Integrity & Single Asset Verifier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chain of Custody Hash-Chain Status (1 Col) */}
        <Card className="border-[#1E293B] bg-[#0E1424] flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Link2 className="w-5 h-5 text-[#6366F1]" />
                Hash Chain Integrity
              </CardTitle>
              <CardDescription>
                Verify that the append-only audit trail is cryptographically linked and untampered from genesis block to current head.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chainResult && (
                <div
                  className={`p-3.5 rounded-lg border text-xs font-mono space-y-1 ${
                    chainResult.valid
                      ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
                      : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {chainResult.valid ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    <span>{chainResult.valid ? 'CHAIN VERIFIED INTACT' : 'CHAIN COMPROMISED'}</span>
                  </div>
                  <p className="text-[11px] opacity-90">{chainResult.message || chainResult.error}</p>
                  {chainResult.total_records !== undefined && (
                    <p className="text-[10px] text-slate-400">Total Blocks Checked: {chainResult.total_records}</p>
                  )}
                </div>
              )}
            </CardContent>
          </div>

          <div className="p-6 pt-0">
            <Button
              onClick={handleVerifyChain}
              disabled={verifyingChain}
              loading={verifyingChain}
              variant="primary"
              className="w-full"
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              {verifyingChain ? 'Traversing Hash Chain...' : 'Verify Cryptographic Chain'}
            </Button>
          </div>
        </Card>

        {/* Cryptographic Asset Integrity Verifier (2 Cols) */}
        <Card className="lg:col-span-2 border-[#1E293B] bg-[#0E1424]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-[#06B6D4]" />
              Cryptographic Asset Integrity Verifier
            </CardTitle>
            <CardDescription>
              Re-calculate the cryptographic SHA-256 digest of a media file or input an existing hash to attest
              chain-of-custody authenticity against the immutable forensic audit log.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1.5">
                    Upload Target File (Calculates SHA-256 Locally)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setVerifyFile(e.target.files?.[0] || null)}
                    className="w-full text-xs font-mono text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#6366F1] file:text-white hover:file:bg-[#4F46E5] bg-[#080D18] border border-[#1E293B] rounded-lg p-1.5"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1.5">
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

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <span className="text-[11px] text-slate-500">
                  Verification confirms media ingestion, processing chain, and tamper-free preservation.
                </span>
                <Button
                  type="submit"
                  disabled={verifying || (!verifyFile && !claimedHash.trim())}
                  loading={verifying}
                  variant="accent"
                >
                  <FileCheck2 className="w-4 h-4 mr-1.5" />
                  Verify Chain of Custody
                </Button>
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

                <div className="space-y-1 text-[11px] text-slate-400">
                  <p>Computed SHA-256: <span className="text-white">{verificationResult.computed_sha256}</span></p>
                  {verificationResult.matched_record && (
                    <>
                      <p>
                        Registered Asset: <span className="text-white">{verificationResult.matched_record.original_filename}</span> ({verificationResult.matched_record.file_size} bytes)
                      </p>
                      <p>Ingestion Date: <span className="text-white">{verificationResult.matched_record.upload_timestamp}</span></p>
                      <p>Investigation ID: <span className="text-[#06B6D4]">{verificationResult.matched_record.investigation_id}</span></p>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by action, hash, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-[#0E1424] border border-[#1E293B] rounded-lg text-white focus:outline-none focus:border-[#6366F1]"
            />
          </div>

          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="text-xs font-mono bg-[#0E1424] border border-[#1E293B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6366F1]"
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

        <div className="text-xs font-mono text-slate-400">
          Showing <strong className="text-white">{filteredLogs.length}</strong> events
        </div>
      </div>

      {/* Immutable Audit Trail Table */}
      <Card className="border-[#1E293B] bg-[#0E1424] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#080D18]/80 text-slate-400 font-mono uppercase tracking-wider">
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
                  <td colSpan={6} className="p-4">
                    <TableSkeleton rows={8} cols={6} />
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No audit records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {log.timestamp.replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge
                        variant={
                          log.event_type === 'UPLOAD'
                            ? 'cyan'
                            : log.event_type === 'STAGE_COMPLETE'
                            ? 'success'
                            : log.event_type === 'CANCELLED' || log.event_type === 'DELETED'
                            ? 'danger'
                            : 'accent'
                        }
                      >
                        {log.event_type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-white max-w-sm font-sans truncate" title={log.action}>
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-[#06B6D4] whitespace-nowrap">
                      {log.investigation_id ? log.investigation_id.substring(0, 8) + '...' : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap" title={log.file_hash}>
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
      </Card>
    </div>
  );
};
