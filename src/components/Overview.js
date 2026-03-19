import { PROVIDERS, SLOT_META } from "../providers/registry";

export default function Overview({ config, setPage }) {
  return (
    <div className="page fade-in">
      {/* Hero */}
      <div style={{ textAlign: "center", paddingBottom: 72 }}>
        <p style={{ fontSize: 10, letterSpacing: 4, color: "var(--cyan)", marginBottom: 20, textTransform: "uppercase" }}>
          AI Content Automation
        </p>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 58, fontWeight: 800, color: "#fff", lineHeight: 1.05, marginBottom: 22 }}>
          From Research<br />
          <span style={{ color: "var(--cyan)" }}>to Viral Video.</span>
        </h1>
        <p style={{ fontSize: 13, color: "var(--text3)", maxWidth: 460, margin: "0 auto 36px", lineHeight: 1.8 }}>
          A fully automated pipeline — fetch trending tech research, generate a script with AI, synthesize your voice, and produce a video. End to end.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={() => setPage("settings")}>Configure Providers →</button>
          <button className="btn btn-ghost" onClick={() => setPage("pipeline")}>Run Pipeline</button>
        </div>
      </div>

      {/* Pipeline Visual */}
      <div style={{ marginBottom: 72 }}>
        <p style={{ fontSize: 10, letterSpacing: 3, color: "var(--text3)", textAlign: "center", marginBottom: 32, textTransform: "uppercase" }}>Active Pipeline</p>
        <div style={{ display: "flex", alignItems: "stretch", justifyContent: "center", gap: 0, overflowX: "auto", padding: "4px 0" }}>
          {Object.entries(SLOT_META).map(([slot, meta], i) => {
            const selected = PROVIDERS[slot].find(p => p.id === config[slot].selected);
            const hasKeys = selected?.fields?.length === 0 ||
              selected?.fields?.every(f => config[slot].keys[f.key]);
            return (
              <div key={slot} style={{ display: "flex", alignItems: "center" }}>
                <div onClick={() => setPage("settings")} style={{
                  background: "var(--bg1)", border: "1px solid var(--border)",
                  borderRadius: 12, padding: "22px 20px", width: 148, textAlign: "center",
                  cursor: "pointer", position: "relative", overflow: "hidden",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${meta.color}18`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: meta.color }} />
                  <div style={{ fontSize: 26, color: meta.color, marginBottom: 10 }}>{meta.icon}</div>
                  <div style={{ fontSize: 9, color: "var(--text3)", letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>{meta.label}</div>
                  <div style={{ fontSize: 11, color: "#ccc", fontWeight: 600, marginBottom: 8 }}>{selected?.name}</div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 6, alignItems: "center" }}>
                    {selected?.free && <span className="badge-free">FREE</span>}
                    {!selected?.free && (
                      <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: hasKeys ? "rgba(0,229,204,0.08)" : "rgba(255,107,107,0.08)", color: hasKeys ? "var(--cyan)" : "var(--red)", border: `1px solid ${hasKeys ? "rgba(0,229,204,0.2)" : "rgba(255,107,107,0.2)"}` }}>
                        {hasKeys ? "READY" : "NEEDS KEY"}
                      </span>
                    )}
                  </div>
                </div>
                {i < 4 && (
                  <div style={{ color: "var(--border2)", fontSize: 18, padding: "0 6px", flexShrink: 0 }}>→</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 64 }}>
        {[
          { icon: "⚡", title: "Provider Agnostic", desc: "Swap any AI provider in seconds. Never locked in to one platform.", color: "var(--cyan)" },
          { icon: "◈", title: "Fully Modular", desc: "Each step is an independent slot — script, voice, video, publish.", color: "var(--red)" },
          { icon: "▶", title: "End-to-End", desc: "From trending tech news to a publishable video in minutes.", color: "var(--yellow)" },
          { icon: "◉", title: "Your Identity", desc: "Clone your voice and face. Every video sounds and looks like you.", color: "var(--purple)" },
        ].map(f => (
          <div key={f.title} className="card" style={{ padding: 24, transition: "border-color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#333"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
          >
            <div style={{ fontSize: 22, color: f.color, marginBottom: 12 }}>{f.icon}</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{f.title}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.7 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Quick Start */}
      <div className="card" style={{ padding: 32, borderColor: "rgba(0,229,204,0.15)" }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 20 }}>Quick Start Checklist</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { done: true, text: "News feed (Hacker News — no key needed)" },
            { done: false, text: "Add Anthropic API key for script generation" },
            { done: false, text: "Add ElevenLabs key + Voice ID for your voice" },
            { done: false, text: "Add Tavus or D-ID key for video generation" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--bg2)", borderRadius: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: item.done ? "var(--cyan)" : "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {item.done && <span style={{ fontSize: 9, color: "#000", fontWeight: 800 }}>✓</span>}
              </div>
              <span style={{ fontSize: 11, color: item.done ? "var(--text)" : "var(--text3)" }}>{item.text}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <button className="btn btn-primary btn-sm" onClick={() => setPage("settings")}>Add API Keys →</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage("pipeline")}>Skip, run anyway</button>
        </div>
      </div>
    </div>
  );
}
