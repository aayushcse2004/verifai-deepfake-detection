import React from 'react';
import { ShieldCheck, Cpu, Code2, Database, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#080D18] border-t border-[#1E293B] mt-20 text-[#94A3B8] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#06B6D4]" />
              <span className="font-bold text-white text-base tracking-tight">VerifAI</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Academic & professional multimodal media forensics platform for audio-visual deepfake detection and integrity analysis.
            </p>
          </div>

          {/* Multimodal Engines */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Forensic Pipeline</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>CNN Facial Feature Extraction</li>
              <li>SyncNet AV Synchronization</li>
              <li>TalkNet Active Speaker</li>
              <li>pyannote Speaker Diarization</li>
              <li>OpenAI Whisper ASR</li>
              <li>Acoustic Spectral Forensics</li>
            </ul>
          </div>

          {/* Architecture */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Architecture</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>FastAPI Async Worker</li>
              <li>OpenCV & FFmpeg Streaming</li>
              <li>Modular ML Adapters</li>
              <li>Dynamic Fusion Engine</li>
              <li>ReportLab PDF Compilation</li>
            </ul>
          </div>

          {/* Privacy & Disclaimer */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Evidentiary Notice</h4>
            <p className="text-slate-400 leading-relaxed">
              Automated forensic indicators represent empirical risk assessments, not legally definitive proof. Results require corroboration with human expert examination.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500">
            © {new Date().getFullYear()} VerifAI Research. Built for high-assurance cybersecurity verification.
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-[#22C55E]" /> Privacy Preserving</span>
            <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-[#06B6D4]" /> SHA-256 Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

