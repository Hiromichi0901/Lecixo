# CLAUDE.md — Lexico

## What this is
Lexico is a contextual vocabulary-learning web app for **Japanese learners of English**.
Core loop: paste a URL → read the scraped article in-app → click any word → see an English
definition + Japanese translation → save it → review saved words with a flashcard test
(on the Vocabulary page; the old Quiz page was removed).
There is also a standalone `/dictionary` page for looking up words without an article.

- Sole developer: Hiro (CS student). Main purpose: portfolio project for internship applications,
  with real users (early tester is a native Japanese speaker learning English).
- **Current goal: ship a stable, deployed v1 by Sunday, Nov 1, 2026.** Prioritize reliability
  and polish of the existing loop over new features.

## Tech stack
- Frontend: React 19 + Vite 8, React Router 7, Tailwind CSS **v4** (`@import "tailwindcss"` + `@tailwindcss/vite`
  plugin — there is no `tailwind.config.js`-style v3 setup; don't add one).
- Backend: Firebase — Auth (anonymous + email/password), Firestore, Cloud Functions, Hosting.
- Cloud Functions use **CommonJS** (`require` / `module.exports`), not ESM. Node 24, `firebase-functions`
  v2 `onCall` callables; the frontend calls them with `httpsCallable`.
- External APIs:
  - Free Dictionary API (`dictionaryapi.dev`) — English definitions
  - Jisho API — Japanese translations, called through a Cloud Function proxy (`getJapanese`)
  - Mercury Parser — article scraping, inside the `scrapeUrl` Cloud Function

## Project layout & commands
The git repo's parent folder is `English Reading App/`; the actual app lives in `english-reading-app/`.
**Always run commands from inside `english-reading-app/`** — running from the parent fails (ENOENT).

Local dev needs two terminals:
```bash
# Terminal 1 — functions emulator
firebase emulators:start --only functions
# Terminal 2 — frontend (http://localhost:5173)
npm run dev
```
- Emulator UI: http://localhost:4000
- Functions have their own `package.json` in `functions/` — install deps there separately.
- Secrets live in `.env` (gitignored). When adding a new env var, also add it to `.env.example`.
- **Only the Functions emulator is wired up.** `src/services/firebase.js` calls `connectFunctionsEmulator`
  in dev, but not the Auth or Firestore emulators, so `npm run dev` reads/writes the **production**
  Firestore and Auth. `firebase.json` has no `emulators` section yet.
- Auth providers: `firebase.json` declares `auth.providers` (`emailPassword: true`, plus an unused
  `googleSignIn`), which `firebase deploy` can apply. **Anonymous auth is not declared there** but the app
  depends on it — make sure it's enabled in the Firebase Console (Authentication → Sign-in method).
  The Console is the reliable fallback for any provider.

Key files (verify paths before editing — this list may be incomplete):
- `src/services/firebase.js` — app init; exports `auth`, `db`, `functions`
- `src/services/auth.js` — email/password sign-up/log-in/log-out + friendly error messages
- `src/context/AuthProvider.jsx` (+ `AuthContext.js`) — auth state; signs visitors in anonymously.
  Read it via `src/hooks/useAuth.js`. "Signed in" means `user && !user.isAnonymous`.
- `src/services/vocabulary.js` — Firestore `saveWord` / `getAllWords`, path `users/{uid}/vocabulary/{word}`
  (doc id = lowercased word)
- `src/services/scraper.js` — calls the `scrapeUrl` function
- `src/hooks/useDictionary.js` — English definition lookup; `src/hooks/useJisho.js` — Japanese, via `getJapanese`
- `src/components/VocabCard.jsx` — word detail card + save button; **intentionally generic** (article-context
  props are optional so the Dictionary page reuses it). Keep it that way.
- `src/pages/`: `Home.jsx` (URL input), `Reader.jsx`, `Dictionary.jsx`, `Vocabulary.jsx`, `Login.jsx`
- `src/components/`: `ArticleContent.jsx`, `WordToken.jsx`, `Flashcard.jsx`, `WordListItem.jsx`, `TestResult.jsx`, `Navbar.jsx`
- `src/hooks/useFlashcardTest.js` — flashcard test state
- `functions/index.js` — `scrapeUrl`, `getJapanese`
- Empty placeholder files (0 bytes, unused): `src/services/claudeApi.js` (out of scope), `src/hooks/useVocabulary.js`,
  `src/components/WordPopup.jsx`. Home's article cards and counters ("19 Words Saved", etc.) are hardcoded mock data.

## Ship checklist (this week, in priority order)
1. **Fix the permanent "Loading..." on word click (CORS).** The browser calls `dictionaryapi.dev`
   directly and it doesn't reliably send `Access-Control-Allow-Origin`. Fix: add a Cloud Function that
   fetches the definition server-side (mirror the existing `getJapanese` proxy pattern), then point
   `useDictionary.js` at it. Handle 404 (word not found) as a normal "no definition" state, not an error.
   *Status: the 404 handling already exists in `useDictionary.js` (keep it). The proxy function does **not**
   exist yet — `useDictionary.js` still fetches `api.dictionaryapi.dev` directly.*
2. **Firestore security rules — urgent.** `firestore.rules` is still the default test-mode rule that allowed
   everything until **2026-07-22**; that date has passed, so it now **denies every client read/write**.
   Replace it: users can only read/write `users/{uid}/vocabulary/{word}` where `request.auth.uid == uid`
   and the user is not anonymous (`request.auth.token.firebase.sign_in_provider != 'anonymous'`).
   Anonymous users can look words up (that goes through Functions, not Firestore) but not save.
   Test with the Firestore emulator before deploying (needs emulator setup — see Local dev note above).
3. **Re-saving a word must not reset review progress.** Saving an already-saved word should update
   definition fields (or no-op) while preserving review/quiz stats.
   *Status: `saveWord` already uses `setDoc(..., { merge: true })`, but still resets progress because it
   writes `reviewCount: 0`, `lastReviewedAt: null`, and a fresh `savedAt` every time. Merge alone isn't
   enough — only set those fields when the doc is first created.*
4. **Every async UI path has loading, error, and empty states** — no infinite spinners anywhere
   (scrape failures, bad URLs, lookup failures, empty vocab list).
   (Example gap: Home's scrape `catch` only does `console.error` — the user sees no message.)
5. **Production deploy** to Firebase Hosting + Functions, then smoke-test the full loop on the live URL:
   scrape → click word → save (signed in) → review. Confirm functions work in prod, not just the emulator.
6. README with screenshots, live link, and a short "how it works" for recruiters.
   *Status: `README.md` is still the Vite template boilerplate (plus a stray "# Lecixo" typo line).*

**Out of scope until after launch** (don't start these unless asked): Claude API contextual explanations,
photo/OCR, YouTube captions, Chrome extension, payments, migrating off Firebase, swapping Mercury
Parser for `@mozilla/readability`.

## Conventions
- Keep Firestore/Auth calls centralized in a few service/hook files, not scattered through components.
- In `useEffect` async fetches, keep the `cancelled`-flag cleanup pattern to avoid state updates after
  unmount. Don't remove it.
- Server-side code is required for: CORS-blocked APIs, scraping arbitrary URLs, and hiding API keys.
  Never put a secret API key in frontend code.
- Product language: the target user is Japanese. Vocabulary-level signals are **Eiken grades / TOEIC
  bands** — not JLPT (JLPT tests Japanese, not English).
- Match existing code style; prefer small, focused changes over large refactors this week.

## Git workflow
- Small, verified changes → commit directly to `main`.
- Multi-step work that may leave the app broken → feature branch, merge when working.
- Commit messages: descriptive, multi-line (summary line + what/why).
- Don't commit `.env`, emulator data, or build output.

## How to work with Hiro
- **Plan before coding.** For anything non-trivial, give a short plan first and wait for a go-ahead.
- **One step at a time, verified end to end.** After each change, say exactly how to verify it
  (which page, what to click, what to expect) before moving on.
- **Explain the why briefly.** Hiro is learning React/Firebase and wants to understand changes, not just
  receive them. Short explanations; relate to Java/familiar concepts when helpful. Simpler re-explanations
  on request.
- Flag anything that needs manual action (Firebase Console settings, deploys, env vars) clearly.
- If something is ambiguous or a fix would touch many files, ask before proceeding.
