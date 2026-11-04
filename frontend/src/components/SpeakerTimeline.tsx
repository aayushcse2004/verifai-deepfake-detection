import React from 'react';
import { Users, MessageSquare } from 'lucide-react';
import { SpeakerSegment } from '../types';

interface SpeakerTimelineProps {
  segments: SpeakerSegment[];
  duration?: number;
}

export const SpeakerTimeline: React.FC<SpeakerTimelineProps> = ({ segments, duration }) => {
  const maxTime = duration || (segments.length > 0 ? Math.max(...segments.map((s) => s.end_time)) : 10);

  const speakerColors: Record<string, string> = {
    SPEAKER_00: 'bg-[#6366F1] border-[#818CF8]',
    SPEAKER_01: 'bg-[#06B6D4] border-[#22D3EE]',
    SPEAKER_02: 'bg-[#EC4899] border-[#F472B6]',
    SPEAKER_03: 'bg-[#F59E0B] border-[#FBBF24]',
  };

  const getSpeakerColor = (id: string) => {
    return speakerColors[id] || 'bg-slate-600 border-slate-400';
  };

  return (
    <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#6366F1]" />
            Speaker Diarization Timeline
          </h3>
          <p className="text-xs text-[#94A3B8]">Acoustically segmented conversational speaker turns</p>
        </div>
      </div>

      {segments.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-sm">
          No speaker segments recorded for this media.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Visual Track Bar */}
          <div className="relative h-9 bg-[#080D18] rounded-lg border border-[#1E293B] overflow-hidden p-1 flex items-center">
            {segments.map((seg, idx) => {
              const leftPct = (seg.start_time / maxTime) * 100;
              const widthPct = Math.max(3, ((seg.end_time - seg.start_time) / maxTime) * 100);
              return (
                <div
                  key={idx}
                  title={`${seg.speaker_id}: ${seg.start_time.toFixed(1)}s - ${seg.end_time.toFixed(1)}s`}
                  className={`absolute h-7 rounded text-[10px] font-mono text-white font-bold flex items-center justify-center border shadow-sm transition-all hover:brightness-125 cursor-pointer ${getSpeakerColor(
                    seg.speaker_id
                  )}`}
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                  }}
                >
                  <span className="truncate px-1">{seg.speaker_id.replace('SPEAKER_', 'SPK ')}</span>
                </div>
              );
            })}
          </div>

          {/* Time axis marks */}
          <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
            <span>0.0s</span>
            <span>{(maxTime * 0.25).toFixed(1)}s</span>
            <span>{(maxTime * 0.5).toFixed(1)}s</span>
            <span>{(maxTime * 0.75).toFixed(1)}s</span>
            <span>{maxTime.toFixed(1)}s</span>
          </div>

          {/* Transcript List */}
          <div className="space-y-2 mt-4 max-h-64 overflow-y-auto pr-1">
            {segments.map((seg, idx) => (
              <div
                key={idx}
                className="bg-[#080D18] border border-[#1E293B] rounded-lg p-3 flex items-start gap-3"
              >
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white uppercase whitespace-nowrap mt-0.5 ${getSpeakerColor(
                    seg.speaker_id
                  )}`}
                >
                  {seg.speaker_id}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono text-slate-400">
                      {seg.start_time.toFixed(1)}s - {seg.end_time.toFixed(1)}s
                    </span>
                  </div>
                  <p className="text-sm text-slate-200">
                    {seg.transcript || <span className="italic text-slate-500">Acoustic turn without distinct lexical tokens</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
