import { doc, setDoc, serverTimestamp, collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export async function saveWord(uid, wordData) {
  const wordId = wordData.word.toLowerCase();
  const wordRef = doc(db, "users", uid, "vocabulary", wordId);

  await setDoc(wordRef, {
    word: wordData.word,
    definitionEn: wordData.definitionEn,
    definitionJa: wordData.definitionJa,
    exampleSentence: wordData.exampleSentence,
    sourceArticleUrl: wordData.sourceArticleUrl,
    sourceArticleTitle: wordData.sourceArticleTitle,
    savedAt: serverTimestamp(),
    reviewCount: 0,
    lastReviewedAt: null,
  }, { merge: true });
}

export async function getAllWords(uid) {
  const vocabRef = collection(db, "users", uid, "vocabulary");
  const snapshot = await getDocs(vocabRef);
  return snapshot.docs.map((doc) => doc.data());
}
