import { describe, it, expect } from 'vitest';
import { PACK_BASE_URL } from './config';

describe('config', () => {
  it('exposes a non-empty pack base URL ending in /packs', () => {
    expect(PACK_BASE_URL).toMatch(/\/packs$/);
  });
});
