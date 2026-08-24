'use client';
import { useState, useRef } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import ResumeTemplate, { ResumeData } from '@/components/ResumeTemplate';

// ── Style Constants ──────────────────────────────────────
const inp: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.85rem',
  borderRadius: 10,
  border: '1px solid var(--admin-border-strong)',
  background: 'var(--admin-bg-secondary)',
  color: 'var(--admin-text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
  fontFamily: 'inherit',
  resize: 'vertical',
};

const lbl: React.CSSProperties = {
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--admin-text-secondary)',
  marginBottom: '0.4rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
};

const card: React.CSSProperties = {
  background: 'var(--admin-card)',
  border: '1px solid var(--admin-border)',
  borderRadius: 'var(--admin-radius)',
  padding: '1.25rem',
  boxShadow: 'var(--admin-shadow)',
};

// ── Main Page ────────────────────────────────────────────
export default function ResumeFixerPage() {
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';
  const fileRef = useRef<HTMLInputElement>(null);

  // Resume PDF state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // JD + result state
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── PDF Upload ────────────────────────────────────────
  const handleFileSelect = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setExtractError('Only PDF files are supported.');
      return;
    }
    setPdfFile(file);
    setExtractError('');
    setResumeText('');
    setExtracting(true);

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/resume-fixer/extract', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        setExtractError(data.error ?? 'Failed to read PDF.');
        setPdfFile(null);
      } else {
        setResumeText(data.text);
      }
    } catch {
      setExtractError('Network error while reading PDF.');
      setPdfFile(null);
    }
    setExtracting(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    setResumeText('');
    setExtractError('');
    setResult(null);
  };

  // ── Fix Resume ────────────────────────────────────────
  const handleFix = async () => {
    setError('');
    setResult(null);

    if (!resumeText || resumeText.trim().length < 50) {
      setError('Please upload your resume PDF first.');
      return;
    }
    if (jobDescription.trim().length < 50) {
      setError('Please paste the job description (at least 50 characters).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/resume-fixer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: resumeText, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
      } else {
        setResult(data.result);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    }
    setLoading(false);
  };

  // ── Download PDF via print ────────────────────────────
  const handleDownloadPdf = () => {
    if (!result) return;
    window.print();
  };

  return (
    <AppLayout title="Resume Fixer AI">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
            Upload your resume PDF and paste a job description — the AI will rewrite your resume to match the role.
          </div>
          <button
            onClick={handleFix}
            disabled={loading || extracting || !pdfFile}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.4rem', borderRadius: 10, border: 'none',
              background: (loading || extracting || !pdfFile) ? 'rgba(59,130,246,0.4)' : 'var(--admin-accent)',
              color: '#fff', fontWeight: 700, fontSize: '0.875rem',
              cursor: (loading || extracting || !pdfFile) ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            <i className={`bi ${loading ? 'bi-hourglass-split' : 'bi-stars'}`} />
            {loading ? 'Fixing…' : 'Fix My Resume'}
          </button>
        </div>

        {/* Input panels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '1.25rem',
        }}>

          {/* Left — PDF Upload */}
          <div style={card}>
            <label style={lbl}>
              <i className="bi bi-file-earmark-person-fill" style={{ color: 'var(--admin-accent)' }} />
              Your Resume
            </label>

            {/* Drop zone */}
            {!pdfFile && (
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${dragOver ? 'var(--admin-accent)' : 'var(--admin-border-strong)'}`,
                  borderRadius: 10,
                  padding: '2.5rem 1rem',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '0.6rem', cursor: 'pointer', textAlign: 'center',
                  background: dragOver ? 'rgba(59,130,246,0.05)' : 'transparent',
                  transition: 'all 0.15s',
                  minHeight: isMobile ? 160 : 320,
                }}
              >
                <i className="bi bi-file-earmark-arrow-up" style={{ fontSize: '2rem', color: 'var(--admin-accent)', opacity: 0.7 }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>
                  Click to upload or drag & drop
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                  PDF only · Max 5MB
                </div>
              </div>
            )}

            {/* Extracting */}
            {pdfFile && extracting && (
              <div style={{
                border: '1px solid var(--admin-border)', borderRadius: 10, padding: '1.5rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                minHeight: isMobile ? 160 : 320, justifyContent: 'center',
              }}>
                <i className="bi bi-file-earmark-pdf-fill" style={{ fontSize: '2rem', color: 'var(--admin-accent)' }} />
                <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                  Reading <strong style={{ color: 'var(--admin-text-primary)' }}>{pdfFile.name}</strong>…
                </div>
              </div>
            )}

            {/* File loaded */}
            {pdfFile && !extracting && resumeText && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.65rem 0.85rem', borderRadius: 10,
                  background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)',
                }}>
                  <i className="bi bi-file-earmark-pdf-fill" style={{ color: '#4ade80', fontSize: '1.1rem', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pdfFile.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>
                      {resumeText.length.toLocaleString()} characters extracted
                    </div>
                  </div>
                  <button
                    onClick={handleRemovePdf}
                    title="Remove"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)', fontSize: '1rem', padding: '0.2rem', flexShrink: 0 }}
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
                <div style={{
                  background: 'var(--admin-bg-secondary)', borderRadius: 10,
                  border: '1px solid var(--admin-border)', padding: '0.75rem',
                  maxHeight: isMobile ? 160 : 240, overflowY: 'auto',
                }}>
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.72rem', lineHeight: 1.6, color: 'var(--admin-text-muted)', margin: 0, fontFamily: 'inherit' }}>
                    {resumeText}
                  </pre>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>
                  Extracted text preview ·{' '}
                  <span style={{ color: 'var(--admin-accent)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => fileRef.current?.click()}>
                    Replace PDF
                  </span>
                </div>
              </div>
            )}

            {extractError && (
              <div style={{
                marginTop: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: 10,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <i className="bi bi-exclamation-triangle-fill" />
                {extractError}
              </div>
            )}

            <input ref={fileRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleFileInputChange} />
          </div>

          {/* Right — Job Description */}
          <div style={card}>
            <label style={lbl}>
              <i className="bi bi-briefcase-fill" style={{ color: 'var(--admin-accent)' }} />
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here…"
              rows={isMobile ? 10 : 18}
              style={inp}
            />
            <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', marginTop: '0.4rem' }}>
              {jobDescription.length} characters
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: 10,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <i className="bi bi-exclamation-triangle-fill" />
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={card}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[60, 40, 100, 85, 92, 70, 88, 60, 95, 75].map((w, i) => (
                <div key={i} style={{
                  height: i < 2 ? 20 : 13, borderRadius: 6, width: `${w}%`,
                  background: 'var(--admin-border)', opacity: 0.6,
                }} />
              ))}
              <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <i className="bi bi-stars" style={{ color: 'var(--admin-accent)' }} />
                AI is rewriting your resume…
              </div>
            </div>
          </div>
        )}

        {/* Output — Resume Preview */}
        {result && !loading && (
          <div style={card}>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-check-circle-fill" style={{ color: '#4ade80', fontSize: '1rem' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>Fixed Resume</span>
              </div>
              <button
                onClick={handleDownloadPdf}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.4rem 0.9rem', borderRadius: 8,
                  border: '1px solid var(--admin-border-strong)',
                  background: 'transparent', color: 'var(--admin-text-secondary)',
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <i className="bi bi-file-earmark-pdf-fill" />
                Download PDF
              </button>
            </div>

            {/* Resume preview — white paper look */}
            <div style={{
              border: '1px solid var(--admin-border)',
              borderRadius: 8,
              overflow: 'hidden',
              background: '#fff',
            }}>
              <ResumeTemplate data={result} />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !result && !error && (
          <div style={{
            ...card,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '3rem 1.5rem', gap: '0.75rem',
            border: '1px dashed var(--admin-border)', background: 'transparent',
          }}>
            <i className="bi bi-file-earmark-check" style={{ fontSize: '2.5rem', color: 'var(--admin-text-muted)', opacity: 0.5 }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', textAlign: 'center' }}>
              Your fixed resume will appear here.<br />
              Upload your PDF and paste a job description above, then click <strong>Fix My Resume</strong>.
            </div>
          </div>
        )}

      </div>

      {/* Print-only container — hidden on screen, full page when printing */}
      {result && (
        <div id="resume-print-root">
          <ResumeTemplate data={result} />
        </div>
      )}

      {/* Print styles */}
      <style>{`
        @page {
          size: 8.5in 13in;
          margin: 0.65in 0.75in;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
          }
          body > * {
            display: none !important;
          }
          #resume-print-root {
            display: block !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
          }
        }
        #resume-print-root { display: none; }
      `}</style>

    </AppLayout>
  );
}
