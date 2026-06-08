/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private bgmInterval: any = null;
  private bgmSequenceStep = 0;
  private moveOsc: OscillatorNode | null = null;
  private moveLfo: OscillatorNode | null = null;
  private moveGain: GainNode | null = null;

  // Settings stored in local storage
  public bgmEnabled: boolean = false;
  public sfxEnabled: boolean = true;

  constructor() {
    // Load setting preferences from local storage if available
    try {
      const savedBgm = localStorage.getItem('shima_bgm_enabled');
      const savedSfx = localStorage.getItem('shima_sfx_enabled');
      if (savedBgm !== null) this.bgmEnabled = savedBgm === 'true';
      if (savedSfx !== null) this.sfxEnabled = savedSfx === 'true';
    } catch (e) {
      console.warn('Could not read audio preferences from localStorage', e);
    }
  }

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Set BGM preference
  setBgm(enabled: boolean) {
    this.bgmEnabled = enabled;
    localStorage.setItem('shima_bgm_enabled', String(enabled));
    if (enabled) {
      this.startBGM();
    } else {
      this.stopBGM();
    }
  }

  // Set SFX preference
  setSfx(enabled: boolean) {
    this.sfxEnabled = enabled;
    localStorage.setItem('shima_sfx_enabled', String(enabled));
    if (!enabled) {
      this.stopMoveSound();
    }
  }

  // Start BGM loop (Cute 8-bit pentatonic melody sequence)
  startBGM() {
    if (!this.bgmEnabled) return;
    this.initContext();
    if (this.bgmInterval) return;

    // Pentatonic happy melody scale in C major
    const notes = [
      261.63, // C4
      293.66, // D4
      329.63, // E4
      392.00, // G4
      440.00, // A4
      523.25, // C5
      587.33, // D5
      659.25  // E5
    ];

    // Simple nostalgic chord/melody sequences
    const patterns = [
      [2, 4, 5, 4, 3, 5, 4, 3], // Intro/Verse
      [5, 4, 3, 2, 0, 1, 2, 4], 
      [5, 6, 7, 5, 4, 5, 4, 2], // Chorus
      [4, 3, 2, 0, 2, 3, 4, 5]
    ];

    let patternIdx = 0;

    this.bgmInterval = setInterval(() => {
      if (!this.ctx || !this.bgmEnabled) return;
      if (this.ctx.state === 'suspended') return;

      const pattern = patterns[patternIdx];
      const noteIdx = pattern[this.bgmSequenceStep % pattern.length];
      const freq = notes[noteIdx];

      // Play a cute soft square wave synth note
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle'; // Sweet flute/plip tone
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);

      // Add a very quiet rhythmic bass / chord accent half the time
      if (this.bgmSequenceStep % 2 === 0) {
        const bassNotes = [130.81, 146.83, 164.81, 196.00]; // C3, D3, E3, G3
        const bassFreq = bassNotes[Math.floor(this.bgmSequenceStep / 4) % bassNotes.length];
        
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassFreq, this.ctx.currentTime);
        bassGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
        
        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start();
        bassOsc.stop(this.ctx.currentTime + 0.6);
      }

      this.bgmSequenceStep++;
      if (this.bgmSequenceStep % 8 === 0) {
        // Change pattern
        patternIdx = (patternIdx + 1) % patterns.length;
      }
    }, 220); // ~136 bpm (cute tempo)
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  // SFX: Claw Motor Move sound (humming synth disabled to avoid annoying hum)
  startMoveSound() {
    // Disabled as requested to remove the motor humming sound
  }

  stopMoveSound() {
    // Disabled as requested
  }

  // SFX: Drop launch (retro high to low slide)
  playDropSFX() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.55);
  }

  // SFX: Raising (climbing sound)
  playRaiseSFX() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(450, this.ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.65);
  }

  // SFX: Success grab (cute arpeggio)
  playGrabSFX() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C E G C E G
    
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.06, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.3);
    });
  }

  // SFX: Dropped in chute score increase (happy digital ring chime)
  playWinSFX() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Play dual oscillator chime
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    const gain2 = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.setValueAtTime(1046.50, now + 0.08); // C6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1318.51, now); // E6
    osc2.frequency.setValueAtTime(1567.98, now + 0.08); // G6

    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    gain2.gain.setValueAtTime(0.05, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);

    osc1.start();
    osc2.start();

    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  }

  // SFX: Click setting / select sound
  playClickSFX() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }
}

export const audio = new AudioEngine();
