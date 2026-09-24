'use client';

import { useMemo, useState } from 'react';
import styles from './performance.module.css';

const EXAMS = ['PSSA', 'Keystone'];
const DEFAULT_GROUP = 'All Students';

// "62.3", "62.3%", " 62 " -> number. Blank or non-numeric values (PDE
// suppresses small groups with markers like "*" or "<5") -> null.
function parsePct(value) {
  const cleaned = String(value ?? '').replace('%', '').trim();
  if (cleaned === '') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function formatPct(n) {
  return n === null ? '—' : `${n.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;
}

// Distinct non-blank values in first-seen order, so the sheet controls ordering.
function uniqueValues(rows, key) {
  const seen = new Set();
  rows.forEach((row) => {
    const v = row[key];
    if (v) seen.add(v);
  });
  return [...seen];
}

// Returns `value` if it's a valid option, otherwise the preferred fallback
// (when present) or the first option.
function pick(value, options, preferred) {
  if (options.includes(value)) return value;
  if (preferred && options.includes(preferred)) return preferred;
  return options[0] ?? '';
}

function OptionButtons({ label, options, value, onChange }) {
  return (
    <div className={styles.filter}>
      <div className={styles.filterLabel} id={`filter-${label}`}>{label}</div>
      <div className={styles.filterGroup} role="group" aria-labelledby={`filter-${label}`}>
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              className={`${styles.filterBtn} ${active ? styles.filterBtnActive : ''}`}
              aria-pressed={active}
              onClick={() => onChange(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function PerformanceClient({ rows }) {
  const [exam, setExam] = useState(EXAMS[0]);
  const [subject, setSubject] = useState('');
  const [group, setGroup] = useState(DEFAULT_GROUP);
  const [scope, setScope] = useState('');

  const examRows = useMemo(() => rows.filter((r) => r.exam === exam), [rows, exam]);

  const subjectOptions = useMemo(() => uniqueValues(examRows, 'subject'), [examRows]);
  const groupOptions = useMemo(() => uniqueValues(rows, 'group'), [rows]);
  const scopeOptions = useMemo(() => uniqueValues(rows, 'scope'), [rows]);

  const activeSubject = pick(subject, subjectOptions);
  const activeGroup = pick(group, groupOptions, DEFAULT_GROUP);
  const activeScope = pick(scope, scopeOptions);

  const handleExamChange = (nextExam) => {
    setExam(nextExam);
    setSubject(uniqueValues(rows.filter((r) => r.exam === nextExam), 'subject')[0] ?? '');
  };

  // One entry per year, oldest first.
  const series = useMemo(() => {
    const byYear = new Map();
    examRows
      .filter(
        (r) =>
          r.subject === activeSubject &&
          r.group === activeGroup &&
          (scopeOptions.length <= 1 || r.scope === activeScope)
      )
      .forEach((r) => {
        if (!byYear.has(r.year)) {
          byYear.set(r.year, {
            year: r.year,
            wcasd: parsePct(r.wcasd_pct_prof_adv),
            pa: parsePct(r.pa_pct_prof_adv),
          });
        }
      });
    return [...byYear.values()].sort((a, b) => Number(a.year) - Number(b.year));
  }, [examRows, activeSubject, activeGroup, activeScope, scopeOptions.length]);

  const caption = [exam, activeSubject, activeGroup, scopeOptions.length > 1 ? activeScope : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>Schools</div>
          <h1 className={styles.heading}>Performance Data</h1>
          <p className={styles.intro}>
            Share of West Chester Area School District students scoring Proficient or
            Advanced on state exams, compared with Pennsylvania statewide.
          </p>
        </div>
      </header>

      <div className={styles.content}>
        {rows.length === 0 ? (
          <p className={styles.emptyText}>Performance data isn&apos;t available right now. Check back soon.</p>
        ) : (
          <>
            <div className={styles.filters}>
              <OptionButtons label="Exam" options={EXAMS} value={exam} onChange={handleExamChange} />
              {subjectOptions.length > 0 && (
                <OptionButtons label="Subject" options={subjectOptions} value={activeSubject} onChange={setSubject} />
              )}
              {scopeOptions.length > 1 && (
                <OptionButtons label="Scope" options={scopeOptions} value={activeScope} onChange={setScope} />
              )}
              {groupOptions.length > 0 && (
                <div className={styles.filter}>
                  <label className={styles.filterLabel} htmlFor="performance-group">Student Group</label>
                  <select
                    id="performance-group"
                    className={styles.select}
                    value={activeGroup}
                    onChange={(e) => setGroup(e.target.value)}
                  >
                    {groupOptions.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {series.length === 0 ? (
              <p className={styles.emptyText}>No results match this selection.</p>
            ) : (
              <>
                <section className={styles.chartCard}>
                  <h2 className={styles.chartTitle}>{caption}</h2>
                  <div className={styles.legend} aria-hidden="true">
                    <span className={styles.legendItem}>
                      <span className={`${styles.swatch} ${styles.swatchWcasd}`} /> WCASD
                    </span>
                    <span className={styles.legendItem}>
                      <span className={`${styles.swatch} ${styles.swatchPa}`} /> Pennsylvania
                    </span>
                  </div>

                  {/* Visual only; the table below carries the same numbers for assistive tech. */}
                  <div className={styles.chart} aria-hidden="true">
                    {series.map((point) => (
                      <div key={point.year} className={styles.yearGroup}>
                        <div className={styles.bars}>
                          {[
                            ['wcasd', styles.barWcasd],
                            ['pa', styles.barPa],
                          ].map(([key, barClass]) => (
                            <div key={key} className={styles.barSlot}>
                              <span className={styles.barValue}>{formatPct(point[key])}</span>
                              {point[key] !== null && (
                                <div
                                  className={`${styles.bar} ${barClass}`}
                                  style={{ height: `${Math.min(Math.max(point[key], 0), 100)}%` }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className={styles.yearLabel}>{point.year}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <caption className={styles.tableCaption}>
                      % Proficient or Advanced — {caption}
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Year</th>
                        <th scope="col">WCASD</th>
                        <th scope="col">Pennsylvania</th>
                      </tr>
                    </thead>
                    <tbody>
                      {series.map((point) => (
                        <tr key={point.year}>
                          <th scope="row">{point.year}</th>
                          <td>{formatPct(point.wcasd)}</td>
                          <td>{formatPct(point.pa)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className={styles.notes}>
              <p>
                2021 results were affected by pandemic-era participation and may not be
                comparable to other years.
              </p>
              <p>
                “—” means the value is blank or suppressed by the state for privacy.
              </p>
            </div>

            <section className={styles.sources} aria-labelledby="performance-sources">
              <h2 className={styles.sourcesHeading} id="performance-sources">Sources</h2>
              <p>
                Source:{' '}
                <a
                  className={styles.sourceLink}
                  href="https://www.pa.gov/agencies/education/data-and-reporting/assessment-reporting"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Pennsylvania Department of Education
                </a>
                , PSSA and Keystone district-level results, 2021–2025, for West Chester Area
                School District (AUN 124159002). PSSA is grades 3–8 combined; Keystone is
                grade 11. Percentages are Proficient + Advanced.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
