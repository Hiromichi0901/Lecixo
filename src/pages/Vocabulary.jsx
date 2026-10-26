import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFlashcardTest } from '../hooks/useFlashcardTest';
import { getAllWords } from '../services/vocabulary';
import Flashcard from '../components/Flashcard';
import TestResult from '../components/TestResult';
import WordListItem from '../components/WordListItem';

function Vocabulary() {
  const { user, loading } = useAuth();
  // Tagged with the uid it was loaded for, so switching accounts can't show the
  // previous one's words while the next load is in flight.
  const [loaded, setLoaded] = useState(null);
  const {
    status,
    index,
    flipped,
    answers,
    wrongWords,
    currentWord,
    total,
    start,
    flip,
    answer,
    exit,
  } = useFlashcardTest();

  const signedIn = Boolean(user) && !user.isAnonymous;
  const isCurrentUser = Boolean(loaded) && loaded.uid === user?.uid;
  const words = isCurrentUser ? loaded.words : [];
  const loadingWords = signedIn && !isCurrentUser;

  useEffect(() => {
    // Anonymous visitors can't have saved anything, so there's nothing to fetch.
    if (!user || user.isAnonymous) return;

    let cancelled = false;
    const { uid } = user;

    getAllWords(uid)
      .then((savedWords) => {
        if (cancelled) return;
        setLoaded({ uid, words: savedWords });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Loading vocabulary failed:', error);
        setLoaded({ uid, words: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (status !== 'testing') return;

    function handleKeyDown(event) {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        flip();
      } else if (flipped && event.key === 'ArrowRight') {
        answer(true);
      } else if (flipped && event.key === 'ArrowLeft') {
        answer(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, flipped, flip, answer]);

  if (loading || loadingWords) {
    return <div className="p-8 text-neutral-400">Loading...</div>;
  }

  if (!signedIn) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-10 text-white">
        <h1 className="text-3xl font-semibold">Vocabulary</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Words you save while reading collect here.
        </p>

        <div className="mt-10 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <p className="text-sm text-neutral-300">
            Create an account to build your vocabulary.
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Looking words up is free, but saving them needs an account.
          </p>
          <Link
            to="/login"
            state={{ mode: 'signup', from: { pathname: '/vocabulary' } }}
            className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Create an account
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    return (
      <TestResult
        answers={answers}
        onRetryAll={() => start(words)}
        onRetryWrong={() => start(wrongWords)}
        onExit={exit}
      />
    );
  }

  if (status === 'testing' && currentWord) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-10 text-white">
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <span>
            {index + 1} / {total}
          </span>
          <button type="button" onClick={exit} className="hover:text-white">
            Quit
          </button>
        </div>

        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all duration-300"
            style={{ width: `${(index / total) * 100}%` }}
          />
        </div>

        <div className="mt-8">
          <Flashcard word={currentWord} flipped={flipped} onFlip={flip} />
        </div>

        {flipped ? (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => answer(false)}
              className="rounded-xl bg-neutral-800 py-3 text-sm font-medium text-white hover:bg-neutral-700"
            >
              Didn't know
            </button>
            <button
              type="button"
              onClick={() => answer(true)}
              className="rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white hover:bg-emerald-500"
            >
              I knew it
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={flip}
            className="mt-6 w-full rounded-xl bg-emerald-800 py-3 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Show the meaning
          </button>
        )}

        <p className="mt-4 text-center text-xs text-neutral-600">
          Space to flip · ← didn't know · → knew it
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10 text-white">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Vocabulary</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {words.length} {words.length === 1 ? 'word' : 'words'} saved
          </p>
        </div>
        <button
          type="button"
          onClick={() => start(words)}
          disabled={words.length === 0}
          className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-600"
        >
          Start flashcard test
        </button>
      </div>

      {words.length === 0 ? (
        <p className="mt-10 text-sm text-neutral-500">
          No words yet. Click a word while reading an article to save it here.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {words.map((word) => (
            <WordListItem key={word.id ?? word.word} word={word} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default Vocabulary;
