'use client';

import { Modal } from '@/components/core/Modal';
import { Link2, ExternalLink, Edit3 } from 'lucide-react';
import Link from 'next/link';

interface AssetUsage {
  type: 'cover_image' | 'content' | 'avatar' | 'category_image' | 'tag_image' | 'milestone_image' | 'work_image';
  entityType: 'post' | 'user' | 'category' | 'tag' | 'milestone' | 'work_experience';
  entityId: string;
  entityTitle: string;
  entitySlug?: string;
  adminUrl: string;
  publicUrl?: string;
}

interface AssetUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetKey: string;
  usage: {
    isUsed: boolean;
    usageCount: number;
    usages: AssetUsage[];
  } | null;
}

export function AssetUsageModal({ isOpen, onClose, assetKey, usage }: AssetUsageModalProps) {
  const filename = assetKey.split('/').pop() || assetKey;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asset Usage" size="lg">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
          <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
            <Link2 className="h-5 w-5 text-blue-700 dark:text-blue-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm mb-1">Asset</h3>
            <p className="text-sm text-muted-foreground truncate" title={assetKey}>
              {filename}
            </p>
            {assetKey.includes('/') && (
              <p className="text-xs text-muted-foreground/70 mt-1">
                Path: {assetKey.split('/').slice(0, -1).join('/')}
              </p>
            )}
          </div>
        </div>

        {!usage ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading usage information...
          </div>
        ) : !usage.isUsed ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
              <Link2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              This asset is not currently used anywhere.
            </p>
            <p className="text-sm text-muted-foreground/70 mt-2">
              You can safely delete it if no longer needed.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                Used in {usage.usageCount} location{usage.usageCount !== 1 ? 's' : ''}
              </h4>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {usage.usages.map((usageItem, index) => (
                <div
                  key={index}
                  className="group flex items-start gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded capitalize">
                        {usageItem.type.replace(/_/g, ' ')}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded capitalize">
                        {usageItem.entityType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h5 className="text-sm font-medium mb-2 group-hover:text-primary transition-colors">
                      {usageItem.entityTitle}
                    </h5>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link
                        href={usageItem.adminUrl}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Edit3 className="h-3 w-3" />
                        Edit
                      </Link>
                      {usageItem.publicUrl && (
                        <Link
                          href={usageItem.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
