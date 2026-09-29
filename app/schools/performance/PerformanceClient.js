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

const WCASD_DISTRICT = 'West Chester Area';
const PEER_DISTRICTS = [
  'West Chester Area',
  'Downingtown Area',
  'Great Valley',
  'Owen J. Roberts',
  'Tredyffrin-Easttown',
  'Unionville-Chadds Ford',
];

// Horizontal bar chart + table comparing WCASD with peer districts for the
// selected exam/subject/group, with the statewide average as a reference line.
function PeerComparison({ peers, rows, exam, subject, group, scope }) {
  const [year, setYear] = useState('');

  const subjectPeers = useMemo(
    () => peers.filter((p) => p.exam === exam && p.subject === subject),
    [peers, exam, subject]
  );

  // Rows from the tab's older format have no group; treat them as All Students.
  const groupPeers = useMemo(
    () => subjectPeers.filter((p) => (p.group || DEFAULT_GROUP) === group),
    [subjectPeers, group]
  );

  const yearOptions = useMemo(
    () => uniqueValues(subjectPeers, 'year').sort((a, b) => Number(a) - Number(b)),
    [subjectPeers]
  );

  // Most recent year where at least one district has a numeric value.
  const latestYear = useMemo(() => {
    const withData = yearOptions.filter((y) =>
      groupPeers.some((p) => p.year === y && parsePct(p.pct_prof_adv) !== null)
    );
    return withData[withData.length - 1] ?? yearOptions[yearOptions.length - 1];
  }, [yearOptions, groupPeers]);

  const activeYear = pick(year, yearOptions, latestYear);

  // Every known district appears, even with no value that year; sorted
  // highest to lowest with missing values last.
  const districts = useMemo(() => {
    const names = [...new Set([...PEER_DISTRICTS, ...uniqueValues(peers, 'district')])];
    return names
      .map((name) => {
        const match = groupPeers.find((p) => p.year === activeYear && p.district === name);
        return { name, value: match ? parsePct(match.pct_prof_adv) : null };
      })
      .sort((a, b) => {
        if (a.value === null) return b.value === null ? 0 : 1;
        if (b.value === null) return -1;
        return b.value - a.value;
      });
  }, [peers, groupPeers, activeYear]);

  const paAverage = useMemo(() => {
    const match = rows.find(
      (r) =>
        r.exam === exam &&
        r.subject === subject &&
        r.year === activeYear &&
        r.group === group &&
        (!scope || r.scope === scope)
    );
    return match ? parsePct(match.pa_pct_prof_adv) : null;
  }, [rows, exam, subject, group, activeYear, scope]);

  const clampPct = (n) => Math.min(Math.max(n, 0), 100);
  const caption = [exam, subject, activeYear, group].filter(Boolean).join(' · ');
  const hasEnoughData = districts.filter((d) => d.value !== null).length >= 2;

  return (
    <section className={styles.peerSection} aria-labelledby="peer-heading">
      <h2 className={styles.peerHeading} id="peer-heading">
        How WCASD compares with similar Chester County districts
        {group !== DEFAULT_GROUP && ` — ${group}`}
      </h2>

      {yearOptions.length === 0 ? (
        <p className={styles.emptyText}>No district comparison data for this exam and subject.</p>
      ) : (
        <>
          <div className={styles.filters}>
            <OptionButtons label="Year" options={yearOptions} value={activeYear} onChange={setYear} />
          </div>

          {hasEnoughData ? (
            <>
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>{caption}</h3>
                <div className={styles.legend} aria-hidden="true">
                  <span className={styles.legendItem}>
                    <span className={`${styles.swatch} ${styles.swatchPa}`} /> West Chester Area
                  </span>
                  <span className={styles.legendItem}>
                    <span className={`${styles.swatch} ${styles.swatchWcasd}`} /> Peer districts
                  </span>
                  {paAverage !== null && (
                    <span className={styles.legendItem}>
                      <span className={styles.swatchRef} /> Pennsylvania average
                    </span>
                  )}
                </div>

                {/* Visual only; the table below carries the same numbers for assistive tech. */}
                <div
                  className={`${styles.hChart} ${paAverage !== null ? styles.hChartWithRef : ''}`}
                  style={paAverage !== null ? { '--pa': clampPct(paAverage) } : undefined}
                  aria-hidden="true"
                >
                  {paAverage !== null && (
                    <>
                      <span className={styles.refLabel}>PA avg {formatPct(paAverage)}</span>
                      <span className={styles.refLine} />
                    </>
                  )}
                  {districts.map((d) => (
                    <div key={d.name} className={styles.hRow}>
                      <div className={styles.hLabel}>
                        <span className={d.name === WCASD_DISTRICT ? styles.hLabelWcasd : ''}>{d.name}</span>
                      </div>
                      <div className={styles.hPlot}>
                        <div className={styles.hPlotArea}>
                          {d.value !== null && (
                            <div
                              className={`${styles.hBar} ${d.name === WCASD_DISTRICT ? styles.hBarWcasd : styles.hBarPeer}`}
                              style={{ width: `${clampPct(d.value)}%` }}
                            />
                          )}
                          <span
                            className={styles.hValue}
                            style={{ left: d.value !== null ? `${clampPct(d.value)}%` : 0 }}
                          >
                            {formatPct(d.value)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <caption className={styles.tableCaption}>
                    % Proficient or Advanced by district — {caption}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">District</th>
                      <th scope="col">% Prof./Adv.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {districts.map((d) => (
                      <tr key={d.name}>
                        <th scope="row">{d.name}</th>
                        <td>{formatPct(d.value)}</td>
                      </tr>
                    ))}
                    {paAverage !== null && (
                      <tr>
                        <th scope="row">Pennsylvania average</th>
                        <td>{formatPct(paAverage)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className={styles.emptyText}>Not enough district data for this group and year.</p>
          )}
        </>
      )}

      <div className={styles.notes}>
        <p>
          Peer districts are nearby Chester County suburban districts. Data points based on
          fewer than 50 students are omitted.
        </p>
        {exam === 'Keystone' && (
          <p>
            Keystone results for 2021–2023 were affected by pandemic-era testing waivers, and
            scores fell across all six districts in 2023.
          </p>
        )}
      </div>
    </section>
  );
}

export default function PerformanceClient({ rows, peers = [] }) {
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

            {peers.length > 0 && (
              <PeerComparison
                peers={peers}
                rows={rows}
                exam={exam}
                subject={activeSubject}
                group={activeGroup}
                scope={scopeOptions.length > 1 ? activeScope : ''}
              />
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
                , PSSA and Keystone results, 2021–2025. West Chester Area School District
                (AUN 124159002) and peer district figures are from PDE&apos;s district-level
                files; Pennsylvania figures are from PDE&apos;s state-level files. PSSA is grades
                3–8 combined; Keystone is grade 11. Percentages are Proficient + Advanced.
                Statewide results by student group are not published for 2021, and only for
                Economically Disadvantaged and IEP students in 2022. PDE did not publish PSSA
                Science results for 2025.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
