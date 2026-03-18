'use client';
import React, { useEffect, useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { motion } from 'framer-motion';
import { Mail, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 192 192" fill="currentColor" aria-hidden="true">
    <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.502 7.13 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.372-39.134 15.265-38.105 34.569.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.741C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.206 17.11 97.014 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.643 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.068c.224 28.617 6.882 51.447 19.788 67.852C47.292 182.356 68.882 191.804 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.553ZM98.44 129.507c-10.44.588-21.286-4.098-21.82-14.135-.397-7.442 5.296-15.746 22.461-16.735 1.966-.113 3.895-.169 5.79-.169 6.235 0 12.068.606 17.371 1.765-1.978 24.702-13.574 28.713-23.802 29.274Z" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path fillRule="evenodd" d="M10 2.162c2.67 0 2.986.01 4.04.058 1.032.047 1.59.218 1.963.362.492.191.843.42 1.212.788.369.369.598.72.788 1.212.144.373.315.931.362 1.963.048 1.054.058 1.37.058 4.04s-.01 2.986-.058 4.04c-.047 1.032-.218 1.59-.362 1.963-.191.492-.42.843-.788 1.212-.369.369-.72.598-1.212.788-.373.144-.931.315-1.963.362-1.054.048-1.37.058-4.04.058s-2.986-.01-4.04-.058c-1.032-.047-1.59-.218-1.963-.362-.492-.191-.843-.42-1.212-.788-.369-.369-.598-.72-.788-1.212-.144-.373-.315-.931-.362-1.963C2.172 12.986 2.162 12.67 2.162 10s.01-2.986.058-4.04c.047-1.032.218-1.59.362-1.963.191-.492.42-.843.788-1.212.369-.369.72-.598 1.212-.788.373-.144.931-.315 1.963-.362C7.014 2.172 7.33 2.162 10 2.162zM10 0C7.284 0 6.944.012 5.877.06 4.813.107 4.086.277 3.45.525a4.74 4.74 0 00-1.716 1.118A4.74 4.74 0 00.525 3.45C.277 4.086.107 4.813.06 5.877.012 6.944 0 7.284 0 10s.012 3.056.06 4.123c.047 1.064.217 1.791.465 2.427a4.74 4.74 0 001.118 1.716 4.74 4.74 0 001.716 1.118c.636.248 1.363.418 2.427.465C6.944 19.988 7.284 20 10 20s3.056-.012 4.123-.06c1.064-.047 1.791-.217 2.427-.465a4.74 4.74 0 001.716-1.118 4.74 4.74 0 001.118-1.716c.248-.636.418-1.363.465-2.427C19.988 13.056 20 12.716 20 10s-.012-3.056-.06-4.123c-.047-1.064-.217-1.791-.465-2.427a4.74 4.74 0 00-1.118-1.716A4.74 4.74 0 0016.55.525C15.914.277 15.187.107 14.123.06 13.056.012 12.716 0 10 0zm0 4.865a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm0 8.468a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm6.538-8.671a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" clipRule="evenodd" />
  </svg>
);

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GitHubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
  </svg>
);

interface SocialLink {
  name: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SocialMediaBarProps {
  variant?: 'default' | 'card';
  className?: string;
}

const socialLinks: SocialLink[] = [
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/geraldmdagher/', icon: LinkedInIcon },
  { name: 'Instagram', url: 'https://www.instagram.com/geraldmdagher/', icon: InstagramIcon },
  { name: 'Threads', url: 'https://threads.net/@geraldmdagher', icon: ThreadsIcon },
  { name: 'YouTube', url: 'https://www.youtube.com/@geraldmdagher', icon: YouTubeIcon },
  { name: 'Twitter', url: 'https://x.com/geraldmdagher', icon: XIcon },
  { name: 'GitHub', url: 'https://github.com/geraldmdagher', icon: GitHubIcon },
  { name: 'Website', url: 'https://geralddagher.com', icon: Globe },
  { name: 'Email', url: 'mailto:me@geralddagher.com', icon: Mail },
];

const SocialMediaBar: React.FC<SocialMediaBarProps> = ({
  variant = 'default',
  className = ''
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Tooltip.Provider delayDuration={300}>
      <div className={cn(
        'flex flex-wrap items-center gap-1',
        variant === 'default' ? `justify-center p-2 sm:p-3 w-full ${className}` : `justify-center gap-3 mb-6 ${className}`
      )}>
        {socialLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Tooltip.Root key={link.name}>
              <Tooltip.Trigger asChild>
                <motion.a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${link.name}`}
                  whileHover={{ scale: 1.1, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'inline-flex items-center justify-center rounded-lg transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    variant === 'default'
                      ? 'w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted'
                      : 'w-10 h-10 bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                    !mounted && 'opacity-0'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="z-50 overflow-hidden rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                  sideOffset={6}
                >
                  {link.name}
                  <Tooltip.Arrow className="fill-foreground" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          );
        })}
      </div>
    </Tooltip.Provider>
  );
};

export default SocialMediaBar;
