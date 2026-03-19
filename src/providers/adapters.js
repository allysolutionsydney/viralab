// ─── NEWS ADAPTERS ────────────────────────────────────────────────────────────

export async function fetchNews(provider, keys) {
  switch (provider) {
    case "hackernews": return fetchHackerNews();
    case "arxiv":      return fetchArxiv(keys.query || "artificial intelligence");
    case "newsapi":    return fetchNewsAPI(keys.apiKey);
    case "perplexity": return fetchPerplexityNews(keys.apiKey);
    default: throw new Error("Unknown news provider");
  }
}

async function fetchHackerNews() {
  const res = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
  const ids = await res.json();
  const top = ids.slice(0, 15);
  const items = await Promise.all(
    top.map(id => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json()))
  );
  return items.filter(i => i && i.title && i.url).map(i => ({
    id: String(i.id),
    title: i.title,
    url: i.url || `https://news.ycombinator.com/item?id=${i.id}`,
    summary: `${i.score} points · ${i.descendants || 0} comments`,
    source: "Hacker News",
    score: i.score,
  }));
}

async function fetchArxiv(query) {
  const encoded = encodeURIComponent(query);
  const res = await fetch(
    `https://export.arxiv.org/api/query?search_query=all:${encoded}&start=0&max_results=12&sortBy=submittedDate&sortOrder=descending`
  );
  const text = await res.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "text/xml");
  const entries = Array.from(xml.querySelectorAll("entry"));
  return entries.map(e => ({
    id: e.querySelector("id")?.textContent || Math.random().toString(),
    title: e.querySelector("title")?.textContent?.trim().replace(/\s+/g, " ") || "",
    url: e.querySelector("id")?.textContent || "",
    summary: e.querySelector("summary")?.textContent?.trim().slice(0, 160) + "...",
    source: "Arxiv",
    score: null,
  }));
}

async function fetchNewsAPI(apiKey) {
  if (!apiKey) throw new Error("NewsAPI key required");
  const res = await fetch(
    `https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=15&apiKey=${apiKey}`
  );
  const data = await res.json();
  if (data.status !== "ok") throw new Error(data.message || "NewsAPI error");
  return data.articles.map((a, i) => ({
    id: String(i),
    title: a.title,
    url: a.url,
    summary: a.description || "",
    source: a.source?.name || "NewsAPI",
    score: null,
  }));
}

async function fetchPerplexityNews(apiKey) {
  if (!apiKey) throw new Error("Perplexity key required");
  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "sonar",
      messages: [{ role: "user", content: "Give me the top 10 technology news stories today. Respond ONLY with a JSON array like: [{\"title\":\"...\",\"summary\":\"...\",\"url\":\"...\"}]" }],
    }),
  });
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "[]";
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);
  return parsed.map((a, i) => ({
    id: String(i),
    title: a.title,
    url: a.url || "#",
    summary: a.summary || "",
    source: "Perplexity",
    score: null,
  }));
}

// ─── SCRIPT ADAPTERS ─────────────────────────────────────────────────────────

const SCRIPT_SYSTEM = `You are an expert viral TikTok and Instagram Reels script writer for tech content. 
Write punchy, engaging 60-90 second scripts that:
- Hook viewers in the FIRST 3 SECONDS
- Use simple, conversational language
- Include natural pauses marked as [PAUSE]
- Build to a surprising or satisfying conclusion
- Feel like a knowledgeable friend explaining something cool

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "hook": "The opening line that grabs attention",
  "script": "Full spoken script with [PAUSE] markers",
  "caption": "Instagram caption (2-3 sentences, conversational)",
  "hashtags": "#tech #ai #technology ... (10-15 relevant hashtags)",
  "duration": "estimated seconds as a number",
  "title": "Short video title"
}`;

export async function generateScript(provider, keys, topic) {
  switch (provider) {
    case "anthropic": return generateWithAnthropic(keys.apiKey, topic);
    case "openai":    return generateWithOpenAI(keys.apiKey, topic);
    case "gemini":    return generateWithGemini(keys.apiKey, topic);
    case "grok":      return generateWithGrok(keys.apiKey, topic);
    default: throw new Error("Unknown script provider");
  }
}

async function generateWithAnthropic(apiKey, topic) {
  if (!apiKey) throw new Error("Anthropic API key required. Add it in Settings → Script Generator.");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SCRIPT_SYSTEM,
      messages: [{ role: "user", content: `Write a TikTok script about this tech topic: ${topic}` }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return parseScriptJSON(data.content?.[0]?.text);
}

async function generateWithOpenAI(apiKey, topic) {
  if (!apiKey) throw new Error("OpenAI API key required. Add it in Settings → Script Generator.");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "system", content: SCRIPT_SYSTEM }, { role: "user", content: `Write a TikTok script about: ${topic}` }],
      max_tokens: 1000,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return parseScriptJSON(data.choices?.[0]?.message?.content);
}

async function generateWithGemini(apiKey, topic) {
  if (!apiKey) throw new Error("Gemini API key required.");
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${SCRIPT_SYSTEM}\n\nWrite a TikTok script about: ${topic}` }] }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return parseScriptJSON(data.candidates?.[0]?.content?.parts?.[0]?.text);
}

async function generateWithGrok(apiKey, topic) {
  if (!apiKey) throw new Error("Grok API key required.");
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "grok-beta",
      messages: [{ role: "system", content: SCRIPT_SYSTEM }, { role: "user", content: `Write a TikTok script about: ${topic}` }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return parseScriptJSON(data.choices?.[0]?.message?.content);
}

function parseScriptJSON(text) {
  if (!text) throw new Error("Empty response from AI");
  const clean = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch {
    return { hook: "", script: text, caption: "", hashtags: "", duration: "75", title: "Tech Update" };
  }
}

// ─── VOICE ADAPTERS ───────────────────────────────────────────────────────────

export async function generateVoice(provider, keys, scriptText) {
  switch (provider) {
    case "elevenlabs": return generateElevenLabs(keys.apiKey, keys.voiceId, keys.modelId, scriptText);
    case "openai_tts": return generateOpenAITTS(keys.apiKey, keys.voice, scriptText);
    case "playht":     return generatePlayHT(keys.apiKey, keys.userId, keys.voiceId, scriptText);
    case "murf":       return generateMurf(keys.apiKey, keys.voiceId, scriptText);
    default: throw new Error("Unknown voice provider");
  }
}

async function generateElevenLabs(apiKey, voiceId, modelId, text) {
  if (!apiKey) throw new Error("ElevenLabs API key required. Add it in Settings → Voice Synthesis.");
  if (!voiceId) throw new Error("ElevenLabs Voice ID required. Find it in your ElevenLabs dashboard.");
  const model = modelId || "eleven_multilingual_v2";
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId.trim()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "xi-api-key": apiKey.trim() },
    body: JSON.stringify({ text, model_id: model, voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
  });
  if (!res.ok) {
    let errMsg = `ElevenLabs error: ${res.status}`;
    try {
      const err = await res.json();
      errMsg = err.detail?.message || err.detail || err.message || JSON.stringify(err) || errMsg;
    } catch {}
    throw new Error(errMsg);
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

async function generateOpenAITTS(apiKey, voice, text) {
  if (!apiKey) throw new Error("OpenAI API key required.");
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "tts-1-hd", voice: voice || "nova", input: text }),
  });
  if (!res.ok) throw new Error(`OpenAI TTS error: ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

async function generatePlayHT(apiKey, userId, voiceId, text) {
  if (!apiKey || !userId) throw new Error("PlayHT API key and User ID required.");
  const res = await fetch("https://api.play.ht/api/v2/tts/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json", "AUTHORIZATION": apiKey, "X-USER-ID": userId, "accept": "audio/mpeg" },
    body: JSON.stringify({ text, voice: voiceId, output_format: "mp3", voice_engine: "PlayHT2.0" }),
  });
  if (!res.ok) throw new Error(`PlayHT error: ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

async function generateMurf(apiKey, voiceId, text) {
  if (!apiKey) throw new Error("Murf API key required.");
  const res = await fetch("https://api.murf.ai/v1/speech/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": apiKey },
    body: JSON.stringify({ voiceId: voiceId || "en-US-natalie", text, format: "MP3", channelType: "MONO", sampleRate: 44100 }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  const audioRes = await fetch(data.audioFile);
  const blob = await audioRes.blob();
  return URL.createObjectURL(blob);
}

// ─── VIDEO ADAPTERS ───────────────────────────────────────────────────────────

export async function generateVideo(provider, keys, scriptText, audioUrl) {
  switch (provider) {
    case "tavus":     return generateTavus(keys.apiKey, keys.replicaId, scriptText);
    case "did":       return generateDID(keys.apiKey, keys.sourceUrl, audioUrl, scriptText);
    case "heygen":    return generateHeyGen(keys.apiKey, keys.avatarId, keys.voiceId, scriptText);
    case "synthesia": return generateSynthesia(keys.apiKey, keys.avatarId, scriptText);
    default: throw new Error("Unknown video provider");
  }
}

async function generateTavus(apiKey, replicaId, script) {
  if (!apiKey) throw new Error("Tavus API key required. Add it in Settings → Video Generation.");
  if (!replicaId) throw new Error("Tavus Replica ID required.");
  const res = await fetch("https://tavusapi.com/v2/videos", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({ replica_id: replicaId, script, video_name: `viralab_${Date.now()}` }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Tavus error: ${res.status}`);
  return { videoId: data.video_id, status: "processing", provider: "tavus", apiKey };
}

async function generateDID(apiKey, sourceUrl, audioUrl, script) {
  if (!apiKey) throw new Error("D-ID API key required.");
  if (!sourceUrl) throw new Error("D-ID Presenter Image URL required.");
  const body = audioUrl
    ? { source_url: sourceUrl, script: { type: "audio", audio_url: audioUrl } }
    : { source_url: sourceUrl, script: { type: "text", input: script, provider: { type: "microsoft", voice_id: "en-US-JennyNeural" } } };
  const res = await fetch("https://api.d-id.com/talks", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Basic ${apiKey}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.description || `D-ID error: ${res.status}`);
  return { videoId: data.id, status: "processing", provider: "did", apiKey };
}

async function generateHeyGen(apiKey, avatarId, voiceId, script) {
  if (!apiKey) throw new Error("HeyGen API key required.");
  if (!avatarId) throw new Error("HeyGen Avatar ID required.");
  const res = await fetch("https://api.heygen.com/v2/video/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": apiKey },
    body: JSON.stringify({
      video_inputs: [{ character: { type: "avatar", avatar_id: avatarId }, voice: { type: "text", input_text: script, voice_id: voiceId || "" } }],
      dimension: { width: 1080, height: 1920 },
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "HeyGen error");
  return { videoId: data.data?.video_id, status: "processing", provider: "heygen", apiKey };
}

async function generateSynthesia(apiKey, avatarId, script) {
  if (!apiKey) throw new Error("Synthesia API key required.");
  const res = await fetch("https://api.synthesia.io/v2/videos", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": apiKey },
    body: JSON.stringify({
      test: false,
      title: `Viralab ${Date.now()}`,
      input: [{ avatarId: avatarId || "anna_costume1_cameraA", scriptText: script }],
      aspectRatio: "9:16",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Synthesia error: ${res.status}`);
  return { videoId: data.id, status: "processing", provider: "synthesia", apiKey };
}

// Poll for video completion
export async function pollVideoStatus(videoJob) {
  const { videoId, provider, apiKey } = videoJob;
  switch (provider) {
    case "tavus": {
      const res = await fetch(`https://tavusapi.com/v2/videos/${videoId}`, { headers: { "x-api-key": apiKey } });
      const data = await res.json();
      return { status: data.status === "ready" ? "done" : "processing", url: data.download_url || data.stream_url };
    }
    case "did": {
      const res = await fetch(`https://api.d-id.com/talks/${videoId}`, { headers: { "Authorization": `Basic ${apiKey}` } });
      const data = await res.json();
      return { status: data.status === "done" ? "done" : "processing", url: data.result_url };
    }
    case "heygen": {
      const res = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, { headers: { "X-Api-Key": apiKey } });
      const data = await res.json();
      return { status: data.data?.status === "completed" ? "done" : "processing", url: data.data?.video_url };
    }
    case "synthesia": {
      const res = await fetch(`https://api.synthesia.io/v2/videos/${videoId}`, { headers: { "Authorization": apiKey } });
      const data = await res.json();
      return { status: data.status === "complete" ? "done" : "processing", url: data.download };
    }
    default: return { status: "done", url: null };
  }
}
