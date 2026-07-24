import { useState } from 'react';
import WordListItem from './WordListItem';

function scoreMessage(percentage) {
  if (percentage === 100) return 'Perfect run. Every word landed.';
  if (percentage >= 80) return 'Strong round — just a few to polish.';
  if (percentage >= 50) return 'Good progress. Another pass will lock these in.';
  return 'These words need more reps. Keep going.';
}

function TestResult({ answers, onRetryAll, onRetryWrong, onExit }) {
  const [showReview, setShowReview] = useState(false);

  const total = answers.length;
  const correctCount = answers.filter((entry) => entry.correct).length;
  const wrongCount = total - correctCount;
  const percentage = total === 0 ? 0 : Math.round((correctCount / total) * 100);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10 text-white">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Test complete
        </p>
        <p className="mt-4 text-6xl font-semibold text-emerald-400">{percentage}%</p>
        <p className="mt-2 text-sm text-neutral-400">
          {correctCount} of {total} correct
        </p>

        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="mt-6 text-sm text-neutral-500">{scoreMessage(percentage)}</p>
      </div>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={onRetryAll}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Try the whole test again
        </button>

        <button
          type="button"
          onClick={onRetryWrong}
          disabled={wrongCount === 0}
          className="w-full rounded-xl bg-neutral-800 py-3 text-sm font-medium text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:text-neutral-600 disabled:hover:bg-neutral-800"
        >
          {wrongCount === 0
            ? 'No wrong words to retry'
            : `Retry wrong words only (${wrongCount})`}
        </button>

        <button
          type="button"
          onClick={() => setShowReview((current) => !current)}
          className="w-full rounded-xl border border-neutral-800 py-3 text-sm font-medium text-neutral-300 hover:border-neutral-700 hover:text-white"
        >
          {showReview ? 'Hide the words' : 'Review the words you tested'}
        </button>

        <button
          type="button"
          onClick={onExit}
          className="w-full py-2 text-sm text-neutral-500 hover:text-neutral-300"
        >
          Back to vocabulary
        </button>
      </div>

      {showReview && (
        <ul className="mt-6 space-y-3">
          {answers.map((entry) => (
            <WordListItem
              key={entry.word.id ?? entry.word.word}
              word={entry.word}
              result={entry.correct ? 'correct' : 'wrong'}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default TestResult;
