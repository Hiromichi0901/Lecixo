import { useState } from 'react';
import VocabCard from '../components/VocabCard';

function Dictionary() {
  const [input, setInput] = useState('');
  const [submittedWord, setSubmittedWord] = useState(null);

  const trimmedInput = input.trim();
  const canSearch = trimmedInput.length > 0;

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSearch) return;
    setSubmittedWord(trimmedInput.toLowerCase());
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10 text-white">
      <h1 className="text-3xl font-semibold">Dictionary</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Look up any English word and save it to your vocabulary.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Enter a word"
          aria-label="Word to look up"
          autoFocus
          className="min-w-0 flex-1 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-emerald-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!canSearch}
          className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-600"
        >
          Search
        </button>
      </form>

      {submittedWord ? (
        <div className="mt-8">
          <VocabCard word={submittedWord} />
        </div>
      ) : (
        <p className="mt-10 text-sm text-neutral-500">
          Search for a word to see its definition and Japanese translation.
        </p>
      )}
    </div>
  );
}

export default Dictionary;
