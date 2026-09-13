/**
 * Web Audio API synthesizer for realistic football sound effects
 * Zero external audio files, 100% offline, 0 bytes download overhead!
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Realistic referee dual-tone whistle with frequency flutter
   */
  playWhistle(duration = 0.32, volume = 0.25) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Dual characteristic referee whistle frequencies
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(2600, now);
      osc1.frequency.exponentialRampToValueAtTime(2850, now + duration * 0.4);
      osc1.frequency.exponentialRampToValueAtTime(2550, now + duration);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(2850, now);
      osc2.frequency.exponentialRampToValueAtTime(3100, now + duration * 0.4);
      osc2.frequency.exponentialRampToValueAtTime(2800, now + duration);

      // Amplitude envelope (fast attack, sharp cutoff)
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(volume, now + 0.04);
      gainNode.gain.setValueAtTime(volume * 0.9, now + duration - 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch {
      // Ignore audio policy errors
    }
  }

  /**
   * Deep acoustic ball kick thud
   */
  playKick(volume = 0.3) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

      gainNode.gain.setValueAtTime(volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignore audio policy errors
    }
  }

  /**
   * Crisp transition click / step sound
   */
  playClick(volume = 0.15) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gainNode.gain.setValueAtTime(volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Ignore audio policy errors
    }
  }
}

export const soundEffects = new SoundEffectsEngine();
