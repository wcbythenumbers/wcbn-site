'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './coming-soon.module.css';
import nf from './not-found.module.css';
import err from './error.module.css';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.inner}>
          <div className={styles.label}>Error</div>
          <h1 className={styles.heading}>Something went wrong</h1>
          <p className={styles.subtext}>
            This page couldn&apos;t load right now. Please try again in a minute.
          </p>
          <div className={nf.links}>
            <button
              type="button"
              onClick={() => reset()}
              className={`${styles.btn} ${nf.link} ${err.button}`}
            >
              Try again
            </button>
            <Link href="/" className={`${styles.btn} ${nf.link}`}>
              Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
