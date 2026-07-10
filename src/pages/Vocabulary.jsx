import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { getAllWords } from "../services/vocabulary";

function Vocabulary() {
    const { user, loading } = useAuth();
    const [words, setWords] = useState([]);

    useEffect(() => {
        if(!user) return;

        getAllWords(user.uid).then((setWords))
    }, [user]);
    
    if(loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">vocabulary</h1>
            <ul>
                {words.map((word) => (
                    <li key={word.word}>{word.word}</li>
                ))}
            </ul>
        </div>
    )
}

export default Vocabulary;
