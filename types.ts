export type LanguageCode = 'es-ES' | 'en-US' | 'fr-FR' | 'de-DE' | 'it-IT' | 'pt-PT' | 'ru-RU' | 'ja-JP' | 'ko-KR' | 'zh-CN' | 'ar-SA' | 'hi-IN' | 'ca-ES' | 'ca-ES-valencia';

export interface Language {
  code: LanguageCode;
  name: string;
}

export interface TranslationEntry {
    id: string;
    text: string;
    timestamp: string;
}

export interface TranslationChunk {
    id:string;
    text: string;
    isTranslating: boolean;
}
