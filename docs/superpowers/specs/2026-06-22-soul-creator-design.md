# SOUL Creator — Design Spec

**Date:** 2026-06-22
**Status:** Approved (design), pending implementation plan
**Author:** Hermes Expert (with Chris Jacob)

## Purpose

A slick, easy-to-use web tool that helps users author best-of-breed
`SOUL.md` files for **Hermes Agent** (NousResearch). `SOUL.md` is the agent's
durable identity file, injected directly into slot #1 of the system prompt. It
defines *who the agent is, how it speaks, and what it avoids* — not project or
task details (those belong in `AGENTS.md`).

Modeled on the existing [prompt-forge](https://github.com/ChristopherJacob/prompt-forge)
tool: guided builder + live quality scoring, local-first.

## Background research (sources)

- Hermes SOUL.md docs — Personality & SOUL.md:
  https://hermes-agent.nousresearch.com/docs/user-guide/features/personality
- Hermes — Use SOUL.md with Hermes:
  https://hermes-agent.nousresearch.com/docs/guides/use-soul-with-hermes

Key facts that drive the design:

- **Location:** `~/.hermes/SOUL.md` (or `$HERMES_HOME/SOUL.md`). Instance-wide,
  not per-repo.
- **Canonical structure** (from docs): Identity → Style → What to avoid →
  Defaults. The docs render the heading as `# Personality` followed by
  `## Style`, `## What to avoid`, and a domain/defaults section.
- **Content belongs in SOUL.md:** tone, communication style, directness, how to
  handle uncertainty/disagreement, default interaction patterns, stylistic
  avoidances.
- **Excluded from SOUL.md:** one-off project instructions, file paths, repo
  conventions, ports/commands, architecture notes, temporary workflow details
  (→ `AGENTS.md`). Guiding rule: *"if it should follow you everywhere, it
  belongs in SOUL.md; if it belongs to a project, it belongs in AGENTS.md."*
- **Quality bar:** stable across contexts, broad enough to apply in many
  conversations, specific enough to materially shape the voice. Start with
  ~4–8 defining lines and iterate.
- **Processing:** scanned for prompt-injection patterns, truncated if oversized;
  falls back to a built-in default if empty/unreadable.

## Decisions (locked)

- **Stack:** React + Vite + TypeScript.
- **Scoring:** include a live 1–100 quality score with a visible rubric.
- **Presets:** include a one-click preset library.
- **Sections:** canonical 4 always, plus optional collapsible sections.
- **PWA/offline:** out of scope for v1 (may add later).

## Architecture

Single-page React app, local-first, no backend. State autosaves to
`localStorage`. Two-pane layout:

- **Left:** guided builder form (collapsible sections).
- **Right:** live Markdown preview of the generated `SOUL.md` + score gauge.

Responsive: panes stack vertically on narrow screens. Dark mode default with a
light toggle. Minimal dependencies: React, Vite, and `react-markdown` for the
preview. All other styling is hand-rolled CSS for full visual control.

### Modules (each isolated and unit-testable)

| Module | Responsibility | Depends on |
|--------|----------------|------------|
| `model.ts` | `SoulDraft` type — single source of truth | — |
| `generator.ts` | Pure `SoulDraft → SOUL.md` string | `model` |
| `scoring.ts` | Pure `SoulDraft → { score, categories[], tips[] }` | `model` |
| `presets.ts` | Seed library of `SoulDraft` presets | `model` |
| `storage.ts` | Load/save draft to `localStorage` | `model` |
| `BuilderForm` | Edits the draft via collapsible sections | `model`, `presets` |
| `PresetPicker` | Apply a preset to the draft | `presets` |
| `LivePreview` | Render generated Markdown | `generator` |
| `ScorePanel` | Show gauge + rubric + tips | `scoring` |
| `ExportBar` | Copy / Download / draft management + quality gates | `generator`, `scoring` |
| `App` | Compose layout, own draft state, wire autosave | all |

**Boundary test:** `generator`, `scoring`, `presets`, and `storage` are pure
data functions with no React imports — fully testable in isolation. UI
components consume them through props.

## Data model

```ts
interface SoulDraft {
  identity: string;        // 1–3 sentence "who Hermes is"
  style: string[];         // imperative lines, e.g. "Be direct."
  avoid: string[];         // e.g. "Avoid hype language."
  defaults: string[];      // behavior under ambiguity/uncertainty
  domainPosture?: {        // optional
    title: string;
    lines: string[];
  };
  examples?: string[];     // optional illustrative lines
}
```

Empty optional sections are omitted from both the generated output and the
form's default view (revealed via "add optional section").

## Generated output format

```markdown
# Personality
{identity}

## Style
- {style[0]}
- {style[1]}

## What to avoid
- {avoid[0]}

## Defaults
- {defaults[0]}

## {domainPosture.title}        // only if present
- {domainPosture.lines[0]}

## Examples                     // only if present
- {examples[0]}
```

Rules: trailing whitespace trimmed; empty sections omitted; list items
normalized to single `- ` bullets; single trailing newline.

## Scoring rubric (1–100)

Pure heuristic engine, no network. Weighted categories, each contributing
points and emitting actionable tips. Weights are tuned to sum to 100; exact
values finalized during implementation.

| Category | Checks | Direction |
|----------|--------|-----------|
| Identity present & concrete | Non-empty identity, not a placeholder, names a real posture | reward |
| Style specificity | Concrete imperative verbs ("Be…", "Say when…", "Distinguish…"); penalize vague filler | reward |
| Avoid clarity | At least a couple of genuine stylistic boundaries | reward |
| Defaults / ambiguity handling | Defines behavior when input is underspecified | reward |
| Portability | **Penalize** task-specific leakage: file paths, ports, repo/command tokens (belongs in AGENTS.md) | penalty |
| Conciseness | Reward the ~4–8 defining-lines sweet spot; flag bloat | reward/penalty |
| No-hype | Penalize marketing tone ("blazing fast", "revolutionary", "world-class") | penalty |
| Structure | Valid Markdown, canonical headings present | reward |

The **Portability** check is the signature Hermes-correctness signal: it is what
distinguishes a correct SOUL.md from a misused one.

Each category renders its sub-score and a one-line tip in `ScorePanel`.

## Quality gates

Mirrors prompt-forge. Copy and Download are **disabled** until the draft:

1. Has a real Identity (non-empty, not the placeholder), and
2. Has at least one Style line, and
3. Passes the Portability check (no obvious task-specific leakage).

When gated, `ExportBar` shows which gate is unmet so the fix is obvious.

## Presets

One-click seeds, all fully editable after applying. Inspired by the Hermes docs
examples:

- **Pragmatic Engineer** — "Be direct. Be concise unless complexity requires depth. Say when something is a bad idea."
- **Research Partner** — "Explore possibilities without pretending certainty. Distinguish speculation from evidence. Ask clarifying questions when the idea space is underspecified."
- **Teacher / Explainer** — "Explain clearly using examples when helpful. Do not assume prior knowledge unless signaled. Build from intuition to details."
- **Tough Reviewer** — "Point out weak assumptions directly. Prioritize correctness over harmony. Be explicit about risks and tradeoffs."
- **Blank Slate** — empty scaffold.

## Persistence & export

- **Autosave:** current draft to `localStorage` on change (debounced).
- **Copy:** generated `SOUL.md` to clipboard.
- **Download:** generated content as a file named `SOUL.md`.
- Draft survives reload; a "reset / new" action clears to Blank Slate.

## UI / visual direction

- Two-pane, dark-first, gradient accent, generous spacing — "slick" and
  uncluttered per the success criteria.
- Live score gauge prominent in the right pane.
- Collapsible optional sections keep the default view simple ("super easy to use").
- Fully responsive; keyboard-accessible inputs.

## Testing strategy

- Unit tests for the pure modules: `generator` (output formatting, omission
  rules), `scoring` (each category reward/penalty, gate logic), `presets`
  (valid drafts), `storage` (round-trip).
- Component smoke tests: applying a preset updates preview + score; gate
  toggling enables/disables export.
- Test runner: Vitest (native to Vite).

## Out of scope (v1)

- PWA / offline / service worker.
- Backend, accounts, cloud sync.
- Direct write to `~/.hermes/SOUL.md` (browser can't); we provide download +
  copy with a note on where to place the file.
- AGENTS.md authoring (separate concern; tool only warns when content belongs there).

## Success criteria check

- *Best-of-breed SOUL.md output* → generator emits canonical Hermes structure;
  scoring + gates enforce the docs' quality bar (concise, portable, identity-
  focused, no hype).
- *Super easy to use, slick interface* → two-pane live builder, presets,
  collapsible optional sections, dark-first design.
- *Consistent with prompt-forge* → same guided-builder + live-scoring +
  local-first model, upgraded to React/Vite per decision.
