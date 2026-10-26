import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { saveWord } from "../services/vocabulary";
import useDictionary from "../hooks/useDictionary";
import useJisho from "../hooks/useJisho";

function highlightWord(sentence, word) {
    const parts = sentence.split(new RegExp(`(${word})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === word.toLowerCase()
        ? <mark key={index} className="bg-emerald-800 text-emerald-200 rounded px-0.5">{part}</mark>
        : part
    );
  }

function VocabCard({word, sentence,onClose, articleUrl, articleTitle}) {
    const { data, loading, error } = useDictionary(word);
    const { data: japanese, loading: japaneseLoading } = useJisho(word);
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    // The card stays mounted while `word` changes, so save state is tagged with
    // the word it belongs to rather than reset, otherwise the next word would
    // inherit the previous one's "Saved".
    const [saveState, setSaveState] = useState({ word: null, status: 'idle', error: null });

    const definition = data?.meanings?.[0]?.definitions?.[0]?.definition;
    const pronunciation = data?.phonetic || data?.phonetics?.[0]?.text;
    const partOfSpeech = data?.meanings?.[0]?.partOfSpeech;
    const example = data?.meanings?.[0]?.definitions?.[0]?.example;

    const isCurrentWord = saveState.word === word;
    const saving = isCurrentWord && saveState.status === 'saving';
    const saved = isCurrentWord && saveState.status === 'saved';
    const saveError = isCurrentWord ? saveState.error : null;

    const lookingUp = loading || japaneseLoading;
    const hasEnglish = Boolean(definition);
    // Jisho can report a match while leaving `kanji` blank, in which case the
    // kana reading is the only Japanese form available to show.
    const japaneseText = japanese?.found ? (japanese.kanji || japanese.reading) : '';
    const hasJapanese = Boolean(japaneseText);
    const noResults = !lookingUp && !error && !hasEnglish && !hasJapanese;
    const canSave = !lookingUp && (hasEnglish || hasJapanese);
    const signedIn = Boolean(user) && !user.isAnonymous;

    async function handleSave() {
      if(saving || saved) return;

      // Anonymous visitors can look words up but not keep them, so saving sends
      // them to sign up instead of attempting a write they aren't allowed.
      if(!signedIn) {
        navigate('/login', {
          state: {
            mode: 'signup',
            from: {
              pathname: location.pathname,
              search: location.search,
              state: location.state,
            },
          },
        });
        return;
      }

      setSaveState({ word, status: 'saving', error: null });

      try {
        await saveWord(user.uid, {
          word,
          definitionEn: definition || "",
          definitionJa: japanese?.kanji || "",
          exampleSentence: sentence || example || "",
          sourceArticleUrl: articleUrl || null,
          sourceArticleTitle: articleTitle || null,
        })
        setSaveState({ word, status: 'saved', error: null });
      } catch {
        setSaveState({
          word,
          status: 'idle',
          error: "Could not save that word. Please try again.",
        });
      }
    }

  return (
    <div className="w-full max-w-md rounded-2xl bg-neutral-900 p-6 text-white shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-semibold">{word}</h2>
            {partOfSpeech && (
                <span className="text-sm text-neutral-500">{partOfSpeech}</span>
            )}
          </div>
          {pronunciation && (
            <p className="mt-1 text-sm text-neutral-500">{pronunciation}</p>
          )}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 transition hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      <div className="my-5 border-t border-neutral-800" />

      <div className="space-y-5">
        {lookingUp && (
            <p className="text-sm text-neutral-500">Loading...</p>
        )}
        {!lookingUp && error && (
            <p className="text-sm text-neutral-500">{error}</p>
        )}
        {noResults && (
            <div>
                <p className="text-sm text-neutral-400">
                    No results for "{word}".
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                    Double-check the spelling, or try the word's base form.
                </p>
            </div>
        )}
        {!lookingUp && hasEnglish && (
            <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Definition
                </p>
                <p className="text-sm text-neutral-500">{definition}</p>
            </div>
        )}
        
        {!lookingUp && hasJapanese && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              日本語
            </p>
            <p className="text-sm leading-relaxed text-neutral-400 italic">{japaneseText}</p>
          </div>
        )}
      

        {sentence && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                In this article
              </p>
              <p className="text-sm leading-relaxed text-neutral-400 italic">
                "{highlightWord(sentence, word)}"
              </p>
            </div>
          )}
          
          {example && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Dictionary example
              </p>
              <p className="text-sm leading-relaxed text-neutral-400 italic">
                "{example}"
              </p>
            </div>
          )}
        
      </div>

      {canSave && (
        <>
          <button
            type="button"
            onClick={handleSave}
            disabled={saved || saving}
            className="mt-6 w-full rounded-xl bg-emerald-800 py-3 text-sm font-medium text-white"
          >
            {saved ? "✓ Saved to vocabulary" : saving ? "Saving..." : "Save to vocabulary"}
          </button>

          {saveError && (
            <p className="mt-2 text-sm text-neutral-500">{saveError}</p>
          )}
        </>
      )}
    </div>
  );
}

export default VocabCard;
