# Pulli (புள்ளி) — a kolam co-creator

**ForgeHacks 2026 · Track: AI + Creativity**

Draw a kolam around a grid of dots, watch it mirror in perfect symmetry, and ask an AI to explain your pattern and the tradition behind it.

- **Live demo:** `[add Netlify link]`
- **Demo video:** `[add YouTube link]`
- **Team:** `[names and roles]`

## The problem

Kolam is the Tamil floor art drawn at doorsteps around a grid of dots (*pulli*). Behind its beauty is real mathematics: symmetry, repetition and loops. But it is learned almost entirely by watching elders, and that knowledge is fading as families move to cities and apartments. Young people who never learned it have no easy, playful way in.

## What Pulli does

- **Draw:** trace strokes around the dot grid with a mouse or finger. Strokes are mirrored live (4-way mirror, 4-fold rotation, or 8-way), so you see the symmetry *happen* instead of reading about it.
- **Complete it:** wraps every untouched dot in a small loop. This is a plain geometric rule, **not AI**.
- **Tell me about my kolam:** the app measures your drawing (which symmetries it has, how many dots are wrapped, how many are untouched) and an open-source LLM explains the pattern, with one gentle cultural note and an idea to try next.
- **Download** your kolam as a PNG, pick an ink colour, and pick a diamond or square dot grid (5, 7 or 9).

### Why the AI works this way

The AI **explains, it does not draw**. The person stays the artist, and the AI is a teacher. Two design choices keep it honest:

1. The drawing is measured **in code**, not guessed by the model. The model receives only whitelisted numbers (symmetry names, dot counts), never the image and never free text, and is told not to invent details or name a specific traditional pattern.
2. If the AI service is slow or unavailable, the app falls back to an **offline explanation** built from the same measurements, and it labels it as offline so nobody mistakes it for AI output.

## How it is built

| Part | Tech |
|---|---|
| Front end | HTML, CSS, vanilla JavaScript, HTML5 Canvas (no framework) |
| Symmetry, analysis, "Complete it" | `public/kolam-core.js` (pure JavaScript, unit-tested) |
| AI explanation | Featherless AI (OpenAI-compatible API, open-source LLM) |
| Server piece | Netlify Function (`netlify/functions/explain.js`), so the API key never reaches the browser |
| Hosting | Netlify |

```
public/
  index.html, style.css     UI
  app.js                    canvas, input, buttons, calls /api/explain
  kolam-core.js             symmetry, dot grids, analysis, offline explanation
netlify/functions/explain.js   validates input, builds the prompt, calls the LLM
dev-server.js               zero-dependency local server
test/                       17 tests (node:test)
```

## Run it locally

Requires Node 18+. There are no dependencies to install.

```bash
npm run dev     # http://localhost:8888
npm test        # 17 tests
```

Without a key the app works fully and shows the offline explanation. To try the AI path, copy `.env.example` to `.env` and add your `FEATHERLESS_API_KEY`.

## Deploy (Netlify)

1. Push this repo to GitHub and import it in Netlify (settings come from `netlify.toml`).
2. In **Site configuration → Environment variables**, add `FEATHERLESS_API_KEY`. Optionally add `FEATHERLESS_MODEL` (a model id from featherless.ai/models).
3. Deploy. The function is available at `/api/explain`.

## What works and what doesn't

**Works (tested):**
- Drawing with mouse or touch, with live 4-way mirror, 4-fold rotation, 8-way and free-draw modes.
- Diamond and square dot grids; undo, clear, ink colours, PNG export, autosave in the browser.
- Symmetry detection and dot counting, with unit tests including a test that the stats do not over-claim.
- "Complete it" (rule-based) and the offline explanation.
- The serverless function's validation, error handling and timeout behaviour, tested against a mocked AI response.

**Does not do (yet):**
- It does **not** check or generate true single-line **sikku kolams**. Pulli makes freehand symmetric kolams, and says so in the app.
- "Complete it" is a simple rule (a small loop around each empty dot), not a design engine.
- Drawing needs a pointer or touch; there is no keyboard-only drawing yet.
- The AI explanation needs a working Featherless key and model. Cultural remarks from an LLM can be wrong, so we asked it to keep them general, and we recommend having someone who draws kolams review them.
- Symmetry detection is approximate: a drawing counts as symmetric when 95% of its points have a partner within about one line-width.

## How we used AI

- **In the product:** one LLM call per explanation (Featherless AI), described above.
- **In development:** we used an AI coding assistant (Claude) to help write and test the code. `[Team: edit this line to reflect what each of you actually did.]`

## What's next

True single-loop (sikku) validation and generation, a library of traditional patterns to learn from, and sharing designs with family.

## Credits

Featherless AI for model credits, Netlify for hosting, and the kolam artists whose tradition this is built around.
