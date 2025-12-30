import { describe, it, expect } from 'vitest';
import { getAssetType, getAssetTypeIconName, getAssetTypeLabel } from '@/lib/utils/asset-types';

describe('getAssetType', () => {
  describe('by mime type', () => {
    it('should detect image mime types', () => {
      expect(getAssetType('file.unknown', 'image/jpeg')).toBe('image');
      expect(getAssetType('file.unknown', 'image/png')).toBe('image');
      expect(getAssetType('file.unknown', 'image/webp')).toBe('image');
    });

    it('should detect video mime types', () => {
      expect(getAssetType('file.unknown', 'video/mp4')).toBe('video');
      expect(getAssetType('file.unknown', 'video/webm')).toBe('video');
    });

    it('should detect audio mime types', () => {
      expect(getAssetType('file.unknown', 'audio/mpeg')).toBe('audio');
      expect(getAssetType('file.unknown', 'audio/wav')).toBe('audio');
    });

    it('should detect document mime types', () => {
      expect(getAssetType('file.unknown', 'application/pdf')).toBe('document');
      expect(getAssetType('file.unknown', 'text/plain')).toBe('document');
      expect(getAssetType('file.unknown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe('document');
    });
  });

  describe('by file extension', () => {
    it('should detect image extensions', () => {
      expect(getAssetType('photo.jpg')).toBe('image');
      expect(getAssetType('photo.jpeg')).toBe('image');
      expect(getAssetType('photo.png')).toBe('image');
      expect(getAssetType('photo.gif')).toBe('image');
      expect(getAssetType('photo.webp')).toBe('image');
      expect(getAssetType('photo.svg')).toBe('image');
      expect(getAssetType('photo.ico')).toBe('image');
      expect(getAssetType('photo.bmp')).toBe('image');
      expect(getAssetType('photo.tiff')).toBe('image');
      expect(getAssetType('photo.avif')).toBe('image');
    });

    it('should detect video extensions', () => {
      expect(getAssetType('video.mp4')).toBe('video');
      expect(getAssetType('video.webm')).toBe('video');
      expect(getAssetType('video.ogg')).toBe('video');
      expect(getAssetType('video.mov')).toBe('video');
      expect(getAssetType('video.avi')).toBe('video');
      expect(getAssetType('video.wmv')).toBe('video');
      expect(getAssetType('video.flv')).toBe('video');
      expect(getAssetType('video.mkv')).toBe('video');
      expect(getAssetType('video.m4v')).toBe('video');
    });

    it('should detect audio extensions', () => {
      expect(getAssetType('audio.mp3')).toBe('audio');
      expect(getAssetType('audio.wav')).toBe('audio');
      expect(getAssetType('audio.aac')).toBe('audio');
      expect(getAssetType('audio.flac')).toBe('audio');
      expect(getAssetType('audio.m4a')).toBe('audio');
      expect(getAssetType('audio.wma')).toBe('audio');
      expect(getAssetType('audio.opus')).toBe('audio');
    });

    it('should detect document extensions', () => {
      expect(getAssetType('document.pdf')).toBe('document');
      expect(getAssetType('document.doc')).toBe('document');
      expect(getAssetType('document.docx')).toBe('document');
      expect(getAssetType('document.xls')).toBe('document');
      expect(getAssetType('document.xlsx')).toBe('document');
      expect(getAssetType('document.ppt')).toBe('document');
      expect(getAssetType('document.pptx')).toBe('document');
      expect(getAssetType('document.txt')).toBe('document');
      expect(getAssetType('document.rtf')).toBe('document');
      expect(getAssetType('document.odt')).toBe('document');
      expect(getAssetType('document.ods')).toBe('document');
      expect(getAssetType('document.odp')).toBe('document');
    });

    it('should return other for unknown extensions', () => {
      expect(getAssetType('file.xyz')).toBe('other');
      expect(getAssetType('file.unknown')).toBe('other');
      expect(getAssetType('file')).toBe('other');
    });

    it('should handle case insensitivity', () => {
      expect(getAssetType('photo.JPG')).toBe('image');
      expect(getAssetType('photo.PNG')).toBe('image');
      expect(getAssetType('video.MP4')).toBe('video');
      expect(getAssetType('document.PDF')).toBe('document');
    });
  });

  describe('mime type priority', () => {
    it('should prioritize mime type over extension', () => {
      expect(getAssetType('file.txt', 'image/png')).toBe('image');
      expect(getAssetType('file.jpg', 'video/mp4')).toBe('video');
    });
  });
});

describe('getAssetTypeIconName', () => {
  it('should return correct icon names', () => {
    expect(getAssetTypeIconName('image')).toBe('ImageIcon');
    expect(getAssetTypeIconName('video')).toBe('Video');
    expect(getAssetTypeIconName('audio')).toBe('Music');
    expect(getAssetTypeIconName('document')).toBe('FileText');
    expect(getAssetTypeIconName('other')).toBe('Package');
  });
});

describe('getAssetTypeLabel', () => {
  it('should return correct labels', () => {
    expect(getAssetTypeLabel('image')).toBe('Image');
    expect(getAssetTypeLabel('video')).toBe('Video');
    expect(getAssetTypeLabel('audio')).toBe('Audio');
    expect(getAssetTypeLabel('document')).toBe('Document');
    expect(getAssetTypeLabel('other')).toBe('Other');
  });
});
