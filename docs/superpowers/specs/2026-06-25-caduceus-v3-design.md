# Caduceus v3 — Import, Pack v2, Auto-Deploy CI & Rebrand-to-URL

**Date:** 2026-06-25
**Status:** Approved (design), pending implementation plan
**Author:** Claude (with Chris Jacob)
**Builds on:** [2026-06-24-soul-creator-v2-design.md](./2026-06-24-soul-creator-v2-design.md)

## Purpose

The app (now branded **Caduceus**) is feature-complete against the v1 and v2
specs and deployed. This round closes the remaining gaps and adds the one
genuinely missing feature:

1. **Import existing files** — load or paste an existing `SOUL.md` / `AGENTS.md`
   to score and edit it. Today the tool is create-only; anyone who already has
   these files has no entry point. This is the centerpiece and the only piece
   needing real new design.
2. **Knowledge pack v2** — publish a newer, content-enriched pack to exercise
   the notify-and-apply update loop **live** (it has only ever served v1).
3. **Auto-deploy CI** — push-to-`main` builds and publishes via GitHub Actions,
   retiring the manual deploy as the default path.
4. **Repo rename → Caduceus** — align the GitHub repo name and public URL with
   the brand (`/SoulCreator/` → `/Caduceus/`).
5. **Review-deferred polish** — clipboard error feedback, live online/offline
   reactivity, and cross-tab leak detection in the SOUL identity field.

## Decisions (locked)

- **Import mapping:** best-effort + review — map matching headings to sections;
  surface unrecognized content in an "Unmatched content" panel; never silently
  drop.
- **Import doc-type detection:** auto-detect from content; route to the detected
  tab when confident, fall back to the active tab when ambiguous.
- **Import entry:** both a file picker (`.md`) and a paste textarea.
- **Import overwrite safety:** confirm before replacing a non-empty target
  draft; empty drafts import with no prompt.
- **Pack v2 scope:** content enrichment only (presets, tip wording, light
  threshold/weight tuning). Stays `schemaVersion: 2` so the live app applies it.
- **CI:** GitHub Actions workflow, Pages source switched to Actions. Requires
  granting the `workflow` OAuth scope.
- **Repo rename:** yes — `Caduceus`; update `VITE_BASE`, `PACK_BASE_URL`, the
  deploy script, and CI to match.

## 1. Import existing files

### Module: `src/lib/parser.ts` (pure, React-free)

The inverse of `generator.ts`. The generator emits, per canonical section, a
heading (`#` for the level-1 text section, `##` otherwise) followed by either a
paragraph (text section) or `- ` bullets (list section). The parser reverses
this against a `SectionDef[]`.

**Signature:**

```ts
interface ParseResult {
  docId: DocId;            // detected (or fallback) doc type
  draft: Draft;            // section-id → value, for the matched sections
  unmatched: { heading: string; body: string }[];  // content with no canonical home
  detection: 'confident' | 'fallback';              // how docId was chosen
}

// `activeTab` is the fallback when detection is ambiguous.
function parseMarkdown(markdown: string, activeTab: DocId): ParseResult;
```

**Algorithm:**

1. **Detect doc type.** Score the markdown's headings against each doc type's
   canonical heading set. SOUL signals: `Personality`, `Style`, `What to avoid`,
   `Defaults`. AGENTS signals: `Project overview`, `Setup & commands`,
   `Boundaries`, `Code style`. Pick the doc type with the most heading matches
   (case-insensitive, trimmed). If the winner has ≥1 match and a strictly higher
   count than the other → `confident`. Otherwise `docId = activeTab`,
   `detection = 'fallback'`.
2. **Split into heading blocks.** Walk the lines; each `#`/`##` heading starts a
   new block whose body is the lines until the next heading. Leading content
   before any heading is treated as a block with an empty heading.
3. **Map blocks to sections.** For the chosen doc type's `SectionDef[]`, match a
   block to a section by case-insensitive trimmed heading equality. For a matched
   **text** section, the section value is the block body trimmed. For a matched
   **list** section, parse `- `/`* ` bullet lines into items; non-bullet lines in
   a list block are also surfaced as unmatched (best-effort, lossless).
4. **Collect unmatched.** Any block whose heading matches no canonical section
   (or content that can't be placed) goes into `unmatched` with its original
   heading + body. Nothing is discarded.

The parser is bounded (drafts/files are small) and does no network or DOM work.

### UI integration

- An **Import** control (button) sits near the `TabBar`. Clicking opens a small
  inline panel with: a file picker (`accept=".md,text/markdown"`) and a paste
  `<textarea>` with an "Import" submit button.
- On import:
  - `parseMarkdown(text, activeTab)` runs.
  - If `detection === 'confident'` and the detected `docId` differs from the
    active tab, switch to the detected tab.
  - If the target tab's current draft is **non-empty** (any section has
    content), show a confirm dialog ("Replace your current {SOUL|AGENTS} draft
    with the imported file?"). Empty target → apply directly.
  - On apply: set the target tab's draft to `result.draft` (flows through the
    existing score/gate/autosave pipeline).
  - If `result.unmatched` is non-empty, render an **"Unmatched content"** panel
    (dismissible) listing each unmatched heading + body, with copy-friendly text
    so the user can paste it into the right section manually.
- **Round-trip guarantee:** the app's own `generate()` output re-imports to an
  equivalent draft with zero unmatched blocks. This is an explicit test.

### Files

| File | Change | Responsibility |
|------|--------|----------------|
| `src/lib/parser.ts` | new | `parseMarkdown` + doc-type detection (pure) |
| `src/lib/parser.test.ts` | new | unit + round-trip tests |
| `src/components/ImportPanel.tsx` | new | file picker + paste UI, emits parsed result |
| `src/components/ImportPanel.test.tsx` | new | component smoke tests |
| `src/App.tsx` | modify | wire import: detect→switch tab→confirm→apply→unmatched panel |
| `src/App.css` | modify | import panel + unmatched-content styles |

## 2. Knowledge pack v2 (content enrichment)

- Update `src/lib/pack/baseline.ts` to a richer pack and bump `packVersion` to
  `2` (keep `schemaVersion: 2`). Enrichment: additional SOUL presets and AGENTS
  project archetypes, refined tip copy, and light threshold/weight tuning within
  existing rules (no new primitives, weights still sum to 100 per doc type).
- `npm run pack:build` regenerates `public/packs/pack-2.json` and updates
  `public/packs/manifest.json` (`latest: '2'`, `url: 'pack-2.json'`). The
  existing `pack-1.json` stays published and immutable.
- The bundled `BASELINE_PACK` is itself v2 (the app ships current); the live
  update loop is exercised by any installed client still holding v1 in
  `localStorage`, which will see the banner and can apply/revert.
- **Parity test update:** the existing SOUL v1-parity test is re-pinned to the
  v2 numbers where tuning changed them; the test continues to lock exact scores
  so future edits stay intentional. Document any weight change in the spec of the
  plan task.

### Files

| File | Change |
|------|--------|
| `src/lib/pack/baseline.ts` | enrich presets/tips/thresholds; `packVersion: '2'` |
| `src/lib/pack/baseline.soul.test.ts` / `baseline.agents.test.ts` | re-pin exact scores |
| `public/packs/pack-2.json`, `public/packs/manifest.json` | regenerated via `pack:build` |
| `scripts/build-pack.test.ts` | assert published `pack-2.json` == baseline, manifest `latest: '2'` |

## 3. Auto-deploy CI

- Commit `.github/workflows/deploy.yml`: on push to `main` (and
  `workflow_dispatch`), `npm ci` → build with `VITE_BASE` → publish `dist/` via
  `actions/upload-pages-artifact` + `actions/deploy-pages` (OIDC). The workflow
  already exists locally; finalize and commit it.
- Switch the Pages build source from the `gh-pages` branch back to **GitHub
  Actions** (`gh api -X PUT .../pages -f build_type=workflow`).
- Keep `npm run deploy` as a documented manual fallback; CI becomes the default.
- **Prerequisite:** the `workflow` OAuth scope must be granted
  (`gh auth refresh -h github.com -s workflow`) so the workflow file can be
  pushed. The plan's first task gates on this.

## 4. Repo rename → Caduceus

- `gh repo rename Caduceus` (GitHub redirects the old `SoulCreator` URLs,
  including Pages, so existing links and cached PWAs keep working via redirect).
- Update path references to the new project-site base `/Caduceus/`:
  - `package.json` `deploy:build` / `deploy` default `VITE_BASE`.
  - `src/lib/config.ts` default `PACK_BASE_URL` →
    `https://christopherjacob.github.io/Caduceus/packs`.
  - `.github/workflows/deploy.yml` `VITE_BASE`.
  - README links and the live-app URL.
- Redeploy; verify the new URL serves and asset/pack paths resolve under
  `/Caduceus/`.
- **Migration note:** clients with the old bundled `PACK_BASE_URL`
  (`/SoulCreator/packs`) still resolve via GitHub's rename redirect, so the
  update check keeps working for already-installed apps.

## 5. Review-deferred polish

- **Clipboard error feedback** (`PreviewPane.tsx`): wrap the Copy handler in
  try/catch; on failure show a transient "Copy failed" state instead of silently
  doing nothing. Add a test that a rejected `clipboard.writeText` surfaces the
  error state.
- **Online/offline reactivity** (`App.tsx`): subscribe to `window` `online`/
  `offline` events and hold connectivity in state so the header indicator updates
  live (today it is a one-time `navigator.onLine` snapshot). Clean up listeners
  on unmount.
- **Cross-tab move from identity text** (`crossTab.ts`): extend leak relocation
  to scan the SOUL `identity` text section (currently list sections only), so a
  leak typed into Personality can also be moved. Keep the single-safe-append
  scoping. Add a test.

## Sequencing

1. **Infra first:** grant `workflow` scope → repo rename → path updates → commit
   CI workflow → switch Pages to Actions → verify auto-deploy works.
2. **Import:** parser (TDD: unit + round-trip) → ImportPanel → App wiring +
   unmatched panel.
3. **Pack v2:** enrich baseline → re-pin parity tests → `pack:build` → publish.
4. **Polish:** clipboard, online/offline, cross-tab identity leak.

Each step keeps the full gate green: `npm test`, `npm run test:build`,
`npm run build`, `npm run lint`.

## Testing strategy

- **`parser`** — unit tests for: SOUL detection, AGENTS detection, ambiguous →
  active-tab fallback; matched text + list sections; bullet parsing; unmatched
  collection (lossless); and a **round-trip** test (`generate(parse(x)) ≈ x` for
  canonical input, and `parse(generate(draft)) === draft`).
- **`ImportPanel`** — paste + file-read produce a parsed result; submit emits it.
- **App** — import switches to the detected tab; confirm dialog gates replace of
  a non-empty draft; unmatched panel renders when present.
- **Pack v2** — re-pinned baseline parity; published `pack-2.json` matches
  baseline; manifest `latest: '2'`.
- **Polish** — clipboard failure state; online/offline indicator updates on
  event; identity-field leak is relocated by the move action.
- **CI** — a successful Actions run deploying to Pages (validated live).

## Out of scope (v3)

- Fuzzy/aliased import mapping (e.g. "Tone"→Style) — best-effort exact match
  only; unmatched content is surfaced, not guessed.
- Nested/per-directory `AGENTS.md` import or authoring.
- Draft versioning/history/diff, accounts, cloud sync, native desktop packaging.
- New rule-engine primitives (would require `schemaVersion: 3` + an app release).

## Success criteria check

- *Import* → users can load/paste an existing SOUL.md/AGENTS.md, have it
  auto-typed, scored, and editable, with nothing silently lost and a safe
  overwrite path.
- *Pack v2* → the notify-and-apply update loop is proven live; the published pack
  delivers richer guidance.
- *Auto-deploy* → push to `main` deploys automatically; manual `npm run deploy`
  remains as a fallback.
- *Rebrand* → repo and public URL are `Caduceus`; all base/pack paths updated;
  old URLs redirect.
- *Polish* → clipboard failures are visible, the connectivity indicator is live,
  and SOUL identity-field leaks are movable.
