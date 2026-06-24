import type { DraftScore } from '../lib/pack/engine';

interface Props {
  result: DraftScore;
  /** When provided, sub-max categories that carry leak hits get a move button. */
  onMoveLeaks?: () => void;
  /** Only the category with this key shows the move button. */
  moveLeaksKey?: string;
}

function tier(score: number): string {
  if (score >= 80) return 'great';
  if (score >= 60) return 'ok';
  return 'weak';
}

export function ScorePanel({ result, onMoveLeaks, moveLeaksKey }: Props) {
  return (
    <div className={`score-panel tier-${tier(result.score)}`}>
      <div className="score-gauge">
        <span className="score-number">{result.score}</span>
        <span className="score-max">/100</span>
      </div>
      <ul className="score-rows">
        {result.categories.map((c) => (
          <li key={c.key} className="score-row">
            <div className="score-row-head">
              <span className="score-row-label">{c.label}</span>
              <span className="score-row-value">{c.score}/{c.max}</span>
            </div>
            <div className="score-bar">
              <div className="score-bar-fill" style={{ width: `${c.max > 0 ? (c.score / c.max) * 100 : 0}%` }} />
            </div>
            {c.score < c.max && <p className="score-tip">{c.tip}</p>}
            {onMoveLeaks && c.key === moveLeaksKey && c.hits && c.hits.length > 0 && (
              <button type="button" className="move-leaks" onClick={onMoveLeaks}>
                Move to AGENTS.md
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
