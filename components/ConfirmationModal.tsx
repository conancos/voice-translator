import React from 'react';
import { WarningIcon } from './icons';
import { translations } from '../services/i18n';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  t: (key: keyof typeof translations.en) => string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  t
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative bg-base-200 rounded-xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start p-6">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 sm:mx-0 sm:h-10 sm:w-10">
                <WarningIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-4 text-left">
                <h3 className="text-lg leading-6 font-medium text-text-primary" id="modal-title">
                    {title}
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-text-secondary">
                        {message}
                    </p>
                </div>
            </div>
        </div>
        <div className="bg-base-300/50 px-6 py-4 flex flex-row-reverse gap-3 rounded-b-xl">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-base-200 transition-colors"
            onClick={onConfirm}
          >
            {t('confirm')}
          </button>
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-base-300 shadow-sm px-4 py-2 bg-transparent text-base font-medium text-text-primary hover:bg-base-300/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary focus:ring-offset-base-200 transition-colors"
            onClick={onClose}
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};