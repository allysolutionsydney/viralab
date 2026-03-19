// ─── PROVIDER REGISTRY ───────────────────────────────────────────────────────
// Each slot has a list of providers. Adding a new provider = adding an entry here.

export const PROVIDERS = {
  news: [
    {
      id: "hackernews",
      name: "Hacker News",
      free: true,
      description: "Top tech stories from the HN community",
      fields: [],
    },
    {
      id: "arxiv",
      name: "Arxiv",
      free: true,
      description: "Latest academic research papers",
      fields: [
        { key: "query", label: "Search Query", type: "text", placeholder: "e.g. large language models", default: "artificial intelligence" },
      ],
    },
    {
      id: "newsapi",
      name: "NewsAPI",
      free: false,
      description: "Curated tech headlines from 80,000+ sources",
      fields: [
        { key: "apiKey", label: "API Key", type: "password", placeholder: "Enter NewsAPI key..." },
      ],
    },
    {
      id: "perplexity",
      name: "Perplexity",
      free: false,
      description: "AI-powered research summaries",
      fields: [
        { key: "apiKey", label: "API Key", type: "password", placeholder: "Enter Perplexity key..." },
      ],
    },
  ],

  script: [
    {
      id: "anthropic",
      name: "Claude (Anthropic)",
      description: "Best for creative, nuanced scripts",
      fields: [
        { key: "apiKey", label: "Anthropic API Key", type: "password", placeholder: "sk-ant-..." },
      ],
    },
    {
      id: "openai",
      name: "GPT-4o (OpenAI)",
      description: "Reliable, fast script generation",
      fields: [
        { key: "apiKey", label: "OpenAI API Key", type: "password", placeholder: "sk-..." },
      ],
    },
    {
      id: "gemini",
      name: "Gemini (Google)",
      description: "Google's latest multimodal model",
      fields: [
        { key: "apiKey", label: "Gemini API Key", type: "password", placeholder: "Enter Gemini key..." },
      ],
    },
    {
      id: "grok",
      name: "Grok (xAI)",
      description: "xAI's model with real-time knowledge",
      fields: [
        { key: "apiKey", label: "Grok API Key", type: "password", placeholder: "Enter Grok key..." },
      ],
    },
  ],

  voice: [
    {
      id: "elevenlabs",
      name: "ElevenLabs",
      description: "Most realistic voice cloning available",
      fields: [
        { key: "apiKey", label: "API Key", type: "password", placeholder: "Enter ElevenLabs key..." },
        { key: "voiceId", label: "Voice ID", type: "text", placeholder: "e.g. 21m00Tcm4TlvDq8ikWAM" },
        { key: "modelId", label: "Model", type: "text", placeholder: "eleven_turbo_v2 (default)", default: "eleven_turbo_v2" },
      ],
    },
    {
      id: "openai_tts",
      name: "OpenAI TTS",
      description: "Fast, affordable text-to-speech",
      fields: [
        { key: "apiKey", label: "OpenAI API Key", type: "password", placeholder: "sk-..." },
        { key: "voice", label: "Voice", type: "text", placeholder: "alloy / echo / fable / onyx / nova / shimmer", default: "nova" },
      ],
    },
    {
      id: "playht",
      name: "PlayHT",
      description: "Ultra-realistic voice cloning",
      fields: [
        { key: "apiKey", label: "API Key", type: "password", placeholder: "Enter PlayHT key..." },
        { key: "userId", label: "User ID", type: "text", placeholder: "Enter User ID..." },
        { key: "voiceId", label: "Voice ID / Clone URL", type: "text", placeholder: "s3://voice-cloning-zero-shot/..." },
      ],
    },
    {
      id: "murf",
      name: "Murf AI",
      description: "Studio-quality AI voices",
      fields: [
        { key: "apiKey", label: "API Key", type: "password", placeholder: "Enter Murf key..." },
        { key: "voiceId", label: "Voice ID", type: "text", placeholder: "en-US-natalie" },
      ],
    },
  ],

  video: [
    {
      id: "tavus",
      name: "Tavus",
      description: "Clone your face & voice — most realistic",
      fields: [
        { key: "apiKey", label: "API Key", type: "password", placeholder: "Enter Tavus key..." },
        { key: "replicaId", label: "Replica ID", type: "text", placeholder: "Your face replica ID" },
      ],
    },
    {
      id: "did",
      name: "D-ID",
      description: "Animate a photo with your voice",
      fields: [
        { key: "apiKey", label: "API Key (Base64)", type: "password", placeholder: "Enter D-ID basic auth key..." },
        { key: "sourceUrl", label: "Presenter Image URL", type: "text", placeholder: "https://... (public image URL)" },
      ],
    },
    {
      id: "heygen",
      name: "HeyGen",
      description: "High-quality avatar videos",
      fields: [
        { key: "apiKey", label: "API Key", type: "password", placeholder: "Enter HeyGen key..." },
        { key: "avatarId", label: "Avatar ID", type: "text", placeholder: "Your avatar ID" },
        { key: "voiceId", label: "HeyGen Voice ID", type: "text", placeholder: "Voice ID from HeyGen" },
      ],
    },
    {
      id: "synthesia",
      name: "Synthesia",
      description: "Professional presenter videos",
      fields: [
        { key: "apiKey", label: "API Key", type: "password", placeholder: "Enter Synthesia key..." },
        { key: "avatarId", label: "Avatar ID", type: "text", placeholder: "anna_costume1_cameraA" },
      ],
    },
  ],

  publish: [
    {
      id: "manual",
      name: "Manual Export",
      free: true,
      description: "Download files and post manually",
      fields: [],
    },
    {
      id: "buffer",
      name: "Buffer",
      description: "Schedule posts across social platforms",
      fields: [
        { key: "accessToken", label: "Access Token", type: "password", placeholder: "Enter Buffer access token..." },
        { key: "profileId", label: "Instagram Profile ID", type: "text", placeholder: "Enter profile ID..." },
      ],
    },
    {
      id: "later",
      name: "Later",
      description: "Visual social media scheduler",
      fields: [
        { key: "apiKey", label: "API Key", type: "password", placeholder: "Enter Later key..." },
      ],
    },
  ],
};

export const SLOT_META = {
  news:    { icon: "◈", label: "News Source",       color: "#00E5CC", step: 1 },
  script:  { icon: "◆", label: "Script Generator",  color: "#FF6B6B", step: 2 },
  voice:   { icon: "◉", label: "Voice Synthesis",    color: "#FFD93D", step: 3 },
  video:   { icon: "▶", label: "Video Generation",   color: "#C77DFF", step: 4 },
  publish: { icon: "◎", label: "Publishing",         color: "#4ECDC4", step: 5 },
};

// ─── DEFAULT CONFIG ───────────────────────────────────────────────────────────
export const DEFAULT_CONFIG = {
  news:    { selected: "hackernews", keys: {} },
  script:  { selected: "anthropic",  keys: {} },
  voice:   { selected: "elevenlabs", keys: {} },
  video:   { selected: "tavus",      keys: {} },
  publish: { selected: "manual",     keys: {} },
};
