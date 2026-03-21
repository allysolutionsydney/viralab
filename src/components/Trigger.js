import { useState } from "react";
import { PROVIDERS, SLOT_META } from "../providers/registry";

const TEMPLATES = [
  {
    id: "breaking_news",
    icon: "⚡",
    label: "Breaking News",
    color: "#FF6B6B",
    prompt: "Cover the most important breaking news story today in tech or business. Make it urgent, factual, and shareable.",
    source: "newsapi",
  },
  {
    id: "tech_deepdive",
    icon: "🔬",
    label: "Tech Deep Dive",
    color: "#00E5CC",
    prompt: "Explain a complex emerging technology in simple terms. Break it down so anyone can understand why it matters.",
    source: "hackernews",
  },
  {
    id: "market_trends",
    icon: "📈",
    label: "Market Trends",
    color: "#FFD93D",
    prompt: "Analyse the hottest market trend right now — crypto, AI stocks, or startup funding. Give viewers an edge.",
    source: "perplexity",
  },
  {
    id: "ai_research",
    icon: "🧠",
    label: "AI Research",
    color: "#C77DFF",
    prompt: "Cover the latest breakthrough in AI research. Explain what it does, why it's exciting, and what it means for the future.",
    source: "arxiv",
  },
  {
    id: "product_launch",
    icon: "🚀",
    label: "Product Launch",
    color: "#4ECDC4",
    prompt: "React to a major product launch or announcement. Give your honest take on whether it's a game changer or just hype.",
    source: "hackernews",
  },
  {
    id: "viral_moment",
    icon: "🔥",
    label: "Viral Moment",
    color: "#FF9A3C",
    prompt: "Find the most talked-about story online right now and create a compelling reaction or explainer video about it.",
    source: "perplexity",
  },
];

export default function Trigger({ config, onStart, showToast }) {
  const [prompt, setPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [aiAssisting, setAiAssisting] = useState(false);

  // Per-step provider overrides (which configured providers to use for this run)
  const [stepProviders, setStepProviders] = useState({
    news:    config.news.selected,
    script:  config.script.selected,
    voice:   config.voice.selected,
    video:   config.video.selected,
    publish: config.publish.selected,
  });

  // Only show providers that have keys filled in (or are free)
  const configuredProviders = (slot) => {
    return PROVIDERS[slot].filter(p => {
      if (p.fields.length === 0) return true; // free / no keys needed
      return p.fields.every(f => config[slot]?.keys?.[f.key]);
    });
  };

  const pickTemplate = (tpl) => {
    setSelectedTemplate(tpl.id);
    setPrompt(tpl.prompt);
    // Auto-select a matching news source if configured
    const available = configuredProviders("news").map(p => p.id);
    if (available.includes(tpl.source)) {
      setStepProviders(prev => ({ ...prev, news: tpl.source }));
    }
  };

  const handleAIAssist = async () => {
    if (!prompt.trim()) return showToast("Enter a topic or rough idea first", "error");
    // Find a configured script provider to use for assist
    const scriptProvider = configuredProviders("script")[0];
    if (!scriptProvider) return showToast("Add a script provider API key in Settings first", "error");

    setAiAssisting(true);
    try {
      const apiKey = config.script.keys?.apiKey;
      let improvedPrompt = "";

      if (scriptProvider.id === "anthropic") {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
          body: JSON.stringify({
            model: "claude-opus-4-5",
            max_tokens: 200,
            messages: [{ role: "user", content: `Rewrite this video prompt to be more specific, engaging, and viral for a short-form social media video. Return ONLY the improved prompt, nothing else:\n\n"${prompt}"` }],
          }),
        });
        const data = await res.json();
        improvedPrompt = data.content?.[0]?.text?.trim() || "";
      } else if (scriptProvider.id === "openai") {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "gpt-4o",
            max_tokens: 200,
            messages: [
              { role: "system", content: "You improve video prompts to be more specific and viral. Return ONLY the improved prompt." },
              { role: "user", content: `Improve this prompt: "${prompt}"` },
            ],
          }),
        });
        const data = await res.json();
        improvedPrompt = data.choices?.[0]?.message?.content?.trim() || "";
      } else if (scriptProvider.id === "gemini") {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: `Rewrite this video prompt to be more engaging and specific for short-form social media. Return ONLY the improved prompt:\n\n"${prompt}"` }] }] }),
        });
        const data = await res.json();
        improvedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      }

      if (improvedPrompt) {
        setPrompt(improvedPrompt);
        showToast("✨ Prompt improved by AI!", "success");
      }
    } catch (e) {
      showToast("AI assist failed: " + e.message, "error");
    }
    setAiAssisting(false);
  };

  const handleLaunch = () => {
    if (!prompt.trim()) return showToast("Enter a prompt or pick a template", "error");
    onStart({ prompt, stepProviders });
  };

  const slots = ["news", "script", "voice", "video"];

  return (
    <div className="page fade-in">
      <h2 className="page-title">New Video</h2>
      <p className="page-subtitle">Choose a template or write your own prompt. Then configure which provider to use for each step.</p>

      {/* ── TEMPLATES ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: "var(--text3)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>Quick Templates</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {TEMPLATES.map(tpl => (
            <button key={tpl.id} onClick={() => pickTemplate(tpl)} style={{
              background: selectedTemplate === tpl.id ? `${tpl.color}12` : "var(--bg2)",
              border: selectedTemplate === tpl.id ? `1px solid ${tpl.color}55` : "1px solid var(--border)",
              borderRadius: 10, padding: "14px 16px", cursor: "pointer", textAlign: "left", transition: "all 0.15s",
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{tpl.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: selectedTemplate === tpl.id ? "#fff" : "var(--text2)" }}>{tpl.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── PROMPT BOX ── */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "var(--text3)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>Your Prompt</div>
        <textarea
          rows={4}
          placeholder="Describe what your video should be about... e.g. 'Explain why everyone is talking about AI agents and what it means for jobs'"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}
        />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className="btn btn-sm"
            style={{ background: "linear-gradient(135deg, #C77DFF, #00E5CC)", color: "#000", fontWeight: 700 }}
            onClick={handleAIAssist}
            disabled={aiAssisting}
          >
            {aiAssisting ? <><span className="spinner" style={{ borderTopColor: "#000" }} /> Improving...</> : "✨ AI Assist"}
          </button>
          <span style={{ fontSize: 10, color: "var(--text3)" }}>Let AI sharpen your prompt</span>
        </div>
      </div>

      {/* ── PROVIDER SELECTORS ── */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "var(--text3)", letterSpacing: 1, marginBottom: 16, textTransform: "uppercase" }}>Provider for Each Step</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {slots.map(slot => {
            const meta = SLOT_META[slot];
            const available = configuredProviders(slot);
            const current = stepProviders[slot];
            return (
              <div key={slot} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 16, color: meta.color }}>{meta.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)", letterSpacing: 0.3 }}>{meta.label}</span>
                </div>
                {available.length === 0 ? (
                  <div style={{ fontSize: 10, color: "var(--red)", padding: "6px 10px", background: "rgba(255,107,107,0.08)", borderRadius: 6 }}>
                    No provider configured · <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => {}}>Go to Settings</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {available.map(p => (
                      <button key={p.id} onClick={() => setStepProviders(prev => ({ ...prev, [slot]: p.id }))} style={{
                        background: current === p.id ? `${meta.color}12` : "transparent",
                        border: current === p.id ? `1px solid ${meta.color}44` : "1px solid transparent",
                        borderRadius: 7, padding: "7px 10px", cursor: "pointer", textAlign: "left", transition: "all 0.12s",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                      }}>
                        <span style={{ fontSize: 11, color: current === p.id ? "#fff" : "var(--text3)" }}>{p.name}</span>
                        {current === p.id && <span style={{ fontSize: 11, color: meta.color, fontWeight: 700 }}>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── LAUNCH ── */}
      <button
        className="btn btn-primary"
        style={{ width: "100%", padding: "16px", fontSize: 15, fontWeight: 700, justifyContent: "center" }}
        onClick={handleLaunch}
        disabled={!prompt.trim()}
      >
        🚀 Launch Pipeline
      </button>
    </div>
  );
}
