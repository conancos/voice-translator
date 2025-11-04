import React, { useRef, useEffect, useState } from 'react';
import { TranslationChunk } from '../types';
import { PlayIcon, StopIcon, VolumeOffIcon, VolumeUpIcon, ClipboardIcon, CheckIcon } from './icons';
import { translations } from '../services/i18n';

interface SessionTranslationProps {
  icon: React.ReactNode;
  chunks: TranslationChunk[];
  onToggleSpeak: () => void;
  currentlyPlayingId: string | null;
  isPlaying: boolean;
  voiceAvailable: boolean;
  t: (key: keyof typeof translations.en) => string;
  isAutoNarrationEnabled: boolean;
  onToggleAutoNarration: () => void;
  onCopy: () => void;
}

const ChunkLoadingIndicator: React.FC<{ t: (key: keyof typeof translations.en) => string; }> = ({ t }) => (
    <span className="inline-flex items-center gap-2 text-text-secondary ml-2 opacity-75">
        <svg className="animate-spin h-4 w-4 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-sm">{t('translating')}</span>
    </span>
);

export const SessionTranslation: React.FC<SessionTranslationProps> = ({
  icon,
  chunks,
  onToggleSpeak,
  currentlyPlayingId,
  isPlaying,
  voiceAvailable,
  t,
  isAutoNarrationEnabled,
  onToggleAutoNarration,
  onCopy
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [chunks]);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCurrentlySpeaking = currentlyPlayingId === 'session-output' && isPlaying;
  const hasContent = chunks.some(c => c.text.trim().length > 0);

  return (
    <div className="bg-base-200 rounded-xl shadow-lg flex flex-col h-80 relative">
      <div className="flex items-center justify-between p-4 border-b border-base-300">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-lg font-semibold text-text-primary">{t('sessionTranslation')}</h2>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative group">
                <button
                    onClick={onToggleAutoNarration}
                    className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-200 ${
                        isAutoNarrationEnabled
                        ? 'bg-brand-secondary/20 text-brand-secondary hover:bg-brand-secondary/30 focus:ring-brand-secondary'
                        : 'bg-base-300 text-text-secondary hover:bg-base-100 focus:ring-brand-primary'
                    }`}
                    aria-label={isAutoNarrationEnabled ? t('disableAutoNarrationAria') : t('enableAutoNarrationAria')}
                >
                    {isAutoNarrationEnabled ? <VolumeUpIcon className="w-5 h-5" /> : <VolumeOffIcon className="w-5 h-5" />}
                </button>
                <span className="absolute top-full right-0 mt-2 w-max px-2 py-1 bg-base-300 text-text-primary text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {isAutoNarrationEnabled ? t('disableAutoNarrationTooltip') : t('enableAutoNarrationTooltip')}
                </span>
            </div>

            <button
                onClick={onToggleSpeak}
                disabled={!voiceAvailable || !hasContent}
                className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-200 ${isCurrentlySpeaking ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 focus:ring-yellow-400' : 'bg-brand-secondary/20 text-brand-secondary hover:bg-brand-secondary/30 focus:ring-brand-secondary'} disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={isCurrentlySpeaking ? t('stopReadingAria') : t('readAloudAria')}
            >
                {isCurrentlySpeaking ? <StopIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
            </button>
            <button
                onClick={handleCopy}
                disabled={!hasContent}
                className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-200 ${copied ? 'bg-green-500/20 text-green-400' : 'bg-base-300 text-text-secondary hover:bg-base-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={t('copyTranslationAria')}
            >
                {copied ? <CheckIcon className="w-5 h-5" /> : <ClipboardIcon className="w-5 h-5" />}
            </button>
        </div>
      </div>
      <div className="p-4 overflow-y-auto flex-grow" ref={scrollContainerRef}>
        {chunks.length === 0 ? (
            <div className="flex items-center justify-center h-full text-text-secondary">
                <p>{t('translationPlaceholder')}</p>
            </div>
        ) : (
            <p className="text-text-primary whitespace-pre-wrap leading-relaxed">
                {chunks.map(chunk => (
                    <span key={chunk.id} className={!chunk.isTranslating && chunk.text ? 'finalize-anim' : ''}>
                        {chunk.text}
                    </span>
                ))}
                {(() => {
                    const lastChunk = chunks[chunks.length - 1];
                    if (lastChunk && lastChunk.isTranslating) {
                        return !lastChunk.text
                            ? <ChunkLoadingIndicator t={t} />
                            : <span className="text-text-secondary">...</span>;
                    }
                    return null;
                })()}
            </p>
        )}
      </div>
    </div>
  );
};