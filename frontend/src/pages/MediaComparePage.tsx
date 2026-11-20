import React, { useState } from 'react';
import {
  GitCompare,
  Upload,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  FileText,
  Volume2,
  Video,
  Download,
} from 'lucide-react';
import { compareMediaAssets } from '../services/api';
import { ComparisonResult } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

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
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Forensic Laboratory' },
          { label: 'Media Comparison' },
        ]}
      />

      <PageHeader
        title="Media Comparison Laboratory"
        subtitle="Dual-asset forensic diffing: SHA-256 match, perceptual pHash distance, and acoustic waveform correlation"
        icon={<GitCompare className="w-5 h-5" />}
        actions={
          result ? (
            <Button variant="outline" size="sm" onClick={handleExportJSON}>
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export Report
            </Button>
          ) : undefined
        }
      />

      {/* Upload Dual Dropzones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Asset A (Reference) */}
        <Card className="border-[#1E293B] bg-[#0E1424]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-[#06B6D4]">
              Asset A (Reference / Baseline)
            </CardTitle>
            {fileA && (
              <Badge variant="cyan">{(fileA.size / (1024 * 1024)).toFixed(2)} MB</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
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
                  <p className="text-[11px] text-slate-400">Click to replace file</p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs font-semibold text-white">Select Reference Asset A</p>
                  <p className="text-[11px] text-slate-400">Video, Audio, or Forensic Image</p>
                </div>
              )}
            </label>

            {previewA && fileA?.type.startsWith('video') && (
              <video src={previewA} controls className="w-full max-h-48 rounded-lg border border-[#1E293B] bg-black" />
            )}
            {previewA && fileA?.type.startsWith('image') && (
              <img src={previewA} alt="Preview A" className="w-full max-h-48 object-contain rounded-lg border border-[#1E293B] bg-black" />
            )}
          </CardContent>
        </Card>

        {/* Asset B (Query / Suspect) */}
        <Card className="border-[#1E293B] bg-[#0E1424]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-[#6366F1]">
              Asset B (Suspect / Query)
            </CardTitle>
            {fileB && (
              <Badge variant="accent">{(fileB.size / (1024 * 1024)).toFixed(2)} MB</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
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
                  <p className="text-[11px] text-slate-400">Click to replace file</p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs font-semibold text-white">Select Query Asset B</p>
                  <p className="text-[11px] text-slate-400">Video, Audio, or Forensic Image</p>
                </div>
              )}
            </label>

            {previewB && fileB?.type.startsWith('video') && (
              <video src={previewB} controls className="w-full max-h-48 rounded-lg border border-[#1E293B] bg-black" />
            )}
            {previewB && fileB?.type.startsWith('image') && (
              <img src={previewB} alt="Preview B" className="w-full max-h-48 object-contain rounded-lg border border-[#1E293B] bg-black" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action CTA */}
      <div className="text-center py-2">
        <Button
          onClick={handleCompare}
          disabled={comparing || !fileA || !fileB}
          loading={comparing}
          size="lg"
          variant="primary"
          className="px-8 shadow-lg shadow-[#6366F1]/20"
        >
          {comparing ? 'Computing Dual-Asset Comparative Vectors...' : 'Run Comparative Forensic Suite'}
        </Button>

        {error && (
          <p className="text-xs font-mono text-[#EF4444] mt-3">{error}</p>
        )}
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6 pt-2">
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

            <div className="text-right font-mono text-xs text-slate-400">
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
              <Card className="border-[#1E293B] bg-[#0E1424]">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#06B6D4]" />
                    Visual Perceptual Hash (pHash)
                  </CardTitle>
                  <Badge variant="cyan">
                    Hamming Dist: {result.visual_similarity.hamming_distance} / 64
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono text-[#06B6D4]">
                      {result.visual_similarity.similarity_pct}%
                    </span>
                    <span className="text-xs text-slate-400">Structural Similarity</span>
                  </div>

                  <p className="text-xs text-slate-300 bg-[#080D18] p-2.5 rounded-lg border border-[#1E293B]">
                    {result.visual_similarity.interpretation}
                  </p>

                  <div className="text-[11px] font-mono text-slate-400 space-y-1">
                    <p>Hash A: <span className="text-white">{result.visual_similarity.phash_a}</span></p>
                    <p>Hash B: <span className="text-white">{result.visual_similarity.phash_b}</span></p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Audio Waveform Correlation Card */}
            {result.audio_comparison && (
              <Card className="border-[#1E293B] bg-[#0E1424]">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#6366F1]" />
                    Acoustic Cross-Correlation
                  </CardTitle>
                  <Badge variant={result.audio_comparison.comparable ? 'success' : 'neutral'}>
                    {result.audio_comparison.comparable ? 'CORRELATED' : 'UNAVAILABLE'}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.audio_comparison.comparable ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold font-mono text-[#6366F1]">
                          {result.audio_comparison.acoustic_similarity_pct}%
                        </span>
                        <span className="text-xs text-slate-400">
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
                    <p className="text-xs text-slate-400 italic py-4">{result.audio_comparison.reason}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Metadata Comparison Side-by-Side Table */}
          <Card className="border-[#1E293B] bg-[#0E1424]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#6366F1]" />
                Metadata & Cryptographic Discrepancies
              </CardTitle>
              <CardDescription>
                Detailed structural metadata and integrity comparisons across media containers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto font-mono text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E293B] text-slate-400">
                      <th className="py-2 px-3">Attribute</th>
                      <th className="py-2 px-3 text-[#06B6D4]">Asset A (Reference)</th>
                      <th className="py-2 px-3 text-[#6366F1]">Asset B (Query)</th>
                      <th className="py-2 px-3">Disparity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    <tr>
                      <td className="py-2.5 px-3 text-slate-400">Filename</td>
                      <td className="py-2.5 px-3 text-white truncate max-w-[200px]">{result.asset_a.name}</td>
                      <td className="py-2.5 px-3 text-white truncate max-w-[200px]">{result.asset_b.name}</td>
                      <td className="py-2.5 px-3 text-slate-400">—</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-slate-400">File Size</td>
                      <td className="py-2.5 px-3 text-white">{(result.asset_a.size_bytes / (1024 * 1024)).toFixed(2)} MB</td>
                      <td className="py-2.5 px-3 text-white">{(result.asset_b.size_bytes / (1024 * 1024)).toFixed(2)} MB</td>
                      <td className="py-2.5 px-3">
                        {result.asset_a.size_bytes === result.asset_b.size_bytes ? (
                          <Badge variant="success">Match</Badge>
                        ) : (
                          <Badge variant="warning">
                            {Math.abs(result.asset_a.size_bytes - result.asset_b.size_bytes).toLocaleString()} bytes
                          </Badge>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-slate-400">SHA-256 Digest</td>
                      <td className="py-2.5 px-3 text-slate-300 text-[10px]" title={result.asset_a.sha256}>
                        {result.asset_a.sha256.substring(0, 16)}...
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 text-[10px]" title={result.asset_b.sha256}>
                        {result.asset_b.sha256.substring(0, 16)}...
                      </td>
                      <td className="py-2.5 px-3">
                        {result.hash_match ? (
                          <Badge variant="success">Match</Badge>
                        ) : (
                          <Badge variant="danger">Mismatch</Badge>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-slate-400">Resolution</td>
                      <td className="py-2.5 px-3 text-white">
                        {result.asset_a.metadata.width}x{result.asset_a.metadata.height}
                      </td>
                      <td className="py-2.5 px-3 text-white">
                        {result.asset_b.metadata.width}x{result.asset_b.metadata.height}
                      </td>
                      <td className="py-2.5 px-3">
                        {result.asset_a.metadata.width === result.asset_b.metadata.width &&
                        result.asset_a.metadata.height === result.asset_b.metadata.height ? (
                          <Badge variant="success">Match</Badge>
                        ) : (
                          <Badge variant="warning">Dimension Disparity</Badge>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-slate-400">Duration</td>
                      <td className="py-2.5 px-3 text-white">{result.asset_a.metadata.duration}s</td>
                      <td className="py-2.5 px-3 text-white">{result.asset_b.metadata.duration}s</td>
                      <td className="py-2.5 px-3">
                        {result.asset_a.metadata.duration === result.asset_b.metadata.duration ? (
                          <Badge variant="success">Match</Badge>
                        ) : (
                          <Badge variant="warning">
                            {Math.abs(result.asset_a.metadata.duration - result.asset_b.metadata.duration).toFixed(2)}s diff
                          </Badge>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
