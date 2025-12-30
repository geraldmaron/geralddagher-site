'use client';
import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Share2, Copy, Check, Facebook, Linkedin, Twitter } from 'lucide-react';
import Button from './Button';
interface SocialShareProps {
  url: string;
  title: string;
  floating?: boolean;
}
const SocialShare: React.FC<SocialShareProps> = ({ url, title, floating = false }) => {
  const [opened, setOpened] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };
  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
  };
  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
  };
  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`);
  };
  const shareContent = (
    <div className="flex items-center gap-2">
      <Button
        onClick={shareOnFacebook}
        variant="ghost"
        size="md"
        className="p-2"
        aria-label="Share on Facebook"
      >
        <Facebook size={16} />
      </Button>
      <Button
        onClick={shareOnLinkedIn}
        variant="ghost"
        size="md"
        className="p-2"
        aria-label="Share on LinkedIn"
      >
        <Linkedin size={16} />
      </Button>
      <Button
        onClick={shareOnTwitter}
        variant="ghost"
        size="md"
        className="p-2"
        aria-label="Share on Twitter"
      >
        <Twitter size={16} />
      </Button>
      <Button
        onClick={copyToClipboard}
        variant={copied ? "success" : "ghost"}
        size="md"
        className="p-2"
        aria-label="Copy link"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </Button>
    </div>
  );
  if (floating) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Popover.Root open={opened} onOpenChange={setOpened}>
          <Popover.Trigger asChild>
            <Button
              variant="primary"
              size="md"
              className="p-3 rounded-full shadow-lg"
              aria-label="Share"
            >
              <Share2 size={16} />
            </Button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="z-50 w-auto rounded-lg bg-white dark:bg-gray-800 p-4 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
              sideOffset={5}
            >
              {shareContent}
              {copied && (
                <p className="mt-2 text-sm text-teal-600 dark:text-teal-400">
                  Link copied to clipboard!
                </p>
              )}
              <Popover.Arrow className="fill-white dark:fill-gray-800" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    );
  }
  return (
    <Popover.Root open={opened} onOpenChange={setOpened}>
      <Popover.Trigger asChild>
        <Button
          variant="primary"
          size="md"
          className="inline-flex items-center gap-2"
          aria-label="Share"
        >
          <Share2 size={16} />
          <span>Share</span>
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-auto rounded-lg bg-white dark:bg-gray-800 p-4 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          sideOffset={5}
        >
          {shareContent}
          {copied && (
            <p className="mt-2 text-sm text-teal-600 dark:text-teal-400">
              Link copied to clipboard!
            </p>
          )}
          <Popover.Arrow className="fill-white dark:fill-gray-800" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
export default SocialShare;