'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './rates.module.css';

const MUNICIPALITIES = [
  {
    id: 'wc-borough',
    name: 'West Chester Borough',
    shortName: 'WC Borough',
    county: 5.164,
    municipal: 8.09,
    school: 23.38,
    eit: '1.25%',
    lst: '$52',
  },
  {
    id: 'east-goshen',
    name: 'East Goshen Township',
    shortName: 'East Goshen',
    county: 5.164,
    municipal: 1.75,
    school: 23.38,
    eit: '1.00%',
    lst: '$52',
  },
  {
    id: 'west-goshen',
    name: 'West Goshen Township',
    shortName: 'West Goshen',
    county: 5.164,
    municipal: 2.00,
    school: 23.38,
    eit: '1.00%',
    lst: '$52',
  },
  {
    id: 'east-bradford',
    name: 'East Bradford Township',
    shortName: 'East Bradford',
    county: 5.164,
    municipal: 2.25,
    school: 23.38,
    eit: '1.25%',
    lst: '$52',
  },
  {
    id: 'west-whiteland',
    name: 'West Whiteland Township',
    shortName: 'West Whiteland',
    county: 5.164,
    municipal: 2.00,
    school: 23.38,
    eit: '1.00%',
    lst: '$52',
  },
  {
    id: 'westtown',
    name: 'Westtown Township',
    shortName: 'Westtown',
    county: 5.164,
    municipal: 3.92,
    school: 23.38,
    eit: '1.08%',
    lst: '$52',
  },
  {
    id: 'thornbury-chester',
    name: 'Thornbury Twp (Chester Co.)',
    shortName: 'Thornbury (Chester)',
    county: 5.164,
    municipal: 0.995,
    school: 23.38,
    eit: '1.00%',
    lst: '$52',
  },
  {
    id: 'thornbury-delaware',
    name: 'Thornbury Twp (Delaware Co.)',
    shortName: 'Thornbury (Del. Co.)',
    county: 3.873,
    municipal: null,
    school: 11.36,
    eit: '1.00%',
    lst: '$52',
  },
];

function getTotal(m) {
  if (m.municipal === null) return null;
  return +(m.county + m.municipal + m.school).toFixed(3);
}

export default function RatesClient() {
  const allIds = MUNICIPALITIES.map((m) => m.id);
  const [selected, setSelected] = useState(new Set(allIds));

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const visible = MUNICIPALITIES.filter((m) => selected.has(m.id));
  const chartData = visible
    .map((m) => ({ ...m, total: getTotal(m) }))
    .filter((m) => m.total !== null);
  const maxTotal = chartData.length > 0 ? Math.max(...chartData.map((m) => m.total)) : 1;

  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>Taxes &amp; Budget</div>
          <h1 className={styles.heading}>Tax Rate Comparisons</h1>
          <p className={styles.intro}>
            This page lets you compare local tax rates across the municipalities
            in the greater West Chester area. Rates shown are for the current
            tax year. All three layers of local taxation are included: property
            tax (county + municipal + school district millage), earned income
            tax (EIT), and local services tax (LST).
          </p>
        </div>
      </header>

      <div className={styles.content}>

        {/* Municipality toggles */}
        <section className={styles.filterSection}>
          <div className={styles.filterLabel}>Select municipalities to compare</div>
          <div className={styles.toggleGrid}>
            {MUNICIPALITIES.map((m) => (
              <button
                key={m.id}
                className={`${styles.toggleBtn} ${selected.has(m.id) ? styles.toggleActive : ''}`}
                onClick={() => toggle(m.id)}
                aria-pressed={selected.has(m.id)}
              >
                {m.name}
              </button>
            ))}
          </div>
        </section>

        {/* Table */}
        <section className={styles.tableSection}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thMuni}>Municipality</th>
                  <th className={styles.thNum}>County<br />Millage</th>
                  <th className={styles.thNum}>Municipal<br />Millage</th>
                  <th className={styles.thNum}>School<br />Millage</th>
                  <th className={`${styles.thNum} ${styles.thTotal}`}>Total<br />Millage</th>
                  <th className={styles.thNum}>EIT Rate<br />(Residents)</th>
                  <th className={styles.thNum}>LST<br />(flat)</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((m) => {
                  const total = getTotal(m);
                  return (
                    <tr key={m.id} className={styles.tr}>
                      <td className={styles.tdMuni}>{m.name}</td>
                      <td className={styles.tdNum}>{m.county.toFixed(3)}</td>
                      <td className={styles.tdNum}>
                        {m.municipal !== null ? m.municipal.toFixed(3) : <span className={styles.tbd}>TBD</span>}
                      </td>
                      <td className={styles.tdNum}>{m.school.toFixed(2)}</td>
                      <td className={`${styles.tdNum} ${styles.tdTotal}`}>
                        {total !== null ? total.toFixed(3) : <span className={styles.tbd}>N/A</span>}
                      </td>
                      <td className={styles.tdNum}>{m.eit}</td>
                      <td className={styles.tdNum}>{m.lst}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bar chart */}
        {chartData.length > 0 && (
          <section className={styles.chartSection}>
            <h2 className={styles.chartTitle}>Total Combined Millage</h2>
            <p className={styles.chartSubtitle}>
              Property tax only (county + municipal + school district).
              Excludes Thornbury Twp (Delaware Co.) — municipal millage pending.
            </p>
            <div className={styles.chart}>
              {chartData.map((m) => {
                const pct = (m.total / maxTotal) * 100;
                const isHighest = m.total === maxTotal;
                return (
                  <div key={m.id} className={styles.chartRow}>
                    <div className={styles.chartLabel}>{m.shortName}</div>
                    <div className={styles.chartBarWrap}>
                      <div
                        className={`${styles.chartBar} ${isHighest ? styles.chartBarHighest : ''}`}
                        style={{ width: `${pct}%` }}
                        role="meter"
                        aria-valuenow={m.total}
                        aria-valuemin={0}
                        aria-valuemax={maxTotal}
                        aria-label={`${m.name}: ${m.total.toFixed(3)} mills`}
                      >
                        <span className={styles.chartValue}>{m.total.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Disclaimer */}
        <div className={styles.disclaimer}>
          <p>
            Tax rates change annually and this page may not reflect the most
            current figures. If you notice a discrepancy, please contact us at{' '}
            <a href="mailto:hello@westchesterbythenumbers.com" className={styles.disclaimerLink}>
              hello@westchesterbythenumbers.com
            </a>{' '}
            — we appreciate the help keeping this accurate. Always verify
            current rates directly with the taxing authority before relying on
            this information for any purpose.
          </p>
        </div>

        {/* Link to explainer */}
        <div className={styles.explainerLink}>
          <span className={styles.explainerLinkLabel}>Want to understand what these numbers mean?</span>
          <Link href="/taxes/explainer" className={styles.explainerLinkAnchor}>
            Read: How Local Taxes Work →
          </Link>
        </div>

      </div>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>© 2025 West Chester by the Numbers</span>
          <div className={styles.footerLinks}>
            <a href="/about">About</a>
            <a href="/calendar">Calendar</a>
            <a href="/subscribe">Subscribe</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
