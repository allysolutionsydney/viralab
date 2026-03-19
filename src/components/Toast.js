import { useEffect, useState } from "react";

export default function Toast({ toast, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  const colors = {
    error:   { bg: "#2A0A0A", border: "#FF6B6B44", text: "#FF6B6B" },
    success: { bg: "#001A14", border: "#00E5CC44", text: "#00E5CC" },
    info:    { bg: "#1A1A1A", border: "#333",      text: "#ccc"     },
  };
  const c = colors[toast.type] || colors.info;

  return (
    <div style={{
      position: "fixed", top: 24, right: 24, zIndex: 9999,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      padding: "12px 20px", borderRadius: 10, fontSize: 12,
      fontFamily: "'JetBrains Mono',monospace", letterSpacing: 0.3,
      maxWidth: 380, lineHeight: 1.5,
      transition: "opacity 0.3s, transform 0.3s",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-8px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    }}>
      {toast.type === "error" && "✕ "}
      {toast.type === "success" && "✓ "}
      {toast.msg}
    </div>
  );
}
