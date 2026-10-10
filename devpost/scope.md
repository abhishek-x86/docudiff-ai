# Scope: DocuDiff AI

## 1. Problem Statement
Users routinely accept revised leases, employment contracts, and digital terms of service without reviewing modified clauses. Traditional diff utilities only highlight raw character additions or deletions without interpreting the legal, financial, or operational liabilities introduced by the changes.

## 2. Solution Overview
DocuDiff AI is an automated contract watchdog built on a decoupled, production-ready architecture. It ingests an original document and an amended document, analyzes substantive variances through Gemini 2.5 Flash via a FastAPI backend, and renders an interactive, color-coded risk assessment on a responsive React frontend.

## 3. In-Scope (Hackathon MVP)
- Decoupled client-server architecture: FastAPI backend REST service and React (Vite + Tailwind CSS) client.
- Zero-friction environment configuration: Relative API pathing with Vite dev-server proxy for local execution, switchable to cloud deployment via a single environment variable.
- Side-by-side text ingestion panes with a one-click sample loader for rapid evaluation.
- Asynchronous analysis endpoint executing a single, structured schema call to Gemini 2.5 Flash.
- Severity classification: High Risk (financial penalties, strict liabilities, forfeit clauses), Medium Risk (deadlines, operational adjustments), and Low Risk (wording or formatting tweaks).
- Visual status dashboard with severity badges, plain-English impact breakdowns, and actionable next steps.

## 4. Out-of-Scope (Deliberately Deferred)
- User authentication, account management, and database persistence.
- Scanned physical document OCR processing.
- Multi-party digital signature collection.
- Multi-language contract translation.

## 5. Success Criteria
- Sub-5-second analysis turnaround on typical contractual amendments.
- Single API round-trip per user action to operate safely inside free-tier quota limits.
- Zero code modifications required between local execution and cloud deployment.