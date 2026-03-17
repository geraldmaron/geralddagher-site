'use client';
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
        <Dialog.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 -translate-x-1/2 -translate-y-1/2',
            'w-[calc(100%-2rem)] bg-card rounded-2xl border border-border/60',
            'max-h-[90vh] overflow-hidden flex flex-col',
            'shadow-[0_20px_60px_-10px_rgba(0,0,0,0.18),0_8px_20px_-8px_rgba(0,0,0,0.12)]',
            'dark:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.55),0_8px_20px_-8px_rgba(0,0,0,0.40)]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'duration-200',
            sizes[size]
          )}
        >
          {title ? (
            <>
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
                <Dialog.Title className="text-base font-semibold text-foreground">{title}</Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Dialog.Close>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {children}
              </div>
            </>
          ) : (
            <>
              <Dialog.Title className="sr-only">Dialog</Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {children}
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;
