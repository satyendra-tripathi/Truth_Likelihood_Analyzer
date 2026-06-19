import Analysis from "../models/Analysis.js";

export const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const analyses = await Analysis.find({ userId }).sort({ createdAt: 1 }).lean();
    const totalAnalyses = analyses.length;
    const averageTruthScore = totalAnalyses
      ? Math.round(analyses.reduce((sum, item) => sum + item.truthScore, 0) / totalAnalyses)
      : 0;

    const sentimentDistribution = ["Positive", "Neutral", "Negative"].map((label) => ({
      name: label,
      value: analyses.filter((item) => item.sentiment?.label === label).length
    }));

    const dailyMap = new Map();
    const phraseMap = new Map();
    for (const item of analyses) {
      const day = new Date(item.createdAt).toISOString().slice(0, 10);
      dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
      for (const suspicious of item.suspiciousWords || []) {
        phraseMap.set(suspicious.phrase, (phraseMap.get(suspicious.phrase) || 0) + suspicious.count);
      }
    }

    const dailyActivity = [...dailyMap.entries()].map(([date, count]) => ({ date, count }));
    const topSuspiciousPhrases = [...phraseMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([phrase, count]) => ({ phrase, count }));

    res.json({ totalAnalyses, averageTruthScore, sentimentDistribution, dailyActivity, topSuspiciousPhrases });
  } catch (error) {
    next(error);
  }
};
