import axios from "axios";

export const analyzeWithModel = async (statement) => {
  const mlUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";
  const { data } = await axios.post(
    `${mlUrl}/predict`,
    { text: statement },
    { timeout: 15000 }
  );
  return data;
};
