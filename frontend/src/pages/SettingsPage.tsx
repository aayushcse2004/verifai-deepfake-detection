import React, { useEffect, useState } from 'react';
import {
  Settings,
  Sliders,
  HardDrive,
  Save,
} from 'lucide-react';
import { getSettings, updateSettings } from '../services/api';
import { SystemSettings } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useToast } from '../components/common/ToastContext';

export const SettingsPage: React.FC = () => {
  const { addToast } = useToast();
  const [settings, setSettingsState] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

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
        addToast({
          type: 'error',
          title: 'Failed to Load Settings',
          message: 'Could not retrieve platform configuration from backend.',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updated = await updateSettings({
        max_upload_size_mb: maxSize,
        weight_facial: wFacial,
        weight_lip_sync: wLipSync,
        weight_active_speaker: wActiveSpeaker,
        weight_audio: wAudio,
      });
      setSettingsState(updated);
      addToast({
        type: 'success',
        title: 'Settings Saved Successfully',
        message: 'System configuration and fusion weights updated.',
      });
    } catch (err: any) {
      console.error('Update error:', err);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err?.response?.data?.detail || 'Failed to update settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  const weightsSum = (wFacial + wLipSync + wActiveSpeaker + wAudio).toFixed(2);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Management' },
          { label: 'Settings' },
        ]}
      />

      <PageHeader
        title="Platform & Model Settings"
        subtitle="Configure media upload thresholds, multimodal fusion weights, and hardware parameters"
        icon={<Settings className="w-5 h-5" />}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Multimodal Fusion Weights */}
        <Card className="border-[#1E293B] bg-[#0E1424]">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#1E293B]">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#6366F1]" />
                Multimodal Fusion Weights
              </CardTitle>
              <CardDescription>
                Relative weighting allocated across forensic modalities (Total sum: {weightsSum})
              </CardDescription>
            </div>
            <Badge variant={weightsSum === '1.00' ? 'success' : 'warning'}>
              Sum: {weightsSum}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-4 pt-5">
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
          </CardContent>
        </Card>

        {/* Ingestion & Hardware Settings */}
        <Card className="border-[#1E293B] bg-[#0E1424]">
          <CardHeader className="pb-3 border-b border-[#1E293B]">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-[#06B6D4]" />
              Storage & Hardware Configuration
            </CardTitle>
            <CardDescription>Limits and runtime environment execution flags</CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
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
                value={settings?.device || 'cuda'}
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
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            loading={saving}
            variant="primary"
            size="lg"
          >
            <Save className="w-4 h-4 mr-1.5" />
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
