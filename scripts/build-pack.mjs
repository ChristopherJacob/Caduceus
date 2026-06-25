// Run this script with: npx tsx scripts/build-pack.mjs
// tsx handles TypeScript imports directly; no separate loader registration needed.
import { writeFileSync, mkdirSync } from 'node:fs';
import { BASELINE_PACK } from '../src/lib/pack/baseline.ts';

const version = BASELINE_PACK.packVersion;
const file = `pack-${version}.json`;

mkdirSync('public/packs', { recursive: true });
// Write the current version's pack file. Prior versions (e.g. pack-1.json) are
// left untouched so old clients can still fetch the exact pack they shipped with.
writeFileSync(`public/packs/${file}`, JSON.stringify(BASELINE_PACK, null, 2) + '\n');
writeFileSync(
  'public/packs/manifest.json',
  JSON.stringify(
    {
      latest: version,
      schemaVersion: BASELINE_PACK.schemaVersion,
      url: file,
      publishedAt: BASELINE_PACK.publishedAt,
      summary: BASELINE_PACK.summary,
    },
    null,
    2,
  ) + '\n',
);
console.log(`wrote public/packs/{manifest,${file.replace('.json', '')}}.json`);
