import { useState, useEffect } from "react";
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
    const { data: japanese } = useJisho(word);
    const { user } = useAuth();
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);


    const definition = data?.meanings?.[0]?.definitions?.[0]?.definition;
    const pronunciation = data?.phonetic || data?.phonetics?.[0]?.text;
    const partOfSpeech = data?.meanings?.[0]?.partOfSpeech;
    const example = data?.meanings?.[0]?.definitions?.[0]?.example;

    async function handleSave() {
      if(!user || saving) return;

      setSaving(true);
      await saveWord(user.uid, {
        word,
        definitionEn: definition || "",
        definitionJa: japanese?.kanji || "",
        exampleSentence: sentence || example || "",
        sourceArticleUrl: articleUrl || null,
        sourceArticleTitle: articleTitle || null,
      })
      setSaving(false);
      setSaved(true);
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
        {loading && (
            <p className="text-sm text-neutral-500">Loading...</p>
        )}
        {error && (
            <p className="text-sm text-neutral-500">Error: {error}</p>
        )}
        {!loading && !error  && (
            <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Definition
                </p>
                <p className="text-sm text-neutral-500">{definition || 'No definition available.'}</p>
            </div>
        )}
        
        {japanese?.found&& (
          <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            日本語
          </p>
          <div className="text-sm leading-relaxed text-neutral-400 italic">
            {japanese.kanji && (
              <p className="text-sm leading-relaxed text-neutral-400 italic">{japanese.kanji}</p>
            )}
          </div>
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

      <button
        type="button"
        onClick={handleSave}
        disabled={saved || saving}
        className="mt-6 w-full rounded-xl bg-emerald-800 py-3 text-sm font-medium text-white"
      >
        {saved ? "✓ Saved to vocabulary" : saving ? "Saving..." : "Save to vocabulary"}
      </button>
    </div>
  );
}

export default VocabCard;
