import { useState, useEffect, useCallback } from 'react';

export const useSpeechSynthesis = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let intervalId: number | null = null;
    
    const updateVoices = () => {
      const voiceList = window.speechSynthesis.getVoices();
      if (voiceList.length > 0) {
        setVoices(voiceList);
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    };

    // Initial check
    updateVoices();

    // Poll as a fallback for browsers that load voices asynchronously and unreliably
    if (window.speechSynthesis.getVoices().length === 0) {
      intervalId = window.setInterval(updateVoices, 100);
    }
    
    // Use the official event listener
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      window.speechSynthesis.onvoiceschanged = null;
      // Also cancel any ongoing speech when the component unmounts
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text: string, voice: SpeechSynthesisVoice, onEnd?: () => void) => {
    // Use window.speechSynthesis.speaking as a more reliable guard
    if (!text || window.speechSynthesis.speaking) return;

    window.speechSynthesis.cancel(); // Clear any previous utterances

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
        setIsPlaying(false);
        onEnd?.();
    };
    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
        // "interrupted" is a common event when speech is cancelled by the user.
        // It's not a true error, so we don't need to log it to the console.
        if (e.error !== 'interrupted') {
            console.error("Speech synthesis error:", e.error);
        }
        setIsPlaying(false);
        onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  return { voices, speak, stop, isPlaying };
};