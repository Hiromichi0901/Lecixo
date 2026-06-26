import { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';

function useJisho(word) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(()=>{
        if(!word) return;

        const fetchJapnese = async () => {
            setLoading(true);
            setError(null);
            setData(null);

            try {
                const getJapanese = httpsCallable(functions, 'getJapanese');
                const result = await getJapanese({word});
                setData(result.data);
            } catch (err) {
                setError('No Japanese translation found');
            } finally {
                setLoading(false);
            }
        };
        fetchJapnese();
    }, [word]);

    return {data, loading, error};
}

export default useJisho;