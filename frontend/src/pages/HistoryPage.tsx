import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  Video,
  Volume2,
  Image as ImageIcon,
  Trash2,
  FileDown,
  Eye,
  RefreshCw,
  AlertCircle,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  Filter,
} from 'lucide-react';

import { getAnalysisHistory, deleteAnalysis, getReportDownloadUrl } from '../services/api';
import { AnalysisJob } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Skeleton, TableSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/ToastContext';
import { RiskBadge } from '../components/RiskBadge';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [history, setHistory] = useState<AnalysisJob[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchHistory = async () => {
    try {
      const data = await getAnalysisHistory(100);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
      showToast({
        type: 'error',
        title: 'Query Failed',
        message: 'Could not retrieve investigation records from SQLite backend.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteModalId) return;
    setDeleting(true);
    try {
      await deleteAnalysis(deleteModalId);
      setHistory((prev) => prev.filter((item) => item.id !== deleteModalId));
      showToast({
        type: 'success',
        title: 'Asset Deleted',
        message: `Investigation ${deleteModalId.substring(0, 8)} and associated frame caches were purged.`,
      });
    } catch (err) {
      console.error('Delete error:', err);
      showToast({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Could not remove analysis record from database.',
      });
    } finally {
      setDeleting(false);
      setDeleteModalId(null);
    }
  };

  const filteredHistory = history.filter((item) => {
    const filename = item.media?.original_filename?.toLowerCase() || '';
    const id = item.id.toLowerCase();
    const hash = item.media?.file_hash?.toLowerCase() || '';
    const query = searchTerm.toLowerCase();

    const matchesSearch = filename.includes(query) || id.includes(query) || hash.includes(query);
    const matchesType = selectedType === 'all' || item.media?.file_type === selectedType;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Investigation History"
        subtitle="Immutable ledger of previously processed forensic media, extracted frame crops & verification reports"
        icon={<History className="w-6 h-6" />}
        breadcrumbs={[{ label: 'Workspace', to: '/dashboard' }, { label: 'Investigation History' }]}
        actions={
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate('/upload')}
          >
            New Investigation
          </Button>
        }
      />

      {/* Filter and Control Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by filename, SHA-256 hash, or investigation ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#070A13] border border-[#1E293B] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#6366F1]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Media Type Selector */}
            <div className="flex items-center bg-[#070A13] border border-[#1E293B] rounded-xl p-1 text-xs">
              {['all', 'video', 'audio', 'image'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1 rounded-lg capitalize font-mono text-[11px] transition-all cursor-pointer ${
                    selectedType === t
                      ? 'bg-[#6366F1] text-white font-bold'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Status Selector */}
            <div className="flex items-center bg-[#070A13] border border-[#1E293B] rounded-xl p-1 text-xs">
              {['all', 'COMPLETED', 'PROCESSING', 'FAILED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                    selectedStatus === s
                      ? 'bg-[#06B6D4] text-black font-bold'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {s === 'all' ? 'All Status' : s}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#070A13] border border-[#1E293B] rounded-xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg ${viewMode === 'table' ? 'bg-[#1E293B] text-white' : 'text-[#64748B]'}`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg ${viewMode === 'cards' ? 'bg-[#1E293B] text-white' : 'text-[#64748B]'}`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      {loading ? (
        <Card className="p-6">
          <TableSkeleton rows={6} cols={5} />
        </Card>
      ) : filteredHistory.length === 0 ? (
        <EmptyState
          title="No Matching Investigations Found"
          description={searchTerm ? `No results match query "${searchTerm}".` : 'No forensic investigations have been performed yet.'}
          actionLabel="Start New Investigation"
          onAction={() => navigate('/upload')}
        />
      ) : viewMode === 'table' ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] text-[#64748B] font-mono uppercase text-[10px] bg-[#070A13]">
                  <th className="py-3.5 pl-4">ID</th>
                  <th className="py-3.5">Asset Filename</th>
                  <th className="py-3.5">Media Type</th>
                  <th className="py-3.5">Ingestion Size</th>
                  <th className="py-3.5">Status</th>
                  <th className="py-3.5">SHA-256 Digest</th>
                  <th className="py-3.5">Ingested Timestamp</th>
                  <th className="py-3.5 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60">
                {filteredHistory.map((job) => (
                  <tr key={job.id} className="hover:bg-[#131B2E]/60 transition-colors group">
                    <td className="py-4 pl-4 font-mono text-[#06B6D4] font-semibold">
                      <Link to={`/results/${job.id}`} className="hover:underline">
                        {job.id.substring(0, 8)}...
                      </Link>
                    </td>
                    <td className="py-4 font-medium text-white max-w-[200px] truncate">
                      {job.media?.original_filename || 'Unknown asset'}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5">
                        {job.media?.file_type === 'video' ? (
                          <Video className="w-3.5 h-3.5 text-[#06B6D4]" />
                        ) : job.media?.file_type === 'audio' ? (
                          <Volume2 className="w-3.5 h-3.5 text-[#6366F1]" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5 text-[#22C55E]" />
                        )}
                        <span className="font-mono uppercase text-[10px] text-slate-300">
                          {job.media?.file_type || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-slate-400">
                      {job.media?.file_size ? `${(job.media.file_size / (1024 * 1024)).toFixed(2)} MB` : '-'}
                    </td>
                    <td className="py-4">
                      <RiskBadge status={job.status} />
                    </td>
                    <td className="py-4 font-mono text-[#64748B] text-[11px] truncate max-w-[140px]" title={job.media?.file_hash}>
                      {job.media?.file_hash ? `${job.media.file_hash.substring(0, 16)}...` : '-'}
                    </td>
                    <td className="py-4 font-mono text-[#64748B] text-[11px]">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/results/${job.id}`}
                          className="p-1.5 rounded-lg bg-[#111827] hover:bg-[#1E293B] text-slate-300 hover:text-white transition-colors"
                          title="View Results"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        {job.media?.file_type === 'video' && (
                          <Link
                            to={`/lab/video/${job.id}`}
                            className="p-1.5 rounded-lg bg-[#06B6D4]/10 hover:bg-[#06B6D4]/20 text-[#22D3EE] transition-colors"
                            title="Video Forensics Lab"
                          >
                            <Video className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        {job.media?.file_type === 'audio' && (
                          <Link
                            to={`/lab/audio/${job.id}`}
                            className="p-1.5 rounded-lg bg-[#6366F1]/10 hover:bg-[#6366F1]/20 text-[#818CF8] transition-colors"
                            title="Audio Forensics Lab"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        {job.status === 'COMPLETED' && (
                          <a
                            href={getReportDownloadUrl(job.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#22C55E]/10 hover:bg-[#22C55E]/20 text-[#4ADE80] transition-colors"
                            title="Download PDF Certificate"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => setDeleteModalId(job.id)}
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                          title="Purge Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHistory.map((job) => (
            <Card key={job.id} interactive className="hover:border-[#6366F1]/50 flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-2 rounded-lg bg-[#111827] text-[#06B6D4] shrink-0">
                    {job.media?.file_type === 'video' ? (
                      <Video className="w-4 h-4" />
                    ) : job.media?.file_type === 'audio' ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <ImageIcon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="truncate">{job.media?.original_filename || 'Unknown asset'}</CardTitle>
                    <p className="text-[10px] font-mono text-[#64748B]">{job.id.substring(0, 12)}...</p>
                  </div>
                </div>
                <RiskBadge status={job.status} />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">SHA-256:</span>
                    <span className="text-slate-300 truncate max-w-[180px]">{job.media?.file_hash?.substring(0, 16)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Size:</span>
                    <span className="text-white">
                      {job.media?.file_size ? `${(job.media.file_size / (1024 * 1024)).toFixed(2)} MB` : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Ingested:</span>
                    <span className="text-slate-400">{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/results/${job.id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteModalId(job.id)}
                    className="text-[#EF4444] hover:bg-[#EF4444]/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      <Modal
        isOpen={deleteModalId !== null}
        onClose={() => setDeleteModalId(null)}
        title="Confirm Evidence Purge"
        description="Permanently remove analysis job and wipe storage assets"
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteModalId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleting}
              onClick={handleDeleteConfirm}
            >
              Confirm Purge
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            You are about to purge investigation record <span className="font-mono text-white font-bold">{deleteModalId}</span>.
          </p>
          <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#FCA5A5] space-y-1">
            <p className="font-semibold text-white">Forensic Deletion Consequences:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
              <li>Ingested source file in storage will be unlinked.</li>
              <li>Extracted facial crop filmstrips and audio WAVs will be removed.</li>
              <li>Generated PDF forensic reports will be destroyed.</li>
              <li>Chain-of-custody audit trail will record a DELETED event.</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};
