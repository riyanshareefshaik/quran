export function formatDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

/** YYYY-MM-DD for `daysAgo` days before today (local time). */
export function isoDay(daysAgo = 0): string {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Cells starting with these characters are executed as formulas by Excel /
// Sheets. User-submitted text is prefixed with ' so it opens as plain text.
function csvCell(value: unknown): string {
    let text = value === null || value === undefined ? '' : String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const lines = [headers.map(csvCell).join(','), ...rows.map(r => headers.map(h => csvCell(r[h])).join(','))];
    const blob = new Blob([`﻿${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

/** Converts a <input type="datetime-local"> value to ISO, or null if empty. */
export function localInputToIso(value: string): string | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Converts an ISO timestamp to a <input type="datetime-local"> value. */
export function isoToLocalInput(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Shared styles for every admin tab, scoped under .adm-root. */
export const ADMIN_CSS = `
.adm-root { --adm-panel: #151f1a; --adm-line: rgba(212, 175, 55, 0.18); }
.adm-root .adm-panel { background: var(--adm-panel); border: 1px solid var(--adm-line); border-radius: 12px; padding: 1.25rem; }
.adm-root .adm-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 1rem; }
.adm-root .adm-stat { display: flex; flex-direction: column; gap: 0.3rem; }
.adm-root .adm-stat-value { font-size: 1.9rem; font-weight: 700; color: var(--gold-primary); line-height: 1.1; }
.adm-root .adm-stat-label { font-size: 0.78rem; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 1px; }
.adm-root h2.adm-h { font-size: 1.05rem; color: var(--white); margin: 0 0 1rem; }
.adm-root .adm-toolbar { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-bottom: 1rem; }
.adm-root .adm-spacer { flex: 1; }
.adm-root .adm-btn {
    font-family: inherit; font-size: 0.82rem; font-weight: 600; cursor: pointer; border-radius: 8px;
    padding: 0.5rem 0.95rem; border: 1px solid var(--emerald-medium); background: transparent; color: var(--emerald-light);
}
.adm-root .adm-btn:hover { border-color: var(--gold-primary); color: var(--gold-primary); }
.adm-root .adm-btn.primary { background: var(--gold-primary); border-color: var(--gold-primary); color: var(--matte-black); }
.adm-root .adm-btn.danger { border-color: rgba(230, 120, 120, 0.5); color: #e6a5a5; }
.adm-root .adm-btn.danger:hover { background: rgba(230, 120, 120, 0.1); }
.adm-root .adm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.adm-root .adm-btn:focus-visible, .adm-root .adm-input:focus-visible, .adm-root .adm-chip:focus-visible { outline: 2px solid var(--gold-primary); outline-offset: 2px; }
.adm-root .adm-chip {
    font-family: inherit; font-size: 0.78rem; cursor: pointer; border-radius: 20px; padding: 0.35rem 0.85rem;
    border: 1px solid rgba(22,125,79,0.5); background: rgba(4,57,39,0.25); color: var(--emerald-light);
}
.adm-root .adm-chip.active { background: var(--gold-primary); border-color: var(--gold-primary); color: var(--matte-black); font-weight: 600; }
.adm-root .adm-input {
    width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(212,175,55,0.3); color: var(--off-white);
    border-radius: 8px; padding: 0.6rem 0.8rem; font-family: inherit; font-size: 0.9rem;
}
.adm-root select.adm-input option { background: #101a15; }
.adm-root .adm-input:focus { outline: none; border-color: var(--gold-primary); }
.adm-root .adm-field { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.82rem; color: rgba(255,255,255,0.75); }
.adm-root .adm-form { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.adm-root .adm-form .full { grid-column: 1 / -1; }
.adm-root .adm-list { display: flex; flex-direction: column; gap: 0.75rem; }
.adm-root .adm-item { background: var(--adm-panel); border: 1px solid var(--adm-line); border-radius: 10px; padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.5rem; }
.adm-root .adm-item-head { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
.adm-root .adm-item-body { color: rgba(255,255,255,0.88); font-size: 0.93rem; white-space: pre-wrap; overflow-wrap: anywhere; }
.adm-root .adm-meta { font-size: 0.75rem; color: rgba(255,255,255,0.5); }
.adm-root .adm-badge { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 1px; border-radius: 20px; padding: 0.15rem 0.6rem; border: 1px solid; }
.adm-root .adm-badge.new { color: var(--gold-primary); border-color: var(--gold-primary); }
.adm-root .adm-badge.read, .adm-root .adm-badge.reviewing { color: #9fc5e8; border-color: rgba(159,197,232,0.6); }
.adm-root .adm-badge.resolved, .adm-root .adm-badge.fixed, .adm-root .adm-badge.live { color: #7fd1a3; border-color: rgba(127,209,163,0.6); }
.adm-root .adm-badge.dismissed, .adm-root .adm-badge.off { color: rgba(255,255,255,0.5); border-color: rgba(255,255,255,0.3); }
.adm-root .adm-empty { text-align: center; color: rgba(255,255,255,0.5); padding: 2rem 0; font-size: 0.9rem; }
.adm-root .adm-error { color: #e6a5a5; font-size: 0.85rem; }
.adm-root .adm-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.adm-root .adm-table th { text-align: left; color: rgba(255,255,255,0.55); font-weight: 500; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; padding: 0.5rem; border-bottom: 1px solid var(--adm-line); }
.adm-root .adm-table td { padding: 0.55rem 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.85); }
.adm-root .adm-table td.num { text-align: right; font-variant-numeric: tabular-nums; }
.adm-root .adm-bars { display: flex; align-items: flex-end; gap: 3px; height: 140px; padding-top: 0.5rem; }
.adm-root .adm-bar { flex: 1; background: linear-gradient(180deg, var(--gold-primary), rgba(212,175,55,0.35)); border-radius: 3px 3px 0 0; min-height: 2px; position: relative; }
.adm-root .adm-bar:hover { background: var(--gold-secondary); }
.adm-root .adm-bar-labels { display: flex; justify-content: space-between; font-size: 0.7rem; color: rgba(255,255,255,0.45); margin-top: 0.35rem; }
@media (max-width: 640px) {
    .adm-root .adm-form { grid-template-columns: 1fr; }
}
`;
