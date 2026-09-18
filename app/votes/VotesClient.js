'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import MunicipalityFilter from '../components/MunicipalityFilter';
import FilterButtonGroup from '../components/FilterButtonGroup';
import { formatDate, yearOf } from '../../lib/format';
import { voteTally } from '../../lib/votes';
import { isValidMunicipalityId } from '../../lib/entities';
import styles from './votes.module.css';

const CATEGORY_OPTIONS = [
  'Budget', 'Personnel', 'Contract', 'Policy', 'Zoning', 'Facilities', 'Curriculum', 'Procedural',
].map((c) => ({ id: c, label: c }));

const OUTCOME_OPTIONS = ['Passed', 'Failed', 'Tabled'].map((o) => ({ id: o, label: o }));

const OUTCOME_STYLES = {
  Passed: 'outcomePassed',
  Failed: 'outcomeFailed',
  Tabled: 'outcomeTabled',
};

export default function VotesClient({ votes, publishedRecapKeys, initialEntity }) {
  const [municipality, setMunicipality] = useState(() =>
    isValidMunicipalityId(initialEntity) ? [initialEntity] : []
  );
  const [category, setCategory] = useState([]);
  const [outcome, setOutcome] = useState([]);
  const [year, setYear] = useState('all');

  const years = useMemo(() => {
    const set = new Set(votes.map((v) => yearOf(v.meeting_date)).filter(Boolean));
    return Array.from(set).sort((a, b) => b - a);
  }, [votes]);

  const recapKeySet = useMemo(() => new Set(publishedRecapKeys), [publishedRecapKeys]);

  const filtered = useMemo(() => {
    return votes
      .filter((v) => municipality.length === 0 || municipality.includes(v.entity_slug))
      .filter((v) => category.length === 0 || category.includes(v.category))
      .filter((v) => outcome.length === 0 || outcome.includes(v.outcome))
      .filter((v) => year === 'all' || yearOf(v.meeting_date) === Number(year))
      .sort((a, b) => (a.meeting_date < b.meeting_date ? 1 : -1));
  }, [votes, municipality, category, outcome, year]);

  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>Government</div>
          <h1 className={styles.heading}>Voting Records</h1>
          <p className={styles.intro}>
            A record of every formal vote taken by elected boards and councils
            in the greater West Chester area.
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <MunicipalityFilter selected={municipality} onChange={setMunicipality} />
        <FilterButtonGroup
          label="Filter by category"
          options={CATEGORY_OPTIONS}
          selected={category}
          onChange={setCategory}
        />
        <FilterButtonGroup
          label="Filter by outcome"
          options={OUTCOME_OPTIONS}
          selected={outcome}
          onChange={setOutcome}
        />

        <div className={styles.yearFilter}>
          <label className={styles.yearLabel} htmlFor="year-select">Date range</label>
          <select
            id="year-select"
            className={styles.yearSelect}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="all">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {votes.length === 0 ? (
          <p className={styles.emptyText}>
            Vote records will appear here as meeting recaps are published.
          </p>
        ) : filtered.length === 0 ? (
          <p className={styles.emptyText}>No votes match these filters.</p>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Entity</th>
                    <th>Date</th>
                    <th>Resolution</th>
                    <th>Category</th>
                    <th>Outcome</th>
                    <th>Vote</th>
                    <th>Recap</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v, i) => {
                    const recapKey = `${v.entity_slug}|${v.meeting_date}`;
                    const hasRecap = recapKeySet.has(recapKey);
                    return (
                      <tr key={`${v.resolution_id || v.resolution_title}-${i}`}>
                        <td>{v.entity}</td>
                        <td className={styles.dateCell}>{formatDate(v.meeting_date)}</td>
                        <td>{v.resolution_title}</td>
                        <td>{v.category}</td>
                        <td>
                          {v.outcome && (
                            <span className={`${styles.outcomeTag} ${styles[OUTCOME_STYLES[v.outcome]] || ''}`}>
                              {v.outcome}
                            </span>
                          )}
                        </td>
                        <td className={styles.voteCell}>{voteTally(v)}</td>
                        <td className={styles.recapLinkCell}>
                          {hasRecap ? (
                            <Link href={`/recaps/${v.entity_slug}/${v.meeting_date}`}>
                              Read recap →
                            </Link>
                          ) : (
                            <span>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className={styles.scrollHint}>Scroll right to see all columns →</p>
          </>
        )}
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
