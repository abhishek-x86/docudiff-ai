# Product Requirements Document (PRD): DocuDiff AI

## 1. User & Problem
- **Target User:** Tenants, freelancers, students, and consumers reviewing updated terms or contracts.
- **Core Need:** Quickly uncover hidden fees, altered deadlines, and increased liability between two document versions without reading dozens of repetitive clauses.

## 2. Core User Flow
1. **Input:** User pastes the original text into Box A and the revised text into Box B (or clicks "Load Sample Agreement").
2. **Action:** User clicks **"Analyze Changes"**.
3. **Processing:** The app sends both texts in a single prompt to the LLM requesting structured JSON.
4. **Output:** 
   - Summary metric cards (Total Modifications, High-Risk Alerts).
   - Color-coded cards:
     - 🔴 **High Risk:** Explicit penalty additions, payment term cuts, liability transfers.
     - 🟡 **Medium Risk:** Notice periods, venue changes, procedure tweaks.
     - 🟢 **Low Risk:** Clarifications, spelling fixes, harmless wording changes.
   - Plain-English explanation and practical next step for each clause.

## 3. Non-Functional Requirements
- **Simplicity:** Single-page interface; zero page reloads.
- **Cost & Quota Safety:** Only 1 API request per user action to conserve free-tier quotas.
- **Privacy:** In-memory processing; input text is never saved to disk.