// A tiny synthesizer: every sound in Kindlefall is an oscillator, so the game
// carries no audio files.

export class Soundboard {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  tone({ freq = 440, to = null, dur = 0.14, type = 'sine', gain = 0.07, delay = 0 }) {
    if (!this.enabled) return;
    const ctx = this.unlock();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(30, to), t0 + dur);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(amp).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  noise({ dur = 0.18, gain = 0.05, delay = 0 }) {
    if (!this.enabled) return;
    const ctx = this.unlock();
    if (!ctx) return;
    const frames = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 2;
    const src = ctx.createBufferSource();
    const amp = ctx.createGain();
    amp.gain.value = gain;
    src.buffer = buffer;
    src.connect(amp).connect(ctx.destination);
    src.start(ctx.currentTime + delay);
  }

  deal() { this.noise({ dur: 0.09, gain: 0.035 }); this.tone({ freq: 520, to: 380, dur: 0.08, type: 'triangle', gain: 0.03 }); }
  click() { this.tone({ freq: 640, to: 520, dur: 0.05, type: 'triangle', gain: 0.035 }); }
  play() { this.noise({ dur: 0.12, gain: 0.045 }); this.tone({ freq: 300, to: 520, dur: 0.16, type: 'sawtooth', gain: 0.035 }); }
  hit() { this.tone({ freq: 150, to: 60, dur: 0.26, type: 'square', gain: 0.06 }); this.noise({ dur: 0.2, gain: 0.06 }); }
  ward() { this.tone({ freq: 880, to: 1320, dur: 0.22, type: 'sine', gain: 0.045 }); }
  heal() { [523, 659, 784].forEach((f, i) => this.tone({ freq: f, dur: 0.18, type: 'sine', gain: 0.04, delay: i * 0.07 })); }
  ember() { this.tone({ freq: 1180, to: 1600, dur: 0.1, type: 'triangle', gain: 0.035 }); }
  victory() { [392, 523, 659, 784, 1046].forEach((f, i) => this.tone({ freq: f, dur: 0.5, type: 'sine', gain: 0.055, delay: i * 0.13 })); }
  defeat() { [330, 262, 208, 165].forEach((f, i) => this.tone({ freq: f, dur: 0.7, type: 'sine', gain: 0.05, delay: i * 0.16 })); }
}
