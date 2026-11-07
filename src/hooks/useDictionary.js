import { useState, useEffect } from 'react';

function useDictionary(word) {
  // Tagged with the word it belongs to, so a slow response for a previous
  // word can never be shown as the result for the current one.
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!word) return;

    let cancelled = false;

    const fetchDefinition = async () => {
      try {
        // Same-origin route so the browser never talks to dictionaryapi.dev.
        // Vite answers it during `npm run dev` (no Functions emulator). Firebase
        // Hosting rewrites it to the `dictionary` function once that is deployed.
        const response = await fetch(
          `/api/dictionary/en/${encodeURIComponent(word)}`
        );

        if (cancelled) return;

        // A 404 means the word simply isn't in the dictionary, which is a
        // normal outcome rather than a failure worth surfacing as an error.
        if (response.status === 404) {
          setResult({ word, data: null, error: null });
          return;
        }

        if (!response.ok) throw new Error('Lookup failed');

        const json = await response.json();
        if (cancelled) return;

        setResult({ word, data: json[0] ?? null, error: null });
      } catch {
        if (cancelled) return;
        setResult({ word, data: null, error: 'Could not reach the dictionary.' });
      }
    };

    fetchDefinition();

    return () => {
      cancelled = true;
    };
  }, [word]);

  const settled = result?.word === word;

  return {
    data: settled ? result.data : null,
    error: settled ? result.error : null,
    loading: Boolean(word) && !settled,
  };
}

export default useDictionary;
