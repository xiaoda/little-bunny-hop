
// Simple audio synthesizer to avoid loading external mp3s
const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
// Create context lazily or handle suspended state
const audioCtx = new AudioContextClass();

// --- Sound Effects ---

export const playSound = (type: 'jump' | 'collect' | 'hit' | 'win') => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  
  // If globally muted, don't play SFX
  if (musicManager.isMuted) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === 'collect') {
    // Happy high ping
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, now);
    oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    oscillator.start(now);
    oscillator.stop(now + 0.1);
  } else if (type === 'hit') {
    // Low thud
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150, now);
    oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    oscillator.start(now);
    oscillator.stop(now + 0.3);
  } else if (type === 'jump') {
    // Swoosh
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(200, now);
    oscillator.frequency.linearRampToValueAtTime(300, now + 0.1);
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.1);
    oscillator.start(now);
    oscillator.stop(now + 0.1);
  } else if (type === 'win') {
    // Victory fanfare (simple arpeggio)
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gn = audioCtx.createGain();
      osc.connect(gn);
      gn.connect(audioCtx.destination);
      
      const time = now + (i * 0.1);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      gn.gain.setValueAtTime(0.2, time);
      gn.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
      osc.start(time);
      osc.stop(time + 0.3);
    });
  }
};

// --- Background Music System ---

interface Note {
  freq: number;
  duration: number; // in beats
}

// Frequencies
const C4 = 261.63;
const D4 = 293.66;
const E4 = 329.63;
const F4 = 349.23;
const G4 = 392.00;
const A4 = 440.00;
const B4 = 493.88;
const C5 = 523.25;

// Melodies
const MENU_MELODY: Note[] = [
  { freq: C4, duration: 2 },
  { freq: E4, duration: 2 },
  { freq: G4, duration: 2 },
  { freq: E4, duration: 2 },
  { freq: C4, duration: 2 },
  { freq: G4, duration: 2 },
];

const GAME_MELODY: Note[] = [
  { freq: C4, duration: 1 },
  { freq: D4, duration: 1 },
  { freq: E4, duration: 1 },
  { freq: C4, duration: 1 },
  { freq: E4, duration: 1 },
  { freq: F4, duration: 1 },
  { freq: G4, duration: 2 },
  { freq: G4, duration: 1 },
  { freq: A4, duration: 1 },
  { freq: G4, duration: 1 },
  { freq: F4, duration: 1 },
  { freq: E4, duration: 1 },
  { freq: C4, duration: 1 },
];

class MusicManager {
  private currentTimeout: number | null = null;
  private currentMelody: Note[] | null = null;
  private noteIndex: number = 0;
  private bpm: number = 120;
  public isMuted: boolean = false;
  private currentType: 'menu' | 'playing' | null = null;

  constructor() {}

  init() {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  play(type: 'menu' | 'playing') {
    if (this.currentType === type && this.currentTimeout) return; // Already playing
    
    this.stop();
    this.currentType = type;
    this.noteIndex = 0;

    if (type === 'menu') {
      this.currentMelody = MENU_MELODY;
      this.bpm = 100; // Slower
    } else {
      this.currentMelody = GAME_MELODY;
      this.bpm = 180; // Faster
    }

    this.init();
    this.scheduleNextNote();
  }

  stop() {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    this.currentType = null;
  }

  pause() {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
  }

  resume() {
    // Only resume if we have a melody selected and no active timeout (meaning it's paused or stopped)
    if (this.currentMelody && !this.currentTimeout) {
      this.scheduleNextNote();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      // Don't actually stop the sequencer loop, just stop emitting sound? 
      // Or we can just let the sequencer run but produce 0 volume. 
      // For simplicity, let's keep running but check isMuted in playTone.
    }
    return this.isMuted;
  }

  private scheduleNextNote() {
    if (!this.currentMelody) return;

    const note = this.currentMelody[this.noteIndex];
    const beatDuration = 60 / this.bpm;
    const noteTime = note.duration * beatDuration;

    if (!this.isMuted) {
      this.playTone(note.freq, noteTime);
    }

    this.noteIndex = (this.noteIndex + 1) % this.currentMelody.length;

    // Schedule next
    this.currentTimeout = window.setTimeout(() => {
      this.scheduleNextNote();
    }, noteTime * 1000);
  }

  private playTone(freq: number, duration: number) {
    if (audioCtx.state === 'suspended') return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    // Softer sound for BGM
    osc.type = this.currentType === 'menu' ? 'sine' : 'triangle';
    osc.frequency.value = freq;
    
    // Smooth envelope
    const now = audioCtx.currentTime;
    const volume = this.currentType === 'menu' ? 0.05 : 0.03; // Very quiet background

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.05);
    gain.gain.linearRampToValueAtTime(volume, now + duration - 0.05);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.start(now);
    osc.stop(now + duration);
  }
}

export const musicManager = new MusicManager();
