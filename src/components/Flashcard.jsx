function Flashcard({ word, flipped, onFlip }) {
  const hasMeaning = word.definitionEn || word.definitionJa;

  return (
    <div
      role="button"
      tabIndex={-1}
      onClick={onFlip}
      aria-label={flipped ? 'Show the word' : 'Show the meaning'}
      className="w-full cursor-pointer select-none perspective-distant"
    >
      <div
        className={`relative h-80 w-full transition-transform duration-500 transform-3d ${
          flipped ? 'rotate-y-180' : 'rotate-y-0'
        }`}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl backface-hidden">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            What does this mean?
          </p>
          <h2 className="text-center text-4xl font-semibold text-white">{word.word}</h2>
          <p className="text-xs text-neutral-600">Click the card to flip</p>
        </div>

        <div className="absolute inset-0 overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl rotate-y-180 backface-hidden">
          <h3 className="text-2xl font-semibold text-white">{word.word}</h3>

          <div className="mt-5 space-y-5">
            {word.definitionEn && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Definition
                </p>
                <p className="text-sm leading-relaxed text-neutral-300">{word.definitionEn}</p>
              </div>
            )}

            {word.definitionJa && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  日本語
                </p>
                <p className="text-sm leading-relaxed text-emerald-400">{word.definitionJa}</p>
              </div>
            )}

            {!hasMeaning && (
              <p className="text-sm text-neutral-500">No meaning was saved for this word.</p>
            )}

            {word.exampleSentence && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Example
                </p>
                <p className="text-sm italic leading-relaxed text-neutral-400">
                  "{word.exampleSentence}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Flashcard;
