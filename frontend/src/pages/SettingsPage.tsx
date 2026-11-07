import React, { useEffect, useState } from 'react';
import {
  Settings,
  Sliders,
  HardDrive,
  Cpu,
  CheckCircle2,
  Save,
  RefreshCw,
  AlertCircle,
  Database,
  Lock,
} from 'lucide-react';
import { getSettings, updateSettings } from '../services/api';
import { SystemSettings } from '../types';

export const SettingsPage: React.FC = () => {
  const [settings, setSettingsState] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [maxSize, setMaxSize] = useState<number>(250);
  const [wFacial, setWFacial] = useState<number>(0.35);
  const [wLipSync, setWLipSync] = useState<number>(0.25);
  const [wActiveSpeaker, setWActiveSpeaker] = useState<number>(0.20);
  const [wAudio, setWAudio] = useState<number>(0.20);

  useEffect(() => {
    getSettings()
      .then((data) => {
        setSettingsState(data);
        setMaxSize(data.max_upload_size_mb);
        setWFacial(data.weight_facial);
        setWLipSync(data.weight_lip_sync);
        setWActiveSpeaker(data.weight_active_speaker);
        setWAudio(data.weight_audio);
      })
      .catch((err) => {
        console.error('Settings fetch error:', err);
        setError('Failed to load system settings.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const updated = await updateSettings({
        max_upload_size_mb: maxSize,
        weight_facial: wFacial,
        weight_lip_sync: wLipSync,
        weight_active_speaker: wActiveSpeaker,
        weight_audio: wAudio,
      });
      setSettingsState(updated);
      setMessage('System configuration and fusion weights updated successfully.');
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err?.response?.data?.detail || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  const weightsSum = (wFacial + wLipSync + wActiveSpeaker + wAudio).toFixed(2);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-[#06B6D4]" />
          Platform & Model Settings
        </h1>
        <p className="text-sm text-[#94A3B8]">
          Configure media upload thresholds, multimodal fusion weights, and hardware parameters
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center gap-3 text-sm text-[#22C55E]">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center gap-3 text-sm text-[#EF4444]">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Multimodal Fusion Weights */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#6366F1]" />
                Multimodal Fusion Weights
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Relative weighting allocated across forensic modalities (Total sum: {weightsSum})
              </p>
            </div>
            <span
              className={`font-mono text-xs font-bold px-2.5 py-1 rounded ${
                weightsSum === '1.00'
                  ? 'bg-[#22C55E]/10 text-[#22C55E]'
                  : 'bg-[#F59E0B]/10 text-[#F59E0B]'
              }`}
            >
              Sum: {weightsSum}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Facial Manipulation Weight (CNN)</span>
                <span className="text-white font-bold">{wFacial.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={wFacial}
                onChange={(e) => setWFacial(parseFloat(e.target.value))}
                className="w-full accent-[#6366F1] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Lip-Sync Inconsistency Weight (SyncNet)</span>
                <span className="text-white font-bold">{wLipSync.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={wLipSync}
                onChange={(e) => setWLipSync(parseFloat(e.target.value))}
                className="w-full accent-[#06B6D4] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Active Speaker Concordance Weight (TalkNet)</span>
                <span className="text-white font-bold">{wActiveSpeaker.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={wActiveSpeaker}
                onChange={(e) => setWActiveSpeaker(parseFloat(e.target.value))}
                className="w-full accent-[#22C55E] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Audio Forensics & Splices Weight</span>
                <span className="text-white font-bold">{wAudio.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={wAudio}
                onChange={(e) => setWAudio(parseFloat(e.target.value))}
                className="w-full accent-[#F59E0B] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Ingestion & Hardware Settings */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-5">
          <div className="border-b border-[#1E293B] pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-[#06B6D4]" />
              Storage & Hardware Configuration
            </h3>
            <p className="text-xs text-[#94A3B8]">Limits and runtime environment execution flags</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Maximum Upload Size (MB)
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={maxSize}
                onChange={(e) => setMaxSize(parseInt(e.target.value) || 250)}
                className="w-full bg-[#080D18] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Whisper Model Checkpoint
              </label>
              <input
                type="text"
                disabled
                value={settings?.whisper_model || 'base'}
                className="w-full bg-[#080D18]/50 border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-slate-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Execution Hardware Device
              </label>
              <input
                type="text"
                disabled
                value={settings?.device || 'cpu'}
                className="w-full bg-[#080D18]/50 border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-slate-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Permitted File Extensions
              </label>
              <input
                type="text"
                disabled
                value={settings?.allowed_extensions || 'mp4,mov,avi,mkv,wav,mp3,m4a'}
                className="w-full bg-[#080D18]/50 border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-slate-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#4338CA] text-white text-xs font-bold shadow-lg shadow-[#6366F1]/20 transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

