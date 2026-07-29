import { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';

function useJisho(word) {
    // Tagged with the word it belongs to, so a slow response for a previous
    // word can never be shown as the result for the current one.
    const [result, setResult] = useState(null);

    useEffect(()=>{
        if(!word) return;

        let cancelled = false;

        const fetchJapanese = async () => {
            try {
                const getJapanese = httpsCallable(functions, 'getJapanese');
                const response = await getJapanese({word});
                if (cancelled) return;
                setResult({word, data: response.data, error: null});
            } catch {
                if (cancelled) return;
                setResult({word, data: null, error: 'No Japanese translation found'});
            }
        };

        fetchJapanese();

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

export default useJisho;
