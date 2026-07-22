import { CHANGELOG_ENTRIES } from './CHANGELOG_ENTRIES'; // changelog data — newest first

// Badge colours keyed on change type
const TYPE_STYLE = {
  feat:     { background: '#1e3a5f', color: '#93c5fd', label: 'feat' },
  fix:      { background: '#1a2f1a', color: '#86efac', label: 'fix' },
  refactor: { background: '#2d1f3d', color: '#c4b5fd', label: 'refactor' },
  chore:    { background: '#2d2416', color: '#fcd34d', label: 'chore' },
  docs:     { background: '#1e293b', color: '#94a3b8', label: 'docs' },
};

// Single changelog entry card
function EntryCard({ entry }) {
  return (
    <div style={s.card}>
      {/* Card header — version, date, label */}
      <div style={s.cardHeader}>
        <span style={s.version}>v{entry.version}</span>
        <span style={s.label}>{entry.label}</span>
        <span style={s.date}>{entry.date}</span>
      </div>

      {/* Change list */}
      <ul style={s.list}>
        {entry.changes.map((c, i) => {
          const badge = TYPE_STYLE[c.type] ?? TYPE_STYLE.docs; // fall back to docs style for unknown types
          return (
            <li key={i} style={s.listItem}>
              {/* Type badge */}
              <span style={{ ...s.badge, background: badge.background, color: badge.color }}>
                {badge.label}
              </span>
              {/* Change description */}
              <span style={s.changeText}>{c.text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Top-level changelog section rendered in the spin-docs shell
export function ChangelogSection() {
  return (
    <div style={s.root}>
      {/* Section heading */}
      <div style={s.heading}>
        <h2 style={s.title}>Platform Changelog</h2>
        <p style={s.subtitle}>Significant changes to spin-core, ordered newest first.</p>
      </div>

      {/* Entry cards */}
      <div style={s.stack}>
        {CHANGELOG_ENTRIES.map(entry => (
          <EntryCard key={entry.version} entry={entry} />
        ))}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  root: {
    flex: 1,
    overflowY: 'auto',
    padding: '32px 40px',
    // maxWidth: '860px',
  },
  heading: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#f1f5f9',        // slate-100
    margin: '0 0 6px',
    letterSpacing: '-0.01em',
  },
  subtitle: {
    color: '#64748b',        // slate-500
    fontSize: '13px',
    margin: 0,
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    background: '#1e293b',   // slate-800
    border: '1px solid #334155', // slate-700
    borderRadius: '10px',
    padding: '18px 20px',
  },
  cardHeader: {
    alignItems: 'baseline',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '14px',
  },
  version: {
    background: '#1d4ed8',   // blue-700
    borderRadius: '6px',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    padding: '3px 9px',
  },
  label: {
    color: '#e2e8f0',        // slate-200
    fontSize: '14px',
    fontWeight: 600,
    flex: 1,
  },
  date: {
    color: '#64748b',        // slate-500
    fontFamily: 'monospace',
    fontSize: '11px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  listItem: {
    alignItems: 'flex-start',
    display: 'flex',
    gap: '10px',
  },
  badge: {
    borderRadius: '4px',
    flexShrink: 0,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    marginTop: '1px',
    padding: '2px 7px',
    textTransform: 'uppercase',
  },
  changeText: {
    color: '#94a3b8',        // slate-400
    fontSize: '13px',
    lineHeight: 1.5,
  },
};
