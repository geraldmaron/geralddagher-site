'use client';
import React, { useEffect, useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { motion } from 'framer-motion';
import { Globe, Mail } from 'lucide-react';
import { LinkedInIcon, InstagramIcon, ThreadsIcon, YouTubeIcon, XTwitterIcon, GitHubIcon } from '@/components/core/icons/BrandIcons';
import { useTheme } from '@/components/core/ThemeProvider';
interface SocialLink {
  name: string;
  url: string;
  Icon: React.ComponentType<{ className?: string }>;
}
interface SocialMediaBarProps {
  variant?: 'default' | 'card';
  className?: string;
}
const socialLinks: SocialLink[] = [
  { name: 'LinkedIn',  url: 'https://www.linkedin.com/in/geraldmdagher/',    Icon: LinkedInIcon },
  { name: 'Instagram', url: 'https://www.instagram.com/geraldmdagher/',      Icon: InstagramIcon },
  { name: 'Threads',   url: 'https://threads.net/@geraldmdagher',            Icon: ThreadsIcon },
  { name: 'YouTube',   url: 'https://www.youtube.com/@geraldmdagher',        Icon: YouTubeIcon },
  { name: 'Twitter',   url: 'https://x.com/geraldmdagher',                   Icon: XTwitterIcon },
  { name: 'GitHub',    url: 'https://github.com/geraldmdagher',              Icon: GitHubIcon },
  { name: 'Website',   url: 'https://geralddagher.com',                      Icon: Globe },
  { name: 'Email',     url: 'mailto:me@geralddagher.com',                    Icon: Mail },
];
const SocialMediaBar: React.FC<SocialMediaBarProps> = ({ 
  variant = 'default',
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const variants = {
    default: "p-2 sm:p-4 w-full",
    card: "flex flex-wrap justify-center gap-4 mb-6"
  };
  const iconStyles = {
    default: mounted ? `transition-colors duration-300 ${
      isDarkMode ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-700'
    }` : 'transition-colors duration-300 opacity-0',
    card: mounted ? `w-12 h-12 flex items-center justify-center rounded-full ${
      isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
    }` : 'opacity-0'
  };
  return (
    <Tooltip.Provider>
      <div className={`flex justify-center gap-4 ${variants[variant]} ${className}`}>
        {socialLinks.map(({ name, url, Icon }) => (
          <Tooltip.Root key={name}>
            <Tooltip.Trigger asChild>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="transition-all duration-300"
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${name}`}
                  className={`inline-flex items-center justify-center p-2 rounded-md ${iconStyles[variant]}`}
                >
                  <Icon className="w-5 h-5" />
                </a>
              </motion.div>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="z-50 overflow-hidden rounded-md bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                sideOffset={5}
              >
                {name}
                <Tooltip.Arrow className="fill-white dark:fill-gray-800" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        ))}
      </div>
    </Tooltip.Provider>
  );
};
export default SocialMediaBar;