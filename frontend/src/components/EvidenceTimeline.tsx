import React, { useState } from 'react';
import { Clock, ShieldAlert, Video, Mic, Volume2, Users } from 'lucide-react';
import { EvidenceItem } from '../types';

interface EvidenceTimelineProps {
  items: EvidenceItem[];
}

export const EvidenceTimeline: React.FC<EvidenceTimelineProps> = ({ items }) => {
  const [filter, setFilter] = useState<string>('all');

  const getIcon = (type: string) => {
    switch (type) {
      case 'facial_manipulation':
        return Video;
      case 'lip_sync_inconsistency':
      case 'temporal_lag_anomaly':
        return Mic;
      case 'active_speaker_mismatch':
        return Users;
      case 'vocoder_spectral_cutoff':
      case 'acoustic_discontinuity':
        return Volume2;
      default:
        return ShieldAlert;
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'facial') return item.evidence_type.includes('facial');
    if (filter === 'sync') return item.evidence_type.includes('lip') || item.evidence_type.includes('lag');
    if (filter === 'audio') return item.evidence_type.includes('acoustic') || item.evidence_type.includes('vocoder');
    if (filter === 'speaker') return item.evidence_type.includes('speaker');
    return true;
  });

  return (
    <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#06B6D4]" />
            Forensic Evidence Timeline
          </h3>
          <p className="text-xs text-[#94A3B8]">Chronological anomalies identified across media modalities</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap bg-[#080D18] p-1 rounded-lg border border-[#1E293B] text-xs">
          {[
            { id: 'all', label: `All (${items.length})` },
            { id: 'facial', label: 'Facial' },
            { id: 'sync', label: 'Lip-Sync' },
            { id: 'audio', label: 'Audio' },
            { id: 'speaker', label: 'Speaker' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-[#1E293B] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="py-12 text-center text-[#94A3B8] text-sm bg-[#080D18]/50 rounded-lg border border-dashed border-[#1E293B]">
          No anomalies detected under the current filter selection.
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-[#1E293B] space-y-6">
          {filteredItems.map((item, idx) => {
            const Icon = getIcon(item.evidence_type);
            const isHigh = item.score >= 0.6;
            return (
              <div key={idx} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-[#111827] flex items-center justify-center transition-all ${
                    isHigh ? 'bg-[#EF4444] shadow-[0_0_8px_#EF4444]' : 'bg-[#06B6D4]'
                  }`}
                />

                <div className="bg-[#080D18] border border-[#1E293B] hover:border-[#334155] rounded-lg p-4 transition-all">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-[#06B6D4]" />
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#1E293B] text-[#F8FAFC]">
                        {item.timestamp.toFixed(2)}s
                      </span>
                      <span className="text-xs uppercase tracking-wider font-mono text-[#94A3B8]">
                        {item.evidence_type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        isHigh ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                      }`}
                    >
                      Risk: {Math.round(item.score * 100)}%
                    </span>
                  </div>

                  <p className="text-sm text-slate-200 leading-snug">{item.description}</p>

                  {item.metadata_json && Object.keys(item.metadata_json).length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#1E293B] flex flex-wrap gap-2 text-[11px] font-mono text-[#94A3B8]">
                      {Object.entries(item.metadata_json).map(([k, v]) => (
                        <span key={k} className="bg-[#111827] px-2 py-0.5 rounded border border-[#1E293B]">
                          {k}: <span className="text-white">{String(v)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
