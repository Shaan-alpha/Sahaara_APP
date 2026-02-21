import { useRef, useCallback } from 'react';

/**
 * Hook that generates a two-tone emergency siren using Web Audio API
 * and triggers device vibration on mobile.
 */
export function useAlertSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playAlertSound = useCallback(() => {
    // Vibrate on supported devices
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      // Pattern: vibrate 500ms, pause 200ms, repeat
      navigator.vibrate([500, 200, 500, 200, 500, 200, 500, 200, 500]);
    }

    // Create audio context
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      let high = true;

      const playTone = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = high ? 880 : 660;
        gain.gain.value = 0.3;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
        high = !high;
      };

      playTone();
      intervalRef.current = setInterval(playTone, 500);

      // Auto-stop after 10 seconds
      timeoutRef.current = setTimeout(() => {
        stopAlertSound();
      }, 10000);
    } catch (e) {
      console.error('Failed to play alert sound:', e);
    }
  }, []);

  const stopAlertSound = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    // Stop vibration
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(0);
    }
  }, []);

  return { playAlertSound, stopAlertSound };
}
