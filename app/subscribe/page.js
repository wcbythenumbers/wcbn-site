import styles from '../coming-soon.module.css';

export const metadata = {
    title: 'Subscribe — West Chester by the Numbers',
    description: 'Subscribe to West Chester by the Numbers. Free data-driven coverage of West Chester Borough and WCASD governance.',
};

export default function SubscribePage() {
    return (
          <main className={styles.main}>
<section className={styles.hero}>
        <div className={styles.inner}>
          <div className={styles.label}>Newsletter</div>
            <h1 className={styles.heading}>Coming Soon</h1>
            <p className={styles.subtext}>
            The West Chester by the Numbers newsletter is on its way.
                  Free, data-driven coverage of local government delivered
              straight to your inbox.
                </p>
            <a href="/" className={styles.btn}>← Back to Home</a>
                </div>
                </section>
                </main>
    );
}
