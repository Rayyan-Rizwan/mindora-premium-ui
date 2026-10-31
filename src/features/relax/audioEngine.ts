import type { TrackSound } from "./tracks";

type AudioContextCtor = typeof AudioContext;

function audioContextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  const candidate = window as Window & {
    webkitAudioContext?: AudioContextCtor;
  };
  return window.AudioContext ?? candidate.webkitAudioContext ?? null;
}

export function isAudioSupported(): boolean {
  return audioContextCtor() !== null;
}

export class AmbientEngine {
  private readonly context: AudioContext;
  private readonly master: GainNode;
  private readonly filter: BiquadFilterNode;
  private readonly padGain: GainNode;
  private readonly noiseGain: GainNode;
  private readonly sound: TrackSound;
  private sources: AudioScheduledSourceNode[] = [];
  private noteTimer: number | null = null;
  private running = false;

  constructor(sound: TrackSound, volume: number) {
    const Ctor = audioContextCtor();
    if (!Ctor) throw new Error("Web Audio is not available in this browser.");
    this.sound = sound;
    this.context = new Ctor();
    this.master = this.context.createGain();
    this.master.gain.value = Math.min(1, Math.max(0, volume)) * 0.9;
    this.master.connect(this.context.destination);

    this.filter = this.context.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = sound.brightness;
    this.filter.Q.value = 0.7;
    this.filter.connect(this.master);

    this.padGain = this.context.createGain();
    this.padGain.gain.value = sound.padLevel;
    this.padGain.connect(this.filter);

    this.noiseGain = this.context.createGain();
    this.noiseGain.gain.value = sound.noise;
    this.noiseGain.connect(this.filter);
  }

  async start(): Promise<void> {
    if (this.running) return;
    if (this.context.state === "suspended") {
      await this.context.resume();
    }
    this.running = true;
    const now = this.context.currentTime;
    this.padGain.gain.cancelScheduledValues(now);
    this.padGain.gain.setValueAtTime(this.sound.padLevel, now);
    this.noiseGain.gain.cancelScheduledValues(now);
    this.noiseGain.gain.setValueAtTime(this.sound.noise, now);

    [0, 7, 12].forEach((semitone, index) => {
      const osc = this.context.createOscillator();
      osc.type = index === 0 ? "sine" : "triangle";
      osc.frequency.value =
        this.sound.root * Math.pow(2, semitone / 12);
      osc.detune.value = index * 5 - 5;
      const gain = this.context.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(
        0.2 / (index + 1),
        now + 3.5,
      );
      osc.connect(gain);
      gain.connect(this.padGain);
      osc.start(now);
      this.sources.push(osc);
    });

    const lfo = this.context.createOscillator();
    lfo.frequency.value = 0.035;
    const lfoDepth = this.context.createGain();
    lfoDepth.gain.value = this.sound.brightness * 0.26;
    lfo.connect(lfoDepth);
    lfoDepth.connect(this.filter.frequency);
    lfo.start(now);
    this.sources.push(lfo);

    const noise = this.context.createBufferSource();
    noise.buffer = this.makeNoiseBuffer();
    noise.loop = true;
    noise.connect(this.noiseGain);
    noise.start(now);
    this.sources.push(noise);

    this.scheduleNote();
    this.noteTimer = window.setInterval(
      () => this.scheduleNote(),
      this.sound.tempo * 1000,
    );
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;
    if (this.noteTimer !== null) {
      window.clearInterval(this.noteTimer);
      this.noteTimer = null;
    }
    const now = this.context.currentTime;
    const previous = this.sources;
    this.sources = [];
    this.padGain.gain.cancelScheduledValues(now);
    this.padGain.gain.setTargetAtTime(0.0001, now, 0.12);
    this.noiseGain.gain.cancelScheduledValues(now);
    this.noiseGain.gain.setTargetAtTime(0.0001, now, 0.12);
    window.setTimeout(() => {
      previous.forEach((source) => {
        try {
          source.stop();
        } catch {
          // A source that already ended can throw; nothing to release.
        }
        try {
          source.disconnect();
        } catch {
          // Ignore disconnection of already-released nodes.
        }
      });
    }, 650);
  }

  setVolume(value: number): void {
    const clamped = Math.min(1, Math.max(0, value));
    this.master.gain.setTargetAtTime(
      clamped * 0.9,
      this.context.currentTime,
      0.08,
    );
  }

  dispose(): void {
    this.stop();
    void this.context.close().catch(() => undefined);
  }

  private scheduleNote(): void {
    if (!this.running) return;
    const now = this.context.currentTime + 0.06;
    const scale = this.sound.scale;
    const semitone = scale[Math.floor(Math.random() * scale.length)];
    const osc = this.context.createOscillator();
    osc.type = "sine";
    osc.frequency.value =
      this.sound.root * 2 * Math.pow(2, semitone / 12);
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(
      this.sound.chimeLevel,
      now + 0.05,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);
    osc.connect(gain);
    gain.connect(this.filter);
    osc.start(now);
    osc.stop(now + 2.8);
  }

  private makeNoiseBuffer(): AudioBuffer {
    const length = this.context.sampleRate * 2;
    const buffer = this.context.createBuffer(
      1,
      length,
      this.context.sampleRate,
    );
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let index = 0; index < length; index += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[index] = last * 3.2;
    }
    return buffer;
  }
}
