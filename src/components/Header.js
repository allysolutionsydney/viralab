export default function Header({ page, setPage }) {
  const activePage = (page === "pipeline") ? "trigger" : page;

  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "18px 40px", borderBottom: "1px solid #1A1A1A",
      position: "sticky", top: 0, background: "rgba(8,8,8,0.92)",
      backdropFilter: "blur(12px)", zIndex: 200,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <polygon points="13,2 24,20 2,20" fill="#00E5CC" opacity="0.9"/>
          <polygon points="13,8 20,20 6,20" fill="#080808"/>
        </svg>
        <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, letterSpacing: 3, color: "#fff" }}>VIRALAB</span>
        <span style={{ fontSize: 9, padding: "2px 7px", background: "#1A1A1A", color: "#00E5CC", borderRadius: 4, letterSpacing: 2, border: "1px solid #242424" }}>BETA</span>
      </div>

      <nav style={{ display: "flex", gap: 6 }}>
        {[
          { id: "overview", label: "◈ Overview" },
          { id: "settings", label: "⚙ Settings" },
          { id: "trigger",  label: "▶ New Video" },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setPage(id)} style={{
            background: activePage === id ? "rgba(0,229,204,0.07)" : "transparent",
            border: activePage === id ? "1px solid rgba(0,229,204,0.3)" : "1px solid transparent",
            color: activePage === id ? "#00E5CC" : "#666",
            padding: "8px 18px", borderRadius: 7, cursor: "pointer",
            fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: 0.5,
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { if (activePage !== id) e.target.style.color = "#aaa"; }}
            onMouseLeave={e => { if (activePage !== id) e.target.style.color = "#666"; }}
          >
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
}
