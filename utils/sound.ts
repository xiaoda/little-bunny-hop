// Simple audio synthesizer to avoid loading external mp3s
const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
const audioCtx = new AudioContextClass();

export const playSound = (type: 'jump' | 'collect' | 'hit' | 'win') => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

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