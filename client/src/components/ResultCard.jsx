import { Download, ShieldAlert } from "lucide-react";
import jsPDF from "jspdf";

export default function ResultCard({ analysis }) {
  if (!analysis) return null;

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Truth Likelihood Analysis Report", 14, 18);
    doc.setFontSize(11);
    doc.text("This report is an NLP likelihood estimate, not a lie detector result.", 14, 28);
    doc.text(`Date: ${new Date(analysis.createdAt).toLocaleString()}`, 14, 40);
    doc.text(`Truth Likelihood: ${analysis.truthScore}%`, 14, 50);
    doc.text(`Confidence: ${analysis.confidence}%`, 14, 60);
    doc.text(`Prediction Label: ${analysis.predictionLabel}`, 14, 70);
    doc.text(`Sentiment: ${analysis.sentiment.label}`, 14, 80);
    doc.text("Statement:", 14, 94);
    doc.text(doc.splitTextToSize(analysis.statement, 180), 14, 102);
    doc.save("truth-likelihood-report.pdf");
  };

  return (
    <section className="card">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Truth Likelihood</p>
          <div className="mt-2 flex items-end gap-3">
            <span className="text-5xl font-black text-teal-700 dark:text-teal-300">{analysis.truthScore}%</span>
            <span className="pb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{analysis.predictionLabel}</span>
          </div>
        </div>
        <button className="btn-secondary" onClick={exportPdf}>
          <Download size={18} /> Export PDF
        </button>
      </div>
      <div className="mt-6 h-3 rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="h-3 rounded-full bg-teal-600" style={{ width: `${analysis.confidence}%` }} />
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Confidence meter: {analysis.confidence}%</p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200/70 p-4 dark:border-slate-700">
          <p className="text-xs uppercase text-slate-500">Sentiment</p>
          <p className="mt-1 text-lg font-bold">{analysis.sentiment.label}</p>
        </div>
        <div className="rounded-lg border border-slate-200/70 p-4 dark:border-slate-700">
          <p className="text-xs uppercase text-slate-500">Suspicious phrases</p>
          <p className="mt-1 text-lg font-bold">{analysis.suspiciousWords.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200/70 p-4 dark:border-slate-700">
          <p className="text-xs uppercase text-slate-500">Keywords</p>
          <p className="mt-1 text-lg font-bold">{analysis.keywordFrequency.length}</p>
        </div>
      </div>
      <div className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-400/10 dark:text-amber-100">
        <div className="mb-1 flex items-center gap-2 font-bold">
          <ShieldAlert size={17} /> AI Explanation
        </div>
        {analysis.explanation}
      </div>
    </section>
  );
}
