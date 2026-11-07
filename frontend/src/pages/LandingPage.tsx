import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  Cpu,
  Video,
  Mic,
  Users,
  Volume2,
  Activity,
  ArrowRight,
  Layers,
  Sparkles,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { ForensicComparisonSlider } from '../components/ForensicComparisonSlider';

export const LandingPage: React.FC = () => {
  const [copiedBibtex, setCopiedBibtex] = useState(false);
  const [activeTab, setActiveTab] = useState<'vision' | 'sync' | 'audio' | 'fusion'>('vision');

  const bibtexCode = `@article{verifai2026multimodal,
  title={VerifAI: Multimodal Deepfake Detection and Forensic Media Verification},
  author={VerifAI Research Initiative},
  journal={Journal of Digital Media Forensics & Cybersecurity},
  year={2026},
  url={https://github.com/VerifAI/VerifAI}
}`;

  const copyBibtex = () => {
    navigator.clipboard.writeText(bibtexCode);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  return (
    <div className="space-y-24 py-8 bg-cyber-grid">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 bg-ambient-radial">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111827] border border-[#1E293B] text-xs font-mono text-[#06B6D4] mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Multimodal AI Media Forensics</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Autonomous Deepfake Detection & <br />
            <span className="bg-gradient-to-r from-[#6366F1] via-[#06B6D4] to-[#22C55E] bg-clip-text text-transparent">
              Media Verification Platform
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[#94A3B8] max-w-3xl mx-auto leading-relaxed mb-10">
            VerifAI fuses computer vision, speech acoustics, lip-sync synchrony, and active speaker tracking to perform evidence-based verification on audio and video media.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/upload"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#4338CA] text-white font-bold text-base shadow-lg shadow-[#6366F1]/25 hover:shadow-[#6366F1]/40 transition-all flex items-center justify-center gap-2.5 hover:scale-105"
            >
              <Upload className="w-5 h-5" />
              Analyze Video / Audio
            </Link>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#111827] hover:bg-[#1E293B] text-white font-semibold text-base border border-[#1E293B] transition-all flex items-center justify-center gap-2"
            >
              <Activity className="w-5 h-5 text-[#06B6D4]" />
              Open Live Dashboard
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto pt-10 border-t border-[#1E293B]">
            {[
              { label: 'Multimodal Engines', val: '6 Neural Models' },
              { label: 'Pipeline Precision', val: '11-Stage Inspection' },
              { label: 'File Verification', val: 'SHA-256 Hashing' },
              { label: 'Reporting', val: 'Court-Grade PDF' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-3 rounded-lg bg-[#111827]/60 border border-white/5 backdrop-blur-sm">
                <p className="text-xl font-bold font-mono text-white">{stat.val}</p>
                <p className="text-xs text-[#94A3B8]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Forensic Comparison Slider */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#06B6D4] mb-2">Forensic Demonstration</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Visual Artifact Detection in Action</h3>
          <p className="text-[#94A3B8] text-sm mt-2">
            See how VerifAI exposes high-frequency spectrum residuals, boundary blending inconsistencies, and synthetic generation artifacts.
          </p>
        </div>

        <ForensicComparisonSlider />
      </section>

      {/* Multimodal Analysis Capabilities with Interactive Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#6366F1] mb-2">Engine Architecture</h2>
          <h3 className="text-3xl font-extrabold text-white">Six Independent Forensic Modalities</h3>
          <p className="text-[#94A3B8] text-sm mt-3">
            Single-model deepfake detectors fail on adversarial compression. VerifAI cross-verifies multiple physical, temporal, and acoustic indicators.
          </p>
        </div>

        {/* Interactive Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-[#111827] p-1.5 rounded-xl border border-[#1E293B] gap-1 text-xs font-medium">
            {[
              { id: 'vision', label: 'Computer Vision', icon: Video },
              { id: 'sync', label: 'Lip-Sync & AV', icon: Mic },
              { id: 'audio', label: 'Acoustic Forensics', icon: Volume2 },
              { id: 'fusion', label: 'Multimodal Fusion', icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#6366F1] text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-8 shadow-xl max-w-5xl mx-auto">
          {activeTab === 'vision' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-mono text-[#6366F1] uppercase">Module 2 & 3</span>
                <h4 className="text-2xl font-bold text-white">Spatial & Frequency Domain Face Analysis</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Extracts facial crops using OpenCV Haar Cascade and DNN models. Tracks unique individuals across frames, then evaluates 2D-FFT frequency spectrum magnitudes, Laplacian edge gradient sharpness, and YCrCb chrominance consistency to identify synthetic textures and border cut-pastes.
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-400 pt-2">
                  <span className="px-2.5 py-1 rounded bg-[#080D18] border border-[#1E293B]">2D-FFT High-Freq Residual</span>
                  <span className="px-2.5 py-1 rounded bg-[#080D18] border border-[#1E293B]">Laplacian Variance</span>
                  <span className="px-2.5 py-1 rounded bg-[#080D18] border border-[#1E293B]">Face Tracking Across Time</span>
                </div>
              </div>
              <div className="bg-[#080D18] border border-[#1E293B] rounded-xl p-5 font-mono text-xs text-slate-400 space-y-2">
                <p className="text-[#22C55E]">// OpenCV & CNN Pipeline</p>
                <p>1. Detect faces: [x, y, w, h] bbox extraction</p>
                <p>2. Track spatial centroids across sample frames</p>
                <p>3. Calculate Laplacian: var &gt; 80.0 expected</p>
                <p>4. 2D FFT magnitude ring check: [r_inner, r_outer]</p>
                <p className="text-slate-500">→ Aggregates frame-level 85th percentile risk</p>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-mono text-[#06B6D4] uppercase">Module 4 & 5</span>
                <h4 className="text-2xl font-bold text-white">SyncNet & TalkNet Audio-Visual Consistency</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Isolates mouth-region optical motion velocity and cross-correlates against acoustic speech energy envelopes across temporal lag windows [-8, +8 steps]. Detects out-of-sync dubbing, puppet deepfakes, and associates active speech with visible speakers.
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-400 pt-2">
                  <span className="px-2.5 py-1 rounded bg-[#080D18] border border-[#1E293B]">Offset Lag (ms)</span>
                  <span className="px-2.5 py-1 rounded bg-[#080D18] border border-[#1E293B]">Cross-Modal Correlation</span>
                  <span className="px-2.5 py-1 rounded bg-[#080D18] border border-[#1E293B]">Speaker Concordance</span>
                </div>
              </div>
              <div className="bg-[#080D18] border border-[#1E293B] rounded-xl p-5 font-mono text-xs text-slate-400 space-y-2">
                <p className="text-[#06B6D4]">// SyncNet Cross-Correlation</p>
                <p>Mouth ROI: lower 35% of face crop</p>
                <p>Audio envelope: 40ms RMS sliding window</p>
                <p>Norm: (motion - mean) / std cross-correlated</p>
                <p>Threshold: offset &gt; 150ms triggers anomaly flag</p>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-mono text-[#22C55E] uppercase">Module 6, 7 & 8</span>
                <h4 className="text-2xl font-bold text-white">pyannote Diarization, Whisper ASR & Spectral Forensics</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Combines acoustic voice clustering (SPEAKER_00, SPEAKER_01), OpenAI Whisper automatic speech recognition with segment timestamps, and Welch Power Spectral Density analysis to detect vocoder band-pass cutoffs and sharp splice transitions.
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-400 pt-2">
                  <span className="px-2.5 py-1 rounded bg-[#080D18] border border-[#1E293B]">Speaker Turn Tracking</span>
                  <span className="px-2.5 py-1 rounded bg-[#080D18] border border-[#1E293B]">Whisper Transcriptions</span>
                  <span className="px-2.5 py-1 rounded bg-[#080D18] border border-[#1E293B]">Vocoder Cutoff Detection</span>
                </div>
              </div>
              <div className="bg-[#080D18] border border-[#1E293B] rounded-xl p-5 font-mono text-xs text-slate-400 space-y-2">
                <p className="text-[#22C55E]">// Acoustic Forensics</p>
                <p>Welch PSD: Low (100-1k), Mid (1-4k), High (4-8k)</p>
                <p>Vocoder check: ultra-high &gt; 8kHz attenuation</p>
                <p>Splice detection: RMS 1st derivative threshold</p>
                <p>Diarization: Spectral centroid k-means clustering</p>
              </div>
            </div>
          )}

          {activeTab === 'fusion' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-mono text-[#F59E0B] uppercase">Module 9 & ReportLab</span>
                <h4 className="text-2xl font-bold text-white">Dynamic Fusion & Cryptographic PDF Reporting</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Dynamically balances evidence across available modalities. Automatically compensates for missing visual or audio streams. Compiles a court-grade PDF report containing SHA-256 hashes, component score breakdowns, limitations, and legal disclaimers.
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-400 pt-2">
                  <span className="px-2.5 py-1 rounded bg-[#080D18] border border-[#1E293B]">Missing Modality Adaptation</span>
                  <span className="px-2.5 py-1 rounded bg-[#080D18] border border-[#1E293B]">SHA-256 Integrity Hash</span>
                  <span className="px-2.5 py-1 rounded bg-[#080D18] border border-[#1E293B]">ReportLab PDF Document</span>
                </div>
              </div>
              <div className="bg-[#080D18] border border-[#1E293B] rounded-xl p-5 font-mono text-xs text-slate-400 space-y-2">
                <p className="text-[#F59E0B]">// Fusion Assessment Tiers</p>
                <p>• LOW EVIDENCE: Score &lt; 0.38</p>
                <p>• INCONCLUSIVE: 0.38 ≤ Score &lt; 0.62</p>
                <p>• POTENTIAL MANIPULATION: Score ≥ 0.62</p>
                <p className="text-slate-500">→ Dynamic Bayesian confidence weighting applied</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4-Step Pipeline Execution */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#111827]/40 rounded-2xl border border-[#1E293B] p-8 sm:p-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#6366F1] mb-2">Workflow Execution</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">How VerifAI Evaluates Media</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {[
            {
              step: '01',
              title: 'Secure Ingestion',
              desc: 'Media is validated, sanitized, and hashed via SHA-256 for cryptographic chain of custody.',
            },
            {
              step: '02',
              title: 'Multimodal Extraction',
              desc: 'OpenCV extracts sampled frames; FFmpeg isolates and normalizes 16kHz PCM audio.',
            },
            {
              step: '03',
              title: 'Parallel Neural Forensics',
              desc: 'Faces, lip movements, acoustic spectra, and speaker turns are concurrently analyzed.',
            },
            {
              step: '04',
              title: 'Multimodal Fusion & PDF',
              desc: 'Evidence is synthesized into an overall risk score with a downloadable PDF forensic report.',
            },
          ].map((step, idx) => (
            <div key={idx} className="bg-[#080D18] border border-[#1E293B] rounded-xl p-5 relative">
              <span className="text-3xl font-black font-mono text-[#6366F1]/30 block mb-2">{step.step}</span>
              <h4 className="text-base font-bold text-white mb-2">{step.title}</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Academic Citation / BibTeX Export */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <h3 className="text-sm font-mono uppercase tracking-wider text-[#94A3B8] mb-4">Academic & Research Citation</h3>
        <div className="relative bg-[#111827] border border-[#1E293B] rounded-xl p-5 text-left font-mono text-xs text-slate-300">
          <button
            onClick={copyBibtex}
            className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080D18] border border-[#1E293B] hover:bg-[#1E293B] text-slate-300 text-xs font-sans transition-colors"
          >
            {copiedBibtex ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5 text-[#06B6D4]" />}
            <span>{copiedBibtex ? 'Copied' : 'Copy BibTeX'}</span>
          </button>
          <pre className="overflow-x-auto pr-24">{bibtexCode}</pre>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-5xl mx-auto px-4 text-center">
        <div className="bg-gradient-to-r from-[#6366F1]/10 via-[#06B6D4]/10 to-[#22C55E]/10 border border-[#6366F1]/30 rounded-2xl p-10 sm:p-14 shadow-2xl relative overflow-hidden">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
            Verify Media Authenticity Today
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8">
            Upload any video or audio file to run the automated 11-stage forensic verification pipeline.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#4338CA] text-white font-bold text-base shadow-lg shadow-[#6366F1]/30 transition-all hover:scale-105"
          >
            <Upload className="w-5 h-5" />
            Upload File Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
