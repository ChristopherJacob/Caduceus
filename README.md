# SOUL Creator

A slick, local-first web tool for authoring best-of-breed [Hermes](https://hermes-agent.nousresearch.com) `SOUL.md` files — your agent's durable identity (tone, voice, boundaries, defaults).

## Why
`SOUL.md` goes into slot #1 of the Hermes system prompt. It should be portable identity, not project detail (that belongs in `AGENTS.md`). SOUL Creator guides you to the canonical structure (Identity → Style → What to avoid → Defaults), scores the draft 1–100, and blocks export until it clears the quality bar — including a portability check that flags task-specific leakage.

## Develop
```bash
npm install
npm run dev      # start the app
npm test         # run the test suite
npm run build    # production build
```

## Use
1. Pick a preset or start blank.
2. Edit Identity, Style, Avoid, Defaults (add optional Domain Posture / Examples).
3. Watch the live preview and score.
4. Copy or Download `SOUL.md`, then place it at `~/.hermes/SOUL.md`.
