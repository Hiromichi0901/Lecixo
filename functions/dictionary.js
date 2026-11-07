const USER_AGENT =
  'Lexico/1.0 (https://github.com/Hiromichi0901/Lecixo; educational English reading app)';
const PRIMARY_TIMEOUT_MS = 4000;
const FALLBACK_TIMEOUT_MS = 6000;

// dictionaryapi.dev sits behind Cloudflare. Browser fetches (and many
// datacenter fetches) get a challenge or a 502 instead of JSON, which the
// client used to surface as "Could not reach the dictionary." Look the word
// up here, and fall back to Wiktionary when that host does not return a
// definition.
const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const WIKTIONARY_API = 'https://en.wiktionary.org/api/rest_v1/page/definition/';

let loggedPrimaryFailure = false;

function normalizeWord(raw) {
  if (typeof raw !== 'string') return null;

  let decoded = raw.trim();
  if (decoded.includes('%')) {
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      return null;
    }
  }

  const word = decoded
    .trim()
    .toLowerCase()
    .replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, '')
    .replace(/\s+/g, ' ');

  if (!word || word.length > 64) return null;
  // Letters, digits, spaces, hyphens, and apostrophes only, so the word
  // cannot change which host or path we request.
  if (!/^[a-z0-9]+(?:['-][a-z0-9]+)*(?: [a-z0-9]+(?:['-][a-z0-9]+)*)*$/.test(word)) {
    return null;
  }
  return word;
}

function wordFromRequestUrl(url) {
  const path = String(url || '').split('?')[0];
  const match = path.match(/\/en\/([^/]+)\/?$/);
  return match ? match[1] : null;
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function htmlToText(html) {
  if (!html) return '';
  const withoutTags = String(html)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '');
  return decodeEntities(withoutTags).replace(/\s+/g, ' ').trim();
}

function entryFromDictionaryApi(json) {
  if (!Array.isArray(json)) return null;
  return json.find((item) => item && Array.isArray(item.meanings)) || null;
}

function entryFromWiktionary(word, json) {
  const groups = Array.isArray(json?.en) ? json.en : [];
  const meanings = [];

  for (const group of groups) {
    const definitions = [];
    for (const sense of group.definitions || []) {
      const definition = htmlToText(sense.definition);
      if (!definition) continue;
      const example = htmlToText((sense.examples || [])[0]);
      definitions.push(example ? { definition, example } : { definition });
    }
    if (definitions.length === 0) continue;
    meanings.push({
      partOfSpeech: String(group.partOfSpeech || '').toLowerCase(),
      definitions,
    });
  }

  if (meanings.length === 0) return null;
  return { word, meanings };
}

async function fetchResponse(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
      },
      redirect: 'follow',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function readJson(response) {
  const type = response.headers.get('content-type') || '';
  const text = await response.text();
  if (!type.includes('json')) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function lookupDictionaryApi(word) {
  let response;
  try {
    response = await fetchResponse(
      `${DICTIONARY_API}${encodeURIComponent(word)}`,
      PRIMARY_TIMEOUT_MS,
    );
  } catch (error) {
    const reason = error.name === 'AbortError' ? 'timeout' : 'network';
    return { entry: null, reason };
  }

  if (response.status === 404) {
    return { entry: null, reason: 'not-found' };
  }

  const entry = entryFromDictionaryApi(await readJson(response));
  if (response.ok && entry) {
    return { entry, reason: null };
  }

  return { entry: null, reason: `status ${response.status}` };
}

async function lookupWiktionary(word) {
  let response;
  try {
    response = await fetchResponse(
      `${WIKTIONARY_API}${encodeURIComponent(word)}`,
      FALLBACK_TIMEOUT_MS,
    );
  } catch (error) {
    const reason = error.name === 'AbortError' ? 'timeout' : 'network';
    return { entry: null, reason };
  }

  if (response.status === 404) {
    return { entry: null, reason: 'not-found' };
  }

  const entry = entryFromWiktionary(word, await readJson(response));
  if (response.ok && entry) {
    return { entry, reason: null };
  }
  // 200 with no English senses is a real miss, not an outage.
  if (response.ok) {
    return { entry: null, reason: 'not-found' };
  }

  return { entry: null, reason: `status ${response.status}` };
}

function notePrimaryFailure(reason) {
  if (loggedPrimaryFailure) return;
  loggedPrimaryFailure = true;
  console.warn(
    `dictionaryapi.dev unavailable (${reason}); using Wiktionary for English definitions`,
  );
}

async function lookupEnglish(word) {
  const primary = await lookupDictionaryApi(word);
  if (primary.entry) return primary.entry;

  if (primary.reason !== 'not-found') notePrimaryFailure(primary.reason);

  const fallback = await lookupWiktionary(word);
  if (fallback.entry) return fallback.entry;
  if (fallback.reason === 'not-found' || primary.reason === 'not-found') return null;

  const error = new Error(`Dictionary lookup failed (${fallback.reason})`);
  throw error;
}

function notFoundBody(word) {
  return {
    title: 'No Definitions Found',
    message: word ? `No definitions found for "${word}".` : 'No definitions found.',
    resolution: 'Try the base form of the word.',
  };
}

// Same JSON shape the client already expects from dictionaryapi.dev:
// 200 → [entry], 404 → not in the dictionary.
async function handleDictionary(url) {
  const segment = wordFromRequestUrl(url);
  if (!segment) {
    return { status: 400, body: { error: 'Word is required' } };
  }

  const word = normalizeWord(segment);
  if (!word) {
    return { status: 404, body: notFoundBody(null) };
  }

  try {
    const entry = await lookupEnglish(word);
    if (!entry) {
      return { status: 404, body: notFoundBody(word) };
    }
    return { status: 200, body: [entry] };
  } catch (error) {
    console.error('Dictionary lookup failed:', error.message);
    return { status: 502, body: { error: 'Lookup failed' } };
  }
}

module.exports = {
  handleDictionary,
};
