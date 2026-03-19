import { useState, useEffect, useRef } from "react";
import { PROVIDERS } from "../providers/registry";
import { fetchNews, generateScript, generateVoice, generateVideo, pollVideoStatus } from "../providers/adapters";

const STEP_COLORS = ["var(--cyan)", "var(--red)", "var(--yellow)", "var(--purple)", "var(--teal)"];

export default function Pipeline({ config, showToast, setPage, triggerData, onReset }) {
  const [completedStep, setCompletedStep] = useState(0);
  const [news, setNews] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [script, setScript] = useState(null);
  const [editedScript, setEditedScript] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [videoJob, setVideoJob] = useState(null);
  const [loading, setLoading] = useState({});
  const audioRef = useRef(null);
  const pollRef = useRef(null);

  // Provider overrides from Trigger screen
  const providers = triggerData?.stepProviders || {
    news:    config.news.selected,
    script:  config.script.selected,
    voice:   config.voice.selected,
    video:   config.video.selected,
    publish: config.publish.selected,
  };

  const prompt = triggerData?.prompt || "";

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);
  // Auto-fetch on mount if we have a trigger
  useEffect(() => {
    if (triggerData) handleFetchNews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLoad = (key, val) => setLoading(l => ({ ...l, [key]: val }));

  const getKeys = (slot) => {
    const merged = { ...(config[slot]?.keys || {}) };
    return merged;
  };

  const providerName = (slot) => {
    const pid = providers[slot];
    return PROVIDERS[slot]?.find(p => p.id === pid)?.name || pid;
  };

  // ── STEP 1: Fetch / Trigger
  const handleFetchNews = async () => {
    setLoad("news", true);
    try {
      const keys = { ...getKeys("news") };
      // Inject prompt as query for providers that support it
      if (prompt) keys.query = prompt;
      const stories = await fetchNews(providers.news, keys);
      setNews(stories);
      setCompletedStep(s => Math.max(s, 1));
      showToast(`Fetched ${stories.length} stories via ${providerName("news")}`, "success");
    } catch (e) {
      showToast(e.message, "error");
    }
    setLoad("news", false);
  };

  // ── STEP 2: Generate Script
  const handleGenerateScript = async () => {
    if (!selectedStory) return showToast("Select a story first", "error");
    setLoad("script", true);
    try {
      const topic = selectedStory.title + (selectedStory.summary ? ". " + selectedStory.summary : "");
      const contextualTopic = prompt ? `Context: ${prompt}\n\nStory: ${topic}` : topic;
      const result = await generateScript(providers.script, getKeys("script"), contextualTopic);
      setScript(result);
      setEditedScript(result.script || "");
      setCompletedStep(s => Math.max(s, 2));
      showToast("Script generated!", "success");
    } catch (e) {
      showToast(e.message, "error");
    }
    setLoad("script", false);
  };

  // ── STEP 3: Generate Voice
  const handleGenerateVoice = async () => {
    if (!editedScript) return showToast("No script to synthesize", "error");
    setLoad("voice", true);
    if (audioUrl) { URL.revokeObjectURL(audioUrl); setAudioUrl(null); }
    try {
      const voiceKeys = getKeys("voice");
      if (providers.voice === "elevenlabs") {
        if (!voiceKeys.apiKey) throw new Error("ElevenLabs API key missing. Go to Settings → Voice Synthesis.");
        if (!voiceKeys.voiceId) throw new Error("ElevenLabs Voice ID missing. Go to Settings → Voice Synthesis.");
      }
      const url = await generateVoice(providers.voice, voiceKeys, editedScript);
      setAudioUrl(url);
      setCompletedStep(s => Math.max(s, 3));
      showToast("Voice synthesized!", "success");
    } catch (e) {
      showToast(e.message, "error");
    }
    setLoad("voice", false);
  };

  // ── STEP 4: Generate Video
  const handleGenerateVideo = async () => {
    setLoad("video", true);
    try {
      const job = await generateVideo(providers.video, getKeys("video"), editedScript, audioUrl);
      setVideoJob({ ...job, status: "processing" });
      showToast("Video submitted! Polling every 8s (2–5 min)...", "info");
      pollRef.current = setInterval(async () => {
        try {
          const result = await pollVideoStatus({ ...job });
          if (result.status === "done") {
            clearInterval(pollRef.current);
            setVideoJob(j => ({ ...j, status: "done", url: result.url }));
            setCompletedStep(s => Math.max(s, 4));
            showToast("🎬 Video ready!", "success");
          }
        } catch {}
      }, 8000);
    } catch (e) {
      showToast(e.message, "error");
    }
    setLoad("video", false);
  };

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text).then(() => showToast(`${label} copied!`, "success"));
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement("a"); a.href = audioUrl; a.download = "viralab_voice.mp3"; a.click();
  };

  return (
    <div className="page fade-in">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h2 className="page-title">Run Pipeline</h2>
          {prompt && (
            <div style={{ marginTop: 6, padding: "7px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text2)", maxWidth: 520, lineHeight: 1.5 }}>
              🎯 <em>{prompt.length > 100 ? prompt.slice(0, 100) + "…" : prompt}</em>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage("settings")}>⚙ Settings</button>
          <button className="btn btn-ghost btn-sm" onClick={onReset}>← New Video</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        {/* ── STEP 1: TRIGGER / NEWS ─── */}
        <StepCard
          num={1} color={STEP_COLORS[0]} done={completedStep >= 1}
          title="Fetch Stories"
          meta={`via ${providerName("news")}`}
          action={
            <button className="btn btn-sm" style={{ background: "var(--cyan)", color: "#000" }} onClick={handleFetchNews} disabled={loading.news}>
              {loading.news ? <><span className="spinner" /> Fetching...</> : news.length ? "↺ Refresh" : "Fetch Stories"}
            </button>
          }
        >
          {news.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>Select a story to continue ↓</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 340, overflowY: "auto" }}>
                {news.map(story => (
                  <div key={story.id} onClick={() => { setSelectedStory(story); setCompletedStep(s => Math.max(s, 1)); }}
                    style={{
                      padding: "11px 16px", borderRadius: 8, cursor: "pointer",
                      background: selectedStory?.id === story.id ? "rgba(0,229,204,0.06)" : "var(--bg2)",
                      border: selectedStory?.id === story.id ? "1px solid rgba(0,229,204,0.35)" : "1px solid var(--border)",
                      transition: "all 0.12s",
                    }}
                  >
                    <div style={{ fontSize: 12, color: selectedStory?.id === story.id ? "#fff" : "var(--text2)", lineHeight: 1.4, marginBottom: 4 }}>{story.title}</div>
                    {story.summary && <div style={{ fontSize: 10, color: "var(--text3)", lineHeight: 1.4 }}>{story.summary}</div>}
                    <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 4 }}>
                      {story.source}{story.score ? ` · ▲ ${story.score}` : ""}
                      <a href={story.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: "var(--cyan)", marginLeft: 8, textDecoration: "none" }}>↗ read</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </StepCard>

        {/* ── STEP 2: SCRIPT ─── */}
        <StepCard
          num={2} color={STEP_COLORS[1]} done={completedStep >= 2} locked={completedStep < 1}
          title="Generate Script"
          meta={`via ${providerName("script")}${selectedStory ? ` · "${selectedStory.title.slice(0, 45)}…"` : ""}`}
          action={
            <button className="btn btn-sm" style={{ background: "var(--red)", color: "#fff" }} onClick={handleGenerateScript} disabled={loading.script || completedStep < 1 || !selectedStory}>
              {loading.script ? <><span className="spinner" /> Generating...</> : script ? "↺ Regenerate" : "Generate Script"}
            </button>
          }
        >
          {script && (
            <div style={{ marginTop: 20 }}>
              {script.hook && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(255,107,107,0.05)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
                  <span style={{ fontSize: 9, color: "var(--red)", letterSpacing: 1.5, flexShrink: 0, paddingTop: 2, textTransform: "uppercase", fontWeight: 700 }}>Hook</span>
                  <span style={{ fontSize: 12, color: "#ddd", fontStyle: "italic", lineHeight: 1.5 }}>{script.hook}</span>
                </div>
              )}
              <div style={{ marginBottom: 8 }}>
                <label>Script (editable)</label>
                <textarea rows={9} value={editedScript} onChange={e => setEditedScript(e.target.value)} style={{ fontSize: 12, lineHeight: 1.8 }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <button className="btn btn-sm" style={{ background: "var(--bg3)", color: "var(--text2)", border: "1px solid var(--border2)" }} onClick={() => copyText(editedScript, "Script")}>Copy Script</button>
                {script.caption && <button className="btn btn-sm" style={{ background: "var(--bg3)", color: "var(--text2)", border: "1px solid var(--border2)" }} onClick={() => copyText(script.caption + "\n\n" + script.hashtags, "Caption")}>Copy Caption</button>}
                {script.duration && <span style={{ fontSize: 10, color: "var(--text3)", marginLeft: "auto" }}>⏱ ~{script.duration}s</span>}
              </div>
              {script.caption && (
                <div style={{ marginTop: 12, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>Instagram Caption</div>
                  <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.7, marginBottom: 8 }}>{script.caption}</div>
                  <div style={{ fontSize: 11, color: "#E1306C", lineHeight: 1.8, wordBreak: "break-word" }}>{script.hashtags}</div>
                </div>
              )}
            </div>
          )}
        </StepCard>

        {/* ── STEP 3: VOICE ─── */}
        <StepCard
          num={3} color={STEP_COLORS[2]} done={completedStep >= 3} locked={completedStep < 2}
          title="Synthesize Voice"
          meta={`via ${providerName("voice")}`}
          action={
            <button className="btn btn-sm" style={{ background: "var(--yellow)", color: "#000" }} onClick={handleGenerateVoice} disabled={loading.voice || completedStep < 2}>
              {loading.voice ? <><span className="spinner" style={{ borderTopColor: "#000" }} /> Synthesizing...</> : audioUrl ? "↺ Regenerate" : "Generate Voice"}
            </button>
          }
        >
          {audioUrl && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", gap: 3, alignItems: "center", height: 36, marginBottom: 12 }}>
                {[...Array(28)].map((_, i) => (
                  <div key={i} className="wave-bar" style={{ height: `${16 + Math.sin(i * 0.7) * 12}px`, animationDelay: `${i * 0.04}s` }} />
                ))}
              </div>
              <audio ref={audioRef} src={audioUrl} controls style={{ width: "100%", borderRadius: 8, outline: "none", marginBottom: 10 }} />
              <button className="btn btn-sm" style={{ background: "var(--bg3)", color: "var(--text2)", border: "1px solid var(--border2)" }} onClick={downloadAudio}>↓ Download MP3</button>
            </div>
          )}
        </StepCard>

        {/* ── STEP 4: VIDEO ─── */}
        <StepCard
          num={4} color={STEP_COLORS[3]} done={completedStep >= 4} locked={completedStep < 3}
          title="Generate Video"
          meta={`via ${providerName("video")}`}
          action={
            <button className="btn btn-sm" style={{ background: "var(--purple)", color: "#fff" }} onClick={handleGenerateVideo}
              disabled={loading.video || completedStep < 3 || videoJob?.status === "processing"}>
              {loading.video ? <><span className="spinner" /> Submitting…</>
                : videoJob?.status === "processing" ? <><div className="pulse-dot" style={{ width: 7, height: 7 }} /> Processing…</>
                : videoJob?.status === "done" ? "↺ Regenerate"
                : "Generate Video"}
            </button>
          }
        >
          {videoJob && (
            <div style={{ marginTop: 20 }}>
              {videoJob.status === "processing" && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: "rgba(199,125,255,0.06)", border: "1px solid rgba(199,125,255,0.2)", borderRadius: 10 }}>
                  <div className="pulse-dot" />
                  <div>
                    <div style={{ fontSize: 12, color: "var(--purple)", fontWeight: 600 }}>Generating your video…</div>
                    <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 3 }}>Typically 2–5 minutes. Polling every 8s.</div>
                  </div>
                </div>
              )}
              {videoJob.status === "done" && videoJob.url && (
                <div>
                  <video src={videoJob.url} controls style={{ width: "100%", maxWidth: 360, borderRadius: 10, border: "1px solid var(--border)" }} />
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <a href={videoJob.url} download="viralab_video.mp4" className="btn btn-sm" style={{ background: "var(--bg3)", color: "var(--text2)", border: "1px solid var(--border2)", textDecoration: "none" }}>
                      ↓ Download Video
                    </a>
                  </div>
                </div>
              )}
              {videoJob.status === "done" && !videoJob.url && (
                <div style={{ padding: "14px 18px", background: "rgba(199,125,255,0.06)", border: "1px solid rgba(199,125,255,0.2)", borderRadius: 10, fontSize: 12, color: "var(--purple)" }}>
                  ✓ Video submitted. Check your {providerName("video")} dashboard.
                </div>
              )}
            </div>
          )}
        </StepCard>

        {/* ── STEP 5: PUBLISH ─── */}
        <StepCard
          num={5} color={STEP_COLORS[4]} done={completedStep >= 5} locked={completedStep < 4}
          title="Publish"
          meta={`via ${providerName("publish")}`}
        >
          {completedStep >= 4 && (
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {script?.caption && (
                  <button className="btn btn-sm" style={{ background: "var(--bg3)", color: "var(--text2)", border: "1px solid var(--border2)" }}
                    onClick={() => copyText((script?.caption || "") + "\n\n" + (script?.hashtags || ""), "Caption + Hashtags")}>
                    📋 Copy Caption
                  </button>
                )}
                <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: "#E1306C", color: "#fff", textDecoration: "none" }}>📸 Instagram</a>
                <a href="https://www.tiktok.com/upload" target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: "#010101", color: "#fff", border: "1px solid #333", textDecoration: "none" }}>🎵 TikTok</a>
              </div>
              <div style={{ padding: "12px 16px", background: "rgba(78,205,196,0.05)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 8, fontSize: 11, color: "var(--teal)" }}>
                ✓ Pipeline complete! Your video is ready.
              </div>
              <button className="btn btn-sm" style={{ background: "var(--teal)", color: "#000", alignSelf: "flex-start" }} onClick={onReset}>
                ↺ Start New Video
              </button>
            </div>
          )}
        </StepCard>

      </div>
    </div>
  );
}

function StepCard({ num, color, done, locked, title, meta, action, children }) {
  return (
    <div className="card" style={{
      padding: 24, opacity: locked ? 0.38 : 1,
      transition: "opacity 0.3s, border-color 0.3s",
      borderColor: done ? `${color}30` : "var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
          background: done ? color : "var(--bg3)",
          color: done ? "#000" : "var(--text3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 800, transition: "all 0.3s",
          boxShadow: done ? `0 0 18px ${color}44` : "none",
        }}>
          {done ? "✓" : num}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", fontFamily: "'Syne',sans-serif" }}>{title}</div>
          <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2, letterSpacing: 0.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meta}</div>
        </div>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      </div>
      {children}
    </div>
  );
}
