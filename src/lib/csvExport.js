// Zero-dependency CSV export utility.
//
// Why this exists:
//   - Excel and LibreOffice both interpret RFC 4180-shaped CSV reliably when
//     a UTF-8 BOM is present.
//   - Any external CSV lib (papaparse, json2csv, xlsx) is overkill for the
//     volumes the admin pages produce and adds bundle weight.
//
// Two responsibilities:
//   - escapeField(value): turn any JS value into a CSV-safe string.
//   - downloadCSV(rows, filename, columns): build a Blob and trigger a save.

const INJECTION_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

/**
 * RFC 4180 field escape + CSV-injection neutralization.
 *
 * - null/undefined → empty string
 * - boolean/number → toString()
 * - leading `=`, `+`, `-`, `@`, TAB, or CR → prefixed with `'` so Excel
 *   treats the cell as literal text instead of a formula (OWASP advisory).
 * - contains `,`, `"`, `\n`, `\r`, or `;` → wrapped in double quotes, with
 *   internal `"` doubled.
 */
export function escapeField(value) {
  if (value == null) return '';
  let s = typeof value === 'string' ? value : String(value);

  if (s.length > 0 && INJECTION_PREFIXES.includes(s[0])) {
    s = "'" + s;
  }

  const needsQuoting = /[",\r\n;]/.test(s);
  if (needsQuoting) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/**
 * Build a CSV string from rows + column definitions and trigger a download.
 *
 *   columns: Array<{ header: string, value: (row) => any }>
 *
 * - Prepends a UTF-8 BOM (﻿) so Excel autodetects encoding.
 * - Uses CRLF line endings (Excel-friendly).
 * - Caller is responsible for passing the already-filtered/sorted rows.
 */
export function downloadCSV(rows, filename, columns) {
  if (!Array.isArray(rows) || !Array.isArray(columns) || columns.length === 0) {
    return;
  }

  const lines = [];
  lines.push(columns.map(c => escapeField(c.header)).join(','));

  for (const row of rows) {
    const cells = columns.map(c => {
      let v;
      try {
        v = c.value(row);
      } catch {
        v = '';
      }
      return escapeField(v);
    });
    lines.push(cells.join(','));
  }

  const BOM = '﻿';
  const csv = BOM + lines.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Release the object URL on the next tick so the click has flushed.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
