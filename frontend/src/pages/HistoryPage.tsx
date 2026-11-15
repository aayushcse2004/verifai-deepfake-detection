import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Video,
  Mic,
  Image as ImageIcon,
  Trash2,
  FileDown,
  Eye,
  RefreshCw,
  AlertCircle,
  FlaskConical
} from 'lucide-react';
import { getAnalysisHistory, deleteAnalysis, getReportDownloadUrl } from '../services/api';
import { AnalysisJob } from '../types';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<AnalysisJob[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      const data = await getAnalysisHistory(100);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this analysis and all associated files?')) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteAnalysis(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete analysis record.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredHistory = history.filter((item) => {
    const filename = item.media?.original_filename?.toLowerCase() || '';
    const id = item.id.toLowerCase();
    const query = searchTerm.toLowerCase();
    return filename.includes(query) || id.includes(query);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <History className="w-7 h-7 text-[#6366F1]" />
            Analysis Audit History
          </h1>
          <p className="text-sm text-[#94A3B8]">
            Complete record of previously processed media and verification reports
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by filename or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111827] border border-[#1E293B] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6366F1]"
          />
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#06B6D4]" />
            Loading historical records...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            {searchTerm ? 'No matching analyses found.' : 'No analyses performed yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#080D18]/50 text-[#94A3B8] font-mono uppercase">
                  <th className="py-3.5 px-4">Analysis ID</th>
                  <th className="py-3.5 px-4">Filename</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1E293B]/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#06B6D4]">
                      {item.id.slice(0, 8)}...
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white max-w-[220px] truncate">
                      {item.media?.original_filename || 'Media'}
                    </td>
                    <td className="py-3.5 px-4 uppercase font-mono text-[11px]">
                      {item.media?.file_type === 'video' ? (
                        <span className="flex items-center gap-1 text-[#06B6D4]">
                          <Video className="w-3.5 h-3.5" /> Video
                        </span>
                      ) : item.media?.file_type === 'image' ? (
                        <span className="flex items-center gap-1 text-[#F59E0B]">
                          <ImageIcon className="w-3.5 h-3.5" /> Image
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[#22C55E]">
                          <Mic className="w-3.5 h-3.5" /> Audio
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#94A3B8]">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          item.status === 'COMPLETED'
                            ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20'
                            : item.status === 'PROCESSING'
                            ? 'bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20 animate-pulse'
                            : item.status === 'FAILED'
                            ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status === 'COMPLETED' && (
                          <>
                            <Link
                              to={`/results/${item.id}`}
                              className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-[#6366F1]/20 hover:text-[#6366F1] text-slate-300 transition-colors"
                              title="View Forensic Results"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            <a
                              href={getReportDownloadUrl(item.id)}
                              download
                              className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-[#06B6D4]/20 hover:text-[#06B6D4] text-slate-300 transition-colors"
                              title="Download PDF Report"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                            </a>
                          </>
                        )}

                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-[#EF4444]/20 hover:text-[#EF4444] text-slate-400 transition-colors"
                          title="Delete Analysis Record & Files"
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
        )}
      </div>
    </div>
  );
};

