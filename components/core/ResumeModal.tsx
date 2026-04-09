'use client';

import React, { useEffect, useState } from 'react';
import { X, Download, ExternalLink, Loader2 } from 'lucide-react';
import { useMediaQuery } from 'usehooks-ts';
import Button from './Button';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RESUME_URL = '/api/assets/Gerald-Dagher-Product-Management-Resume.pdf';

const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [iframeLoading, setIframeLoading] = useState(true);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    setIframeLoading(true);
  }, [isDesktop]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = RESUME_URL;
    link.download = 'Gerald-Dagher-Product-Management-Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(RESUME_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Resume viewer"
      className="fixed inset-0 z-[9999] flex items-stretch justify-center overflow-hidden p-0 sm:p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative z-10 flex h-full w-full md:max-w-4xl lg:max-w-6xl bg-card rounded-none sm:rounded-xl shadow-[var(--shadow-xl)] flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-foreground">
            Resume
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="inline-flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close resume viewer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isDesktop ? (
          <div className="relative flex-1 min-h-0">
            {iframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading résumé…</p>
              </div>
            )}
            <iframe
              src={RESUME_URL}
              className="w-full h-full border-0"
              title="Resume PDF"
              onLoad={() => setIframeLoading(false)}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 space-y-4">
            <p className="text-sm text-foreground">
              For the best experience on mobile, open the résumé in a new tab or download it.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={handleOpenInNewTab}
                className="w-full inline-flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Résumé
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={handleDownload}
                className="w-full inline-flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeModal;
