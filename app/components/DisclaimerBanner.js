'use client';

import { useEffect, useState } from 'react';
import styles from './DisclaimerBanner.module.css';

const STORAGE_KEY = 'wcbn_disclaimer_dismissed';

export default function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== 'true') {
        setDismissed(false);
      }
    } catch {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore storage errors (e.g. private browsing)
    }
  };

  if (dismissed) return null;

  return (
    <div className={styles.banner} role="note">
      <p className={styles.text}>
        We do our best to keep this data accurate, but errors happen. Information may be
        incomplete, outdated, or incorrect. Always verify with official sources before relying
        on it.
      </p>
      <button
        type="button"
        className={styles.dismiss}
        onClick={handleDismiss}
        aria-label="Dismiss disclaimer"
      >
        &times;
      </button>
    </div>
  );
}
