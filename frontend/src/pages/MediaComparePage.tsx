import React, { useState } from 'react';
import {
  GitCompare,
  Upload,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  FileText,
  Sliders,
  Volume2,
  Video,
  Download,
  Info
} from 'lucide-react';
import { compareMediaAssets } from '../services/api';
import { ComparisonResult } from '../types';

export const MediaComparePage: React.FC = () => {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [previewA, setPreviewA] = useState<string | null>(null);
  const [previewB, setPreviewB] = useState<string | null>(null);
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectA = (file: File) => {
    setFileA(file);
    setPreviewA(URL.createObjectURL(file));
  };

  const handleSelectB = (file: File) => {
    setFileB(file);
    setPreviewB(URL.createObjectURL(file));
  };

  const handleCompare = async () => {
    if (!fileA || !fileB) return;
    setComparing(true);
    setError(null);
    setResult(null);

    try {
      const res = await compareMediaAssets(fileA, fileB);
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Comparison failed');
    } finally {
      setComparing(false);
    }
  };

  const handleExportJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VerifAI_Media_Comparison_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1]">
              <GitCompare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Media Comparison Laboratory</h1>
              <p className="text-sm text-[#94A3B8]">
                Dual-asset forensic diffing: SHA-256 match, perceptual pHash distance, and acoustic waveform correlation
              </p>
            </div>
          </div>
        </div>

        {result && (
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#111827] border border-[#1E293B] text-xs font-mono text-[#06B6D4] hover:bg-white/5 transition-all"
          >
            <Download className="w-4 h-4" />
            Export Comparison Report
          </button>
        )}
      </div>

      {/* Upload Dual Dropzones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Asset A (Reference) */}
        <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#06B6D4] font-semibold">
              Asset A (Reference / Baseline)
            </span>
            {fileA && <span className="text-xs font-mono text-[#94A3B8]">{(fileA.size / (1024 * 1024)).toFixed(2)} MB</span>}
          </div>

          <label className="border-2 border-dashed border-[#1E293B] hover:border-[#06B6D4]/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-[#080D18]/50 min-h-[180px]">
            <input
              type="file"
              onChange={(e) => e.target.files?.[0] && handleSelectA(e.target.files[0])}
              className="hidden"
            />
            {fileA ? (
              <div className="text-center space-y-2">
                <FileCheck className="w-8 h-8 text-[#06B6D4] mx-auto" />
                <p className="text-xs font-mono font-bold text-white truncate max-w-[260px]">{fileA.name}</p>
                <p className="text-[11px] text-[#94A3B8]">Click to replace file</p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <Upload className="w-8 h-8 text-[#64748B] mx-auto" />
                <p className="text-xs font-semibold text-white">Select Reference Asset A</p>
                <p className="text-[11px] text-[#94A3B8]">Video, Audio, or Forensic Image</p>
              </div>
            )}
          </label>

          {previewA && fileA?.type.startsWith('video') && (
            <video src={previewA} controls className="w-full max-h-48 rounded-lg border border-[#1E293B] bg-black" />
          )}
          {previewA && fileA?.type.startsWith('image') && (
            <img src={previewA} alt="Preview A" className="w-full max-h-48 object-contain rounded-lg border border-[#1E293B] bg-black" />
          )}
        </div>

        {/* Asset B (Query / Suspect) */}
        <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#6366F1] font-semibold">
              Asset B (Suspect / Query)
            </span>
            {fileB && <span className="text-xs font-mono text-[#94A3B8]">{(fileB.size / (1024 * 1024)).toFixed(2)} MB</span>}
          </div>

          <label className="border-2 border-dashed border-[#1E293B] hover:border-[#6366F1]/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-[#080D18]/50 min-h-[180px]">
            <input
              type="file"
              onChange={(e) => e.target.files?.[0] && handleSelectB(e.target.files[0])}
              className="hidden"
            />
            {fileB ? (
              <div className="text-center space-y-2">
                <FileCheck className="w-8 h-8 text-[#6366F1] mx-auto" />
                <p className="text-xs font-mono font-bold text-white truncate max-w-[260px]">{fileB.name}</p>
                <p className="text-[11px] text-[#94A3B8]">Click to replace file</p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <Upload className="w-8 h-8 text-[#64748B] mx-auto" />
                <p className="text-xs font-semibold text-white">Select Query Asset B</p>
                <p className="text-[11px] text-[#94A3B8]">Video, Audio, or Forensic Image</p>
              </div>
            )}
          </label>

          {previewB && fileB?.type.startsWith('video') && (
            <video src={previewB} controls className="w-full max-h-48 rounded-lg border border-[#1E293B] bg-black" />
          )}
          {previewB && fileB?.type.startsWith('image') && (
            <img src={previewB} alt="Preview B" className="w-full max-h-48 object-contain rounded-lg border border-[#1E293B] bg-black" />
          )}
        </div>
      </div>

      {/* Action CTA */}
      <div className="text-center">
        <button
          onClick={handleCompare}
          disabled={comparing || !fileA || !fileB}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#06B6D4] hover:from-[#4F46E5] hover:to-[#0891B2] text-white font-bold text-sm shadow-lg shadow-[#6366F1]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {comparing ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Computing Dual-Asset Comparative Vectors...
            </span>
          ) : (
            'Run Comparative Forensic Suite'
          )}
        </button>

        {error && (
          <p className="text-xs font-mono text-[#EF4444] mt-3">{error}</p>
        )}
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6 pt-4">
          {/* Verdict Banner */}
          <div
            className={`p-6 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              result.hash_match
                ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-white'
                : 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-white'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {result.hash_match ? (
                  <CheckCircle className="w-5 h-5 text-[#22C55E]" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                )}
                <span className="font-extrabold text-lg tracking-tight font-mono">{result.verdict}</span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl">{result.summary}</p>
            </div>

            <div className="text-right font-mono text-xs text-[#94A3B8]">
              <span>SHA-256 Digest Match: </span>
              <span className={`font-bold ${result.hash_match ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                {result.hash_match ? '100% IDENTICAL' : 'DIVERGENT'}
              </span>
            </div>
          </div>

          {/* Metric Comparison Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visual Perceptual Hash (pHash) Card */}
            {result.visual_similarity && (
              <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#06B6D4]" />
                    Visual Perceptual Hash (pHash)
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30">
                    Hamming Dist: {result.visual_similarity.hamming_distance} / 64
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-mono text-[#06B6D4]">
                    {result.visual_similarity.similarity_pct}%
                  </span>
                  <span className="text-xs text-[#94A3B8]">Structural Similarity</span>
                </div>

                <p className="text-xs text-slate-300 bg-[#080D18] p-2.5 rounded-lg border border-[#1E293B]">
                  {result.visual_similarity.interpretation}
                </p>

                <div className="text-[11px] font-mono text-[#94A3B8] space-y-1">
                  <p>Hash A: <span className="text-white">{result.visual_similarity.phash_a}</span></p>
                  <p>Hash B: <span className="text-white">{result.visual_similarity.phash_b}</span></p>
                </div>
              </div>
            )}

            {/* Audio Waveform Correlation Card */}
            {result.audio_comparison && (
              <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#6366F1]" />
                    Acoustic Cross-Correlation
                  </h3>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                    result.audio_comparison.comparable
                      ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}>
                    {result.audio_comparison.comparable ? 'CORRELATED' : 'UNAVAILABLE'}
                  </span>
                </div>

                {result.audio_comparison.comparable ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold font-mono text-[#6366F1]">
                        {result.audio_comparison.acoustic_similarity_pct}%
                      </span>
                      <span className="text-xs text-[#94A3B8]">
                        Normalized Cross-Correlation (r = {result.audio_comparison.correlation})
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 bg-[#080D18] p-2.5 rounded-lg border border-[#1E293B]">
                      {result.audio_comparison.identical_audio
                        ? 'Audio streams are bitwise identical.'
                        : result.audio_comparison.acoustic_similarity_pct! > 85
                        ? 'High acoustic concordance; potential compression or volume normalization.'
                        : 'Significant spectral or temporal divergence in audio track.'}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-[#94A3B8] italic">{result.audio_comparison.reason}</p>
                )}
              </div>
            )}
          </div>

          {/* Metadata Comparison Side-by-Side Table */}
          <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#6366F1]" />
              Metadata & Cryptographic Discrepancies
            </h3>

            <div className="overflow-x-auto font-mono text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1E293B] text-[#94A3B8]">
                    <th className="py-2 px-3">Attribute</th>
                    <th className="py-2 px-3 text-[#06B6D4]">Asset A (Reference)</th>
                    <th className="py-2 px-3 text-[#6366F1]">Asset B (Query)</th>
                    <th className="py-2 px-3">Disparity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  <tr>
                    <td className="py-2.5 px-3 text-[#94A3B8]">Filename</td>
                    <td className="py-2.5 px-3 text-white truncate max-w-[200px]">{result.asset_a.name}</td>
                    <td className="py-2.5 px-3 text-white truncate max-w-[200px]">{result.asset_b.name}</td>
                    <td className="py-2.5 px-3 text-[#94A3B8]">—</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-[#94A3B8]">File Size</td>
                    <td className="py-2.5 px-3 text-white">{(result.asset_a.size_bytes / (1024 * 1024)).toFixed(2)} MB</td>
                    <td className="py-2.5 px-3 text-white">{(result.asset_b.size_bytes / (1024 * 1024)).toFixed(2)} MB</td>
                    <td className="py-2.5 px-3">
                      {result.asset_a.size_bytes === result.asset_b.size_bytes ? (
                        <span className="text-[#22C55E]">Match</span>
                      ) : (
                        <span className="text-[#F59E0B]">
                          {Math.abs(result.asset_a.size_bytes - result.asset_b.size_bytes).toLocaleString()} bytes
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-[#94A3B8]">SHA-256 Digest</td>
                    <td className="py-2.5 px-3 text-slate-300 text-[10px]" title={result.asset_a.sha256}>
                      {result.asset_a.sha256.substring(0, 16)}...
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-[10px]" title={result.asset_b.sha256}>
                      {result.asset_b.sha256.substring(0, 16)}...
                    </td>
                    <td className="py-2.5 px-3">
                      {result.hash_match ? (
                        <span className="text-[#22C55E]">Match</span>
                      ) : (
                        <span className="text-[#EF4444]">Mismatch</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-[#94A3B8]">Resolution</td>
                    <td className="py-2.5 px-3 text-white">
                      {result.asset_a.metadata.width}x{result.asset_a.metadata.height}
                    </td>
                    <td className="py-2.5 px-3 text-white">
                      {result.asset_b.metadata.width}x{result.asset_b.metadata.height}
                    </td>
                    <td className="py-2.5 px-3">
                      {result.asset_a.metadata.width === result.asset_b.metadata.width &&
                      result.asset_a.metadata.height === result.asset_b.metadata.height ? (
                        <span className="text-[#22C55E]">Match</span>
                      ) : (
                        <span className="text-[#F59E0B]">Dimension Disparity</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-[#94A3B8]">Duration</td>
                    <td className="py-2.5 px-3 text-white">{result.asset_a.metadata.duration}s</td>
                    <td className="py-2.5 px-3 text-white">{result.asset_b.metadata.duration}s</td>
                    <td className="py-2.5 px-3">
                      {result.asset_a.metadata.duration === result.asset_b.metadata.duration ? (
                        <span className="text-[#22C55E]">Match</span>
                      ) : (
                        <span className="text-[#F59E0B]">
                          {Math.abs(result.asset_a.metadata.duration - result.asset_b.metadata.duration).toFixed(2)}s diff
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

