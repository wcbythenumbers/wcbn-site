'use client';

import { useState } from 'react';
import styles from '../elections.module.css';
import MethodNote from '../../components/MethodNote';

const MEASURES = [
  {
    id: 'delaware-county-open-space-2026',
    year: 2026,
    municipalities: ['delaware-county', 'thornbury-delaware'],
    municipalityLabel:
      'Delaware County — voted on countywide, including Thornbury Township (Delaware Co.)',
    electionLabel: 'November 2026 General Election',
    title: 'Water Quality, Natural Areas, and Wildlife Habitat Protection Referendum',
    election: 'November 3, 2026 General Election',
    whatItAsks:
      '"Shall debt in the maximum principal amount of up to $120 million be authorized for purposes of financing land conservation, including protecting drinking water sources, water quality in rivers and creeks, wildlife habitat, conserving trees to protect air quality, conserving wetlands to prevent flooding, providing greenways and parks, protecting natural areas from development, and related costs, to be incurred by the County as debt approved by the voters, requiring public disclosure and annual independent audits?"',
    yesOutcome:
      'Delaware County is authorized to borrow up to $120 million for the land conservation purposes listed in the question, with public disclosure and annual independent audits.',
    noOutcome: 'Delaware County is not authorized to take on this debt.',
    background:
      'Delaware County Council placed this question on the ballot. It appeared on every ballot in Delaware County, including in Thornbury Township (Delaware Co.).',
    result: {
      outcome: 'Passed',
      status: 'Unofficial results — certification pending',
      rows: [
        {
          label: 'Delaware County (all 383 precincts)',
          yes: 172774,
          yesPct: '75.69%',
          no: 55493,
          noPct: '24.31%',
        },
        {
          label: 'Thornbury Township (Delaware Co.), 5 precincts — calculated by WCBN',
          yes: 2137,
          yesPct: '61.76%',
          no: 1323,
          noPct: '38.24%',
        },
      ],
    },
    sources: [
      {
        label:
          'Question text: Delaware County Bureau of Elections, Notice of 2026 General Election',
        url: 'https://www.delcopa.gov/sites/default/files/2026-08/GE2026-UMOVA-Notice_8-6-2026-update.pdf',
      },
      {
        label: 'Results: Delaware County Election Night Reporting',
        url: 'https://results.enr.clarityelections.com/PA/Delaware/127482/',
      },
    ],
  },
];

const YEAR_OPTIONS = [
  { id: 2026, label: '2026' },
  { id: 2027, label: '2027' },
];

const MUNICIPALITY_OPTIONS = [
  { id: 'west-chester-borough', label: 'West Chester Borough' },
  { id: 'east-goshen', label: 'East Goshen' },
  { id: 'west-goshen', label: 'West Goshen' },
  { id: 'east-bradford', label: 'East Bradford' },
  { id: 'west-whiteland', label: 'West Whiteland' },
  { id: 'westtown', label: 'Westtown' },
  { id: 'thornbury-chester', label: 'Thornbury (Chester Co.)' },
  { id: 'thornbury-delaware', label: 'Thornbury (Delaware Co.)' },
  { id: 'chester-county', label: 'Chester County' },
  { id: 'delaware-county', label: 'Delaware County' },
];

function groupByElection(measures) {
  const groups = [];
  const indexByLabel = new Map();
  measures.forEach((measure) => {
    if (!indexByLabel.has(measure.electionLabel)) {
      indexByLabel.set(measure.electionLabel, groups.length);
      groups.push({ label: measure.electionLabel, measures: [] });
    }
    groups[indexByLabel.get(measure.electionLabel)].measures.push(measure);
  });
  return groups;
}

function formatCount(n) {
  return n.toLocaleString('en-US');
}

function MeasureResult({ result }) {
  const passed = result.outcome === 'Passed';
  return (
    <div className={styles.measureResult}>
      <div className={styles.measureFieldLabel}>Result</div>
      <div
        className={`${styles.resultOutcome} ${passed ? styles.outcomeYes : styles.outcomeNo}`}
      >
        <span className={styles.outcomeTag}>{result.outcome}</span>
      </div>
      <p className={styles.resultStatus}>{result.status}</p>
      <div className={styles.resultTableWrap}>
        <table className={styles.resultTable}>
          <thead>
            <tr>
              <th scope="col">Area</th>
              <th scope="col">Yes</th>
              <th scope="col">No</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>
                  {formatCount(row.yes)} <span className={styles.resultPct}>({row.yesPct})</span>
                </td>
                <td>
                  {formatCount(row.no)} <span className={styles.resultPct}>({row.noPct})</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Measure({ measure }) {
  return (
    <div className={styles.measure}>
      <div className={styles.measureMunicipality}>{measure.municipalityLabel}</div>
      <h2 className={styles.measureTitle}>{measure.title}</h2>

      <div className={styles.measureField}>
        <div className={styles.measureFieldLabel}>Election</div>
        <p className={styles.measureFieldText}>{measure.election}</p>
      </div>

      <div className={styles.measureField}>
        <div className={styles.measureFieldLabel}>What it asks</div>
        <p className={styles.measureFieldText}>{measure.whatItAsks}</p>
      </div>

      <div className={styles.outcomeGrid}>
        <div className={`${styles.outcomeBox} ${styles.outcomeYes}`}>
          <div className={styles.outcomeTag}>If YES passes</div>
          <p className={styles.outcomeText}>{measure.yesOutcome}</p>
        </div>
        <div className={`${styles.outcomeBox} ${styles.outcomeNo}`}>
          <div className={styles.outcomeTag}>If NO passes</div>
          <p className={styles.outcomeText}>{measure.noOutcome}</p>
        </div>
      </div>

      {measure.result && <MeasureResult result={measure.result} />}

      <div className={styles.measureField}>
        <div className={styles.measureFieldLabel}>Background</div>
        <p className={styles.measureFieldText}>{measure.background}</p>
      </div>

      {measure.sources && measure.sources.length > 0 && (
        <ul className={styles.measureSources}>
          {measure.sources.map((source) => (
            <li key={source.url} className={styles.measureSource}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.measureSourceLink}
              >
                {source.label} ↗
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function BallotClient() {
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedMunicipalities, setSelectedMunicipalities] = useState([]);

  const yearsAllActive = selectedYears.length === 0;
  const municipalitiesAllActive = selectedMunicipalities.length === 0;
  const hasActiveFilters = !yearsAllActive || !municipalitiesAllActive;

  const toggleYear = (id) => {
    setSelectedYears((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleMunicipality = (id) => {
    setSelectedMunicipalities((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSelectedYears([]);
    setSelectedMunicipalities([]);
  };

  const visibleMeasures = MEASURES.filter((measure) => {
    const yearMatch = yearsAllActive || selectedYears.includes(measure.year);
    const municipalityMatch =
      municipalitiesAllActive ||
      measure.municipalities.some((id) => selectedMunicipalities.includes(id));
    return yearMatch && municipalityMatch;
  });

  const electionGroups = groupByElection(visibleMeasures);

  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>Elections</div>
          <h1 className={styles.heading}>What&apos;s on the Ballot</h1>
          <p className={styles.intro}>
            This page covers ballot measures and referendums affecting
            residents in the greater West Chester area. For the complete
            official list of all Chester County referendums with plain
            language explanations, visit{' '}
            <a
              href="https://www.chesco.org/156/Voter-Services"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.measureSourceLink}
            >
              Chester County Voter Services
            </a>{' '}
            or{' '}
            <a
              href="https://www.delcopa.gov/vote"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.measureSourceLink}
            >
              Delaware County Elections
            </a>
            .
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.filterBar}>
          <div className={styles.filterBarHeader}>
            <div className={styles.filterBarTitle}>Filter ballot measures</div>
            {hasActiveFilters && (
              <button type="button" className={styles.clearFilters} onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterLabel}>By Election Year</div>
            <div className={styles.filterGroup} role="group" aria-label="Filter by election year">
              <button
                type="button"
                className={`${styles.filterBtn} ${yearsAllActive ? styles.filterBtnActive : ''}`}
                aria-pressed={yearsAllActive}
                onClick={() => setSelectedYears([])}
              >
                All
              </button>
              {YEAR_OPTIONS.map((option) => {
                const active = selectedYears.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`${styles.filterBtn} ${active ? styles.filterBtnActive : ''}`}
                    aria-pressed={active}
                    onClick={() => toggleYear(option.id)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterLabel}>By Municipality</div>
            <div className={styles.filterGroup} role="group" aria-label="Filter by municipality">
              <button
                type="button"
                className={`${styles.filterBtn} ${
                  municipalitiesAllActive ? styles.filterBtnActive : ''
                }`}
                aria-pressed={municipalitiesAllActive}
                onClick={() => setSelectedMunicipalities([])}
              >
                All
              </button>
              {MUNICIPALITY_OPTIONS.map((option) => {
                const active = selectedMunicipalities.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`${styles.filterBtn} ${active ? styles.filterBtnActive : ''}`}
                    aria-pressed={active}
                    onClick={() => toggleMunicipality(option.id)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {electionGroups.length === 0 ? (
          <p className={styles.noResults}>
            No ballot measures found for the selected filters.
          </p>
        ) : (
          electionGroups.map((group) => (
            <div key={group.label} className={styles.electionGroup}>
              <div className={styles.electionGroupLabel}>{group.label}</div>
              {group.measures.map((measure) => (
                <Measure key={measure.id} measure={measure} />
              ))}
            </div>
          ))
        )}

        <p className={styles.pageNote}>
          This page covers ballot questions voted on by residents of the
          WCASD-area municipalities (West Chester Borough, East Bradford, East
          Goshen, West Goshen, West Whiteland, Westtown, Thornbury Township in
          Chester County and Thornbury Township in Delaware County), including
          countywide questions. In November 2026, the only such question was
          Delaware County&apos;s open space referendum; Chester County&apos;s
          three 2026 ballot questions were in East Whiteland, Malvern and
          Tredyffrin, outside the WCASD area.
        </p>

        <div className={styles.aboutData}>
          <MethodNote summary="About this data">
            <p>
              Question text comes from Delaware County&apos;s official notice
              of the election. Results come from the county&apos;s election
              night reporting site and are unofficial until the county
              certifies them; we will replace them with certified results.
              Countywide totals are as reported by the county. Thornbury
              Township (Delaware Co.) totals were calculated by WCBN by adding
              the township&apos;s five precincts. Percentages are of yes and no
              votes on the question; ballots left blank on the question are not
              counted.
            </p>
          </MethodNote>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>© {new Date().getFullYear()} West Chester by the Numbers</span>
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
