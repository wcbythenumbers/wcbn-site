import styles from './AiRecapNote.module.css';

// Standard note on how meeting recaps are prepared. Same look as the recap
// source note; `light` is for use inside the navy page hero.
export default function AiRecapNote({ light = false }) {
  return (
    <p className={`${styles.note} ${light ? styles.light : ''}`}>
      WCBN uses AI to assist with certain tasks in preparing these summaries,
      such as transcribing meeting recordings and drafting summaries. Each
      summary is checked against the recording or the official minutes in a
      separate automated review before it is posted. Votes marked
      “Provisional” have not yet been checked against the official minutes.
      See an error? Email{' '}
      <a href="mailto:hello@westchesterbythenumbers.com" className={styles.link}>
        hello@westchesterbythenumbers.com
      </a>
    </p>
  );
}
