'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { Upload, Trash2, Download, Image as ImageIcon, File, Search, Video, Music, FileText, Package, X, Edit, ChevronRight, Folder, FolderOpen, Home } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ViewToggle } from '@/components/admin/ViewToggle';
import { AssetType, getAssetTypeLabel } from '@/lib/utils/asset-types';
import { AssetUsageIndicator } from '@/components/admin/AssetUsageIndicator';
import { AssetEditModal } from '@/components/admin/AssetEditModal';

type Asset = {
  key: string;
  size: number;
  lastModified: Date;
  url: string;
  type: AssetType;
  mimeType?: string;
};

type FolderNode = {
  name: string;
  path: string;
  children: FolderNode[];
  isExpanded?: boolean;
};

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedType, setSelectedType] = useState<AssetType | 'all'>('all');
  const [currentPath, setCurrentPath] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/assets');
      const json = await res.json();
      if (json.data) {
        setAssets(json.data || []);
      }
    } catch (error) {
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/admin/assets', { method: 'POST', body: formData });
        if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
        return file.name;
      });

      const results = await Promise.allSettled(uploadPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (successful > 0) {
        toast.success(`Successfully uploaded ${successful} asset${successful > 1 ? 's' : ''}`);
      }
      if (failed > 0) {
        toast.error(`Failed to upload ${failed} asset${failed > 1 ? 's' : ''}`);
      }

      load();
    } catch (error) {
      toast.error('Failed to upload assets');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (key: string) => {
    try {
      const usageRes = await fetch(`/api/admin/assets/${encodeURIComponent(key)}/usage`);
      if (usageRes.ok) {
        const usage = await usageRes.json();
        if (usage.isUsed) {
          const locations = usage.usages.map((u: any) => `${u.entityType}: ${u.entityTitle}`).join('\n  - ');
          const confirmed = confirm(
            `This asset is used in ${usage.usageCount} location(s):\n  - ${locations}\n\nAre you sure you want to delete it? This may break references.`
          );
          if (!confirmed) return;
        } else {
          if (!confirm(`Delete "${key}" permanently?`)) return;
        }
      }
    } catch (err) {
      if (!confirm(`Delete "${key}" permanently?`)) return;
    }

    try {
      const res = await fetch('/api/admin/assets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      });
      if (!res.ok) throw new Error();
      toast.success('Asset deleted');
      load();
    } catch {
      toast.error('Failed to delete asset');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isImage = (key: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(key);

  const buildFolderTree = useMemo((): FolderNode[] => {
    const folderPaths = new Set<string>();

    assets.forEach((asset) => {
      const parts = asset.key.split('/');
      if (parts.length > 1) {
        for (let i = 0; i < parts.length - 1; i++) {
          const path = parts.slice(0, i + 1).join('/');
          folderPaths.add(path);
        }
      }
    });

    const sortedPaths = Array.from(folderPaths).sort();
    const tree: FolderNode[] = [];
    const nodeMap = new Map<string, FolderNode>();

    sortedPaths.forEach((path) => {
      const parts = path.split('/');
      const name = parts[parts.length - 1];
      const node: FolderNode = { name, path, children: [] };
      nodeMap.set(path, node);

      if (parts.length === 1) {
        tree.push(node);
      } else {
        const parentPath = parts.slice(0, -1).join('/');
        const parent = nodeMap.get(parentPath);
        if (parent) {
          parent.children.push(node);
        }
      }
    });

    return tree;
  }, [assets]);

  const breadcrumbs = useMemo(() => {
    if (!currentPath) return [];
    return currentPath.split('/').map((part, index, arr) => ({
      name: part,
      path: arr.slice(0, index + 1).join('/'),
    }));
  }, [currentPath]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (selectedType !== 'all' && asset.type !== selectedType) {
        return false;
      }

      const assetFolder = asset.key.split('/').slice(0, -1).join('/');

      if (currentPath !== '') {
        if (assetFolder !== currentPath) {
          return false;
        }
      } else {
        if (asset.key.includes('/')) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const filename = asset.key.split('/').pop()?.toLowerCase() || '';
        const folder = assetFolder.toLowerCase();
        return filename.includes(query) || folder.includes(query) || asset.key.toLowerCase().includes(query);
      }

      return true;
    });
  }, [assets, selectedType, currentPath, searchQuery]);

  const handleImageError = (key: string) => {
    setImageErrors((prev) => new Set(prev).add(key));
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const navigateToFolder = (path: string) => {
    setCurrentPath(path);
  };

  const renderFolderTree = (nodes: FolderNode[], level: number = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedFolders.has(node.path);
      const isSelected = currentPath === node.path;
      const hasChildren = node.children.length > 0;
      const FolderIcon = isExpanded && hasChildren ? FolderOpen : Folder;

      return (
        <div key={node.path} style={{ marginLeft: `${level * 12}px` }}>
          <button
            onClick={() => {
              if (hasChildren) {
                toggleFolder(node.path);
              }
              navigateToFolder(node.path);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors w-full text-left ${
              isSelected
                ? 'bg-primary text-primary-foreground font-medium'
                : 'hover:bg-muted text-foreground'
            }`}
          >
            <FolderIcon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate flex-1">{node.name}</span>
            {hasChildren && (
              <ChevronRight
                className={`h-3 w-3 flex-shrink-0 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            )}
          </button>
          {isExpanded && hasChildren && (
            <div className="mt-0.5">
              {renderFolderTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const getTypeIcon = (type: AssetType) => {
    switch (type) {
      case 'image':
        return ImageIcon;
      case 'video':
        return Video;
      case 'audio':
        return Music;
      case 'document':
        return FileText;
      default:
        return Package;
    }
  };

  const getSmallTypeIcon = (type: AssetType) => {
    const Icon = getTypeIcon(type);
    return <Icon className="h-3.5 w-3.5" />;
  };

  const assetTypes: Array<{ value: AssetType | 'all'; label: string; icon: typeof ImageIcon }> = [
    { value: 'all', label: 'All', icon: Package },
    { value: 'image', label: 'Images', icon: ImageIcon },
    { value: 'video', label: 'Videos', icon: Video },
    { value: 'audio', label: 'Audio', icon: Music },
    { value: 'document', label: 'Documents', icon: FileText },
    { value: 'other', label: 'Other', icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
          <p className="text-muted-foreground mt-2">Manage media files stored in Cloudflare R2</p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onChange={setView} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            multiple
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {assetTypes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setSelectedType(value)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                selectedType === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {buildFolderTree.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="sticky top-4 bg-card border border-border rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Folders</h3>
              <button
                onClick={() => navigateToFolder('')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors w-full text-left ${
                  currentPath === ''
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <Home className="h-4 w-4 flex-shrink-0" />
                <span>Root</span>
              </button>
              <div className="space-y-0.5">
                {renderFolderTree(buildFolderTree)}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {currentPath && (
              <div className="flex items-center gap-1 text-sm bg-muted/30 rounded-lg px-3 py-2 overflow-x-auto">
                <button
                  onClick={() => navigateToFolder('')}
                  className="hover:text-primary transition-colors flex-shrink-0"
                  title="Go to root"
                >
                  <Home className="h-4 w-4" />
                </button>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.path} className="flex items-center gap-1">
                    <button
                      onClick={() => navigateToFolder(crumb.path)}
                      className={`hover:text-primary transition-colors whitespace-nowrap ${
                        index === breadcrumbs.length - 1 ? 'font-medium' : ''
                      }`}
                    >
                      {crumb.name}
                    </button>
                    {index < breadcrumbs.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {!loading && (
              <div className="text-sm text-muted-foreground">
                Showing {filteredAssets.length} of {assets.length} assets
              </div>
            )}

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading assets...</div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {assets.length === 0
                    ? 'No assets yet. Upload your first file!'
                    : 'No assets match your filters.'}
                </p>
              </div>
            ) : view === 'grid' ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssets.map((asset) => {
            const TypeIcon = getTypeIcon(asset.type);
            const hasError = imageErrors.has(asset.key);
            const isImageType = asset.type === 'image' && !hasError;

            return (
              <div
                key={asset.key}
                className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                  {isImageType ? (
                    <>
                      <img
                        src={asset.url}
                        alt={asset.key}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={() => handleImageError(asset.key)}
                        onLoad={() => {
                          setImageErrors((prev) => {
                            const next = new Set(prev);
                            next.delete(asset.key);
                            return next;
                          });
                        }}
                      />
                      {hasError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/80">
                          <TypeIcon className="h-12 w-12 text-muted-foreground" />
                          <span className="text-xs text-destructive">Failed to load</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <TypeIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-background/90 backdrop-blur rounded-md text-xs font-medium z-10 flex items-center gap-1.5">
                    {getSmallTypeIcon(asset.type)} {getAssetTypeLabel(asset.type)}
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {asset.key.includes('/') ? (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground truncate" title={asset.key.split('/').slice(0, -1).join('/')}>
                        📁 {asset.key.split('/').slice(0, -1).join('/')}
                      </p>
                      <p className="text-sm font-medium truncate" title={asset.key.split('/').pop()}>
                        {asset.key.split('/').pop()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-medium truncate" title={asset.key}>
                      {asset.key}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{formatBytes(asset.size || 0)}</p>
                    <AssetUsageIndicator assetKey={asset.key} compact />
                  </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    onClick={() => setEditingAsset(asset)}
                    className="p-2 bg-background/90 backdrop-blur rounded-md hover:bg-background shadow-lg"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <a
                    href={asset.url}
                    download
                    className="p-2 bg-background/90 backdrop-blur rounded-md hover:bg-background shadow-lg"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(asset.key)}
                    className="p-2 bg-background/90 backdrop-blur rounded-md hover:bg-background text-destructive shadow-lg"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Preview</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Modified</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAssets.map((asset) => {
                const TypeIcon = getTypeIcon(asset.type);
                const hasError = imageErrors.has(asset.key);
                const isImageType = asset.type === 'image' && !hasError;

                return (
                  <tr key={asset.key} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden relative">
                        {isImageType ? (
                          <>
                            <img
                              src={asset.url}
                              alt={asset.key}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={() => handleImageError(asset.key)}
                              onLoad={() => {
                                setImageErrors((prev) => {
                                  const next = new Set(prev);
                                  next.delete(asset.key);
                                  return next;
                                });
                              }}
                            />
                            {hasError && (
                              <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                                <TypeIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </>
                        ) : (
                          <TypeIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium max-w-xs" title={asset.key}>
                      {asset.key.includes('/') ? (
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium truncate">
                            {asset.key.split('/').pop()}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            📁 {asset.key.split('/').slice(0, -1).join('/')}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm font-medium truncate">
                          {asset.key}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        {getSmallTypeIcon(asset.type)} {getAssetTypeLabel(asset.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatBytes(asset.size || 0)}</td>
                    <td className="px-6 py-4">
                      <AssetUsageIndicator assetKey={asset.key} compact />
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {asset.lastModified ? new Date(asset.lastModified).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingAsset(asset)}
                          className="text-primary hover:text-primary/80"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <a
                          href={asset.url}
                          download
                          className="text-primary hover:text-primary/80"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(asset.key)}
                          className="text-destructive hover:text-destructive/80"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
            )}
          </div>
        </div>
      )}

      {buildFolderTree.length === 0 && !loading && (
        <>
          {!loading && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredAssets.length} of {assets.length} assets
            </div>
          )}

          {filteredAssets.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {assets.length === 0
                  ? 'No assets yet. Upload your first file!'
                  : 'No assets match your filters.'}
              </p>
            </div>
          ) : view === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filteredAssets.map((asset) => {
                const TypeIcon = getTypeIcon(asset.type);
                const hasError = imageErrors.has(asset.key);
                const isImageType = asset.type === 'image' && !hasError;

                return (
                  <div
                    key={asset.key}
                    className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                      {isImageType ? (
                        <>
                          <img
                            src={asset.url}
                            alt={asset.key}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={() => handleImageError(asset.key)}
                          />
                          {hasError && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/80">
                              <TypeIcon className="h-12 w-12 text-muted-foreground" />
                              <span className="text-xs text-destructive">Failed to load</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <TypeIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 px-2 py-1 bg-background/90 backdrop-blur rounded-md text-xs font-medium z-10 flex items-center gap-1.5">
                        {getSmallTypeIcon(asset.type)} {getAssetTypeLabel(asset.type)}
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      <p className="text-sm font-medium truncate" title={asset.key.split('/').pop()}>
                        {asset.key.split('/').pop()}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{formatBytes(asset.size || 0)}</p>
                        <AssetUsageIndicator assetKey={asset.key} compact />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button
                        onClick={() => setEditingAsset(asset)}
                        className="p-2 bg-background/90 backdrop-blur rounded-md hover:bg-background shadow-lg"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <a
                        href={asset.url}
                        download
                        className="p-2 bg-background/90 backdrop-blur rounded-md hover:bg-background shadow-lg"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(asset.key)}
                        className="p-2 bg-background/90 backdrop-blur rounded-md hover:bg-background text-destructive shadow-lg"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Preview</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Usage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Modified</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAssets.map((asset) => {
                    const TypeIcon = getTypeIcon(asset.type);
                    const hasError = imageErrors.has(asset.key);
                    const isImageType = asset.type === 'image' && !hasError;

                    return (
                      <tr key={asset.key} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden relative">
                            {isImageType ? (
                              <img
                                src={asset.url}
                                alt={asset.key}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={() => handleImageError(asset.key)}
                              />
                            ) : (
                              <TypeIcon className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium max-w-xs" title={asset.key}>
                          <div className="text-sm font-medium truncate">
                            {asset.key.split('/').pop()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-sm">
                            {getSmallTypeIcon(asset.type)} {getAssetTypeLabel(asset.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{formatBytes(asset.size || 0)}</td>
                        <td className="px-6 py-4">
                          <AssetUsageIndicator assetKey={asset.key} compact />
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {asset.lastModified ? new Date(asset.lastModified).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingAsset(asset)}
                              className="text-primary hover:text-primary/80"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <a
                              href={asset.url}
                              download
                              className="text-primary hover:text-primary/80"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                            <button
                              onClick={() => handleDelete(asset.key)}
                              className="text-destructive hover:text-destructive/80"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <AssetEditModal
        isOpen={!!editingAsset}
        onClose={() => setEditingAsset(null)}
        asset={editingAsset}
        onSaved={() => {
          setEditingAsset(null);
          load();
        }}
      />
    </div>
  );
}
