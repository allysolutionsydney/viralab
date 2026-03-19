import { useState } from "react";
import { PROVIDERS, SLOT_META } from "../providers/registry";

export default function Settings({ config, updateProvider, updateKey, showToast }) {
  const [activeSlot, setActiveSlot] = useState("news");

  const slot = activeSlot;
  const meta = SLOT_META[slot];
  const providers = PROVIDERS[slot];
  const slotConfig = config[slot];
  const selectedProvider = providers.find(p => p.id === slotConfig.selected);

  const handleSave = () => {
    try {
      localStorage.setItem("viralab_config_v1", JSON.stringify(config));
      showToast("Settings saved to your browser.", "success");
    } catch {
      showToast("Failed to save settings.", "error");
    }
  };

  return (
    <div className="page fade-in">
      <h2 className="page-title">Provider Settings</h2>
      <p className="page-subtitle">Choose your provider for each pipeline step. API keys are saved locally in your browser only — never sent to any server.</p>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20, alignItems: "start" }}>
        {/* Slot Tabs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {Object.entries(SLOT_META).map(([s, m]) => {
            const prov = PROVIDERS[s].find(p => p.id === config[s].selected);
            const hasKeys = prov?.fields?.length === 0 || prov?.fields?.every(f => config[s].keys[f.key]);
            const active = activeSlot === s;
            return (
              <button key={s} onClick={() => setActiveSlot(s)} style={{
                background: active ? "rgba(255,255,255,0.04)" : "transparent",
                border: active ? `1px solid ${m.color}33` : "1px solid transparent",
                borderRadius: 10, padding: "14px 16px", cursor: "pointer",
                textAlign: "left", display: "flex", alignItems: "center", gap: 12,
                transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 18, color: active ? m.color : "var(--text3)" }}>{m.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: active ? "#fff" : "var(--text2)", letterSpacing: 0.3 }}>{m.label}</div>
                  <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prov?.name}</div>
                </div>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: (prov?.free || hasKeys) ? "var(--cyan)" : "var(--red)", flexShrink: 0 }} />
              </button>
            );
          })}
          <button className="btn btn-primary btn-sm" style={{ marginTop: 8, justifyContent: "center" }} onClick={handleSave}>
            Save Settings
          </button>
        </div>

        {/* Config Panel */}
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid ${meta.color}22` }}>
            <span style={{ fontSize: 24, color: meta.color }}>{meta.icon}</span>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: "#fff" }}>{meta.label}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>Step {meta.step} of 5</div>
            </div>
          </div>

          {/* Provider Grid */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ marginBottom: 12, display: "block" }}>Select Provider</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {providers.map(p => {
                const active = slotConfig.selected === p.id;
                return (
                  <button key={p.id} onClick={() => updateProvider(slot, p.id)} style={{
                    background: active ? `${meta.color}0A` : "var(--bg2)",
                    border: active ? `1px solid ${meta.color}55` : "1px solid var(--border)",
                    borderRadius: 10, padding: "14px 16px", cursor: "pointer",
                    textAlign: "left", transition: "all 0.15s",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: active ? "#fff" : "var(--text2)" }}>{p.name}</span>
                      <div style={{ display: "flex", gap: 5 }}>
                        {p.free && <span className="badge-free">FREE</span>}
                        {active && <span style={{ fontSize: 12, color: meta.color, fontWeight: 700 }}>✓</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text3)", lineHeight: 1.5 }}>{p.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fields */}
          {selectedProvider?.fields?.length > 0 ? (
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 18, letterSpacing: 0.5 }}>
                API Credentials for <span style={{ color: "#ccc" }}>{selectedProvider.name}</span>
              </div>
              {selectedProvider.fields.map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <label>{f.label}</label>
                  <input
                    type={f.type || "text"}
                    placeholder={f.placeholder || ""}
                    value={slotConfig.keys[f.key] || ""}
                    onChange={e => updateKey(slot, f.key, e.target.value)}
                  />
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, padding: "10px 12px", background: "var(--bg)", borderRadius: 7, border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12 }}>🔒</span>
                <span style={{ fontSize: 10, color: "var(--text3)" }}>Keys are stored only in your browser's localStorage. Never transmitted to any server.</span>
              </div>
            </div>
          ) : (
            <div style={{ background: "rgba(0,229,204,0.04)", border: "1px solid rgba(0,229,204,0.15)", borderRadius: 10, padding: 20, fontSize: 12, color: "var(--cyan)" }}>
              ✅ No API key required for {selectedProvider?.name}. Ready to use!
            </div>
          )}

          {/* Provider Links */}
          <div style={{ marginTop: 20, fontSize: 11, color: "var(--text3)" }}>
            {slot === "script" && selectedProvider?.id === "anthropic" && (
              <span>Get your key at <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: "var(--cyan)" }}>console.anthropic.com</a></span>
            )}
            {slot === "voice" && selectedProvider?.id === "elevenlabs" && (
              <span>Get your key at <a href="https://elevenlabs.io" target="_blank" rel="noreferrer" style={{ color: "var(--cyan)" }}>elevenlabs.io</a> · Find Voice ID under Voices → click any voice</span>
            )}
            {slot === "video" && selectedProvider?.id === "tavus" && (
              <span>Get your key at <a href="https://tavus.io" target="_blank" rel="noreferrer" style={{ color: "var(--cyan)" }}>tavus.io</a> · Create a replica first to get your Replica ID</span>
            )}
            {slot === "video" && selectedProvider?.id === "did" && (
              <span>Get your key at <a href="https://studio.d-id.com" target="_blank" rel="noreferrer" style={{ color: "var(--cyan)" }}>studio.d-id.com</a> · Use a publicly accessible image URL for your presenter</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
