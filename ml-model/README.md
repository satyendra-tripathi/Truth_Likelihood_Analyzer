# ML Model Service

Train with the LIAR dataset:

```bash
cd ml-model
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python train.py --train "../dataset/train.tsv" --valid "../dataset/valid.tsv" --out artifacts
python app.py
```

The service exports and loads:

- `artifacts/model.pkl`
- `artifacts/vectorizer.pkl`
- `artifacts/metrics.json`

`POST /predict` returns a truth likelihood score, confidence, and non-certainty disclaimer.
