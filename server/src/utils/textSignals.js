const suspiciousPhrases = ["honestly", "trust me", "believe me", "definitely", "literally", "swear"];
const positiveWords = ["accurate", "clear", "confirmed", "growth", "improved", "success", "safe", "benefit"];
const negativeWords = ["fake", "false", "failed", "crisis", "danger", "worse", "loss", "corrupt", "harm"];

export const findSuspiciousWords = (text) => {
  const lower = text.toLowerCase();
  return suspiciousPhrases
    .map((phrase) => ({
      phrase,
      count: (lower.match(new RegExp(`\\b${phrase.replace(" ", "\\s+")}\\b`, "g")) || []).length
    }))
    .filter((item) => item.count > 0);
};

export const sentimentFromText = (text) => {
  const tokens = text.toLowerCase().match(/[a-z']+/g) || [];
  const positive = tokens.filter((token) => positiveWords.includes(token)).length;
  const negative = tokens.filter((token) => negativeWords.includes(token)).length;
  const score = positive - negative;
  const label = score > 0 ? "Positive" : score < 0 ? "Negative" : "Neutral";
  return { label, score };
};

export const keywordFrequency = (text) => {
  const stop = new Set(["the", "a", "an", "and", "or", "to", "of", "in", "is", "are", "was", "were", "for", "on", "with", "that"]);
  const counts = {};
  for (const token of text.toLowerCase().match(/[a-z']+/g) || []) {
    if (token.length < 4 || stop.has(token)) continue;
    counts[token] = (counts[token] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([keyword, count]) => ({ keyword, count }));
};

export const explanationFor = ({ truthScore, confidence, suspiciousWords, sentiment }) => {
  const phrasePart = suspiciousWords.length
    ? `It contains hedging or persuasion phrases such as ${suspiciousWords.map((x) => x.phrase).join(", ")}.`
    : "It does not contain the configured high-pressure persuasion phrases.";
  return `This score is an NLP likelihood estimate, not a certainty judgment. The model mapped the statement to a ${truthScore}% truth-likelihood score with ${confidence}% confidence. ${phrasePart} The sentiment appears ${sentiment.label.toLowerCase()}.`;
};
