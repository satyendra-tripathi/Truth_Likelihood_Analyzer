import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    statement: { type: String, required: true, trim: true },
    truthScore: { type: Number, required: true, min: 0, max: 100 },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    predictionLabel: { type: String, required: true },
    sentiment: {
      label: { type: String, enum: ["Positive", "Neutral", "Negative"], required: true },
      score: { type: Number, default: 0 }
    },
    suspiciousWords: [{ phrase: String, count: Number }],
    explanation: { type: String, required: true },
    keywordFrequency: [{ keyword: String, count: Number }]
  },
  { timestamps: true }
);

export default mongoose.model("Analysis", analysisSchema);
