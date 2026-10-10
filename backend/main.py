import os
import json
from typing import List, Literal
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

app = FastAPI(
    title="DocuDiff AI API",
    description="Automated legal and policy agreement delta analysis powered by Gemini 2.5 Flash",
    version="1.0.0",
)

# Configure CORS
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "").strip()
if allowed_origins_env:
    origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
else:
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Client globally once (avoids repeated connection overhead)
api_key = os.getenv("GEMINI_API_KEY", "").strip()
client = genai.Client(api_key=api_key) if api_key else None


class AnalyzeRequest(BaseModel):
    original_text: str = Field(..., description="Baseline original document or agreement text")
    revised_text: str = Field(..., description="Amended or revised document or agreement text")


class ChangeItem(BaseModel):
    clause: str = Field(..., description="Identifier or title of the modified clause/section")
    risk: Literal["HIGH", "MEDIUM", "LOW"] = Field(..., description="Assessed risk level")
    change_type: Literal["MODIFIED", "ADDED", "REMOVED"] = Field(..., description="Type of textual change")
    plain_explanation: str = Field(..., description="Plain-English explanation of what actually changed and why it matters")
    advice: str = Field(..., description="Concrete, actionable advice or next step for the user")


class AnalyzeResponse(BaseModel):
    summary: str = Field(..., description="1-2 sentence executive overview of the delta")
    high_risk_count: int = Field(0, description="Total count of HIGH risk changes")
    medium_risk_count: int = Field(0, description="Total count of MEDIUM risk changes")
    low_risk_count: int = Field(0, description="Total count of LOW risk changes")
    changes: List[ChangeItem] = Field(default_factory=list, description="List of detected clause changes")


SYSTEM_PROMPT = """Act as an expert legal and policy auditor. Compare Document A (Original) and Document B (Revised).
Detect substantive changes affecting fees, penalties, liability, rules, and deadlines.
Categorize risk as:
- HIGH: penalties, liabilities, fee jumps, indemnification, strict forfeit clauses, waiver of tenant/user rights.
- MEDIUM: deadlines, operational shifts, notice periods, procedural changes, working hours.
- LOW: editorial wording, style adjustments, cosmetic formatting, clarifications without substantive legal shift.

For change_type: MODIFIED, ADDED, or REMOVED.
Provide direct, concise plain-English explanations and actionable advice. Do not output conversational filler."""


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "DocuDiff AI Backend"}


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze_documents(payload: AnalyzeRequest):
    orig = payload.original_text.strip()
    rev = payload.revised_text.strip()

    if not orig or not rev:
        raise HTTPException(
            status_code=400,
            detail="Both original_text and revised_text must be provided and non-empty."
        )

    if not client:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is missing or invalid in backend environment."
        )

    user_prompt = f"""=== DOCUMENT A (ORIGINAL) ===
{orig}

=== DOCUMENT B (REVISED) ===
{rev}"""

    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=AnalyzeResponse,
                temperature=0.1,
            ),
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini API request failed: {str(e)}"
        )
    if not response or not response.text:
        raise HTTPException(
            status_code=500,
            detail="Received empty response from Gemini API."
        )

    try:
        parsed_data = json.loads(response.text)
        validated_response = AnalyzeResponse(**parsed_data)
        
        # Recount to make sure metrics are exact
        validated_response.high_risk_count = sum(1 for c in validated_response.changes if c.risk == "HIGH")
        validated_response.medium_risk_count = sum(1 for c in validated_response.changes if c.risk == "MEDIUM")
        validated_response.low_risk_count = sum(1 for c in validated_response.changes if c.risk == "LOW")

        return validated_response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse or validate model response JSON: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)