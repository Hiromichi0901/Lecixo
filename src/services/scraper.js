import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export const scrapeUrl = async (url) => {
  const scrapeFunction = httpsCallable(functions, 'scrapeUrl');
  const result = await scrapeFunction({ url });
  return result.data;
};