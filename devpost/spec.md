# Technical Specification: DocuDiff AI

## 1. System Architecture
DocuDiff AI uses a decoupled client-server architecture designed for zero-reconfiguration deployment:
- Client: React single-page app built with Vite and Tailwind CSS. API calls route to `${VITE_API_BASE_URL || ""}/api/analyze`. In local development, Vite proxies `/api` to the backend service.
- Server: Asynchronous FastAPI service exposing the REST endpoint and running via Uvicorn. CORS origins are read from an environment variable with localhost fallbacks.
- AI Engine: Google Gemini 2.5 Flash executing structured JSON response parsing.

## 2. Technology Stack
- Frontend: Node.js, React 18+, Vite, Tailwind CSS, Lucide React (icons)
- Backend: Python 3.10+, FastAPI, Uvicorn, Pydantic, google-genai, python-dotenv
- AI Model: gemini-2.5-flash

## 3. API Contract: POST /api/analyze

Request Body:
{
  "original_text": "string",
  "revised_text": "string"
}

Response Body:
{
  "summary": "string",
  "high_risk_count": 0,
  "medium_risk_count": 0,
  "low_risk_count": 0,
  "changes": [
    {
      "clause": "string",
      "risk": "HIGH | MEDIUM | LOW",
      "change_type": "MODIFIED | ADDED | REMOVED",
      "plain_explanation": "string",
      "advice": "string"
    }
  ]
}

## 4. Architectural Boundaries & Conventions
- The project is split into two autonomous packages: `backend/` and `frontend/`.
- The backend reads `GEMINI_API_KEY` and optional `ALLOWED_ORIGINS` from its local environment/.env file.
- The frontend configures Vite's `server.proxy` to forward `/api` to the backend during local development, ensuring relative requests work without hardcoded localhost URLs.
- Neither frontend nor backend hardcodes external IP addresses or absolute localhost domains into source logic.