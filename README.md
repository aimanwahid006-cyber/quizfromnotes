# QuizFromNotes 📚

### a. What it does & the problem it solves
**QuizFromNotes** turns your raw lecture notes (or even just a topic name) into an instant, AI-generated multiple-choice self-test — so you find out *before* the exam whether you actually understood the material, not during it.

**The real problem:** as a Computer Science student, I constantly sit down the night before an exam with a pile of notes and no fast way to check if I've actually retained anything — making flashcards or quiz questions by hand takes almost as long as studying itself. This app removes that friction: paste your notes, pick a difficulty and question count, and get a graded quiz in seconds. It's built for students, but works for anyone revising any topic.

### b. Live URL
🔗 **[https://YOUR-PROJECT-NAME.vercel.app](https://YOUR-PROJECT-NAME.vercel.app)** ← replace after deploying (see "How to run" below)

### c. Features
- Paste any lecture notes, a summary, or just a topic name
- Choose number of questions (3 / 5 / 8 / 10) and difficulty (easy / medium / hard)
- AI generates a multiple-choice quiz strictly from your content
- Take the quiz right in the browser, get instant grading with per-question explanations
- Correct/incorrect answers are visually highlighted after submission
- Score history is saved locally (per device) so you can track past attempts
- Fully responsive, no login required, no database needed

### d. The AI feature
The core AI feature is **quiz generation from arbitrary study content**, powered by a large language model called through the OpenRouter API (`/api/generate` serverless function). The exact system prompt I wrote and use is:

```
You are an exam-prep assistant for university students.
Given raw lecture notes, a summary, or just a topic name, generate a self-test multiple-choice quiz.

Rules you must follow exactly:
1. Create exactly {NUM_QUESTIONS} multiple-choice questions.
2. Base every question strictly on the provided content. Do not invent facts that contradict it. If the input is just a topic name (no real notes), use your own accurate knowledge of that topic instead.
3. Match the requested difficulty level: {DIFFICULTY}.
   - easy: definitions and direct recall.
   - medium: application and comparison between concepts.
   - hard: multi-step reasoning, edge cases, or "why" questions.
4. Each question must have exactly 4 options, with exactly ONE correct answer.
5. Keep each question and option concise (under 25 words each).
6. Provide a one-sentence explanation for why the correct answer is correct.
7. Respond with ONLY valid JSON, no markdown fences, no commentary, in exactly this shape:

{"questions":[{"question":"string","options":["string","string","string","string"],"answer":"string (must exactly match one of the options)","explanation":"string"}]}
```

The `{NUM_QUESTIONS}` and `{DIFFICULTY}` placeholders are filled in server-side based on what the user selects in the UI. The API key is never exposed to the browser — it's read from a server-side environment variable inside the serverless function.

### e. Tools, services, and AI models used
- **Frontend:** plain HTML, CSS, JavaScript (no framework — kept deliberately simple and dependency-free)
- **Backend:** a single Node.js serverless function (`api/generate.js`)
- **Hosting/Deployment:** Vercel
- **AI provider:** [OpenRouter](https://openrouter.ai) — model used: `meta-llama/llama-3.1-8b-instruct:free` (swappable via the `OPENROUTER_MODEL` env var to any model OpenRouter supports)
- **Version control:** Git + GitHub

### f. Screenshots
> Replace these with real screenshots after you deploy — take them from your live URL.

| Home / input screen | Generated quiz | Graded result |
|---|---|---|
| ![home](screenshots/home.png) | ![quiz](screenshots/quiz.png) | ![result](screenshots/result.png) |

### g. How to run this project

**Run locally:**
```bash
git clone https://github.com/YOUR_USERNAME/quizfromnotes.git
cd quizfromnotes
npm install -g vercel
cp .env.example .env
# edit .env and paste your real OpenRouter key
vercel dev
```
Then open the local URL it prints (usually `http://localhost:3000`).

**Deploy live (Vercel):**
1. Push this folder to a new **public** GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo.
3. In the Vercel project's **Settings → Environment Variables**, add:
   - `OPENROUTER_API_KEY` = your key from [openrouter.ai/keys](https://openrouter.ai/keys)
   - *(optional)* `OPENROUTER_MODEL` = a specific model id from [openrouter.ai/models](https://openrouter.ai/models)
4. Click **Deploy**. Vercel will give you a live `.vercel.app` URL — paste it into section (b) above.

No database, no build step, no extra config needed — it's a static site plus one serverless API route.

---
Built by Aiman.
