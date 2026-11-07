import React, { useState } from 'react';
import { Eye, ShieldAlert, Sparkles } from 'lucide-react';

export const ForensicComparisonSlider: React.FC = () => {
  const [sliderPos, setSliderPos] = useState<number>(50);

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-[#1E293B] shadow-2xl bg-[#080D18]">
      {/* Top Banner Bar */}
      <div className="bg-[#111827] px-4 py-2.5 border-b border-[#1E293B] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-300">
          <Eye className="w-4 h-4 text-[#06B6D4]" />
          <span>Interactive Forensic Scan: Diffusion Blend vs Authentic Capture</span>
        </div>
        <span className="text-[#94A3B8] hidden sm:inline">Drag slider to reveal neural anomalies</span>
      </div>

      {/* Comparison Viewport */}
      <div className="relative h-72 sm:h-96 select-none overflow-hidden bg-black flex items-center justify-center">
        {/* Synthetic Layer (Right / Underneath) */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-slate-950 to-indigo-950/60 p-6">
          <div className="relative w-full h-full max-w-md rounded-xl border border-red-500/40 bg-slate-900/80 flex flex-col items-center justify-center p-6 text-center shadow-[0_0_30px_rgba(239,68,68,0.15)]">
            {/* Visual synthetic artifact simulation */}
            <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-[#EF4444] flex items-center justify-center mb-4 bg-red-950/30">
              <div className="w-24 h-24 rounded-full border border-red-400/50 animate-ping opacity-25" />
              <ShieldAlert className="w-12 h-12 text-[#EF4444]" />
              {/* Highlight callouts */}
              <div className="absolute -top-3 -right-6 px-2 py-0.5 rounded bg-red-500 text-white font-mono text-[9px] font-bold shadow-md">
                FFT 2D Residual
              </div>
              <div className="absolute -bottom-3 -left-6 px-2 py-0.5 rounded bg-amber-500 text-black font-mono text-[9px] font-bold shadow-md">
                Blend Edge Δ 18.4%
              </div>
            </div>
            <h4 className="text-sm font-bold text-red-400 font-mono uppercase tracking-wider mb-1">
              Synthetic Manipulation Detected
            </h4>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Diffusion boundary blending mismatch, high-frequency checkerboard pattern, and Laplacian blur anomaly (Score: 0.88).
            </p>
          </div>
        </div>

        {/* Genuine Layer (Left / Clipped) */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-slate-950 to-cyan-950/60 p-6 overflow-hidden"
          style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
        >
          <div className="relative w-full h-full max-w-md rounded-xl border border-cyan-500/40 bg-slate-900/80 flex flex-col items-center justify-center p-6 text-center shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            <div className="relative w-32 h-32 rounded-full border-2 border-[#06B6D4] flex items-center justify-center mb-4 bg-cyan-950/30">
              <Sparkles className="w-12 h-12 text-[#06B6D4]" />
              <div className="absolute -top-3 -left-4 px-2 py-0.5 rounded bg-emerald-500 text-black font-mono text-[9px] font-bold shadow-md">
                Laplacian OK (94.2)
              </div>
            </div>
            <h4 className="text-sm font-bold text-[#06B6D4] font-mono uppercase tracking-wider mb-1">
              Authentic Media Capture
            </h4>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Continuous natural skin pore gradients, consistent color chrominance channels, and absence of GAN grid residuals.
            </p>
          </div>
        </div>

        {/* Draggable Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-[#06B6D4] via-white to-[#6366F1] shadow-[0_0_12px_#06B6D4] pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#111827] border-2 border-[#06B6D4] text-white flex items-center justify-center shadow-lg font-mono text-xs font-bold">
            ↔
          </div>
        </div>

        {/* Invisible Range Input over container for smooth dragging */}
        <input
          type="range"
          min="5"
          max="95"
          value={sliderPos}
          onChange={(e) => setSliderPos(parseFloat(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-30"
          aria-label="Comparison Slider"
        />
      </div>

      {/* Bottom Labels */}
      <div className="bg-[#111827] px-4 py-2 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="text-[#06B6D4]">◀ Authentic Camera Reference</span>
        <span className="text-red-400">Diffusion Synthesis Overlay ▶</span>
      </div>
    </div>
  );
};

