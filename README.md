# DocuDiff AI ⚖️📄

DocuDiff AI is an automated legal and policy contract watchdog. It compares baseline and revised agreements (leases, terms of service, employment contracts, freelance scopes), analyzes substantive legal delta using Google Gemini 2.5 Flash, and categorizes liabilities into actionable High, Medium, and Low risk posture cards.

---

## Architecture & Zero-Config Portability

- **Frontend**: React 18+ (Vite, Tailwind CSS, Lucide Icons). All fetch calls use relative endpoints (`${import.meta.env.VITE_API_BASE_URL || ""}/api/analyze`).
- **Backend**: FastAPI (Python 3.10+), Uvicorn, Pydantic v2, and the official `google-genai` SDK.
- **AI Model**: Google Gemini 2.5 Flash (`gemini-2.5-flash`) with structured JSON schema outputs.
- **Local Dev Proxy**: Vite proxies `/api` requests to `http://127.0.0.1:8000`, eliminating CORS and port conflicts in local development.
- **Cloud Ready**: Switch to remote deployment without code modifications by specifying `ALLOWED_ORIGINS` on the backend and `VITE_API_BASE_URL` on the frontend.

---

## Project Structure

```
ai-tool/
├── backend/
│   ├── main.py              # FastAPI application & Gemini 2.5 Flash integration
│   ├── requirements.txt     # Python backend dependencies
│   ├── .env.example         # Template for environment variables
│   └── .gitignore           # Python-specific ignore patterns
├── frontend/
│   ├── index.html           # Single-page entry HTML
│   ├── package.json         # React & Vite dependencies
│   ├── vite.config.js       # Vite build & /api reverse proxy configuration
│   ├── tailwind.config.js   # Tailwind CSS styling setup
│   ├── postcss.config.js    # PostCSS plugins
│   └── src/
│       ├── App.jsx          # Main application component & audit dashboard
│       ├── main.jsx         # React DOM mount point
│       └── index.css        # Tailwind directives and base styles
├── devpost/                 # PRD, Architecture Spec, Scope documents
├── .gitignore               # Root git ignore
└── README.md                # Project documentation & setup instructions
```

---

## Local Setup Instructions

### 1. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and insert your valid GEMINI_API_KEY
uvicorn main:app --reload --port 8000
```

The backend health check will be live at `http://127.0.0.1:8000/health` and the analysis endpoint at `POST http://127.0.0.1:8000/api/analyze`.

### 2. Frontend Setup

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. All API requests route seamlessly through Vite's local proxy to `http://127.0.0.1:8000/api/analyze`.

---

## Free Cloud Deployment Instructions

### Backend (Render or Railway)
1. Push this repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com) or [Railway](https://railway.app).
3. Set **Root Directory** to `backend`.
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Set Environment Variables:
   - `GEMINI_API_KEY`: Your Gemini API key.
   - `ALLOWED_ORIGINS`: Comma-separated allowed frontend domains (e.g. `https://your-frontend.vercel.app`).

### Frontend (Vercel)
1. Import the repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Set Environment Variables:
   - `VITE_API_BASE_URL`: The URL of your deployed backend service (e.g. `https://docudiff-backend.onrender.com`).
5. Deploy.

