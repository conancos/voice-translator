import React from 'react';
import { TranslationEntry } from '../types';
import { PlayIcon, StopIcon, HistoryIcon, TrashIcon } from './icons';
import { translations } from '../services/i18n';

interface TranslationHistoryProps {
    history: TranslationEntry[];
    onToggleSpeak: (id: string, text: string) => void;
    currentlyPlayingId: string | null;
    isPlaying: boolean;
    onDelete: (id: string) => void;
    t: (key: keyof typeof translations.en) => string;
}

export const TranslationHistory: React.FC<TranslationHistoryProps> = ({ 
    history, 
    onToggleSpeak, 
    currentlyPlayingId,
    isPlaying,
    onDelete,
    t
}) => {

    return (
        <div className="w-full bg-base-200 rounded-xl shadow-lg flex flex-col">
            <div className="flex items-center gap-3 p-4 border-b border-base-300">
                <HistoryIcon className="w-6 h-6" />
                <h2 className="text-lg font-semibold text-text-primary">{t('translationHistory')}</h2>
            </div>
            <div className="p-2 overflow-y-auto max-h-[600px]">
                {history.map((entry) => {
                    const isCurrentlySpeaking = currentlyPlayingId === entry.id && isPlaying;
                    return (
                        <div key={entry.id} className="bg-base-300/50 rounded-lg p-4 mb-2 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-xs text-text-secondary">{entry.timestamp}</p>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => onToggleSpeak(entry.id, entry.text)}
                                        className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-300 ${isCurrentlySpeaking ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 focus:ring-yellow-400' : 'bg-brand-secondary/20 text-brand-secondary hover:bg-brand-secondary/30 focus:ring-brand-secondary'}`}
                                        aria-label={isCurrentlySpeaking ? t('stopSpeakingAria') : t('startSpeakingAria')}
                                    >
                                        {isCurrentlySpeaking ? <StopIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => onDelete(entry.id)}
                                        className="p-2 rounded-full text-red-400/70 hover:text-red-400 hover:bg-red-500/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-300 focus:ring-red-500"
                                        aria-label={t('deleteAria')}
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-text-primary whitespace-pre-wrap">{entry.text}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};