import { SUPPORTED_SCHEMA_VERSION } from './schema';
import type { Pack, PatternSpec, DocTypePack } from './schema';

const STRONG_VERB: PatternSpec = {
  source:
    '^(be|say|avoid|prefer|explain|ask|distinguish|point|prioritize|keep|use|focus|challenge|state|admit|flag|push|default|treat|assume|lead|stay|surface|name|call)\\b',
  flags: 'i',
};

const HYPE: PatternSpec = {
  source:
    '\\b(blazing[- ]?fast|revolutionary|world[- ]?class|cutting[- ]?edge|game[- ]?changer|best[- ]?in[- ]?class|seamless(ly)?|synergy|10x|next[- ]?generation|state[- ]?of[- ]?the[- ]?art|paradigm)\\b',
  flags: 'gi',
};

const LEAKS: PatternSpec[] = [
  { name: 'file path', source: '(\\.{0,2}\\/)?[\\w-]+\\/[\\w./-]+' },
  { name: 'port', source: ':\\d{2,5}\\b' },
  { name: 'command', source: '\\b(npm|npx|yarn|pnpm|pip|pytest|git|docker|make|cargo|go run|curl)\\b', flags: 'i' },
  { name: 'env/flag token', source: '\\b[A-Z_]{3,}=|--[a-z][\\w-]+' },
];

const soul: DocTypePack = {
  sections: [
    { id: 'identity', heading: 'Personality', level: 1, kind: 'text', optional: false,
      placeholder: 'Who is Hermes? e.g. You are Hermes, a pragmatic engineer…',
      help: '1–3 sentences: who the agent is.' },
    { id: 'style', heading: 'Style', level: 2, kind: 'list', optional: false,
      placeholder: 'Be direct.', help: 'How it sounds — imperative lines.' },
    { id: 'avoid', heading: 'What to avoid', level: 2, kind: 'list', optional: false,
      placeholder: 'Avoid hype language.', help: 'Stylistic boundaries.' },
    { id: 'defaults', heading: 'Defaults', level: 2, kind: 'list', optional: false,
      placeholder: 'When ambiguous, ask one question.', help: 'Behavior under ambiguity.' },
    { id: 'domain', heading: 'Domain posture', level: 2, kind: 'list', optional: true,
      placeholder: 'Prioritize correctness.', help: 'Optional domain-specific posture.' },
    { id: 'examples', heading: 'Examples', level: 2, kind: 'list', optional: true,
      placeholder: 'Say when something is a bad idea.', help: 'Optional illustrative lines.' },
  ],
  rubric: [
    { id: 'identity', label: 'Identity', max: 18, target: 'identity', check: 'textLength', direction: 'reward',
      params: { bands: [{ min: 20, points: 18 }, { min: 1, points: 9 }, { min: 0, points: 0 }] },
      tips: { pass: 'Clear identity statement.', fail: 'Write a 1–3 sentence identity describing who Hermes is.' } },
    { id: 'style', label: 'Style specificity', max: 18, target: 'style', check: 'patternRatio', direction: 'reward',
      params: { patterns: [STRONG_VERB], lowCountCap: { whenBelow: 2, cap: 9 } },
      tips: { pass: 'Concrete, imperative style lines.', fail: 'Use imperative verbs ("Be direct.", "Say when…"); add at least 2.' } },
    { id: 'avoid', label: 'Avoid clarity', max: 12, target: 'avoid', check: 'listSize', direction: 'reward',
      params: { bands: [{ min: 2, points: 12 }, { min: 1, points: 7 }, { min: 0, points: 0 }] },
      tips: { pass: 'Clear stylistic boundaries.', fail: 'List a couple of things the agent should never do stylistically.' } },
    { id: 'defaults', label: 'Defaults', max: 12, target: 'defaults', check: 'listSize', direction: 'reward',
      params: { bands: [{ min: 2, points: 12 }, { min: 1, points: 7 }, { min: 0, points: 0 }] },
      tips: { pass: 'Defines behavior under ambiguity.', fail: 'Describe how the agent behaves when input is underspecified.' } },
    { id: 'portability', label: 'Portability', max: 16, target: '*', check: 'patternPenalty', direction: 'penalty',
      params: { patterns: LEAKS, perHit: 8, countMode: 'patterns', requiresContent: true },
      tips: { pass: 'No task-specific leakage.', fail: 'Move to AGENTS.md — found {hits}.' } },
    { id: 'conciseness', label: 'Conciseness', max: 12, target: '#total', check: 'lineCount', direction: 'reward',
      params: { bands: [
        { min: 0, max: 0, points: 0 },
        { min: 1, max: 3, points: 8 },
        { min: 4, max: 8, points: 12 },
        { min: 9, max: 12, points: 8 },
        { min: 13, points: 5 },
      ] },
      tips: { pass: 'In the 4–8 line sweet spot.', fail: 'Aim for 4–8 defining lines.' } },
    { id: 'noHype', label: 'No hype', max: 8, target: '*', check: 'patternPenalty', direction: 'penalty',
      params: { patterns: [HYPE], perHit: 4, countMode: 'matches', requiresContent: true },
      tips: { pass: 'No marketing language.', fail: 'Remove hype words (e.g. "blazing fast", "world-class").' } },
    { id: 'structure', label: 'Structure', max: 4, target: '*', check: 'structure', direction: 'reward',
      params: { requiredSections: ['identity', 'style'] },
      tips: { pass: 'Canonical Markdown structure.', fail: 'Add an identity and at least one style line.' } },
  ],
  gate: [
    { id: 'identity', check: 'nonEmptyText', target: 'identity', message: 'Add an Identity statement.' },
    { id: 'style', check: 'nonEmptyList', target: 'style', message: 'Add at least one Style line.' },
    { id: 'portability', check: 'noPatterns', target: '*', patterns: LEAKS, countMode: 'patterns',
      message: 'Remove task-specific content (belongs in AGENTS.md): {hits}.' },
  ],
  presets: [
    { id: 'pragmatic-engineer', name: 'Pragmatic Engineer', description: 'Direct, concise, willing to say when something is a bad idea.',
      draft: {
        identity: 'You are Hermes, a pragmatic senior engineer who values clarity and correctness over ceremony.',
        style: ['Be direct.', 'Be concise unless complexity requires depth.', 'Say when something is a bad idea.'],
        avoid: ['Avoid hype language.', 'Avoid hedging when you are confident.'],
        defaults: ['When a request is ambiguous, ask one focused clarifying question.', 'Prefer the simplest solution that is correct.'],
      } },
    { id: 'research-partner', name: 'Research Partner', description: 'Explores possibilities without pretending certainty.',
      draft: {
        identity: 'You are Hermes, a research partner who thinks alongside the user and reasons carefully about open problems.',
        style: ['Explore possibilities without pretending certainty.', 'Distinguish speculation from evidence.', 'Ask clarifying questions when the idea space is underspecified.'],
        avoid: ['Avoid overclaiming.', 'Avoid presenting guesses as facts.'],
        defaults: ['When evidence is thin, state confidence explicitly.', 'Offer multiple framings before converging.'],
      } },
    { id: 'teacher', name: 'Teacher / Explainer', description: 'Explains clearly, builds from intuition to detail.',
      draft: {
        identity: 'You are Hermes, a patient teacher who makes hard ideas approachable.',
        style: ['Explain clearly using examples when helpful.', 'Build from intuition to details.', 'Do not assume prior knowledge unless signaled.'],
        avoid: ['Avoid jargon without definition.', 'Avoid condescension.'],
        defaults: ['When a concept is broad, start with the simplest accurate model.', 'Check understanding before adding depth.'],
      } },
    { id: 'tough-reviewer', name: 'Tough Reviewer', description: 'Prioritizes correctness over harmony; names risks directly.',
      draft: {
        identity: 'You are Hermes, a rigorous reviewer who protects quality and tells the user what they need to hear.',
        style: ['Point out weak assumptions directly.', 'Prioritize correctness over harmony.', 'Be explicit about risks and tradeoffs.'],
        avoid: ['Avoid rubber-stamping.', 'Avoid softening real problems.'],
        defaults: ['When something looks wrong, flag it even if unprompted.', 'Separate blocking issues from nits.'],
      } },
    { id: 'blank', name: 'Blank Slate', description: 'Start from an empty file.',
      draft: { identity: '', style: [], avoid: [], defaults: [] } },
  ],
};

// AGENTS doc type is fully populated in a later task. Until then it is a valid
// empty shell so the pack validates; no UI references it yet.
const agents: DocTypePack = { sections: [], rubric: [], gate: [], presets: [] };

export const BASELINE_PACK: Pack = {
  packVersion: '1',
  schemaVersion: SUPPORTED_SCHEMA_VERSION,
  publishedAt: '2026-06-24',
  summary: 'Initial pack: SOUL rubric (Hermes docs) + AGENTS rubric (agents.md standard).',
  docTypes: { soul, agents },
};
