# Product Requirements Document (PRD): DocuDiff AI

## 1. Target User & Objective
- Target User: Individuals, tenants, freelancers, and students reviewing updated legal contracts or policies without hiring legal counsel.
- Core Objective: Surface newly introduced liabilities, fee escalations, and reduced notice periods before signing.

## 2. User Journey
1. Ingestion: User pastes the baseline document into Document A and the revised text into Document B, or clicks "Load Sample Agreement".
2. Processing: User clicks "Analyze Changes". The interface displays a responsive loading state while the backend evaluates the delta.
3. Review:
   - Metric summary cards display high-level totals: Total Changes, High Risk, Medium Risk, and Low Risk.
   - Categorized cards display each modified clause sorted by severity.
   - Each card details: Clause identifier, plain-English summary of what actually changed, and actionable guidance for the user.
4. Export: User can copy or reference the summarized risk report directly.

## 3. Operational Requirements
- Environment Portability: Client API requests must target relative endpoints (`/api/analyze`) using a configurable base URL so the app runs out-of-the-box locally and on remote hosts without hardcoded domain updates.
- CORS & Security: Backend must support dynamic origin matching (allowing wildcard or configurable origins via environment variables).
- Resilience: Graceful error displays for invalid API keys, timeout issues, or malformed user inputs.