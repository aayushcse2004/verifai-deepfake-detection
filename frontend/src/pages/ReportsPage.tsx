import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Download,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Search,
  RefreshCw,
  Clock,
  HardDrive
} from 'lucide-react';
import { getAnalysisHistory, getReportDownloadUrl } from '../services/api';
import { AnalysisJob } from '../types';

export const ReportsPage: React.FC = () => {
  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchReports = async () => {
    try {
      const data = await getAnalysisHistory(100);
      setJobs(data.filter((j) => j.status === 'COMPLETED'));
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filtered = jobs.filter((j) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (j.media?.original_filename && j.media.original_filename.toLowerCase().includes(q)) ||
      (j.media?.file_hash && j.media.file_hash.toLowerCase().includes(q)) ||
      j.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1E293B] pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Forensic PDF Reports Repository</h1>
            <p className="text-sm text-[#94A3B8]">
              Download and verify court/investigation-grade cryptographic verification reports
            </p>
          </div>
        </div>

        <button
          onClick={fetchReports}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1E293B] text-xs font-mono text-[#94A3B8] hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#64748B]" />
        <input
          type="text"
          placeholder="Filter by filename, SHA-256 digest, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-[#111827] border border-[#1E293B] rounded-lg text-white focus:outline-none focus:border-[#6366F1]"
        />
      </div>

      {/* Reports Table */}
      <div className="bg-[#111827] rounded-xl border border-[#1E293B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#080D18]/80 text-[#94A3B8] font-mono uppercase tracking-wider">
                <th className="py-3 px-4">Investigation ID</th>
                <th className="py-3 px-4">Media Asset</th>
                <th className="py-3 px-4">SHA-256 Digest</th>
                <th className="py-3 px-4">Completion Date</th>
                <th className="py-3 px-4">Document Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] font-mono">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#94A3B8]">
                    Loading verified reports...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#94A3B8]">
                    No completed reports found. Upload and complete an investigation first.
                  </td>
                </tr>
              ) : (
                filtered.map((job) => (
                  <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-[#06B6D4] whitespace-nowrap">
                      {job.id.substring(0, 8)}...
                    </td>
                    <td className="py-3 px-4 text-white max-w-xs truncate font-sans font-semibold">
                      {job.media?.original_filename || 'Unknown Media'}
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8] whitespace-nowrap" title={job.media?.file_hash}>
                      {job.media?.file_hash ? job.media.file_hash.substring(0, 16) + '...' : '—'}
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8] whitespace-nowrap">
                      {job.completed_at ? job.completed_at.replace('T', ' ').substring(0, 19) : '—'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <a
                          href={getReportDownloadUrl(job.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#6366F1]/10 hover:bg-[#6366F1]/20 border border-[#6366F1]/30 text-[#6366F1] font-bold text-[11px] transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download PDF
                        </a>

                        <Link
                          to={`/results/${job.id}`}
                          className="flex items-center gap-1 p-1 rounded hover:bg-white/5 text-[#94A3B8] hover:text-white"
                          title="View detailed results"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
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

