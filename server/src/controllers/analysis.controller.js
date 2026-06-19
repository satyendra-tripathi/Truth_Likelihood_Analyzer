import Analysis from "../models/Analysis.js";
import { analyzeWithModel } from "../services/ml.service.js";
import { explanationFor, findSuspiciousWords, keywordFrequency, sentimentFromText } from "../utils/textSignals.js";

const labelFromScore = (score) => {
  if (score >= 70) return "Likely truthful";
  if (score >= 45) return "Uncertain / mixed signals";
  return "Lower truth likelihood";
};

export const analyzeStatement = async (req, res, next) => {
  try {
    const statement = String(req.body.statement || "").trim();
    if (statement.length < 8) return res.status(400).json({ message: "Enter a statement with at least 8 characters" });
    if (statement.length > 2500) return res.status(400).json({ message: "Statement must be under 2500 characters" });

    const modelResult = await analyzeWithModel(statement);
    const truthScore = Math.round(Number(modelResult.truthScore ?? 50));
    const confidence = Math.round(Number(modelResult.confidence ?? 50));
    const suspiciousWords = findSuspiciousWords(statement);
    const sentiment = sentimentFromText(statement);
    const predictionLabel = modelResult.predictionLabel || labelFromScore(truthScore);
    const keywordFrequencyRows = keywordFrequency(statement);
    const explanation = explanationFor({ truthScore, confidence, suspiciousWords, sentiment });

    const analysis = await Analysis.create({
      userId: req.user._id,
      statement,
      truthScore,
      confidence,
      predictionLabel,
      sentiment,
      suspiciousWords,
      keywordFrequency: keywordFrequencyRows,
      explanation
    });

    res.status(201).json({ analysis });
  } catch (error) {
    if (error.code === "ECONNREFUSED" || error.response || error.request) {
      return res.status(503).json({ message: "ML service is unavailable. Start the Python service and try again." });
    }
    next(error);
  }
};
