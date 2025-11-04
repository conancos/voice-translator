import React from 'react';
import { LanguageCode, Language } from '../types';
import { SOURCE_LANGUAGES } from '../constants';
import { MicIcon, StopCircleIcon, PlusCircleIcon } from './icons';
import { translations } from '../services/i18n';

interface ControlsProps {
  isListening: boolean;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  targetLanguages: Language[];
  onSourceLanguageChange: (code: LanguageCode) => void;
  onTargetLanguageChange: (code: LanguageCode) => void;
  onToggleListening: () => void;
  onNewSession: () => void;
  newSessionDisabled: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string;
  onVoiceChange: (voiceURI: string) => void;
  disabled: boolean;
  t: (key: keyof typeof translations.en) => string;
}

export const Controls: React.FC<ControlsProps> = ({
  isListening,
  sourceLanguage,
  targetLanguage,
  targetLanguages,
  onSourceLanguageChange,
  onTargetLanguageChange,
  onToggleListening,
  onNewSession,
  newSessionDisabled,
  voices,
  selectedVoiceURI,
  onVoiceChange,
  disabled,
  t
}) => {
  return (
    <div className="bg-base-200 p-4 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto flex-wrap">
        {/* Source Language Selector */}
        <div className="flex-1 min-w-[150px]">
            <label htmlFor="source-language-select" className="text-xs text-text-secondary mb-1 block">{t('speakInLabel')}</label>
            <select
              id="source-language-select"
              value={sourceLanguage}
              onChange={(e) => onSourceLanguageChange(e.target.value as LanguageCode)}
              className="w-full bg-base-300 border border-base-300 text-text-primary rounded-lg focus:ring-brand-primary focus:border-brand-primary p-2.5"
              disabled={isListening || disabled}
            >
              {SOURCE_LANGUAGES.map(({ code, name }) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
        </div>

        {/* Target Language Selector */}
        <div className="flex-1 min-w-[150px]">
            <label htmlFor="language-select" className="text-xs text-text-secondary mb-1 block">{t('translateToLabel')}</label>
            <select
              id="language-select"
              value={targetLanguage}
              onChange={(e) => onTargetLanguageChange(e.target.value as LanguageCode)}
              className="w-full bg-base-300 border border-base-300 text-text-primary rounded-lg focus:ring-brand-primary focus:border-brand-primary p-2.5"
              disabled={isListening || disabled || targetLanguages.length === 0}
            >
              {targetLanguages.length > 0 ? targetLanguages.map(({ code, name }) => (
                <option key={code} value={code}>{name}</option>
              )) : <option>{t('noNarratableLanguages')}</option>}
            </select>
        </div>
        
        {/* Voice Selector */}
        <div className="flex-1 min-w-[150px]">
             <label htmlFor="voice-select" className="text-xs text-text-secondary mb-1 block">{t('narrationVoiceLabel')}</label>
            <select
              id="voice-select"
              value={selectedVoiceURI}
              onChange={(e) => onVoiceChange(e.target.value)}
              className="w-full bg-base-300 border border-base-300 text-text-primary rounded-lg focus:ring-brand-primary focus:border-brand-primary p-2.5"
              disabled={voices.length === 0 || disabled}
            >
              {voices.length > 0 ? voices.map(voice => (
                <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>
              )) : <option>{t('noVoicesAvailable')}</option>}
            </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* New Session Button */}
        <button
          onClick={onNewSession}
          disabled={newSessionDisabled}
          className="px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-200 bg-base-300 hover:bg-base-100 text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t('newSessionAria')}
        >
          <PlusCircleIcon className="w-5 h-5" />
          <span>{t('newSession')}</span>
        </button>

        {/* Listen/Stop Listening Button */}
        <button
          onClick={onToggleListening}
          className={`px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-200 ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
              : 'bg-brand-primary hover:bg-indigo-700 text-white focus:ring-brand-primary'
          }`}
        >
          {isListening ? (
            <>
              <StopCircleIcon className="w-5 h-5" />
              <span>{t('stop')}</span>
            </>
          ) : (
             <>
              <MicIcon className="w-5 h-5" />
              <span>{t('listen')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};