import { SoulDraft, cleanLines } from './model';

function bullets(items: string[] | undefined): string {
  return cleanLines(items).map((s) => `- ${s}`).join('\n');
}

export function generateSoul(draft: SoulDraft): string {
  const blocks: string[] = [];
  blocks.push(`# Personality\n${draft.identity.trim()}`);

  const style = bullets(draft.style);
  if (style) blocks.push(`## Style\n${style}`);

  const avoid = bullets(draft.avoid);
  if (avoid) blocks.push(`## What to avoid\n${avoid}`);

  const defaults = bullets(draft.defaults);
  if (defaults) blocks.push(`## Defaults\n${defaults}`);

  if (draft.domainPosture) {
    const title = draft.domainPosture.title.trim();
    const lines = bullets(draft.domainPosture.lines);
    if (title && lines) blocks.push(`## ${title}\n${lines}`);
  }

  const examples = bullets(draft.examples);
  if (examples) blocks.push(`## Examples\n${examples}`);

  return blocks.join('\n\n') + '\n';
}
