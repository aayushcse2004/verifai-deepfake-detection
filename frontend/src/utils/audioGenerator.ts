/**
 * Generates valid standard 16kHz 16-bit PCM WAV file binary Blobs in pure JavaScript
 * for instant one-click pipeline testing and interview demonstrations.
 */
export function generateTestWav(
  durationSeconds = 2.5,
  anomalyType: 'genuine' | 'faceswap' | 'voiceclone' | 'dubbed' = 'genuine'
): File {
  const sampleRate = 16000;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // RIFF Chunk Descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(view, 8, 'WAVE');

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);  // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true);  // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true);  // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)

  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Generate acoustic waveform
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    if (anomalyType === 'voiceclone') {
      // Abrupt harmonics + steep cutoff + splice spikes
      sample = 0.5 * Math.sin(2 * Math.PI * 440 * t) + 0.3 * Math.sin(2 * Math.PI * 880 * t);
      if (i % 8000 < 200) sample = 0.95 * Math.sin(2 * Math.PI * 1500 * t); // synthetic splice
    } else if (anomalyType === 'dubbed') {
      // Out-of-phase speech burst
      sample = 0.6 * Math.sin(2 * Math.PI * 320 * t) * (Math.sin(2 * Math.PI * 3 * t) > 0 ? 1 : 0.1);
    } else {
      // Natural speech-like composite harmonic tone
      sample =
        0.4 * Math.sin(2 * Math.PI * 220 * t) +
        0.25 * Math.sin(2 * Math.PI * 440 * t) +
        0.15 * Math.sin(2 * Math.PI * 660 * t);
    }

    // Clip to int16
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF, true);
    offset += 2;
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  const filename = `benchmark_${anomalyType}_${Date.now()}.wav`;
  return new File([blob], filename, { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

