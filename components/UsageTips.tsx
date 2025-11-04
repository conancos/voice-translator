import React, { useState } from 'react';
import { LightbulbIcon, ChevronDownIcon } from './icons';
import { translations } from '../services/i18n';

interface UsageTipsProps {
    t: (key: keyof typeof translations.en) => string;
}

export const UsageTips: React.FC<UsageTipsProps> = ({ t }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-base-200 rounded-xl shadow-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left"
        aria-expanded={isOpen}
        aria-controls="usage-tips-content"
      >
        <div className="flex items-center gap-3">
            <LightbulbIcon className="w-6 h-6 text-yellow-400" />
            <h3 className="text-md font-semibold text-text-primary">{t('tipsTitle')}</h3>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div id="usage-tips-content" className="p-4 border-t border-base-300">
          <ul className="list-disc list-inside space-y-2 text-text-secondary text-sm">
            <li>
              <strong>{t('tipVideoTitle')}</strong>{t('tipVideoText')}
            </li>
            <li>
              <strong>{t('tipBrowserTitle')}</strong>{t('tipBrowserText')}
            </li>
             <li>
              <strong>{t('tipHeadphonesTitle')}</strong>{t('tipHeadphonesText')}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};