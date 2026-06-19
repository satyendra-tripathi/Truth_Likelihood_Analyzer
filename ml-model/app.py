import os
import re
from pathlib import Path

import joblib
import nltk
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MODEL_PATH = Path(os.getenv("MODEL_PATH", Path(__file__).resolve().parent / "artifacts" / "model.pkl"))
VECTORIZER_PATH = Path(os.getenv("VECTORIZER_PATH", Path(__file__).resolve().parent / "artifacts" / "vectorizer.pkl"))
NLTK_DATA_DIR = Path(os.getenv("NLTK_DATA", Path(__file__).resolve().parents[1] / "nltk_data"))
os.environ["NLTK_DATA"] = str(NLTK_DATA_DIR)
nltk.data.path.insert(0, str(NLTK_DATA_DIR))

from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

model = None
vectorizer = None
lemmatizer = WordNetLemmatizer()


def ensure_nltk():
    try:
        NLTK_DATA_DIR.mkdir(parents=True, exist_ok=True)
        for package in ["punkt", "punkt_tab", "stopwords", "wordnet", "omw-1.4"]:
            nltk.download(package, download_dir=str(NLTK_DATA_DIR), quiet=True)
    except Exception as e:
        app.logger.warning(f"NLTK download failed, relying on local cache: {e}")


def clean_text(text: str) -> str:
    text = str(text).lower()
    text = re.sub(r"http\S+|www\S+", " ", text)
    text = re.sub(r"[^a-z\s']", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def preprocess_text(text: str) -> str:
    stops = set(stopwords.words("english"))
    tokens = nltk.word_tokenize(clean_text(text))
    tokens = [lemmatizer.lemmatize(token) for token in tokens if token not in stops and len(token) > 2]
    return " ".join(tokens)


def load_artifacts():
    global model, vectorizer
    if model is None or vectorizer is None:
        ensure_nltk()
        if not MODEL_PATH.exists() or not VECTORIZER_PATH.exists():
            raise FileNotFoundError("Missing model artifacts. Run: python train.py --train ../dataset/train.tsv --valid ../dataset/valid.tsv")
        model = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)


def score_from_probability(prob_true: float) -> int:
    return int(np.clip(round(prob_true * 100), 0, 100))


def label_from_score(score: int) -> str:
    if score >= 70:
        return "Likely truthful"
    if score >= 45:
        return "Uncertain / mixed signals"
    return "Lower truth likelihood"


@app.get("/health")
def health():
    return jsonify({"status": "ok", "service": "truth-likelihood-ml"})


@app.post("/predict")
def predict():
    payload = request.get_json(silent=True) or {}
    text = str(payload.get("text", "")).strip()
    if len(text) < 8:
        return jsonify({"message": "Text must be at least 8 characters"}), 400

    load_artifacts()
    features = vectorizer.transform([preprocess_text(text)])

    if hasattr(model, "predict_proba"):
        probability = float(model.predict_proba(features)[0][1])
    else:
        raw = float(model.decision_function(features)[0])
        probability = 1 / (1 + np.exp(-raw))

    truth_score = score_from_probability(probability)
    confidence = int(round(max(probability, 1 - probability) * 100))

    return jsonify(
        {
            "truthScore": truth_score,
            "confidence": confidence,
            "predictionLabel": label_from_score(truth_score),
            "disclaimer": "Likelihood estimate only; this system does not detect lies with certainty.",
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
