import styles from './DataNote.module.css';

export default function DataNote({ children }) {
  return (
    <details className={styles.note}>
      <summary className={styles.summary}>
        About this data
        <span className={styles.chevron} aria-hidden="true" />
      </summary>
      <p className={styles.body}>{children}</p>
    </details>
  );
}
