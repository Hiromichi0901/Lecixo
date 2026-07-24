import { useCallback, useMemo, useState } from 'react';

function shuffle(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function useFlashcardTest() {
  const [deck, setDeck] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [status, setStatus] = useState('idle');

  const start = useCallback((words) => {
    if (!words || words.length === 0) return;

    setDeck(shuffle(words));
    setIndex(0);
    setFlipped(false);
    setAnswers([]);
    setStatus('testing');
  }, []);

  const flip = useCallback(() => setFlipped((current) => !current), []);

  const answer = useCallback(
    (correct) => {
      const currentWord = deck[index];
      if (!currentWord) return;

      setAnswers((prev) => [...prev, { word: currentWord, correct }]);
      setFlipped(false);

      if (index + 1 >= deck.length) {
        setStatus('finished');
      } else {
        setIndex(index + 1);
      }
    },
    [deck, index]
  );

  const exit = useCallback(() => {
    setStatus('idle');
    setDeck([]);
    setIndex(0);
    setFlipped(false);
    setAnswers([]);
  }, []);

  const wrongWords = useMemo(
    () => answers.filter((entry) => !entry.correct).map((entry) => entry.word),
    [answers]
  );

  return {
    status,
    deck,
    index,
    flipped,
    answers,
    wrongWords,
    currentWord: deck[index] ?? null,
    total: deck.length,
    correctCount: answers.filter((entry) => entry.correct).length,
    start,
    flip,
    answer,
    exit,
  };
}
