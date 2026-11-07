/**
 * Pre-configured research benchmark scenarios for instant demonstration and testing.
 */
export interface BenchmarkSample {
  id: string;
  title: string;
  type: 'video' | 'audio';
  category: 'Synthetic Face-Swap' | 'Acoustic AI Voice Clone' | 'Authentic Press Conference' | 'Dubbed Translation Lag';
  expectedRisk: 'HIGH' | 'LOW' | 'INCONCLUSIVE';
  description: string;
  duration: number;
  indicators: string[];
}

export const BENCHMARK_SAMPLES: BenchmarkSample[] = [
  {
    id: 'sample-faceswap-01',
    title: 'Synthetic Face-Swap & Deepfake Dubbing',
    type: 'video',
    category: 'Synthetic Face-Swap',
    expectedRisk: 'HIGH',
    description: 'Diffusion-generated face swap exhibiting boundary blending residuals, 2D-FFT high frequency checkerboard artifacts, and a +180ms audio-visual synchronization offset.',
    duration: 8.5,
    indicators: ['GAN Boundary Residuals', 'Lip-Sync Offset (+180ms)', 'High-Frequency Spectrum Grid'],
  },
  {
    id: 'sample-voiceclone-02',
    title: 'Neural Vocoder AI Voice Clone',
    type: 'audio',
    category: 'Acoustic AI Voice Clone',
    expectedRisk: 'HIGH',
    description: 'Synthesized voice clone generated via diffusion acoustic vocoder. Features abrupt high-frequency attenuation above 7.8 kHz and synthetic splice transitions.',
    duration: 6.2,
    indicators: ['Vocoder Cutoff (>8kHz)', 'Unnatural Pitch Jitter', 'Acoustic Splice Discontinuity'],
  },
  {
    id: 'sample-authentic-03',
    title: 'Authentic Broadcast Press Briefing',
    type: 'video',
    category: 'Authentic Press Conference',
    expectedRisk: 'LOW',
    description: 'Clean camera capture with continuous facial texture gradients, concordant mouth-to-voice synchronization (lag: -18ms), and natural room acoustic reverberation.',
    duration: 12.0,
    indicators: ['Natural Facial Laplacian', 'Synchronous Lip Velocity', 'Continuous Acoustic PSD'],
  },
  {
    id: 'sample-dubbed-04',
    title: 'Multi-Lingual Broadcast Dubbing',
    type: 'video',
    category: 'Dubbed Translation Lag',
    expectedRisk: 'INCONCLUSIVE',
    description: 'Legitimate genuine video where audio has been professionally dubbed into another language. Generates lip-sync mismatch without synthetic facial manipulation.',
    duration: 9.4,
    indicators: ['Mouth-Audio Desync', 'Authentic Facial Texture', 'Multi-Speaker Concordance'],
  },
];

