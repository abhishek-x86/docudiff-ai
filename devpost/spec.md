# Technical Specification: DocuDiff AI

## 1. Tools & Libraries
- Python 3.10+
- streamlit (to make the website interface)
- google-genai (to talk to the Gemini API)
- python-dotenv (to read the API key safely)

## 2. How the App Works
1. The user opens the local webpage created by Streamlit.
2. The user types or pastes the old text and the new text.
3. The user clicks "Analyze Changes".
4. The Python script sends both texts to the Gemini API.
5. Gemini sends back a clean list of changes in JSON format.
6. The Python script displays these changes with red/yellow/green color cards on the screen.

## 3. Data Format from the AI
We tell the AI to reply using this structure:
- summary: A one-sentence explanation of what changed.
- high_risk_count: Number of dangerous changes (fees, liabilities).
- medium_risk_count: Number of moderate changes (deadlines, rules).
- low_risk_count: Number of minor changes (typos, harmless wording).
- changes: A list of each difference found, including:
  - clause: Which rule or section changed.
  - risk: HIGH, MEDIUM, or LOW.
  - plain_explanation: What it means in simple English.
  - advice: What the user should do about it.

## 4. Project Files
- devpost/
  - scope.md
  - prd.md
  - spec.md
- app.py (the main program)
- requirements.txt (list of libraries to install)
- README.md (instructions on how to run it)