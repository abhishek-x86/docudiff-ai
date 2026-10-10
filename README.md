# DocuDiff AI ⚖️📄

DocuDiff AI is an automated legal and policy contract watchdog. It compares baseline and revised agreements (leases, terms of service, employment contracts, freelance scopes), analyzes substantive legal deltas using Google Gemini 3.5 Flash Lite, and categorizes liabilities into actionable High, Medium, and Low risk posture cards.

---

## Key Features

1. **Document Upload Support (PDF, TXT, MD)**:
   - Drag-and-drop or file picker for both Document A and Document B.
   - Client-side fast-path extraction for plain text files (`.txt`, `.md`).
   - Server-side asynchronous PDF parsing via `POST /api/extract-text` powered by `pypdf`.
   - Text automatically populates the textareas so users can review/edit before triggering analysis.

2. **Delta Risk Audit**:
   - Compares documents using Google's `gemini-3.5-flash-lite` model.
   - Structured JSON schema output (`AnalyzeResponse`) with exact KPI metrics and itemized findings.

3. **Export & Sharing**:
   - **Export Markdown (`.md`)**: Instant download of the formatted audit report.
   - **Export PDF / Print View**: Uses high-contrast print stylesheet (`@media print`) for clean, branded PDF generation via your browser's Print/Save-as-PDF dialog.
   - **Copy Report to Clipboard**: One-click copy with instant visual confirmation ("Copied!").

---

## Architecture & Zero-Config Portability

- **Frontend**: React 18+ (Vite, Tailwind CSS, Lucide Icons). All fetch calls use relative endpoints (`${import.meta.env.VITE_API_BASE_URL || ""}/api/...`).
- **Backend**: FastAPI (Python 3.10+), Uvicorn, Pydantic v2, `pypdf`, `python-multipart`, and the official `google-genai` SDK.
- **AI Model**: Google Gemini 3.5 Flash Lite (`gemini-3.5-flash-lite`) with structured JSON schema outputs.
- **Local Dev Proxy**: Vite proxies `/api` requests to `http://127.0.0.1:8000`, eliminating CORS and port conflicts in local development.
- **Cloud Ready**: Switch to remote deployment without code modifications by specifying `ALLOWED_ORIGINS` on the backend and `VITE_API_BASE_URL` on the frontend.

---

## Project Structure

```
ai-tool/
├── backend/
│   ├── main.py              # FastAPI application & Gemini 3.5 Flash Lite integration
│   ├── requirements.txt     # Python backend dependencies (fastapi, google-genai, pypdf, etc.)
│   ├── Procfile             # Railway/Render start command: uvicorn main:app --host 0.0.0.0 --port $PORT
│   ├── .env.example         # Template for environment variables
│   └── .gitignore           # Python-specific ignore patterns
├── frontend/
│   ├── index.html           # Single-page entry HTML
│   ├── package.json         # React & Vite dependencies
│   ├── vite.config.js       # Vite build & /api reverse proxy configuration
│   ├── tailwind.config.js   # Tailwind CSS styling setup
│   ├── postcss.config.js    # PostCSS plugins
│   ├── .env.example         # Frontend environment variable template
│   └── src/
│       ├── App.jsx          # Main application component, uploaders, audit dashboard, and exporters
│       ├── main.jsx         # React DOM mount point
│       └── index.css        # Tailwind directives, base styles, and @media print rules
├── render.yaml              # Render blueprint for zero-config Web Service deploy
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

The backend health check will be live at `http://127.0.0.1:8000/health`, text extraction at `POST http://127.0.0.1:8000/api/extract-text`, and the analysis endpoint at `POST http://127.0.0.1:8000/api/analyze`.

### 2. Frontend Setup

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. All API requests route seamlessly through Vite's local proxy to `http://127.0.0.1:8000`.

---

## Production Deployment Configuration

### Backend (Railway or Render)
- **Railway**:
  - Connect your repository. Railway automatically detects `backend/Procfile`:
    ```
    web: uvicorn main:app --host 0.0.0.0 --port $PORT
    ```
  - Set Root Directory to `backend` (if configuring a service directly) or deploy from repository root.
  - Set Environment Variables:
    - `GEMINI_API_KEY`: Your Gemini API key.
    - `ALLOWED_ORIGINS`: Comma-separated frontend origins (e.g. `https://docudiff-ai.vercel.app`).
- **Render**:
  - Use the included [render.yaml](file:///home/abhi/files/projects/ai-tool/render.yaml) blueprint or create a Web Service pointing to `backend/`.
  - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.

### Frontend (Vercel)
1. Import repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Set Environment Variables:
   - `VITE_API_BASE_URL`: Your deployed backend URL (e.g. `https://docudiff-backend.up.railway.app` or `https://docudiff-backend.onrender.com`).
5. Deploy.
