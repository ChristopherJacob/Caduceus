import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { BASELINE_PACK } from '../src/lib/pack/baseline';

const read = (rel: string) => readFileSync(new URL(rel, import.meta.url), 'utf8');

describe('published packs', () => {
  it('the latest pack file matches the bundled baseline', () => {
    const latest = JSON.parse(read(`../public/packs/pack-${BASELINE_PACK.packVersion}.json`));
    expect(latest).toEqual(BASELINE_PACK);
  });

  it('keeps pack-1.json as a frozen v1 artifact', () => {
    const v1 = JSON.parse(read('../public/packs/pack-1.json'));
    expect(v1.packVersion).toBe('1');
    expect(v1.schemaVersion).toBe(2);
  });

  it('manifest points at the latest pack and carries its metadata', () => {
    const manifest = JSON.parse(read('../public/packs/manifest.json'));
    expect(manifest.latest).toBe(BASELINE_PACK.packVersion);
    expect(manifest.schemaVersion).toBe(BASELINE_PACK.schemaVersion);
    expect(manifest.url).toBe(`pack-${BASELINE_PACK.packVersion}.json`);
    expect(manifest.publishedAt).toBe(BASELINE_PACK.publishedAt);
    expect(manifest.summary).toBe(BASELINE_PACK.summary);
  });
});
