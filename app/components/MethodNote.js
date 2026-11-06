import styles from './MethodNote.module.css';

// Collapsed note for the page body (light background). Same structure and
// behavior as DataNote, which is styled for the navy page hero.
export default function MethodNote({ summary, children }) {
  return (
    <details className={styles.note}>
      <summary className={styles.summary}>
        {summary}
        <span className={styles.chevron} aria-hidden="true" />
      </summary>
      <div className={styles.body}>{children}</div>
    </details>
  );
}
