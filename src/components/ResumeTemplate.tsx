import React from 'react';

// ── Types ─────────────────────────────────────────────────
export type ResumeContact = {
  phone?: string;
  email?: string;
  location?: string;
};

export type ResumeEntrySection = {
  heading: string;
  type: 'entries';
  entries: {
    institution: string;
    date?: string;
    role?: string;
    bullets?: string[];
  }[];
};

export type ResumeParagraphSection = {
  heading: string;
  type: 'paragraph';
  content: string;
};

export type ResumeTwoColumnSection = {
  heading: string;
  type: 'two-column';
  left: {
    label: string;
    items: string[];
  };
  right: {
    label: string;
    columns: string[][];
  };
};

export type ResumeSection =
  | ResumeParagraphSection
  | ResumeEntrySection
  | ResumeTwoColumnSection;

export type ResumeData = {
  name: string;
  title?: string;
  contact?: ResumeContact;
  sections: ResumeSection[];
};

// ── Helpers ───────────────────────────────────────────────
// Strip **bold** markdown that the AI sometimes outputs
function stripMd(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').trim();
}

// ── Component ─────────────────────────────────────────────
export default function ResumeTemplate({ data }: { data: ResumeData }) {
  return (
    <div style={{
      fontFamily: '"Helvetica Neue", Arial, Helvetica, sans-serif',
      color: '#111',
      background: '#fff',
      width: '100%',
      maxWidth: 680,
      margin: '0 auto',
      padding: '1.5rem 1.8rem',
      fontSize: '9pt',
      lineHeight: 1.4,
      boxSizing: 'border-box',
      // Reset any inherited link/accent colors from admin theme
      colorScheme: 'light',
    }}>

      {/* ── Header: Bold Name ── */}
      <div style={{ textAlign: 'center', marginBottom: '0.15rem' }}>
        <div style={{
          fontSize: '24pt',
          fontWeight: 900,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          color: '#000',
          lineHeight: 1.05,
        }}>
          {data.name}
        </div>

        {/* Subtitle */}
        {data.title && (
          <div style={{
            fontSize: '9.5pt',
            color: '#222',
            marginTop: '0.2rem',
            fontWeight: 400,
            letterSpacing: '0.01em',
          }}>
            {data.title}
          </div>
        )}
      </div>

      {/* ── Contact bar: left-aligned icons, single line ── */}
      {data.contact && (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '1.6rem',
          fontSize: '8pt',
          color: '#222',
          borderTop: '1.5px solid #111',
          borderBottom: '1.5px solid #111',
          padding: '0.22rem 0',
          marginTop: '0.35rem',
          marginBottom: '0.55rem',
          flexWrap: 'wrap',
        }}>
          {data.contact.phone && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '9pt' }}>📞</span>
              {data.contact.phone}
            </span>
          )}
          {data.contact.email && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '9pt' }}>✉</span>
              {data.contact.email}
            </span>
          )}
          {data.contact.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '9pt' }}>📍</span>
              {data.contact.location}
            </span>
          )}
        </div>
      )}

      {/* ── Sections ── */}
      {data.sections.map((section, i) => (
        <Section key={i} section={section} />
      ))}

    </div>
  );
}

// ── Section Router ────────────────────────────────────────
function Section({ section }: { section: ResumeSection }) {
  return (
    <div style={{ marginBottom: '0.45rem', pageBreakInside: 'avoid' }}>
      {/* Section heading with underline */}
      <div style={{
        fontSize: '10pt',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        color: '#000',
        borderBottom: '1.5px solid #111',
        paddingBottom: '0.1rem',
        marginBottom: '0.3rem',
      }}>
        {section.heading}
      </div>

      {section.type === 'paragraph' && <ParagraphSection section={section} />}
      {section.type === 'entries'   && <EntriesSection section={section} />}
      {section.type === 'two-column' && <TwoColumnSection section={section} />}
    </div>
  );
}

// ── Paragraph Section ─────────────────────────────────────
function ParagraphSection({ section }: { section: ResumeParagraphSection }) {
  return (
    <p style={{
      margin: 0,
      color: '#222',
      textAlign: 'justify',
      fontSize: '8.5pt',
      lineHeight: 1.5,
    }}>
      {stripMd(section.content)}
    </p>
  );
}

// ── Entries Section ───────────────────────────────────────
function EntriesSection({ section }: { section: ResumeEntrySection }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      {section.entries.map((entry, i) => (
        <div key={i} style={{ pageBreakInside: 'avoid' }}>

          {/* Institution line */}
          {(entry.institution || entry.date) && (
            <div style={{
              display: 'flex',
              justifyContent: entry.date ? 'space-between' : 'flex-start',
              alignItems: 'baseline',
              fontSize: '8.5pt',
              color: '#333',
            }}>
              <span style={{ color: '#333' }}>{stripMd(entry.institution)}</span>
              {entry.date && (
                <span style={{ color: '#444', flexShrink: 0, marginLeft: '0.5rem' }}>
                  {entry.date}
                </span>
              )}
            </div>
          )}

          {/* Role — bold */}
          {entry.role && (
            <div style={{
              fontWeight: 700,
              fontSize: '9pt',
              color: '#000',
              marginTop: '0.05rem',
            }}>
              {stripMd(entry.role)}
            </div>
          )}

          {/* Bullet points */}
          {entry.bullets && entry.bullets.length > 0 && (
            <ul style={{
              margin: '0.12rem 0 0 1rem',
              padding: 0,
              color: '#222',
              fontSize: '8.5pt',
              lineHeight: 1.45,
            }}>
              {entry.bullets.map((b, bi) => (
                <li key={bi} style={{ marginBottom: '0.05rem', listStyleType: 'disc', color: '#222' }}>
                  {stripMd(b)}
                </li>
              ))}
            </ul>
          )}

        </div>
      ))}
    </div>
  );
}

// ── Two-Column Section (Skills + Tools) ──────────────────
function TwoColumnSection({ section }: { section: ResumeTwoColumnSection }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem',
      alignItems: 'flex-start',
    }}>
      {/* Left — Skills */}
      <div>
        <div style={{
          fontWeight: 700,
          fontSize: '9.5pt',
          color: '#000',
          marginBottom: '0.2rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          {section.left.label}
        </div>
        <ul style={{
          margin: 0,
          padding: '0 0 0 1rem',
          color: '#222',
          fontSize: '8.5pt',
          lineHeight: 1.5,
        }}>
          {section.left.items.map((item, i) => (
            <li key={i} style={{ marginBottom: '0.05rem', listStyleType: 'disc' }}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Right — Tools (multi-column grid) */}
      <div>
        <div style={{
          fontWeight: 700,
          fontSize: '9.5pt',
          color: '#000',
          marginBottom: '0.2rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          {section.right.label}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${section.right.columns.length}, 1fr)`,
          gap: '0 1rem',
        }}>
          {section.right.columns.map((col, ci) => (
            <ul key={ci} style={{
              margin: 0,
              padding: '0 0 0 1rem',
              color: '#222',
              fontSize: '8.5pt',
              lineHeight: 1.5,
            }}>
              {col.map((item, i) => (
                <li key={i} style={{ marginBottom: '0.05rem', listStyleType: 'disc' }}>{item}</li>
              ))}
            </ul>
          ))}
        </div>
      </div>

    </div>
  );
}
