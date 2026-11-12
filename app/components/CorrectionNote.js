import styles from './CorrectionNote.module.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2026-11-20: what was corrected" -> { date: 'Nov 20, 2026', body: 'what was corrected' }.
// Lines without a valid leading date return { date: null, body: line }.
function parseLine(line) {
  const match = line.match(/^(\d{4})-(\d{2})-(\d{2})\s*:\s*(.*)$/);
  if (match) {
    const [, y, m, d, rest] = match;
    const year = Number(y);
    const month = Number(m);
    const day = Number(d);
    const dt = new Date(Date.UTC(year, month - 1, day));
    if (
      dt.getUTCFullYear() === year &&
      dt.getUTCMonth() === month - 1 &&
      dt.getUTCDate() === day
    ) {
      return { date: `${MONTHS[month - 1]} ${day}, ${year}`, body: rest };
    }
  }
  return { date: null, body: line };
}

// One boxed note per line of `text`. Renders nothing when `text` is empty.
export default function CorrectionNote({ text }) {
  if (!text) return null;
  const lines = String(text)
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  if (lines.length === 0) return null;

  return (
    <div className={styles.wrap}>
      {lines.map((line, i) => {
        const { date, body } = parseLine(line);
        return (
          <p key={i} className={styles.note}>
            <strong className={styles.label}>
              {date ? `Correction (${date}):` : 'Correction:'}
            </strong>{' '}
            {body}
          </p>
        );
      })}
    </div>
  );
}
