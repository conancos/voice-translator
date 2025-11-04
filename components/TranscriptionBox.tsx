import React, { useRef, useEffect } from 'react';

interface TranscriptionBoxProps {
  title: string;
  icon: React.ReactNode;
  finalText: string;
  interimText?: string;
  isLoading?: boolean;
  loadingText?: string;
  placeholder: string;
}

const LoadingIndicator: React.FC<{text: string}> = ({ text }) => (
    <div className="absolute inset-0 flex items-center justify-center bg-base-300/50 rounded-lg z-10">
        <div className="flex items-center gap-3 text-text-secondary bg-base-100/80 px-4 py-2 rounded-lg">
            <svg className="animate-spin h-5 w-5 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{text}</span>
        </div>
    </div>
);


export const TranscriptionBox: React.FC<TranscriptionBoxProps> = ({
  title,
  icon,
  finalText,
  interimText,
  isLoading,
  loadingText = 'Processing...',
  placeholder,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [finalText, interimText]);

  const hasContent = finalText || interimText;

  return (
    <div className="bg-base-200 rounded-xl shadow-lg flex flex-col h-80 relative">
      <div className="flex items-center justify-between p-4 border-b border-base-300">
        <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        </div>
      </div>
      <div className="p-4 overflow-y-auto flex-grow" ref={scrollContainerRef}>
        {!hasContent && !isLoading ? (
          <div className="flex items-center justify-center h-full text-text-secondary">
            <p>{placeholder}</p>
          </div>
        ) : (
          <p className="text-text-primary whitespace-pre-wrap">
            {finalText}
            {interimText && <span className="text-text-secondary opacity-70">{` ${interimText}`}</span>}
          </p>
        )}
      </div>
      {isLoading && <LoadingIndicator text={loadingText} />}
    </div>
  );
};
