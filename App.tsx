import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Controls } from './components/Controls';
import { TranscriptionBox } from './components/TranscriptionBox';
import { TranslationHistory } from './components/TranslationHistory';
import { SessionTranslation } from './components/SessionTranslation';
import { Toast } from './components/Toast';
import { UsageTips } from './components/UsageTips';
import { ConfirmationModal } from './components/ConfirmationModal';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { translateStream } from './services/geminiService';
import { LanguageCode, TranslationEntry, TranslationChunk, Language } from './types';
import { TARGET_LANGUAGES } from './constants';
import { MicIcon, TranslateIcon, LanguageIcon, LinkedInIcon, GitHubIcon } from './components/icons';
import { translations } from './services/i18n';

const App: React.FC = () => {
  const [uiLanguage, setUiLanguage] = useState<'en' | 'es'>('en');
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>('es-ES');
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>('en-US');
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  const [finalTranscription, setFinalTranscription] = useState('');
  const [interimTranscription, setInterimTranscription] = useState('');
  const [sessionChunks, setSessionChunks] = useState<TranslationChunk[]>([]);

  const [translationHistory, setTranslationHistory] = useState<TranslationEntry[]>([]);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [isAutoNarrationEnabled, setIsAutoNarrationEnabled] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const translationTimerRef = useRef<number | null>(null);
  const lastTranslatedTextRef = useRef('');
  
  const t = useCallback((key: keyof typeof translations.en) => {
    return translations[uiLanguage][key] || translations.en[key];
  }, [uiLanguage]);

  const isAnythingTranslating = sessionChunks.some(c => c.isTranslating);
  const hasSessionContent = finalTranscription.length > 0 || sessionChunks.some(c => c.text.trim().length > 0);

  const handleTranslate = useCallback(async (textToTranslate: string) => {
    if (!textToTranslate.trim()) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    const chunkId = `chunk-${Date.now()}`;
    setSessionChunks(prev => [...prev, { id: chunkId, text: '', isTranslating: true }]);
    setError(null);

    try {
      const targetLangName = TARGET_LANGUAGES.find(l => l.code === targetLanguage)?.name || 'English';
      const stream = await translateStream({
        text: textToTranslate,
        targetLanguage: targetLangName,
        signal: controller.signal,
      });
      
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunkText = decoder.decode(value, { stream: true });
        accumulatedText += chunkText;
        setSessionChunks(prev => prev.map(c => 
            c.id === chunkId ? { ...c, text: accumulatedText } : c
        ));
      }
    } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
          console.error('Translation error:', e);
          setError(t('errorTranslation'));
          setSessionChunks(prev => prev.filter(c => c.id !== chunkId));
        }
    } finally {
        setSessionChunks(prev => prev.map(c => 
            c.id === chunkId ? { ...c, isTranslating: false } : c
        ));
    }
  }, [targetLanguage, t]);
  
  // Debounce translation logic
  useEffect(() => {
    if (translationTimerRef.current) {
        clearTimeout(translationTimerRef.current);
    }

    const newTextToTranslate = finalTranscription.substring(lastTranslatedTextRef.current.length).trim();

    if (newTextToTranslate) {
      translationTimerRef.current = window.setTimeout(() => {
          // If source and target languages are the same, just display the transcription without calling the API.
          if (sourceLanguage === targetLanguage) {
              const chunkId = `chunk-${Date.now()}`;
              setSessionChunks(prev => [
                  ...prev, 
                  { id: chunkId, text: newTextToTranslate, isTranslating: false }
              ]);
              lastTranslatedTextRef.current = finalTranscription;
          } else {
              handleTranslate(newTextToTranslate);
              lastTranslatedTextRef.current = finalTranscription;
          }
      }, 800); // Wait for 0.8 seconds of silence before translating
    }
    
    return () => {
        if (translationTimerRef.current) {
            clearTimeout(translationTimerRef.current);
        }
    };
  }, [finalTranscription, handleTranslate, sourceLanguage, targetLanguage]);

  const handleResult = useCallback((final: string, interim: string) => {
    if (final) {
        setFinalTranscription(prev => {
            const trimmedPrev = prev.trim();
            const trimmedFinal = final.trim();

            if (!trimmedPrev) return trimmedFinal;

            // Simple case: new result is the full transcript.
            if (trimmedFinal.startsWith(trimmedPrev)) {
                return trimmedFinal;
            }

            // Complex case (mobile restart with overlap): find the best overlap.
            // This algorithm finds the longest suffix of the previous text
            // that is also a prefix of the new text, preventing duplication.
            let overlap = 0;
            for (let i = Math.min(trimmedPrev.length, trimmedFinal.length); i > 0; i--) {
                if (trimmedPrev.endsWith(trimmedFinal.substring(0, i))) {
                    overlap = i;
                    break;
                }
            }
            
            if (overlap > 0) {
                 return trimmedPrev + trimmedFinal.substring(overlap);
            } else {
                 // No overlap found, treat as a new phrase (standard desktop behavior).
                 return trimmedPrev + ' ' + trimmedFinal;
            }
        });
    }
    setInterimTranscription(interim ? ' ' + interim : '');
  }, []);


  const { isListening, startListening, stopListening, error: speechError } = useSpeechRecognition({
    onResult: handleResult,
    onClear: () => {
      setFinalTranscription('');
      setInterimTranscription('');
      lastTranslatedTextRef.current = '';
    },
  });

  useEffect(() => {
    if (speechError) {
      if (speechError === 'not-allowed' || speechError === 'service-not-allowed') {
        setError(t('errorMicPermission'));
      } else {
        setError(`${t('errorSpeechRec')} ${speechError}`);
      }
    }
  }, [speechError, t]);

  const { voices, speak, stop: stopSpeaking, isPlaying } = useSpeechSynthesis();
  
  const LANGUAGES_REQUIRING_VOICE_FALLBACK: string[] = ['ca-ES', 'ca-ES-valencia', 'ar-SA'];
  
  const baseTargetLanguage = targetLanguage.split('-')[0];
  let voicesForSelection = voices.filter(v => v.lang.startsWith(baseTargetLanguage));
  
  if (voicesForSelection.length === 0 && voices.length > 0) {
      if (LANGUAGES_REQUIRING_VOICE_FALLBACK.includes(targetLanguage)) {
          voicesForSelection = voices;
      }
  }

  useEffect(() => {
    const baseTargetLang = targetLanguage.split('-')[0];
    let availableVoices = voices.filter(v => v.lang.startsWith(baseTargetLang));

    if (availableVoices.length === 0 && voices.length > 0) {
      if (LANGUAGES_REQUIRING_VOICE_FALLBACK.includes(targetLanguage)) {
        availableVoices = voices;
      }
    }

    if (availableVoices.length > 0) {
      const isSelectedVoiceStillValid = selectedVoice && availableVoices.some(v => v.voiceURI === selectedVoice.voiceURI);
      
      if (!isSelectedVoiceStillValid) {
        const defaultForLang = availableVoices.find(v => v.lang.startsWith(targetLanguage) && v.default);
        const anyDefault = availableVoices.find(v => v.default);
        setSelectedVoice(defaultForLang || anyDefault || availableVoices[0]);
      }
    } else {
      setSelectedVoice(null);
    }
  }, [targetLanguage, voices, selectedVoice]);

  useEffect(() => {
    if (!isAutoNarrationEnabled) return;

    const lastChunk = sessionChunks[sessionChunks.length - 1];
    if (lastChunk && !lastChunk.isTranslating && lastChunk.text && selectedVoice) {
      speak(lastChunk.text, selectedVoice);
    }
  }, [sessionChunks, selectedVoice, speak, isAutoNarrationEnabled]);

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(sourceLanguage);
    }
  };

  const handleNewSession = () => {
    stopListening();
    stopSpeaking();
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    
    const sessionText = sessionChunks.map(c => c.text).join(' ').trim();
    if(sessionText) {
        const newEntry: TranslationEntry = {
            id: `hist-${Date.now()}`,
            text: sessionText,
            timestamp: new Date().toLocaleString(),
        };
        setTranslationHistory(prev => [newEntry, ...prev]);
    }
    
    setFinalTranscription('');
    setInterimTranscription('');
    setSessionChunks([]);
    setError(null);
    lastTranslatedTextRef.current = '';
  };

  const handleToggleSpeak = (id: string, text: string) => {
    if (isPlaying && currentlyPlayingId === id) {
      stopSpeaking();
      setCurrentlyPlayingId(null);
    } else if (selectedVoice) {
      setCurrentlyPlayingId(id);
      speak(text, selectedVoice, () => setCurrentlyPlayingId(null));
    }
  };

  const handleToggleSpeakSession = () => {
    const fullText = sessionChunks.map(c => c.text).join(' ').trim();
    if (!fullText) return;

    if (isPlaying && currentlyPlayingId === 'session-output') {
        stopSpeaking();
        setCurrentlyPlayingId(null);
    } else if (selectedVoice) {
        setCurrentlyPlayingId('session-output');
        speak(fullText, selectedVoice, () => setCurrentlyPlayingId(null));
    }
  };
  
  const handleDeleteFromHistory = (id: string) => {
    setConfirmingDeleteId(id);
  };

  const confirmDelete = () => {
    if (confirmingDeleteId) {
        setTranslationHistory(prev => prev.filter(entry => entry.id !== confirmingDeleteId));
        setConfirmingDeleteId(null);
        setToastMessage(t('translationDeleted'));
    }
  };

  const handleTargetLanguageChange = (code: LanguageCode) => {
    stopSpeaking();
    setTargetLanguage(code);
  };
  
  const handleVoiceChange = (voiceURI: string) => {
      const voice = voices.find(v => v.voiceURI === voiceURI);
      if(voice) {
          setSelectedVoice(voice);
      }
  };

  const handleToggleAutoNarration = () => {
    setIsAutoNarrationEnabled(prev => !prev);
  };

  const handleCopySessionTranslation = () => {
    const fullText = sessionChunks.map(c => c.text).join(' ').trim();
    if (fullText) {
      navigator.clipboard.writeText(fullText);
      setToastMessage(t('copiedToClipboard'));
    }
  };

  return (
    <div className="min-h-screen text-text-primary p-4 sm:p-6 lg:p-8 font-sans overflow-x-hidden w-full">
      <main className="w-full mx-auto flex flex-col gap-6 max-w-full sm:max-w-7xl">
        <header className="text-center">
            <div className="flex items-center justify-center gap-2">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">{t('title')}</h1>
                <div className="relative group">
                    <button onClick={() => setUiLanguage(prev => prev === 'en' ? 'es' : 'en')} className="p-2 rounded-full hover:bg-base-200 transition-colors">
                        <LanguageIcon className="w-6 h-6 text-text-secondary"/>
                    </button>
                    <span className="absolute top-full mt-2 w-max px-2 py-1 bg-base-300 text-text-primary text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {uiLanguage === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
                    </span>
                </div>
            </div>
          <p className="mt-2 text-md text-text-secondary">{t('subtitle')}</p>
        </header>

        <Controls
          isListening={isListening}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          targetLanguages={TARGET_LANGUAGES as Language[]}
          onSourceLanguageChange={setSourceLanguage}
          onTargetLanguageChange={handleTargetLanguageChange}
          onToggleListening={handleToggleListening}
          onNewSession={handleNewSession}
          newSessionDisabled={!hasSessionContent || isAnythingTranslating}
          voices={voicesForSelection}
          selectedVoiceURI={selectedVoice?.voiceURI || ''}
          onVoiceChange={handleVoiceChange}
          disabled={isListening}
          t={t}
        />
        
        {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        <UsageTips t={t} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TranscriptionBox
            title={t('liveTranscription')}
            icon={<MicIcon className="w-6 h-6" />}
            finalText={finalTranscription}
            interimText={interimTranscription}
            isLoading={isListening}
            loadingText={t('listening')}
            placeholder={t('transcriptionPlaceholder')}
          />
          <SessionTranslation
            icon={<TranslateIcon className="w-6 h-6" />}
            chunks={sessionChunks}
            onToggleSpeak={handleToggleSpeakSession}
            currentlyPlayingId={currentlyPlayingId}
            isPlaying={isPlaying}
            voiceAvailable={!!selectedVoice}
            t={t}
            isAutoNarrationEnabled={isAutoNarrationEnabled}
            onToggleAutoNarration={handleToggleAutoNarration}
            onCopy={handleCopySessionTranslation}
          />
        </div>

        {translationHistory.length > 0 && (
             <TranslationHistory 
                history={translationHistory}
                onToggleSpeak={handleToggleSpeak}
                currentlyPlayingId={currentlyPlayingId}
                isPlaying={isPlaying}
                onDelete={handleDeleteFromHistory}
                t={t}
             />
        )}

        <footer className="text-center mt-8 space-y-4">
            <div>
                 <a 
                    href="https://conancos.dev" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-2xl sm:text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-brand-primary hover:opacity-80 transition-opacity"
                >
                    By CONANCOS.dev  © 2025
                </a>
                <a
                    href="https://www.gnu.org/licenses/gpl-3.0.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-xs text-text-primary hover:text-brand-primary transition-colors"
                    aria-label="GNU GPL v3.0 License"
                >
                    {t('license')}
                </a>
            </div>
            <div className="flex justify-center items-center gap-6">
                 <a 
                  href="https://www.linkedin.com/in/joaquin-martinez-cortes/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-text-secondary hover:text-brand-secondary transition-colors"
                  aria-label="LinkedIn Profile"
                >
                  <LinkedInIcon className="w-6 h-6"/>
                  {t('linkedIn')}
                </a>
                <a 
                  href="https://github.com/conancos" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-text-secondary hover:text-brand-secondary transition-colors"
                  aria-label="GitHub Profile"
                >
                  <GitHubIcon className="w-6 h-6"/>
                  {t('github')}
                </a>
            </div>
        </footer>

      </main>
      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />
      <ConfirmationModal
        isOpen={!!confirmingDeleteId}
        onClose={() => setConfirmingDeleteId(null)}
        onConfirm={confirmDelete}
        title={t('confirmDeleteTitle')}
        message={t('confirmDeleteMessage')}
        t={t}
      />
    </div>
  );
};

export default App;