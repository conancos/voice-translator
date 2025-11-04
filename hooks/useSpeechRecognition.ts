import { useState, useRef, useCallback } from 'react';

// FIX: Add types for Web Speech API which may not be present in all TypeScript DOM lib versions.
// These definitions provide type safety for the speech recognition features.
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}


interface SpeechRecognitionOptions {
  onResult: (final: string, interim: string) => void;
  onClear: () => void;
}

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

export const useSpeechRecognition = ({ onResult, onClear }: SpeechRecognitionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognition = useRef<SpeechRecognition | null>(null);
  const userStopped = useRef(false);

  const stopListening = useCallback(() => {
    if (recognition.current) {
      userStopped.current = true;
      recognition.current.stop();
    }
  }, []);


  const startListening = useCallback((lang: string) => {
    if (isListening || !SpeechRecognitionAPI) {
      if (!SpeechRecognitionAPI) {
        setError("Speech recognition is not supported in this browser.");
      }
      return;
    }

    userStopped.current = false;
    onClear();
    setError(null);
    const rec = new SpeechRecognitionAPI();
    recognition.current = rec;

    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    
    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onend = () => {
       // Auto-restart logic: If recognition ends but the user didn't manually stop it
       // (e.g., due to a browser timeout on mobile), restart it to maintain a continuous session.
      if (!userStopped.current && recognition.current) {
        recognition.current.start();
      } else {
        setIsListening(false);
        recognition.current = null;
      }
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      // 'no-speech' is a common error on mobile when a pause is detected.
      // We can ignore it because our auto-restart logic will handle it.
      if (event.error !== 'no-speech') {
        setError(event.error);
      }
    };
    
    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      // This logic iterates only over new results from the last recognition event.
      // It is more efficient and relies on the parent component to stitch together the full transcript.
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      onResult(finalTranscript.trim(), interimTranscript.trim());
    };

    rec.start();
  }, [isListening, onClear, onResult]);

  return { isListening, startListening, stopListening, error };
};