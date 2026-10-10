import React, { useState, useRef } from 'react';
import {
  FileText,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Info,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Upload,
  Download,
  Printer,
  FileUp,
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SAMPLE_ORIGINAL = `RESIDENTIAL TENANCY AGREEMENT
Clause 4 (Payment of Rent): Rent of $1,800 is due on the 1st day of each month. A grace period of 5 calendar days is provided before a late fee of $25 is assessed.
Clause 7 (Repairs and Maintenance): Tenant is responsible for basic upkeep. Landlord will remedy any heating, plumbing, or structural defects within 48 hours of written notice.
Clause 11 (Security Deposit): Deposit of $1,800 held in an escrow account, refundable within 30 days of lease expiration less verifiable damages.
Clause 14 (Termination Notice): Either party may terminate this agreement at the conclusion of the term by providing 30 days written notice.
Clause 18 (Subletting): Tenant may sublet the premises subject to reasonable written approval by Landlord, not to be unreasonably withheld.`;

const SAMPLE_REVISED = `RESIDENTIAL TENANCY AGREEMENT
Clause 4 (Payment of Rent): Rent of $1,800 is due on the 1st day of each month. No grace period is provided. A late penalty of $150 plus $20 per additional day late is automatically charged.
Clause 7 (Repairs and Maintenance): Tenant is responsible for all interior maintenance, appliances, plumbing clogs, and HVAC filters. Landlord will evaluate structural defects within 14 business days.
Clause 11 (Security Deposit): Deposit of $2,400 held by Landlord. A non-refundable turnover and deep-clean fee of $450 will be automatically deducted upon move-out. Refund balance processed within 60 days.
Clause 14 (Termination Notice): Tenant must provide 60 days written notice before lease expiration; failure to do so renews the tenancy for a 12-month period with an automatic 15% rent escalation.
Clause 18 (Subletting): Subletting or temporary assignments (including Airbnb) are strictly prohibited under penalty of immediate eviction and liquidated damages of $2,500.
Clause 22 (Mandatory Arbitration & Class Action Waiver): Tenant irrevocably waives right to a jury trial and agrees that all disputes shall be resolved via binding individual arbitration with all fees borne by Tenant.`;

export default function App() {
  const [originalText, setOriginalText] = useState('');
  const [revisedText, setRevisedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [copied, setCopied] = useState(false);

  // File upload state
  const [isExtractingOriginal, setIsExtractingOriginal] = useState(false);
  const [isExtractingRevised, setIsExtractingRevised] = useState(false);
  const [isDragOverA, setIsDragOverA] = useState(false);
  const [isDragOverB, setIsDragOverB] = useState(false);

  const fileInputRefA = useRef(null);
  const fileInputRefB = useRef(null);

  // Dynamic API Base URL with fallback to relative path (dev proxy) or localhost
  const rawApiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
  const apiBase = rawApiBase || '';

  const handleFileUpload = async (file, target) => {
    if (!file) return;

    const isTargetA = target === 'original';
    const setExtracting = isTargetA ? setIsExtractingOriginal : setIsExtractingRevised;
    const setText = isTargetA ? setOriginalText : setRevisedText;

    setExtracting(true);
    setError(null);

    const fileNameLower = file.name.toLowerCase();

    // Fast-path client-side read for plain text files
    if (fileNameLower.endsWith('.txt') || fileNameLower.endsWith('.md')) {
      try {
        const textContent = await file.text();
        setText(textContent);
      } catch (err) {
        setError(`Failed to read file ${file.name}: ${err.message}`);
      } finally {
        setExtracting(false);
      }
      return;
    }

    // For PDF files, extract via backend endpoint
    if (fileNameLower.endsWith('.pdf')) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const extractEndpoint = `${apiBase}/api/extract-text`;
        const res = await fetch(extractEndpoint, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || `Upload failed with status ${res.status}`);
        }

        const data = await res.json();
        setText(data.text);
      } catch (err) {
        setError(`Failed to extract text from PDF (${file.name}): ${err.message}`);
      } finally {
        setExtracting(false);
      }
      return;
    }

    setError('Unsupported file type. Please upload a .pdf, .txt, or .md document.');
    setExtracting(false);
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    if (target === 'original') setIsDragOverA(false);
    if (target === 'revised') setIsDragOverB(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0], target);
    }
  };

  const handleLoadSample = () => {
    setOriginalText(SAMPLE_ORIGINAL);
    setRevisedText(SAMPLE_REVISED);
    setError(null);
  };

  const handleClear = () => {
    setOriginalText('');
    setRevisedText('');
    setError(null);
    setReport(null);
  };

  const handleAnalyze = async () => {
    if (!originalText.trim() || !revisedText.trim()) {
      setError('Please provide text for both the Original Agreement and Revised Agreement before analyzing.');
      return;
    }

    setLoading(true);
    setError(null);

    const endpoint = `${apiBase}/api/analyze`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_text: originalText,
          revised_text: revisedText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Analysis request failed with HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred while communicating with the analysis service.');
    } finally {
      setLoading(false);
    }
  };

  const buildMarkdownReport = () => {
    if (!report) return '';

    let md = `# DocuDiff AI - Agreement Risk Audit Report\n\n`;
    md += `*Generated on: ${new Date().toLocaleString()}*\n\n`;
    md += `## Executive Summary\n${report.summary}\n\n`;
    md += `### Risk Breakdown\n`;
    md += `- **High Risk:** ${report.high_risk_count}\n`;
    md += `- **Medium Risk:** ${report.medium_risk_count}\n`;
    md += `- **Low Risk:** ${report.low_risk_count}\n\n`;
    md += `## Itemized Clause Changes\n\n`;

    report.changes.forEach((item, index) => {
      md += `### ${index + 1}. [${item.risk} RISK] ${item.clause} (${item.change_type})\n`;
      md += `**Explanation:** ${item.plain_explanation}\n\n`;
      md += `**Actionable Advice:** ${item.advice}\n\n`;
      md += `---\n\n`;
    });

    return md;
  };

  const handleCopyMarkdown = () => {
    const md = buildMarkdownReport();
    if (!md) return;

    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDownloadMarkdown = () => {
    const md = buildMarkdownReport();
    if (!md) return;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DocuDiff-Audit-Report-${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation / Header */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white">DocuDiff AI</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                  Gemini 3.5 Flash Lite
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated legal contract watchdog & liability delta auditor
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleLoadSample}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 border border-slate-700 rounded-lg transition shadow-sm"
              title="Pre-fills both text areas with a realistic tenancy lease amendment"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Load Sample Agreement
            </button>
            {(originalText || revisedText || report) && (
              <button
                onClick={handleClear}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Intro Banner */}
        <section className="no-print bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-semibold text-slate-200 flex items-center gap-2">
                <span>Never sign modified terms blind.</span>
              </h2>
              <p className="text-sm text-slate-400 max-w-3xl">
                Compare original agreements vs revisions. Upload PDF or TXT contracts or paste directly. DocuDiff analyzes fee jumps, forfeit clauses, notice shrinkages, and liability shifts in seconds.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800 shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero-Storage Analysis</span>
            </div>
          </div>
        </section>

        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={fileInputRefA}
          accept=".pdf,.txt,.md"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0], 'original');
              e.target.value = '';
            }
          }}
        />
        <input
          type="file"
          ref={fileInputRefB}
          accept=".pdf,.txt,.md"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0], 'revised');
              e.target.value = '';
            }
          }}
        />

        {/* Input Text Areas & Drag-and-Drop Zones */}
        <div className="no-print grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Text Pane */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOverA(true);
            }}
            onDragLeave={() => setIsDragOverA(false)}
            onDrop={(e) => handleDrop(e, 'original')}
            className={cn(
              "flex flex-col bg-slate-900/60 border rounded-xl overflow-hidden shadow-sm transition relative",
              isDragOverA
                ? "border-indigo-400 bg-indigo-950/20 ring-2 ring-indigo-500/30"
                : "border-slate-800 focus-within:border-indigo-500/50"
            )}
          >
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Document A: Original Agreement
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  {originalText.length} chars
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRefA.current?.click()}
                  disabled={isExtractingOriginal}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-md transition shadow-xs"
                  title="Upload .pdf, .txt, or .md file"
                >
                  {isExtractingOriginal ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  ) : (
                    <FileUp className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                  <span>{isExtractingOriginal ? 'Extracting...' : 'Upload PDF/TXT'}</span>
                </button>
              </div>
            </div>

            {/* Drag overlay notice if hovering */}
            {isDragOverA && (
              <div className="absolute inset-0 top-12 bg-indigo-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-10 text-indigo-200 pointer-events-none">
                <Upload className="w-8 h-8 text-indigo-400 animate-bounce mb-2" />
                <p className="text-sm font-semibold">Drop PDF or TXT to extract into Document A</p>
              </div>
            )}

            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Paste original contract or drop a PDF/TXT file here..."
              rows={14}
              className="w-full p-4 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none resize-y font-mono leading-relaxed"
            />
          </div>

          {/* Revised Text Pane */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOverB(true);
            }}
            onDragLeave={() => setIsDragOverB(false)}
            onDrop={(e) => handleDrop(e, 'revised')}
            className={cn(
              "flex flex-col bg-slate-900/60 border rounded-xl overflow-hidden shadow-sm transition relative",
              isDragOverB
                ? "border-indigo-400 bg-indigo-950/20 ring-2 ring-indigo-500/30"
                : "border-slate-800 focus-within:border-indigo-500/50"
            )}
          >
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-indigo-300">
                  Document B: Revised Agreement
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  {revisedText.length} chars
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRefB.current?.click()}
                  disabled={isExtractingRevised}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-md transition shadow-xs"
                  title="Upload .pdf, .txt, or .md file"
                >
                  {isExtractingRevised ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  ) : (
                    <FileUp className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                  <span>{isExtractingRevised ? 'Extracting...' : 'Upload PDF/TXT'}</span>
                </button>
              </div>
            </div>

            {/* Drag overlay notice if hovering */}
            {isDragOverB && (
              <div className="absolute inset-0 top-12 bg-indigo-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-10 text-indigo-200 pointer-events-none">
                <Upload className="w-8 h-8 text-indigo-400 animate-bounce mb-2" />
                <p className="text-sm font-semibold">Drop PDF or TXT to extract into Document B</p>
              </div>
            )}

            <textarea
              value={revisedText}
              onChange={(e) => setRevisedText(e.target.value)}
              placeholder="Paste amended contract terms or drop a PDF/TXT file here..."
              rows={14}
              className="w-full p-4 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none resize-y font-mono leading-relaxed"
            />
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="no-print flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={handleAnalyze}
            disabled={loading || isExtractingOriginal || isExtractingRevised}
            type="button"
            className={cn(
              "w-full sm:w-auto min-w-[240px] px-8 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2",
              loading
                ? "bg-indigo-700/60 text-indigo-200 cursor-not-allowed shadow-none"
                : "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/25 hover:shadow-indigo-500/35 hover:-translate-y-0.5"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Auditing Documents with Gemini...</span>
              </>
            ) : (
              <>
                <span>Analyze Changes</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="no-print p-4 rounded-xl bg-red-950/40 border border-red-800/80 text-red-200 flex items-start gap-3 shadow-md animate-in fade-in duration-200">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-semibold text-red-300">Action Notice</p>
              <p className="text-red-200/90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Results Dashboard */}
        {report && (
          <div className="space-y-6 pt-4 animate-in fade-in duration-300">
            {/* Report Header & Action */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Delta Audit Results</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {report.changes?.length || 0} Changes Detected
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Synthesized risk assessment and actionable legal posture
                </p>
              </div>

              {/* Export Button Toolbar */}
              <div className="no-print flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyMarkdown}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded-lg border border-slate-700 transition shadow-sm"
                  title="Copy markdown formatted audit report"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-300" />
                      <span>Copy Report</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadMarkdown}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded-lg border border-slate-700 transition shadow-sm"
                  title="Download report as a .md file"
                >
                  <Download className="w-4 h-4 text-indigo-400" />
                  <span>Export Markdown</span>
                </button>

                <button
                  onClick={handlePrintReport}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs sm:text-sm font-medium rounded-lg border border-indigo-500/50 transition shadow-sm"
                  title="Export or print as a clean PDF view"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span>Export PDF / Print</span>
                </button>
              </div>
            </div>

            {/* KPI Metric Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* High Risk */}
              <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-5 flex items-center justify-between break-inside-avoid">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-red-400">
                    High Risk Items
                  </p>
                  <p className="text-3xl font-extrabold text-red-100 mt-1">
                    {report.high_risk_count}
                  </p>
                  <p className="text-xs text-red-300/80 mt-1">
                    Financial liabilities & forfeit terms
                  </p>
                </div>
                <div className="p-3 bg-red-950/60 rounded-xl border border-red-800/40">
                  <ShieldAlert className="w-6 h-6 text-red-400" />
                </div>
              </div>

              {/* Medium Risk */}
              <div className="bg-amber-950/20 border border-amber-900/50 rounded-xl p-5 flex items-center justify-between break-inside-avoid">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-amber-400">
                    Medium Risk Items
                  </p>
                  <p className="text-3xl font-extrabold text-amber-100 mt-1">
                    {report.medium_risk_count}
                  </p>
                  <p className="text-xs text-amber-300/80 mt-1">
                    Notice periods & procedural shifts
                  </p>
                </div>
                <div className="p-3 bg-amber-950/60 rounded-xl border border-amber-800/40">
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                </div>
              </div>

              {/* Low Risk */}
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-5 flex items-center justify-between break-inside-avoid">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                    Low Risk Items
                  </p>
                  <p className="text-3xl font-extrabold text-emerald-100 mt-1">
                    {report.low_risk_count}
                  </p>
                  <p className="text-xs text-emerald-300/80 mt-1">
                    Editorial tweaks & clarifications
                  </p>
                </div>
                <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800/40">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Executive Summary Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm break-inside-avoid">
              <div className="flex items-center gap-2 mb-2 text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Executive Summary
                </h4>
              </div>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                {report.summary}
              </p>
            </div>

            {/* Itemized List of Changes */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Itemized Delta Breakdown
              </h4>

              {report.changes && report.changes.length > 0 ? (
                <div className="space-y-4">
                  {report.changes.map((item, index) => {
                    const isHigh = item.risk === 'HIGH';
                    const isMed = item.risk === 'MEDIUM';
                    const isLow = item.risk === 'LOW';

                    return (
                      <div
                        key={index}
                        className={cn(
                          "rounded-xl border p-5 transition-all shadow-sm break-inside-avoid",
                          isHigh && "bg-red-950/10 border-red-900/40 hover:border-red-800/60",
                          isMed && "bg-amber-950/10 border-amber-900/40 hover:border-amber-800/60",
                          isLow && "bg-emerald-950/10 border-emerald-900/40 hover:border-emerald-800/60"
                        )}
                      >
                        {/* Card Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm font-bold text-white">
                              {item.clause}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Change Type Badge */}
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {item.change_type}
                            </span>

                            {/* Severity Badge */}
                            <span
                              className={cn(
                                "text-[11px] font-bold px-2.5 py-0.5 rounded-full border",
                                isHigh && "bg-red-900/30 text-red-400 border-red-700/60",
                                isMed && "bg-amber-900/30 text-amber-400 border-amber-700/60",
                                isLow && "bg-emerald-900/30 text-emerald-400 border-emerald-700/60"
                              )}
                            >
                              {item.risk} RISK
                            </span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="pt-3 space-y-3">
                          {/* Plain-English Explanation */}
                          <div>
                            <p className="text-xs font-semibold text-slate-400 mb-1">
                              Plain-English Explanation:
                            </p>
                            <p className="text-sm text-slate-200 leading-relaxed">
                              {item.plain_explanation}
                            </p>
                          </div>

                          {/* Actionable Advice */}
                          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-indigo-300">
                                Actionable Advice:
                              </p>
                              <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                                {item.advice}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-sm">
                  No substantive clause differences detected between the documents.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-800 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>DocuDiff AI &copy; 2026. For informational and risk audit purposes only. Not formal legal advice.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Gemini 3.5 Flash Lite</span>
            <span>&bull;</span>
            <span>FastAPI &amp; React</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
