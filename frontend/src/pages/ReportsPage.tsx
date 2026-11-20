import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Download,
  ExternalLink,
  Search,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { getAnalysisHistory, getReportDownloadUrl } from '../services/api';
import { AnalysisJob } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/Skeleton';

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
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Management' },
          { label: 'Reports' },
        ]}
      />

      <PageHeader
        title="Forensic PDF Reports Repository"
        subtitle="Download and verify court/investigation-grade cryptographic verification reports"
        icon={<FileText className="w-5 h-5" />}
        actions={
          <Button variant="outline" size="sm" onClick={fetchReports}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        }
      />

      {/* Search and Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filter by filename, SHA-256, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-[#0E1424] border border-[#1E293B] rounded-lg text-white focus:outline-none focus:border-[#6366F1]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Available Reports:</span>
          <Badge variant="cyan">{filtered.length} Generated</Badge>
        </div>
      </div>

      {/* Reports Table */}
      <Card className="border-[#1E293B] bg-[#0E1424] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#080D18]/80 text-slate-400 font-mono uppercase tracking-wider">
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
                  <td colSpan={5} className="p-4">
                    <TableSkeleton rows={5} cols={5} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No completed reports found matching the query.
                  </td>
                </tr>
              ) : (
                filtered.map((job) => (
                  <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-[#06B6D4] whitespace-nowrap font-bold">
                      {job.id.substring(0, 8)}...
                    </td>
                    <td className="py-3 px-4 text-white max-w-xs truncate font-sans font-semibold">
                      {job.media?.original_filename || 'Unknown Media'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap" title={job.media?.file_hash}>
                      {job.media?.file_hash ? job.media.file_hash.substring(0, 16) + '...' : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
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
                          className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white"
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
      </Card>
    </div>
  );
};
