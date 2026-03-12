import styles from '../coming-soon.module.css';

export const metadata = {
      title: 'Articles — West Chester by the Numbers',
      description: 'Data-driven articles on West Chester Borough and WCASD governance. Coming soon.',
};

export default function ArticlesPage() {
      return (
              <main className={styles.main}>
<section className={styles.hero}>
        <div className={styles.inner}>
          <div className={styles.label}>Articles</div>
              <h1 className={styles.heading}>Coming Soon</h1>
              <p className={styles.subtext}>
            Data-driven coverage of West Chester Borough and WCASD governance is on the way.
                      Board meeting recaps, budget breakdowns, voting records, and more —
                all grounded in verifiable data.
                    </p>
              <a href="/" className={styles.btn}>Back to Home</a>
                    </div>
                    </section>
                    </main>
      );
}
