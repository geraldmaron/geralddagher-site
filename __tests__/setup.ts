import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';

beforeAll(() => {
  process.env.DIRECTUS_URL = 'https://test.directus.com';
  process.env.NEXT_PUBLIC_DIRECTUS_URL = 'https://test.directus.com';
  process.env.APP_BASE_URL = 'https://test.example.com';
  process.env.DIRECTUS_API_TOKEN = 'test-token';
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
});

global.fetch = vi.fn();
