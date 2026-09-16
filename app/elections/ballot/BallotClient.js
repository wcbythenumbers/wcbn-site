'use client';

import { useState } from 'react';
import styles from '../elections.module.css';

const MEASURES = [
  {
    id: 'east-whiteland-supervisors-2026',
    year: 2026,
    municipality: 'east-whiteland',
    municipalityLabel: 'East Whiteland Township',
    electionLabel: 'November 2026 General Election',
    title: 'Board of Supervisors Size Referendum',
    election: 'November 3, 2026 General Election',
    whatItAsks:
      'Should the East Whiteland Township Board of Supervisors be expanded from 3 members to 5 members?',
    yesOutcome:
      'The board expands from 3 to 5 elected supervisors. Two additional supervisor seats would be created and filled in a future election.',
    noOutcome: 'The board remains at 3 supervisors. No change to the current structure.',
    background:
      "Residents collected over 500 signatures to place this question on the ballot, motivated in part by community concerns over the township's handling of a proposed data center project on a former Superfund site on the East/West Whiteland township line.",
    sourceText: 'Source: Philadelphia Inquirer, August 19, 2026',
    sourceUrl:
      'https://www.inquirer.com/news/pennsylvania/east-whiteland-board-supervisors-data-center-20260819.html',
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
  { id: 'east-whiteland', label: 'East Whiteland' },
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

      <div className={styles.measureField}>
        <div className={styles.measureFieldLabel}>Background</div>
        <p className={styles.measureFieldText}>{measure.background}</p>
      </div>

      <p className={styles.measureSource}>
        {measure.sourceText} —{' '}
        <a
          href={measure.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.measureSourceLink}
        >
          read the article ↗
        </a>
      </p>
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
      municipalitiesAllActive || selectedMunicipalities.includes(measure.municipality);
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
          Ballot measures are verified against Chester County Voter Services
          official documents. This page is updated as new measures are
          confirmed. Not all measures affecting Chester County appear here —
          only those affecting municipalities within the WCASD area.
        </p>
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
