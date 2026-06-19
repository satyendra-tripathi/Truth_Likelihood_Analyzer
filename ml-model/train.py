import argparse
import json
import os
import re
from pathlib import Path

import joblib
import nltk
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

NLTK_DATA_DIR = Path(__file__).resolve().parents[1] / "nltk_data"
os.environ["NLTK_DATA"] = str(NLTK_DATA_DIR)
nltk.data.path.insert(0, str(NLTK_DATA_DIR))

from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

LIAR_COLUMNS = [
    "id",
    "label",
    "statement",
    "subjects",
    "speaker",
    "job_title",
    "state",
    "party",
    "barely_true_count",
    "false_count",
    "half_true_count",
    "mostly_true_count",
    "pants_fire_count",
    "context",
]

TRUTH_MAP = {
    "pants-fire": 0,
    "false": 0,
    "barely-true": 0,
    "half-true": 1,
    "mostly-true": 1,
    "true": 1,
}

LABEL_TO_SCORE = {
    "pants-fire": 5,
    "false": 15,
    "barely-true": 35,
    "half-true": 55,
    "mostly-true": 78,
    "true": 95,
}


def ensure_nltk():
    NLTK_DATA_DIR.mkdir(parents=True, exist_ok=True)
    for package in ["punkt", "punkt_tab", "stopwords", "wordnet", "omw-1.4"]:
        nltk.download(package, download_dir=str(NLTK_DATA_DIR), quiet=True)


def load_liar(path: Path) -> pd.DataFrame:
    return pd.read_csv(path, sep="\t", names=LIAR_COLUMNS, quoting=3)


def clean_text(text: str) -> str:
    text = str(text).lower()
    text = re.sub(r"http\S+|www\S+", " ", text)
    text = re.sub(r"[^a-z\s']", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def preprocess_text(text: str) -> str:
    stops = set(stopwords.words("english"))
    lemmatizer = WordNetLemmatizer()
    tokens = nltk.word_tokenize(clean_text(text))
    tokens = [lemmatizer.lemmatize(token) for token in tokens if token not in stops and len(token) > 2]
    return " ".join(tokens)


def prepare_frame(df: pd.DataFrame) -> pd.DataFrame:
    df = df[["label", "statement"]].dropna().copy()
    df = df[df["label"].isin(TRUTH_MAP)]
    df["target"] = df["label"].map(TRUTH_MAP)
    df["truth_score_target"] = df["label"].map(LABEL_TO_SCORE)
    return df


def train(train_path: Path, valid_path: Path, out_dir: Path) -> None:
    ensure_nltk()
    out_dir.mkdir(parents=True, exist_ok=True)

    train_df = prepare_frame(load_liar(train_path))
    valid_df = prepare_frame(load_liar(valid_path))
    train_df["processed_statement"] = train_df["statement"].apply(preprocess_text)
    valid_df["processed_statement"] = valid_df["statement"].apply(preprocess_text)

    models = {
        "logistic_regression": LogisticRegression(max_iter=1200, class_weight="balanced"),
        "random_forest": RandomForestClassifier(n_estimators=250, random_state=42, class_weight="balanced"),
        "naive_bayes": MultinomialNB(),
    }

    results = {}
    best_name = None
    best_pipeline = None
    best_accuracy = -1

    for name, estimator in models.items():
        pipeline = Pipeline(
            [
                ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=2, max_df=0.92)),
                ("model", estimator),
            ]
        )
        pipeline.fit(train_df["processed_statement"], train_df["target"])
        predictions = pipeline.predict(valid_df["processed_statement"])
        accuracy = accuracy_score(valid_df["target"], predictions)
        results[name] = {
            "accuracy": float(accuracy),
            "report": classification_report(valid_df["target"], predictions, output_dict=True, zero_division=0),
        }
        if accuracy > best_accuracy:
            best_accuracy = accuracy
            best_name = name
            best_pipeline = pipeline

    joblib.dump(best_pipeline.named_steps["model"], out_dir / "model.pkl")
    joblib.dump(best_pipeline.named_steps["tfidf"], out_dir / "vectorizer.pkl")
    with open(out_dir / "metrics.json", "w", encoding="utf-8") as file:
        json.dump({"best_model": best_name, "results": results}, file, indent=2)

    print(f"Best model: {best_name} ({best_accuracy:.4f})")
    print(f"Saved model.pkl and vectorizer.pkl to {out_dir}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Truth Likelihood Analyzer models on LIAR dataset.")
    parser.add_argument("--train", default="../dataset/train.tsv", help="Path to LIAR train.tsv")
    parser.add_argument("--valid", default="../dataset/valid.tsv", help="Path to LIAR valid.tsv")
    parser.add_argument("--out", default="artifacts", help="Output directory")
    args = parser.parse_args()
    train(Path(args.train), Path(args.valid), Path(args.out))
