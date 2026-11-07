const { onCall, onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions');
const Mercury = require('@postlight/mercury-parser');
const axios = require('axios');
const { handleDictionary } = require('./dictionary');

setGlobalOptions({ maxInstances: 10 });

exports.scrapeUrl = onCall(async (request) => {
  const { url } = request.data;

  if (!url) {
    throw new Error('URL is required');
  }

  try {
    const result = await Mercury.parse(url);
    return {
      title: result.title,
      content: result.content,
      leadImage: result.lead_image_url,
      excerpt: result.excerpt,
      url: url,
    };
  } catch (error) {
    throw new Error('Failed to scrape URL: ' + error.message);
  }
});

exports.getJapanese = onCall(async (request) => {
  const { word } = request.data;

  if(!word) throw new Error('Word is required');

  try {
    const response = await axios.get(`https://jisho.org/api/v1/search/words?keyword=${word}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        }
    
      }
    );

    const data = response.data.data;

    if(!data || data.length === 0){
      return {found: false};
    }

    const first = data[0];
    const reading = first.japanese[0]?.reading || '';
    const kanji = first.japanese[0]?.word || '';
    const meanings = first.senses[0]?.english_definitions || [];

    return {
      found: true,
      reading,
      kanji,
      meanings: meanings.join(', '),
    };
  } catch (error) {
    console.error('Jisho error:', error.message);
    throw new Error('Failed to fetch Japanese translation');
  }
  
});

// English definitions. Hosting rewrites /api/dictionary/** here so production
// does not call dictionaryapi.dev from the browser. Dev serves the same path
// from Vite, because `npm run dev` connects every callable to the Functions
// emulator and that emulator is usually not running.
exports.dictionary = onRequest(
  { region: 'us-central1', invoker: 'public', timeoutSeconds: 20 },
  async (req, res) => {
    if (req.method !== 'GET') {
      res.set('Allow', 'GET');
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const result = await handleDictionary(req.originalUrl || req.url || '');
    if (result.status === 200) {
      res.set('Cache-Control', 'public, max-age=86400');
    }
    res.status(result.status).json(result.body);
  },
);