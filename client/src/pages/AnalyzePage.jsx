import { Mic, Play, RotateCcw, Wand2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import http from "../api/http.js";
import HighlightedStatement from "../components/HighlightedStatement.jsx";
import ResultCard from "../components/ResultCard.jsx";
import { useToast } from "../context/ToastContext.jsx";

const SpeechRecognition =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export default function AnalyzePage() {
  const [statement, setStatement] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState(false);
  const lastLiveText = useRef("");
  const { push } = useToast();

  const localSuspicious = useMemo(() => {
    const phrases = ["honestly", "trust me", "believe me", "definitely", "literally", "swear"];
    return phrases.filter((phrase) => new RegExp(`\\b${phrase.replace(" ", "\\s+")}\\b`, "i").test(statement));
  }, [statement]);

  const analyze = async (source = "manual") => {
    if (statement.trim().length < 8) {
      if (source === "manual") push("Enter a longer statement first", "error");
      return;
    }
    if (source === "live" && lastLiveText.current === statement.trim()) return;
    setLoading(true);
    try {
      const { data } = await http.post("/analyze", { statement });
      setAnalysis(data.analysis);
      lastLiveText.current = statement.trim();
      if (source === "manual") push("Analysis saved");
    } catch (error) {
      push(error.response?.data?.message || "Analysis failed", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!live) return;
    const timer = setTimeout(() => analyze("live"), 1400);
    return () => clearTimeout(timer);
  }, [statement, live]);

  const startVoice = () => {
    if (!SpeechRecognition) {
      push("Speech recognition is not supported in this browser", "error");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setStatement((current) => `${current} ${transcript}`.trim());
    };
    recognition.onerror = () => push("Voice input failed", "error");
    recognition.start();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
      <section className="card">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Statement Analysis</p>
            <h2 className="text-2xl font-bold">Estimate truth likelihood from language patterns</h2>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <input type="checkbox" className="h-4 w-4 accent-teal-600" checked={live} onChange={(e) => setLive(e.target.checked)} />
            Real-time
          </label>
        </div>
        <textarea
          className="input min-h-56 resize-y text-base leading-7"
          placeholder="Paste or speak a statement. The system returns an NLP likelihood score, not a certainty judgment."
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="btn-primary" onClick={() => analyze()} disabled={loading}>
            {loading ? <Wand2 className="animate-spin" size={18} /> : <Play size={18} />}
            {loading ? "Analyzing..." : "Analyze"}
          </button>
          <button className="btn-secondary" onClick={startVoice}>
            <Mic size={18} /> Voice Input
          </button>
          <button className="btn-secondary" onClick={() => { setStatement(""); setAnalysis(null); }}>
            <RotateCcw size={18} /> Reset
          </button>
        </div>
        <div className="mt-6">
          <p className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Suspicious phrase preview</p>
          <HighlightedStatement text={statement || "Suspicious phrases like honestly, trust me, believe me, definitely, literally, and swear will be highlighted here."} />
          <div className="mt-3 flex flex-wrap gap-2">
            {localSuspicious.map((phrase) => (
              <span key={phrase} className="rounded-full bg-amber-300/70 px-3 py-1 text-xs font-bold text-slate-950">{phrase}</span>
            ))}
          </div>
        </div>
      </section>
      <div className="grid gap-6">
        <ResultCard analysis={analysis} />
        <section className="card">
          <h3 className="text-lg font-bold">Responsible Use</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            This app compares linguistic signals with model patterns learned from public fact-checking data. It should support review workflows, not replace evidence, context, or human judgment.
          </p>
        </section>
      </div>
    </div>
  );
}
