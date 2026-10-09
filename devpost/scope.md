# Scope: DocuDiff AI

## 1. Problem Statement
People routinely sign revised terms, rental leases, and service agreements without reading dense fine-print modifications. Standard diff tools only identify raw character changes without interpreting legal or financial liabilities.

## 2. Solution Overview
DocuDiff AI is a single-screen utility that compares an original document against a revised version using a lightweight LLM API. It categorizes changes into risk tiers (High, Medium, Low) and explains practical implications in plain English.

## 3. In-Scope (Hackathon MVP)
- Side-by-side text input boxes (Original vs. Revised).
- One-click "Load Sample Lease" button for instant testing.
- Single API call returning structured JSON diff analysis.
- Risk classification (High = financial penalties/liability; Medium = operational/timeline changes; Low = formatting/wording tweaks).
- Visual UI with severity badges and plain-English breakdown.
- Copyable markdown audit summary.

## 4. Out-of-Scope (Deliberately Excluded)
- User logins, auth tokens, and session management.
- External database integrations (PostgreSQL, MongoDB).
- Multi-page OCR / scanned image ingestion.
- Multi-lingual contract translation.
- Automated legal drafting or multi-user signing.

## 5. Success Criteria
- Complete execution turnaround under 6 seconds per comparison.
- Stateless, in-memory execution via a local browser UI.
- Free-tier API usage remaining well within standard rate limits.