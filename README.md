# VIRALAB — AI Video Content Pipeline

A fully modular, provider-agnostic pipeline to go from trending tech research → AI script → voice synthesis → video generation → publish.

## Features
- **News**: Hacker News (free), Arxiv (free), NewsAPI, Perplexity
- **Script**: Claude (Anthropic), GPT-4o (OpenAI), Gemini, Grok
- **Voice**: ElevenLabs, OpenAI TTS, PlayHT, Murf AI
- **Video**: Tavus, D-ID, HeyGen, Synthesia
- **Publish**: Manual, Buffer, Later

---

## Local Development

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org))
- npm (comes with Node)

### Steps
```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/viralab.git
cd viralab

# 2. Install dependencies
npm install

# 3. Start dev server
npm start
# Opens at http://localhost:3000
```

---

## Deploy to GitHub + Vercel

### Step 1 — Push to GitHub

1. Go to [github.com](https://github.com) and click **New Repository**
2. Name it `viralab`, set to **Public** or **Private**, click **Create**
3. In your terminal (from the viralab folder):

```bash
git init
git add .
git commit -m "Initial commit — VIRALAB pipeline"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/viralab.git
git push -u origin main
```

> Replace `YOUR_USERNAME` with your actual GitHub username.

---

### Step 2 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Import your `viralab` repository
4. Vercel auto-detects it as a React app — **no config needed**
5. Click **Deploy**

Your app will be live at: `https://viralab.vercel.app` (or similar)

Every time you push to `main`, Vercel auto-deploys. ✅

---

## API Keys

All API keys are stored **only in your browser's localStorage** — never sent to any server.

| Step | Provider | Where to get key |
|------|----------|-----------------|
| Script | Anthropic | console.anthropic.com |
| Script | OpenAI | platform.openai.com |
| Voice | ElevenLabs | elevenlabs.io → Profile → API Key |
| Voice | OpenAI TTS | platform.openai.com (same key) |
| Video | Tavus | tavus.io → Settings → API |
| Video | D-ID | studio.d-id.com → Settings |
| Video | HeyGen | app.heygen.com → Settings → API |
| News | NewsAPI | newsapi.org/register |

---

## Project Structure

```
viralab/
├── public/
│   └── index.html
├── src/
│   ├── providers/
│   │   ├── registry.js     # All provider configs & metadata
│   │   └── adapters.js     # All real API call implementations
│   ├── components/
│   │   ├── Header.js
│   │   ├── Overview.js     # Landing/overview page
│   │   ├── Settings.js     # Provider config page
│   │   ├── Pipeline.js     # Main run pipeline page
│   │   └── Toast.js
│   ├── App.js
│   ├── styles.css
│   └── index.js
├── vercel.json
└── package.json
```

### Adding a New Provider
1. Open `src/providers/registry.js`
2. Add your provider entry to the relevant slot array
3. Open `src/providers/adapters.js`
4. Add your API call function and add it to the switch case

That's it — no other files need to change.

---

## License
MIT
