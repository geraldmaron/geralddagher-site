'use client';
import React, { useEffect, useState } from 'react';
import { useTyped } from '@/lib/utils/hooks/useTyped';
import { cn } from '@/lib/utils';
import { name } from '@/lib/constants';
import { motion } from 'framer-motion';

const TypingText: React.FC = () => {
  const [terminalCommands, setTerminalCommands] = useState<string[]>([]);
  const { displayText, isTyping } = useTyped(terminalCommands, 60, 3000, 80);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setTerminalCommands(data.profile?.terminalCommands || []);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  return (
    <motion.div
      className="flex w-full flex-col items-center gap-6 sm:gap-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight text-center">
        Hi, I&apos;m {name}
      </div>

      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-black/50 shadow-2xl shadow-blue-500/10 backdrop-blur">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-emerald-400/10" aria-hidden="true" />
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-emerald-400/15 blur-2xl opacity-60" aria-hidden="true" />

        <div className="relative">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              <span className="ml-3 text-xs font-mono text-white/70">gerald.dagher ~/platform</span>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/80">
              live session
            </span>
          </div>

          <div className="relative space-y-3 px-4 py-5 font-mono text-sm text-white/90">
            <div className="flex items-start gap-2 text-left">
              <span className="text-emerald-400">$</span>
              <div className="flex-1 leading-relaxed whitespace-pre-wrap break-words text-left">
                {displayText}
                <motion.span
                  className={cn(
                    'ml-[2px] inline-block h-[1.2em] w-2 bg-emerald-400 align-middle',
                    isTyping ? 'animate-pulse' : 'animate-terminal-blink'
                  )}
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-white/80">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Product & Platform Leadership</span>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-white/70">
                  <span className="text-emerald-300">▸</span> Multi-Cloud Architecture
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <span className="text-emerald-300">▸</span> Incident Command & Recovery
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <span className="text-emerald-300">▸</span> Enterprise Risk Management
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <span className="text-emerald-300">▸</span> Cross-Functional Leadership
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes terminal-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-terminal-blink {
          animation: terminal-blink 1.2s infinite;
        }
      `}</style>
    </motion.div>
  );
};

export default TypingText;