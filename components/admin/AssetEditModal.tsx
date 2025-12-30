'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { Modal } from '@/components/core/Modal';
import { Input } from '@/components/core/Input';
import { toast } from 'react-hot-toast';

interface AssetEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    key: string;
    size: number;
    url: string;
  } | null;
  onSaved: () => void;
}

export function AssetEditModal({ isOpen, onClose, asset, onSaved }: AssetEditModalProps) {
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (asset && isOpen) {
      const filename = asset.key.split('/').pop() || asset.key;
      const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
      setNewName(nameWithoutExt);
    }
  }, [asset, isOpen]);

  if (!asset) return null;

  const filename = asset.key.split('/').pop() || asset.key;
  const extension = filename.split('.').pop() || '';
  const currentNameWithoutExt = filename.split('.').slice(0, -1).join('.');

  const handleSave = async () => {
    if (!newName.trim()) {
      toast.error('Asset name cannot be empty');
      return;
    }

    if (newName === currentNameWithoutExt) {
      toast.error('Please enter a different name');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/assets/${encodeURIComponent(asset.key)}/rename`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to rename asset');
      }

      const result = await response.json();
      toast.success(`Asset renamed to ${result.newKey}`);
      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to rename asset');
    } finally {
      setSaving(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Asset">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Name</label>
          <p className="text-sm text-muted-foreground">{filename}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Size</label>
          <p className="text-sm text-muted-foreground">{formatBytes(asset.size)}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">New Name</label>
          <div className="flex items-center gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name"
              className="flex-1"
              disabled={saving}
            />
            <span className="text-sm text-muted-foreground">.{extension}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Preview: {newName}.{extension}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !newName.trim() || newName === currentNameWithoutExt}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
