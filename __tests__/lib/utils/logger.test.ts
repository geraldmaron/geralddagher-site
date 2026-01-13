import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Logger, LogLevel } from '@/lib/utils/logger';

describe('Logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('info', () => {
    it('should log info messages', () => {
      Logger.info('Test message');
      expect(console.info).toHaveBeenCalled();
    });

    it('should include data in log', () => {
      const data = { key: 'value' };
      Logger.info('Test message', data);
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO'),
        expect.objectContaining({ key: 'value' })
      );
    });

    it('should include context in log', () => {
      Logger.info('Test message', {}, { location: 'test.ts' });
      const call = (console.info as any).mock.calls[0][0];
      expect(call).toContain('test.ts');
    });

    it('should include timestamp in log', () => {
      Logger.info('Test message');
      const call = (console.info as any).mock.calls[0][0];
      expect(call).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      Logger.warn('Warning message');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should include context in warning', () => {
      Logger.warn('Warning', {}, { location: 'test.ts', userId: '123' });
      const call = (console.warn as any).mock.calls[0][0];
      expect(call).toContain('test.ts');
      expect(call).toContain('user:123');
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      Logger.error('Error message');
      expect(console.error).toHaveBeenCalled();
    });

    it('should format Error objects', () => {
      const error = new Error('Test error');
      Logger.error('Error occurred', { error });
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR'),
        expect.objectContaining({
          error: expect.objectContaining({
            name: 'Error',
            message: 'Test error',
          }),
        })
      );
    });

    it('should include error stack in development', () => {
      vi.stubEnv('NODE_ENV', 'development');
      const error = new Error('Test error');
      Logger.error('Error occurred', { error });

      expect(console.error).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          error: expect.objectContaining({
            stack: expect.stringContaining('Error: Test error'),
          }),
        })
      );
      vi.unstubAllEnvs();
    });
  });


  describe('sanitization', () => {
    it('should redact password fields', () => {
      Logger.info('Login attempt', { email: 'test@example.com', password: 'secret123' });
      expect(console.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          email: 'test@example.com',
          password: '[REDACTED]',
        })
      );
    });

    it('should redact token fields', () => {
      Logger.info('API call', { token: 'abc123' });
      expect(console.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          token: '[REDACTED]',
        })
      );
    });

    it('should redact secret fields', () => {
      Logger.info('Config', { secret: 'secret-key' });
      expect(console.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          secret: '[REDACTED]',
        })
      );
    });

    it('should redact apiKey fields', () => {
      Logger.info('API request', { apiKey: 'key123' });
      expect(console.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          apiKey: '[REDACTED]',
        })
      );
    });

    it('should redact authorization fields', () => {
      Logger.info('Request', { authorization: 'Bearer token123' });
      expect(console.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          authorization: '[REDACTED]',
        })
      );
    });
  });

  describe('context formatting', () => {
    it('should format location context', () => {
      Logger.info('Test', {}, { location: 'api.users.POST' });
      const call = (console.info as any).mock.calls[0][0];
      expect(call).toContain('[api.users.POST]');
    });

    it('should format requestId context', () => {
      Logger.info('Test', {}, { requestId: 'req-123' });
      const call = (console.info as any).mock.calls[0][0];
      expect(call).toContain('[req:req-123]');
    });

    it('should format userId context', () => {
      Logger.info('Test', {}, { userId: 'user-456' });
      const call = (console.info as any).mock.calls[0][0];
      expect(call).toContain('[user:user-456]');
    });

    it('should format multiple context values', () => {
      Logger.info('Test', {}, {
        location: 'test.ts',
        requestId: 'req-123',
        userId: 'user-456',
      });
      const call = (console.info as any).mock.calls[0][0];
      expect(call).toContain('[test.ts|req:req-123|user:user-456]');
    });
  });
});
