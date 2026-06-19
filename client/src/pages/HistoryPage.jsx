import { Download, Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import { useEffect, useState } from "react";
import http from "../api/http.js";
import { useToast } from "../context/ToastContext.jsx";

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();

  const loadHistory = () => {
    setLoading(true);
    http
      .get("/history")
      .then((res) => setAnalyses(res.data.analyses))
      .catch((error) => push(error.response?.data?.message || "Unable to load history", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(loadHistory, []);

  const remove = async (id) => {
    try {
      await http.delete(`/history/${id}`);
      setAnalyses((items) => items.filter((item) => item._id !== id));
      push("History item deleted");
    } catch (error) {
      push(error.response?.data?.message || "Delete failed", "error");
    }
  };

  const exportItem = (item) => {
    const doc = new jsPDF();
    doc.text("Truth Likelihood Analysis Report", 14, 18);
    doc.text(`Statement: ${item.statement}`, 14, 32, { maxWidth: 180 });
    doc.text(`Score: ${item.truthScore}%`, 14, 74);
    doc.text(`Sentiment: ${item.sentiment.label}`, 14, 84);
    doc.text(`Date: ${new Date(item.createdAt).toLocaleString()}`, 14, 94);
    doc.save(`analysis-${item._id}.pdf`);
  };

  return (
    <section className="card">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Analysis History</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Saved analyses are private to your account.</p>
        </div>
        <button className="btn-secondary" onClick={loadHistory}>Refresh</button>
      </div>
      {loading ? (
        <p>Loading history...</p>
      ) : analyses.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500 dark:border-slate-700">No analyses yet.</p>
      ) : (
        <div className="grid gap-4">
          {analyses.map((item) => (
            <article key={item._id} className="rounded-lg border border-slate-200/70 bg-white/55 p-4 dark:border-slate-700 dark:bg-slate-950/35">
              <div className="flex flex-col justify-between gap-3 md:flex-row">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
                  <p className="mt-2 font-semibold">{item.statement}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-bold text-white">{item.truthScore}%</span>
                  <button className="btn-secondary px-3" onClick={() => exportItem(item)} title="Export PDF"><Download size={17} /></button>
                  <button className="btn-secondary px-3 text-rose-600" onClick={() => remove(item._id)} title="Delete"><Trash2 size={17} /></button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-slate-200 px-3 py-1 dark:bg-slate-800">{item.predictionLabel}</span>
                <span className="rounded-full bg-slate-200 px-3 py-1 dark:bg-slate-800">{item.sentiment.label}</span>
                {item.suspiciousWords.map((word) => (
                  <span key={word.phrase} className="rounded-full bg-amber-300/75 px-3 py-1 text-slate-950">{word.phrase} x{word.count}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
