'use client';

import { useState, useEffect } from 'react';
import { Link2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
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

interface AssetUsageResult {
  isUsed: boolean;
  usageCount: number;
  usages: AssetUsage[];
}

interface AssetUsageIndicatorProps {
  assetKey: string;
  compact?: boolean;
}

export function AssetUsageIndicator({ assetKey, compact = false }: AssetUsageIndicatorProps) {
  const [usage, setUsage] = useState<AssetUsageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (compact) {
      if (!usage && !loading) {
        fetchUsage();
      }
    } else {
      if (expanded && !usage && !loading) {
        fetchUsage();
      }
    }
  }, [expanded, compact, assetKey]);

  const fetchUsage = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/assets/${encodeURIComponent(assetKey)}/usage`);
      if (!response.ok) throw new Error('Failed to fetch usage');
      const data = await response.json();
      setUsage(data);
    } catch (err) {
      setError('Failed to load usage');
      console.error('Error fetching asset usage:', err);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    if (loading) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-muted rounded-md">
          <Loader2 className="h-3 w-3 animate-spin" />
        </span>
      );
    }

    if (usage && usage.isUsed) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md">
          <Link2 className="h-3 w-3" />
          {usage.usageCount}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-md">
        Unused
      </span>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-muted/50 hover:bg-muted rounded-md transition-colors"
      >
        <span className="flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          <span>Usage</span>
          {usage && (
            <span className="px-2 py-0.5 text-xs bg-background rounded">
              {usage.usageCount}
            </span>
          )}
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {expanded && (
        <div className="pl-4 space-y-2">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading usage...
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          {usage && !loading && (
            <>
              {usage.isUsed ? (
                <div className="space-y-2">
                  {usage.usages.map((usageItem, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-2 bg-card border border-border rounded-md"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded capitalize">
                            {usageItem.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 bg-muted text-muted-foreground rounded capitalize">
                            {usageItem.entityType.replace('_', ' ')}
                          </span>
                          <Link
                            href={usageItem.adminUrl}
                            className="text-sm font-medium hover:text-primary truncate"
                          >
                            {usageItem.entityTitle}
                          </Link>
                        </div>
                        <div className="flex items-center gap-3">
                          <Link
                            href={usageItem.adminUrl}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Edit →
                          </Link>
                          {usageItem.publicUrl && (
                            <Link
                              href={usageItem.publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              View →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-2">
                  This asset is not currently used anywhere.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}


