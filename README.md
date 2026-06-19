# Truth Likelihood Analyzer

An internship-ready MERN + Python NLP application that estimates a **Truth Likelihood Score** from linguistic patterns. It does **not** claim to detect lies with certainty.

## Tech Stack

- Frontend: React, Tailwind CSS, Axios, React Router, Recharts, jsPDF
- Backend: Node.js, Express, JWT, Mongoose, MongoDB Atlas
- Machine Learning: Python, Scikit-Learn, Pandas, NumPy, NLTK, Joblib, Flask
- Dataset: LIAR Dataset from Kaggle

## Folder Structure

```text
client/
  src/
    api/
    components/
    context/
    pages/
server/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
ml-model/
  app.py
  train.py
  requirements.txt
  artifacts/
dataset/
  train.tsv
  valid.tsv
  test.tsv
```

## Features

- Register/login with JWT and bcrypt password hashing
- Protected REST APIs
- Statement analysis through Python ML inference
- Truth likelihood percentage, confidence meter, prediction label, and explanation
- Suspicious phrase highlighting: honestly, trust me, believe me, definitely, literally, swear
- Sentiment label: Positive, Neutral, Negative
- Saved analysis history with delete support
- Analytics dashboard with total analyses, average score, sentiment distribution, daily activity, and top suspicious phrases
- PDF report export
- Browser voice input
- Dark/light mode
- Optional real-time analysis toggle

## Local Installation

### 1. Install JavaScript dependencies

```bash
npm install
npm run install:all
```

### 2. Configure backend

```bash
copy server\.env.example server\.env
```

Set:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/truth_likelihood
JWT_SECRET=<long-random-secret>
CLIENT_URL=http://localhost:5173
ML_SERVICE_URL=http://localhost:8000
```

### 3. Configure frontend

```bash
copy client\.env.example client\.env
```

### 4. Train the ML model

The LIAR files are expected in `dataset/`.

```bash
cd ml-model
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python train.py --train "../dataset/train.tsv" --valid "../dataset/valid.tsv" --out artifacts
```

This creates:

- `ml-model/artifacts/model.pkl`
- `ml-model/artifacts/vectorizer.pkl`
- `ml-model/artifacts/metrics.json`

### 5. Run the application

In one terminal:

```bash
cd ml-model
.venv\Scripts\activate
python app.py
```

In a second terminal:

```bash
npm run dev
```

Open `http://localhost:5173`.

## API Endpoints

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/analyze
GET    /api/history
DELETE /api/history/:id
GET    /api/analytics
```

## Database Models

User:

- `name`
- `email`
- `password`
- timestamps

Analysis:

- `userId`
- `statement`
- `truthScore`
- `confidence`
- `predictionLabel`
- `sentiment`
- `suspiciousWords`
- `keywordFrequency`
- `explanation`
- timestamps

## Deployment Guide

### MongoDB Atlas

1. Create an Atlas cluster.
2. Add a database user.
3. Allow Render outbound access or temporarily allow `0.0.0.0/0`.
4. Copy the connection string into `MONGO_URI`.

### Python ML Service on Render

1. Create a new Render Web Service from this repo.
2. Set root directory to `ml-model`.
3. Build command:

```bash
pip install -r requirements.txt
```

4. Start command:

```bash
gunicorn app:app
```

5. Add `MODEL_PATH` and `VECTORIZER_PATH` if needed.
6. Upload or generate `artifacts/model.pkl` and `artifacts/vectorizer.pkl` during your deployment workflow.

### Express API on Render

1. Create another Render Web Service.
2. Set root directory to `server`.
3. Build command:

```bash
npm install
```

4. Start command:

```bash
npm start
```

5. Add environment variables:

```env
MONGO_URI=...
JWT_SECRET=...
CLIENT_URL=https://your-vercel-app.vercel.app
ML_SERVICE_URL=https://your-ml-service.onrender.com
```

### React Client on Vercel

1. Import the repo into Vercel.
2. Set root directory to `client`.
3. Build command:

```bash
npm run build
```

4. Output directory:

```text
dist
```

5. Add:

```env
VITE_API_URL=https://your-express-api.onrender.com/api
```

## Responsible AI Notice

The score is based on dataset-driven NLP patterns and keyword heuristics. It should be used as a review aid only and must not be treated as proof that a person is truthful or deceptive.
