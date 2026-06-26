import { useState, useEffect } from 'react';

function useDictionary(word) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!word) return;

    const fetchDefinition = async () => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const response = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
        );

        if (!response.ok) throw new Error('Word not found');

        const json = await response.json();
        setData(json[0]);
      } catch (err) {
        setError('No definition found.');
      } finally {
        setLoading(false);
      }
    };

    fetchDefinition();
  }, [word]);

  return { data, loading, error };
}

export default useDictionary;