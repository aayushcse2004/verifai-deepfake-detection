import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Upload,
  Cpu,
  Video,
  Mic,
  Users,
  Volume2,
  FileText,
  Activity,
  ArrowRight,
  Lock,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#6366F1]/20 to-[#06B6D4]/20 blur-[130px] pointer-events-none rounded-full" />

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
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#4338CA] text-white font-bold text-base shadow-lg shadow-[#6366F1]/25 hover:shadow-[#6366F1]/40 transition-all flex items-center justify-center gap-2.5"
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
              <div key={i} className="text-center p-3 rounded-lg bg-[#111827]/40 border border-white/5">
                <p className="text-xl font-bold font-mono text-white">{stat.val}</p>
                <p className="text-xs text-[#94A3B8]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multimodal Analysis Capabilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#06B6D4] mb-2">Engine Architecture</h2>
          <h3 className="text-3xl font-extrabold text-white">Six Independent Forensic Modalities</h3>
          <p className="text-[#94A3B8] text-sm mt-3">
            Single-model deepfake detectors fail on adversarial attacks. VerifAI cross-verifies multiple physical, temporal, and acoustic indicators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Video,
              title: 'CNN Facial Analysis',
              desc: 'High-frequency 2D-FFT spectral analysis, Laplacian variance, and blending boundary residual checks across tracked face crops.',
              color: 'text-[#6366F1]',
              bg: 'bg-[#6366F1]/10',
            },
            {
              icon: Mic,
              title: 'SyncNet Lip Synchronization',
              desc: 'Calculates mouth ROI optical motion velocity and cross-correlates against acoustic speech energy to isolate temporal desynchronization.',
              color: 'text-[#06B6D4]',
              bg: 'bg-[#06B6D4]/10',
            },
            {
              icon: Users,
              title: 'TalkNet Active Speaker',
              desc: 'Correlates visible face movements with acoustic voice segments to identify voiceover impersonation, dubbed speech, and puppetry.',
              color: 'text-[#22C55E]',
              bg: 'bg-[#22C55E]/10',
            },
            {
              icon: Layers,
              title: 'pyannote Speaker Diarization',
              desc: 'Separates acoustic tracks into distinct speakers (SPEAKER_00, SPEAKER_01) to verify conversation continuity and multi-party authenticity.',
              color: 'text-[#F59E0B]',
              bg: 'bg-[#F59E0B]/10',
            },
            {
              icon: Cpu,
              title: 'OpenAI Whisper ASR',
              desc: 'Generates timestamped transcripts with linguistic alignment, enabling verified cross-referencing between visible dialogue and audio.',
              color: 'text-[#EC4899]',
              bg: 'bg-[#EC4899]/10',
            },
            {
              icon: Volume2,
              title: 'Acoustic Spectral Forensics',
              desc: 'Welch PSD frequency distribution, neural vocoder high-frequency cutoff detection, and RMS first-derivative edit splice localization.',
              color: 'text-[#818CF8]',
              bg: 'bg-[#818CF8]/10',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#111827] border border-[#1E293B] hover:border-[#6366F1]/40 rounded-xl p-6 transition-all hover:translate-y-[-2px] shadow-lg shadow-black/40 group"
              >
                <div className={`w-12 h-12 rounded-lg ${item.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works / 4-Step Pipeline */}
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

      {/* Technology Stack Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-sm font-mono uppercase tracking-wider text-[#94A3B8] mb-6">Engineered With Open Research Frameworks</h3>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            'PyTorch',
            'OpenCV',
            'SyncNet',
            'TalkNet',
            'pyannote.audio',
            'OpenAI Whisper',
            'Librosa & SciPy',
            'FastAPI',
            'ReportLab',
            'React & Vite',
            'Tailwind CSS',
            'SQLite / PostgreSQL',
          ].map((tech, i) => (
            <span
              key={i}
              className="px-4 py-2 rounded-lg bg-[#111827] border border-[#1E293B] text-xs font-mono text-slate-300 shadow-sm"
            >
              {tech}
            </span>
          ))}
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
