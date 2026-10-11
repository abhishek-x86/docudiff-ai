# ⚖️ DocuDiff AI

> A practical contract diffing tool built to catch one-sided clause edits, unexpected fees, and quietly shifted liabilities before you sign.

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev)
[![Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Live Demo](https://img.shields.io/badge/Demo-Live_App-00C7B7?style=for-the-badge&logo=vercel&logoColor=white)](https://docudiff-ai.vercel.app)
[![API Docs](https://img.shields.io/badge/API-Swagger_Docs-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://docudiff-ai.onrender.com/docs)
[![Backend Status](https://img.shields.io/badge/API-Health_Check-22C55E?style=for-the-badge&logo=render&logoColor=white)](https://docudiff-ai.onrender.com/health)
---

## 📌 Why I Built This

Most text diff tools show you line deletions and wording swaps. That works fine for code, but it is useless for contracts where a single rephrased sentence can quietly wipe out your deposit or make you personally liable for HVAC repairs.

DocuDiff is built to parse the actual legal meaning behind changes between two drafts—like an original lease versus a renewal, or an updated SaaS agreement—so you see exactly what rights you are giving up before agreeing to anything.

### 🎯 What it handles

* 📂 **File Drop & Pasting**: Drop `.pdf`, `.txt`, or `.md` files directly into either document slot, or just paste snippets manually.
* ⚡ **PDF Text Extraction**: Uses `pypdf` on the backend so PDFs unpack into editable textareas first. You can inspect or tweak the text before sending it to the model.
* 🧠 **Fast, Structured Auditing**: Runs on `gemini-3.5-flash-lite` with a strict Pydantic JSON schema. No loose conversational output—just an exact list of modified clauses with plain-English summaries.
* 🚦 **Risk Categorization**: Tags edits as **High**, **Medium**, or **Low** risk and writes out direct negotiation counterpoints.
* 📑 **One-Click Export**: Download the results as a Markdown file, copy the summary to your clipboard, or hit export to open a clean, print-styled PDF report via browser print rules.

---

## 🚦 How Risks Are Tagged

| Level | Badge | What usually triggers it |
| :--- | :---: | :--- |
| **High** | 🔴 `HIGH RISK` | One-sided indemnity shifts, uncapped liability, sneaky IP licenses on private data, forfeiture of tenant protections, or surprise price increases. |
| **Medium** | 🟡 `MEDIUM RISK` | Shorter notice periods, removed termination-for-convenience rights, or narrowed dispute windows. |
| **Low** | 🟢 `LOW RISK` | Formatting cleanups, updated entity names, and benign rephrasing that doesn't change legal obligations. |

---

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│     Client (React 18 + Vite)    │ ◄─── Drag & Drop (.pdf, .txt, .md)
│   Tailwind CSS / Lucide Icons   │ ───► Live Preview & Editing
└───────────────┬─────────────────┘
                │  /api/extract-text  (pypdf)
                │  /api/analyze       (JSON Schema)
                ▼
┌─────────────────────────────────┐
│       Backend (FastAPI)         │
│      Pydantic v2 Models         │
└───────────────┬─────────────────┘
                │  Structured Schema Validation
                ▼
┌─────────────────────────────────┐
│   Google Gemini 3.5 Flash Lite  │ ───► High / Medium / Low Delta Report
└─────────────────────────────────┘
```

---

## 📁 Project Layout

| Path | Description |
| :--- | :--- |
| 📁 `backend/main.py` | FastAPI routes, schema definition, and GenAI client pipeline |
| 📄 `backend/requirements.txt` | Backend Python dependencies (`google-genai`, `fastapi`, `pypdf`, etc.) |
| 📄 `backend/Procfile` | Start command for cloud deployment |
| 📁 `frontend/src/App.jsx` | Main UI with file pickers, diff inspector, and export controls |
| 🎨 `frontend/src/index.css` | Tailwind imports plus `@media print` rules for the PDF export |
| ⚙️ `frontend/vite.config.js` | Dev server with local reverse proxy to avoid CORS headaches |
| 📄 `render.yaml` | Cloud blueprint for one-click backend deployment |

---

## 🚀 Running Locally

### 1️⃣ Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your env file
cp .env.example .env
```

Add your Gemini key in `backend/.env`:
```env
GEMINI_API_KEY="your-gemini-api-key"
ALLOWED_ORIGINS="http://localhost:5173"
```

Start the API:
```bash
uvicorn main:app --reload --port 8000
```
Check `http://127.0.0.1:8000/health` to confirm it is up.

---

### 2️⃣ Frontend Setup

In another terminal window:

```bash
cd frontend

npm install
npm run dev
```

Open `http://localhost:5173`. In local dev, all requests to `/api` proxy directly to the FastAPI server on port 8000.

---

## ☁️ Deployment

### 🔹 Backend (Render / Railway)
Both pick up `backend/Procfile` automatically:
```text
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```
Environment variables to set:
* `GEMINI_API_KEY`: Your Google GenAI API key.
* `ALLOWED_ORIGINS`: Comma-separated domains (e.g. `https://docudiff-ai.vercel.app,http://localhost:5173`).

### 🔹 Frontend (Vercel)
1. Link your repo and set the **Root Directory** to `frontend`.
2. Framework Preset: **Vite**.
3. Add the environment variable:
   * `VITE_API_BASE_URL`: Your live backend URL without trailing slash (e.g. `https://docudiff-backend.onrender.com`).

---

## 📄 License

MIT