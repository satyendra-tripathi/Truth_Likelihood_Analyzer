const phrases = ["honestly", "trust me", "believe me", "definitely", "literally", "swear"];

export default function HighlightedStatement({ text }) {
  if (!text) return null;
  const pattern = new RegExp(`(${phrases.map((p) => p.replace(" ", "\\s+")).join("|")})`, "gi");
  const parts = text.split(pattern);
  return (
    <div className="rounded-lg border border-slate-200 bg-white/70 p-4 text-sm leading-7 dark:border-slate-700 dark:bg-slate-950/50">
      {parts.map((part, index) =>
        phrases.some((phrase) => phrase.toLowerCase() === part.toLowerCase().replace(/\s+/g, " ")) ? (
          <mark key={`${part}-${index}`} className="rounded bg-amber-300/70 px-1 py-0.5 text-slate-950">
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </div>
  );
}
