import { describe, it, expect } from 'vitest';
import { generateRandomPassword } from '@/lib/auth/password-utils';

describe('generateRandomPassword', () => {
  it('generates a password of the default length (16)', () => {
    expect(generateRandomPassword()).toHaveLength(16);
  });

  it('generates a password of a custom length', () => {
    expect(generateRandomPassword(24)).toHaveLength(24);
    expect(generateRandomPassword(8)).toHaveLength(8);
  });

  it('includes at least one uppercase letter', () => {
    const password = generateRandomPassword(32);
    expect(/[A-Z]/.test(password)).toBe(true);
  });

  it('includes at least one lowercase letter', () => {
    const password = generateRandomPassword(32);
    expect(/[a-z]/.test(password)).toBe(true);
  });

  it('includes at least one digit', () => {
    const password = generateRandomPassword(32);
    expect(/[0-9]/.test(password)).toBe(true);
  });

  it('includes at least one symbol', () => {
    const password = generateRandomPassword(32);
    expect(/[!@#$%^&*()\-_=+]/.test(password)).toBe(true);
  });

  it('generates unique passwords on each call', () => {
    const passwords = Array.from({ length: 10 }, () => generateRandomPassword());
    const unique = new Set(passwords);
    expect(unique.size).toBeGreaterThan(1);
  });
});
