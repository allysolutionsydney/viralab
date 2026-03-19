import { useState, useEffect } from "react";
import { DEFAULT_CONFIG } from "./providers/registry";
import Header from "./components/Header";
import Overview from "./components/Overview";
import Settings from "./components/Settings";
import Trigger from "./components/Trigger";
import Pipeline from "./components/Pipeline";
import Toast from "./components/Toast";
import "./styles.css";

const STORAGE_KEY = "viralab_config_v1";

export default function App() {
  const [page, setPage] = useState("overview");
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return DEFAULT_CONFIG;
      const parsed = JSON.parse(saved);
      const merged = { ...DEFAULT_CONFIG };
      Object.keys(DEFAULT_CONFIG).forEach(slot => {
        merged[slot] = {
          ...DEFAULT_CONFIG[slot],
          ...parsed[slot],
          keys: { ...(DEFAULT_CONFIG[slot]?.keys || {}), ...(parsed[slot]?.keys || {}) },
        };
      });
      return merged;
    } catch { return DEFAULT_CONFIG; }
  });
  const [toast, setToast] = useState(null);
  const [triggerData, setTriggerData] = useState(null); // { prompt, stepProviders }

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch {}
  }, [config]);

  const showToast = (msg, type = "info") => setToast({ msg, type, id: Date.now() });

  const updateProvider = (slot, selectedId) => {
    setConfig(prev => ({ ...prev, [slot]: { ...prev[slot], selected: selectedId } }));
  };

  const updateKey = (slot, key, value) => {
    setConfig(prev => ({ ...prev, [slot]: { ...prev[slot], keys: { ...prev[slot].keys, [key]: value } } }));
  };

  const handleTriggerStart = (data) => {
    setTriggerData(data);
    setPage("pipeline");
  };

  const handlePipelineReset = () => {
    setTriggerData(null);
    setPage("trigger");
  };

  return (
    <div className="app">
      <Header page={page} setPage={setPage} />
      {toast && <Toast key={toast.id} toast={toast} onDone={() => setToast(null)} />}

      {page === "overview"  && <Overview config={config} setPage={setPage} />}
      {page === "settings"  && <Settings config={config} updateProvider={updateProvider} updateKey={updateKey} showToast={showToast} />}
      {page === "trigger"   && <Trigger config={config} onStart={handleTriggerStart} showToast={showToast} setPage={setPage} />}
      {page === "pipeline"  && <Pipeline config={config} showToast={showToast} setPage={setPage} triggerData={triggerData} onReset={handlePipelineReset} />}
    </div>
  );
}
