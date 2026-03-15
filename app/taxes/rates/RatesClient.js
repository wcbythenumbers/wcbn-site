'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';
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
  },
  {
    id: 'east-goshen',
    name: 'East Goshen Township',
    shortName: 'East Goshen',
    county: 5.164,
    municipal: 1.75,
    school: 23.38,
    eit: '1.00%',
  },
  {
    id: 'west-goshen',
    name: 'West Goshen Township',
    shortName: 'West Goshen',
    county: 5.164,
    municipal: 2.00,
    school: 23.38,
    eit: '1.00%',
  },
  {
    id: 'east-bradford',
    name: 'East Bradford Township',
    shortName: 'East Bradford',
    county: 5.164,
    municipal: 2.25,
    school: 23.38,
    eit: '1.25%',
  },
  {
    id: 'west-whiteland',
    name: 'West Whiteland Township',
    shortName: 'West Whiteland',
    county: 5.164,
    municipal: 2.00,
    school: 23.38,
    eit: '1.00%',
  },
  {
    id: 'westtown',
    name: 'Westtown Township',
    shortName: 'Westtown',
    county: 5.164,
    municipal: 3.92,
    school: 23.38,
    eit: '1.08%',
  },
  {
    id: 'thornbury-chester',
    name: 'Thornbury Twp (Chester Co.)',
    shortName: 'Thornbury (Chester)',
    county: 5.164,
    municipal: 0.995,
    school: 23.38,
    eit: '1.00%',
  },
  {
    id: 'thornbury-delaware',
    name: 'Thornbury Twp (Delaware Co.)',
    shortName: 'Thornbury (Del. Co.)',
    county: 3.873,
    municipal: 0,
    municipalNote: 'This municipality levies no municipal property tax.',
    school: 11.36,
    eit: '1.00%',
  },
];

const ALL_IDS = MUNICIPALITIES.map((m) => m.id);

function getTotalMillage(m) {
  if (m.municipal === null) return null;
  return +(m.county + m.municipal + m.school).toFixed(3);
}

function millToDollar(mills, assessed) {
  return (mills * assessed) / 1000;
}

function fmt$(n) {
  return '$' + Math.round(n).toLocaleString();
}

function fmtMillage(n) {
  return n.toFixed(3);
}

const SOURCES = [
  {
    category: 'Property Tax',
    links: [
      { label: 'Chester County Tax Rates', href: 'https://www.chesco.org/1585/Tax-Rates' },
      { label: 'Chester County Assessment Office', href: 'https://www.chesco.org/213/Assessment' },
      { label: 'Delaware County Assessment Office', href: 'https://www.delcopa.gov/assessment/index.html' },
      { label: 'WCASD Real Estate Taxes', href: 'https://www.wcasd.net/our-team/departments/business-finance/real-estate-taxes' },
    ],
  },
  {
    category: 'Earned Income Tax',
    links: [
      { label: 'Keystone Collections Group', href: 'https://keystonecollects.com' },
      { label: 'PA DCED PSD Codes & EIT Rates', href: 'https://dced.pa.gov/local-government/local-income-tax-information/psd-codes-and-eit-rates/' },
    ],
  },
  {
    category: 'Municipal Tax Information',
    links: [
      { label: 'West Chester Borough Finance', href: 'https://www.west-chester.com/299/Finance' },
      { label: 'East Goshen Township', href: 'https://eastgoshen.org' },
      { label: 'West Goshen Township Tax Collector', href: 'https://www.westgoshen.org/169/Tax-Collector' },
      { label: 'East Bradford Township Taxes', href: 'https://www.eastbradford.org/205/Taxes-Audits' },
      { label: 'West Whiteland Township Taxes', href: 'https://www.westwhiteland.org/181/Taxes' },
      { label: 'Westtown Township Taxes', href: 'https://westtownpa.org/taxes/' },
      { label: 'Thornbury Township (Chester Co.)', href: 'https://www.thornburytwp.com' },
      { label: 'Thornbury Township (Delaware Co.) Local Tax Information', href: 'https://www.thornbury.org/residents/page/local-tax-information' },
    ],
  },
];

const TOOLTIP_STYLE = {
  fontFamily: 'IBM Plex Mono, monospace',
  fontSize: '0.72rem',
  background: '#0A1931',
  border: 'none',
  color: '#F8F6F0',
  borderRadius: 2,
};

export default function RatesClient() {
  const [selected, setSelected] = useState(new Set(ALL_IDS));
  const [viewMode, setViewMode] = useState('millage');
  const [assessedValue, setAssessedValue] = useState(150000);
  const [calcOpen, setCalcOpen] = useState(false);
  const [marketInput, setMarketInput] = useState('');
  const [calcCounty, setCalcCounty] = useState('chester');
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const allSelected = selected.size === MUNICIPALITIES.length;

  const toggleMuni = (id) => {
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

  const selectAll = () => setSelected(new Set(ALL_IDS));
  const deselectAll = () => setSelected(new Set([ALL_IDS[0]]));

  const visible = MUNICIPALITIES.filter((m) => selected.has(m.id));

  const chartData = visible
    .map((m) => {
      const totalMillage = getTotalMillage(m);
      const value =
        viewMode === 'millage'
          ? totalMillage
          : totalMillage !== null
          ? millToDollar(totalMillage, assessedValue)
          : null;
      return { id: m.id, name: m.shortName, value };
    })
    .filter((d) => d.value !== null);

  const maxValue = chartData.length > 0 ? Math.max(...chartData.map((d) => d.value)) : 1;

  const chartHeight = Math.max(220, chartData.length * 54);

  const marketNum = parseFloat(marketInput.replace(/,/g, '')) || 0;
  const estimatedAssessed =
    marketNum > 0
      ? Math.round(marketNum * (calcCounty === 'chester' ? 0.35 : 0.85))
      : null;

  const labelFormatter = (val) =>
    viewMode === 'millage' ? fmtMillage(val) : fmt$(val);

  const tooltipFormatter = (val) =>
    viewMode === 'millage'
      ? [`${fmtMillage(val)} mills`, 'Total Millage']
      : [fmt$(val), 'Est. Total Property Tax'];

  return (
    <main className={styles.main}>
      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>Taxes &amp; Budget</div>
          <h1 className={styles.heading}>Tax Rate Comparisons</h1>
          <p className={styles.intro}>
            Compare local tax rates across the municipalities in the greater
            West Chester area. All three layers of local taxation are included:
            property tax (county + municipal + school district millage), earned
            income tax (EIT), and local services tax (LST).
          </p>
        </div>
      </header>

      <div className={styles.content}>

        {/* ── Municipality toggles ── */}
        <section className={styles.filterSection}>
          <div className={styles.filterRow}>
            <div className={styles.filterLabel}>Select municipalities</div>
            <div className={styles.selectAllRow}>
              <button
                className={styles.selectAllBtn}
                onClick={allSelected ? deselectAll : selectAll}
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>
          <div className={styles.toggleGrid}>
            {MUNICIPALITIES.map((m) => (
              <button
                key={m.id}
                className={`${styles.toggleBtn} ${selected.has(m.id) ? styles.toggleActive : ''}`}
                onClick={() => toggleMuni(m.id)}
                aria-pressed={selected.has(m.id)}
              >
                {m.name}
              </button>
            ))}
          </div>
        </section>

        {/* ── View mode toggle ── */}
        <section className={styles.viewSection}>
          <div className={styles.viewToggleGroup} role="group" aria-label="View mode">
            <button
              className={`${styles.viewBtn} ${viewMode === 'millage' ? styles.viewActive : ''}`}
              onClick={() => setViewMode('millage')}
              aria-pressed={viewMode === 'millage'}
            >
              Millage Rates
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === 'dollar' ? styles.viewActive : ''}`}
              onClick={() => setViewMode('dollar')}
              aria-pressed={viewMode === 'dollar'}
            >
              Dollar Amount
            </button>
          </div>
        </section>

        {/* ── Dollar mode: assessed value input + collapsible ── */}
        {viewMode === 'dollar' && (
          <section className={styles.assessedSection}>
            <label className={styles.assessedLabel} htmlFor="assessed-input">
              Assessed property value
            </label>
            <div className={styles.assessedInputRow}>
              <span className={styles.assessedDollarSign}>$</span>
              <input
                id="assessed-input"
                type="number"
                min="0"
                step="1000"
                className={styles.assessedInput}
                value={assessedValue}
                onChange={(e) =>
                  setAssessedValue(Math.max(0, Number(e.target.value) || 0))
                }
              />
            </div>

            {/* Collapsible */}
            <div className={styles.collapsible}>
              <button
                className={styles.collapsibleToggle}
                onClick={() => setCalcOpen(!calcOpen)}
                aria-expanded={calcOpen}
              >
                <span>How do I find my assessed value?</span>
                <span className={styles.collapsibleArrow}>
                  {calcOpen ? '▲' : '▼'}
                </span>
              </button>

              {calcOpen && (
                <div className={styles.collapsibleBody}>
                  <p>
                    Chester County assesses property at approximately{' '}
                    <strong>35% of market value</strong>. Delaware County
                    assesses at approximately <strong>85% of market value</strong>.
                    Your assessed value may differ from your home's current sale
                    price or estimated market value.
                  </p>
                  <p>
                    All three taxing bodies — your county, your municipality,
                    and your school district — use the same assessed value set
                    by the county assessment office. There is only one assessed
                    value per property. Each taxing body simply applies its own
                    millage rate to that same number.
                  </p>

                  <div className={styles.calcBox}>
                    <div className={styles.calcBoxLabel}>Estimate your assessed value</div>
                    <div className={styles.calcRow}>
                      <div className={styles.calcField}>
                        <label htmlFor="market-input" className={styles.calcFieldLabel}>
                          Estimated market value
                        </label>
                        <div className={styles.calcInputWrap}>
                          <span className={styles.assessedDollarSign}>$</span>
                          <input
                            id="market-input"
                            type="number"
                            min="0"
                            step="10000"
                            className={styles.assessedInput}
                            placeholder="e.g. 400000"
                            value={marketInput}
                            onChange={(e) => setMarketInput(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className={styles.calcField}>
                        <label htmlFor="calc-county" className={styles.calcFieldLabel}>
                          County
                        </label>
                        <select
                          id="calc-county"
                          className={styles.calcSelect}
                          value={calcCounty}
                          onChange={(e) => setCalcCounty(e.target.value)}
                        >
                          <option value="chester">Chester County</option>
                          <option value="delaware">Delaware County</option>
                        </select>
                      </div>
                    </div>
                    {estimatedAssessed !== null && (
                      <div className={styles.calcResult}>
                        Estimated assessed value:{' '}
                        <strong>${estimatedAssessed.toLocaleString()}</strong>
                      </div>
                    )}
                  </div>

                  <p className={styles.calcNote}>
                    Actual assessed values are set by the county assessment
                    office and may differ from this estimate. Look up your exact
                    assessed value at the{' '}
                    <a
                      href="https://www.chesco.org/1290/Assessment"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.calcLink}
                    >
                      Chester County Assessment Office
                    </a>{' '}
                    or the{' '}
                    <a
                      href="https://www.delcopa.gov/assessment/index.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.calcLink}
                    >
                      Delaware County Assessment Office
                    </a>
                    .
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Table ── */}
        <section className={styles.tableSection}>
          <div className={styles.tableWrap}>
            {viewMode === 'millage' ? (
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
                    const total = getTotalMillage(m);
                    return (
                      <tr key={m.id} className={styles.tr}>
                        <td className={styles.tdMuni}>{m.name}</td>
                        <td className={styles.tdNum}>{fmtMillage(m.county)}</td>
                        <td className={styles.tdNum}>
                          {fmtMillage(m.municipal)}
                          {m.municipalNote && (
                            <sup className={styles.noteRef} title={m.municipalNote}>†</sup>
                          )}
                        </td>
                        <td className={styles.tdNum}>{m.school.toFixed(2)}</td>
                        <td className={`${styles.tdNum} ${styles.tdTotal}`}>
                          {total !== null ? fmtMillage(total) : <span className={styles.tbd}>N/A</span>}
                        </td>
                        <td className={styles.tdNum}>{m.eit}</td>
                        <td className={styles.tdNum}>$52</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thMuni}>Municipality</th>
                    <th className={styles.thNum}>County Tax</th>
                    <th className={styles.thNum}>Municipal Tax</th>
                    <th className={styles.thNum}>School Tax</th>
                    <th className={`${styles.thNum} ${styles.thTotal}`}>Total Property Tax</th>
                    <th className={styles.thNum}>EIT Rate<br />(Residents)</th>
                    <th className={styles.thNum}>LST<br />(flat)</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((m) => {
                    const countyTax = millToDollar(m.county, assessedValue);
                    const muniTax = millToDollar(m.municipal, assessedValue);
                    const schoolTax = millToDollar(m.school, assessedValue);
                    const total = countyTax + muniTax + schoolTax;
                    return (
                      <tr key={m.id} className={styles.tr}>
                        <td className={styles.tdMuni}>{m.name}</td>
                        <td className={styles.tdNum}>{fmt$(countyTax)}</td>
                        <td className={styles.tdNum}>
                          {fmt$(muniTax)}
                          {m.municipalNote && (
                            <sup className={styles.noteRef} title={m.municipalNote}>†</sup>
                          )}
                        </td>
                        <td className={styles.tdNum}>{fmt$(schoolTax)}</td>
                        <td className={`${styles.tdNum} ${styles.tdTotal}`}>
                          {fmt$(total)}
                        </td>
                        <td className={styles.tdNum}>{m.eit}</td>
                        <td className={styles.tdNum}>$52</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          {visible.some((m) => m.municipalNote) && (
            <p className={styles.tableFootnote}>
              † Thornbury Township (Delaware Co.) levies no municipal property tax.
            </p>
          )}
        </section>

        {/* ── Bar chart ── */}
        {chartData.length > 0 && (
          <section className={styles.chartSection}>
            <h2 className={styles.chartTitle}>
              {viewMode === 'millage'
                ? 'Total Combined Millage'
                : `Estimated Total Property Tax — assessed value ${fmt$(assessedValue)}`}
            </h2>
            <p className={styles.chartSubtitle}>
              {viewMode === 'dollar'
                ? 'Property tax only (county + municipal + school district).'
                : 'Combined county, municipal, and school district millage.'}
            </p>
            <div style={{ width: '100%', height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 0, right: 72, left: 10, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    domain={[0, maxValue * 1.02]}
                    tick={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fill: '#555' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={labelFormatter}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={128}
                    tick={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fill: '#0A1931' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    cursor={{ fill: 'rgba(10,25,49,0.05)' }}
                    formatter={tooltipFormatter}
                  />
                  <Bar dataKey="value" radius={[0, 2, 2, 0]} isAnimationActive={false}>
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.id}
                        fill={entry.value === maxValue ? '#C9A84C' : '#0A1931'}
                      />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="right"
                      formatter={labelFormatter}
                      style={{
                        fontFamily: 'IBM Plex Mono, monospace',
                        fontSize: 11,
                        fill: '#0A1931',
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* ── Disclaimer ── */}
        <div className={styles.disclaimer}>
          <p>
            Tax rates change annually and this page may not reflect the most
            current figures. If you notice a discrepancy, please contact us at{' '}
            <a
              href="mailto:hello@westchesterbythenumbers.com"
              className={styles.disclaimerLink}
            >
              hello@westchesterbythenumbers.com
            </a>{' '}
            — we appreciate the help keeping this accurate. Always verify
            current rates directly with the taxing authority before relying on
            this information for any purpose.
          </p>
        </div>

        {/* ── Link to explainer ── */}
        <div className={styles.explainerLink}>
          <span className={styles.explainerLinkLabel}>
            Want to understand what these numbers mean?
          </span>
          <Link href="/taxes/explainer" className={styles.explainerLinkAnchor}>
            Read: How Local Taxes Work →
          </Link>
        </div>

        {/* ── Sources & Additional Information ── */}
        <div className={styles.sourcesSection}>
          <button
            className={styles.sourcesToggle}
            onClick={() => setSourcesOpen(!sourcesOpen)}
            aria-expanded={sourcesOpen}
          >
            <span>Sources &amp; Additional Information</span>
            <span className={styles.sourcesArrow}>{sourcesOpen ? '▲' : '▼'}</span>
          </button>

          {sourcesOpen && (
            <div className={styles.sourcesBody}>
              {SOURCES.map((group) => (
                <div key={group.category} className={styles.sourcesGroup}>
                  <div className={styles.sourcesCategoryLabel}>{group.category}</div>
                  <ul className={styles.sourcesList}>
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.sourcesLink}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
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
