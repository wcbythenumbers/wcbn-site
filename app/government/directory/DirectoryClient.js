'use client';

import { useState } from 'react';
import styles from './directory.module.css';

/*
 * Role descriptions are keyed by the position-group title they're attached
 * to, not by an individual official's title — e.g. "Board of Supervisors"
 * covers the Chair, Vice Chair, and Supervisor rows within a township.
 */
const ROLE_INFO = {
  'Board of Supervisors': {
    description:
      "The elected governing body of a township. Supervisors set local policy, approve the annual budget, levy taxes, hire the Township Manager, and make decisions on zoning, land use, roads, and public services. The board elects a chair and vice chair from among its members each year.",
    keyDecisions:
      'annual budget, tax millage rate, zoning ordinances, land development approvals, hiring the Township Manager, contracts and vendor agreements.',
  },
  'Tax Collector': {
    description:
      "An elected official responsible for collecting real estate taxes on behalf of the municipality and school district. The Tax Collector sends tax bills, receives payments, enforces collections on delinquent accounts, and remits funds to the appropriate taxing bodies.",
    keyDecisions:
      'collection procedures, payment plans for delinquent taxpayers, referral of delinquent accounts for legal action.',
  },
  'Mayor (Borough of West Chester)': {
    description:
      "The Borough's chief executive and the only elected official with direct authority over the Police Department. The Mayor directs the Police Chief, presides over Borough Council meetings, and serves as the public face of Borough government. The Mayor does not vote on Borough Council legislation.",
    keyDecisions:
      'police department direction and oversight, casting tie-breaking votes in limited circumstances, signing or vetoing ordinances.',
  },
  'Borough Council Member': {
    description:
      "One of seven elected representatives, each representing one of the Borough's seven geographic wards. As a body, Borough Council sets municipal policy, approves the budget, levies taxes, enacts ordinances, and appoints the Borough Manager who oversees all departments except police.",
    keyDecisions:
      'annual budget, tax millage rate, local ordinances, zoning decisions, hiring the Borough Manager, contracts and vendor agreements.',
  },
  'School Board Director': {
    description:
      "One of nine elected members of the WCASD Board of Directors, representing one of three voting regions. Individual directors have no authority outside of board votes — all decisions are made collectively. The board sets school district policy, approves the annual budget, hires and evaluates the Superintendent, negotiates employee contracts, and approves curriculum.",
    keyDecisions:
      'annual budget, tax millage rate, hiring and evaluating the Superintendent, employee contracts, curriculum, facilities, and school closures or openings.',
  },
  'Board President (School Board)': {
    description:
      "Elected by fellow board members to preside over meetings, coordinate the agenda with the Superintendent, and serve as the board's primary spokesperson. Has no additional vote or authority beyond their role as a director.",
    keyDecisions: 'same as Director, plus setting meeting agendas and representing the board publicly.',
  },
  'County Commissioner (Chester County)': {
    description:
      "One of three elected members of Chester County's chief governing body. Commissioners set county policy, approve the county budget, manage county departments, and appoint members of county authorities and boards. Two of three votes are required to act.",
    keyDecisions:
      'county budget, county tax millage rate, appointments to county boards and authorities, county contracts and major capital projects.',
  },
  'District Attorney': {
    description:
      "The county's chief law enforcement officer and prosecutor. Elected countywide. Decides which criminal cases to prosecute, oversees the DA's office and staff, and sets prosecution policies. Operates independently of local police and county commissioners.",
    keyDecisions:
      'which cases to prosecute or decline, plea agreements, diversion programs, prosecution priorities, office staffing and budget.',
  },
  Sheriff: {
    description:
      'An officer of the county courts responsible for keeping the peace, serving civil court orders and subpoenas, transporting prisoners, and providing security in courthouses. Also operates the county jail. Does not handle day-to-day local policing.',
    keyDecisions: 'jail operations and policy, court security staffing, civil process service prioritization.',
  },
  Controller: {
    description:
      "The county's independently elected fiscal watchdog. Audits county finances, reviews expenditures, and ensures financial accountability across all county departments. Reports findings publicly and operates independently of the commissioners.",
    keyDecisions:
      'scope and findings of county audits, public reporting of financial irregularities, recommendations for improved financial controls.',
  },
  Treasurer: {
    description:
      'The custodian of all county funds. Receives and manages tax payments, grants, and other county revenues. Invests county funds and ensures they are available when needed.',
    keyDecisions: 'investment of county funds, cash management strategy, banking relationships.',
  },
  Coroner: {
    description:
      'Investigates deaths occurring in the county to determine cause and manner of death. Certifies death certificates and serves as an independent check in cases of suspicious or unattended deaths. Operates independently of law enforcement.',
    keyDecisions:
      'whether to investigate a death, determination of cause and manner of death, referral of suspicious deaths to law enforcement.',
  },
  'Recorder of Deeds': {
    description:
      'Records and maintains real estate documents including deeds, mortgages, and liens for all properties in the county. Serves as the official keeper of property ownership records.',
    keyDecisions: 'recording standards and procedures, document retention policies, fee schedules within state guidelines.',
  },
  'Register of Wills': {
    description:
      "Probates wills, appoints estate representatives, and maintains estate records for people who die in the county. Also issues marriage licenses and serves as Clerk of the Orphans' Court.",
    keyDecisions: 'acceptance or rejection of wills for probate, appointment of estate administrators, marriage license issuance.',
  },
  'Clerk of Courts': {
    description:
      'Maintains all criminal court records, processes criminal filings, and manages the administrative functions of the criminal court system. Serves as the official record-keeper for criminal proceedings.',
    keyDecisions: 'records management standards, criminal filing procedures, court document access and fees.',
  },
  Prothonotary: {
    description:
      'The civil equivalent of the Clerk of Courts. Maintains all civil court records, processes civil filings, issues writs, and manages the administrative functions of the civil court system.',
    keyDecisions: 'civil records management, filing procedures, document access and fees.',
  },
  'Magisterial District Judge (MDJ)': {
    description:
      'An elected judge serving a specific district within the county on a six-year term. Handles minor civil disputes, landlord-tenant cases, small claims, traffic violations, and preliminary hearings in criminal cases. MDJs are often the first point of contact with the court system for most residents.',
    keyDecisions:
      'bail in criminal cases, outcomes in minor civil and traffic matters, whether criminal cases proceed to Common Pleas Court.',
  },
  'Court of Common Pleas Judge': {
    description:
      "A countywide elected judge serving a ten-year term. Hears civil, criminal, family, and orphans court cases. Common Pleas judges are the primary trial court judges in Pennsylvania's unified judicial system.",
    keyDecisions:
      'verdicts and sentences in criminal cases, outcomes in civil disputes, family court matters including custody and divorce, orphans court matters including estates.',
  },
};

const DELAWARE_PLACEHOLDER_NOTE =
  'Role descriptions for Delaware County elected positions will be added once current officeholders are verified. For information on Delaware County government, visit delcopa.gov.';

/*
 * Each official: { name, position, term, href, note }
 * A name of 'TBD' renders as an unverified placeholder — muted, italic, unlinked,
 * with a "Verify" link out to the entity's own page instead.
 */
const ENTITIES = [
  {
    id: 'wcasd',
    name: 'WCASD Board of Education',
    description:
      'Nine elected directors serving four-year terms across three voting regions.',
    site: 'wcasd.net/school-board/meet-the-board',
    positionGroups: [
      {
        title: 'Board President (School Board)',
        officials: [
          { name: 'Daryl Durnell', position: 'President', term: 'TBD', href: 'https://wcasd.net/school-board/meet-the-board' },
        ],
      },
      {
        title: 'School Board Director',
        officials: [
          { name: 'Gary Bevilacqua', position: 'Vice President', term: 'TBD', href: 'https://wcasd.net/school-board/meet-the-board' },
          { name: 'Karen Fleming', position: 'Director', term: 'TBD', href: 'https://wcasd.net/school-board/meet-the-board' },
          { name: 'Dr. Beth Campbell', position: 'Director', term: 'TBD', href: 'https://wcasd.net/school-board/meet-the-board' },
          { name: 'Dr. Laura Detre', position: 'Director', term: 'TBD', href: 'https://wcasd.net/school-board/meet-the-board' },
          { name: 'Katy Frey', position: 'Director', term: 'TBD', href: 'https://wcasd.net/school-board/meet-the-board' },
          { name: 'Ramon Jackson', position: 'Director', term: 'TBD', href: 'https://wcasd.net/school-board/meet-the-board' },
          { name: 'Ashley Lahm', position: 'Director', term: 'TBD', href: 'https://wcasd.net/school-board/meet-the-board' },
          { name: 'Jewell Parkinson', position: 'Director', term: 'TBD', href: 'https://wcasd.net/school-board/meet-the-board' },
        ],
      },
    ],
  },
  {
    id: 'borough',
    name: 'Borough of West Chester',
    description:
      'Seven elected council members (one per ward) plus an elected Mayor, serving four-year staggered terms.',
    site: 'west-chester.com/227',
    positionGroups: [
      {
        title: 'Mayor (Borough of West Chester)',
        officials: [
          { name: 'Lillian L. DeBaptiste', position: 'Mayor', term: 'TBD — verify at west-chester.com/227', href: 'https://west-chester.com/227' },
        ],
      },
      {
        title: 'Borough Council Member',
        officials: [
          { name: 'Jerry Szczepaniak', position: 'Ward 1 Council Member', term: 'Expires Dec 31, 2029', href: 'https://west-chester.com/227' },
          { name: 'Bryan Travis', position: 'Ward 2 Council Member', term: 'Expires Dec 31, 2027', href: 'https://west-chester.com/227' },
          { name: 'Brian McGinnis', position: 'Ward 3 Council Member', term: 'Expires Dec 31, 2029', href: 'https://west-chester.com/227' },
          { name: 'Nicole Scimone', position: 'Ward 4 Council Member', term: 'Expires Dec 31, 2027', href: 'https://west-chester.com/227' },
          { name: 'Stephen Marvin', position: 'Ward 5 Council Member', term: 'TBD', href: 'https://west-chester.com/227' },
          { name: 'Bernie Flynn', position: 'Ward 6 Council Member', term: 'Expires Dec 31, 2027', href: 'https://west-chester.com/227' },
          { name: 'Lisa Kearns', position: 'Ward 7 Council Member', term: 'Expires Dec 31, 2029', href: 'https://west-chester.com/227' },
        ],
      },
      {
        title: 'Tax Collector',
        officials: [
          { name: 'TBD', position: 'Tax Collector', term: 'TBD', href: 'https://west-chester.com' },
        ],
      },
    ],
  },
  {
    id: 'east-goshen',
    name: 'East Goshen Township',
    description: 'Five elected supervisors serving six-year staggered terms.',
    site: 'eastgoshen.org',
    positionGroups: [
      {
        title: 'Board of Supervisors',
        officials: [
          { name: 'Cody Bright', position: 'Chair', term: 'TBD', href: 'https://eastgoshen.org/contact-us' },
          { name: 'Barbara Emery', position: 'Vice Chair', term: 'TBD', href: 'https://eastgoshen.org/contact-us' },
          { name: 'Ann Duffield', position: 'Supervisor', term: 'TBD', href: 'https://eastgoshen.org/contact-us' },
          { name: 'Larry Massaro', position: 'Supervisor', term: 'TBD', href: 'https://eastgoshen.org/contact-us' },
          { name: 'Peter Hicks', position: 'Supervisor', term: 'TBD', href: 'https://eastgoshen.org/contact-us' },
        ],
      },
      {
        title: 'Tax Collector',
        officials: [
          { name: 'TBD', position: 'Tax Collector', term: 'TBD', href: 'https://eastgoshen.org' },
        ],
      },
    ],
  },
  {
    id: 'west-goshen',
    name: 'West Goshen Township',
    description: 'Three elected supervisors.',
    site: 'westgoshen.org',
    positionGroups: [
      {
        title: 'Board of Supervisors',
        officials: [
          { name: 'Shaun Walsh', position: 'Chair', term: 'TBD', href: 'https://westgoshen.org' },
          { name: 'John Hellmann', position: 'Vice Chair', term: 'TBD', href: 'https://westgoshen.org' },
          { name: 'Ashley Gagné', position: 'Supervisor', term: 'TBD', href: 'https://westgoshen.org' },
        ],
      },
      {
        title: 'Tax Collector',
        officials: [
          { name: 'TBD', position: 'Tax Collector', term: 'TBD', href: 'https://westgoshen.org' },
        ],
      },
    ],
  },
  {
    id: 'east-bradford',
    name: 'East Bradford Township',
    description: 'Three elected supervisors serving six-year staggered terms.',
    site: 'eastbradford.org',
    positionGroups: [
      {
        title: 'Board of Supervisors',
        officials: [
          { name: 'TBD', position: 'Chair', term: 'TBD', href: 'https://eastbradford.org', note: 'Verify current chair at eastbradford.org.' },
          { name: 'Debbie Maynard', position: 'Supervisor', term: 'Expires Dec 31, 2031', href: 'https://eastbradford.org' },
          { name: 'Bruce W. Laverty', position: 'Supervisor', term: 'TBD', href: 'https://eastbradford.org' },
        ],
      },
      {
        title: 'Tax Collector',
        officials: [
          { name: 'TBD', position: 'Tax Collector', term: 'TBD', href: 'https://eastbradford.org' },
        ],
      },
    ],
  },
  {
    id: 'west-whiteland',
    name: 'West Whiteland Township',
    description: 'Three elected supervisors serving six-year staggered terms.',
    site: 'westwhiteland.org',
    note: 'One seat was vacant as of October 2025.',
    positionGroups: [
      {
        title: 'Board of Supervisors',
        officials: [
          { name: 'Rajesh Kumbhardare', position: 'Chair', term: 'TBD', href: 'https://westwhiteland.org' },
          { name: 'Brian Dunn', position: 'Vice Chair', term: 'TBD', href: 'https://westwhiteland.org' },
          { name: 'TBD', position: 'Supervisor', term: 'TBD', href: 'https://westwhiteland.org', note: 'Verify whether the third seat has been filled.' },
        ],
      },
      {
        title: 'Tax Collector',
        officials: [
          { name: 'TBD', position: 'Tax Collector', term: 'TBD', href: 'https://westwhiteland.org' },
        ],
      },
    ],
  },
  {
    id: 'westtown',
    name: 'Westtown Township',
    description: 'Three elected supervisors.',
    site: 'westtownpa.org',
    positionGroups: [
      {
        title: 'Board of Supervisors',
        officials: [
          { name: 'Tom Foster', position: 'Chair', term: 'TBD', href: 'https://westtownpa.org/board-of-supervisors' },
          { name: 'Ed Yost', position: 'Vice Chair', term: 'TBD', href: 'https://westtownpa.org/board-of-supervisors' },
          { name: 'Jodi Nawrocki', position: 'Supervisor', term: 'TBD', href: 'https://westtownpa.org/board-of-supervisors' },
        ],
      },
      {
        title: 'Tax Collector',
        officials: [
          { name: 'TBD', position: 'Tax Collector', term: 'TBD', href: 'https://westtownpa.org' },
        ],
      },
    ],
  },
  {
    id: 'thornbury-chester',
    name: 'Thornbury Township (Chester Co.)',
    description: 'Five elected supervisors.',
    site: 'thornburytwp.com',
    positionGroups: [
      {
        title: 'Board of Supervisors',
        officials: [
          { name: 'James Benoit', position: 'Chairman', term: 'TBD', href: 'https://thornburytwp.com' },
          { name: 'Joseph Lisa', position: 'Vice Chairman', term: 'TBD', href: 'https://thornburytwp.com' },
          { name: 'TBD', position: 'Supervisor', term: 'TBD', href: 'https://thornburytwp.com' },
          { name: 'TBD', position: 'Supervisor', term: 'TBD', href: 'https://thornburytwp.com' },
          { name: 'TBD', position: 'Supervisor', term: 'TBD', href: 'https://thornburytwp.com' },
        ],
      },
      {
        title: 'Tax Collector',
        officials: [
          { name: 'TBD', position: 'Tax Collector', term: 'TBD', href: 'https://thornburytwp.com' },
        ],
      },
    ],
  },
  {
    id: 'thornbury-delaware',
    name: 'Thornbury Township (Delaware Co.)',
    description: 'Three elected supervisors.',
    site: 'thornbury.org',
    note: 'This township levies no municipal property tax.',
    positionGroups: [
      {
        title: 'Board of Supervisors',
        officials: [
          { name: 'Michael J. Mattson', position: 'Chairman', term: 'TBD', href: 'https://thornbury.org/elected-officials' },
          { name: 'Sheri L. Perkins', position: 'Vice Chair', term: 'TBD', href: 'https://thornbury.org/elected-officials' },
          { name: 'Greg DeMarco', position: 'Supervisor', term: 'TBD', href: 'https://thornbury.org/elected-officials' },
        ],
      },
      {
        title: 'Tax Collector',
        officials: [
          { name: 'TBD', position: 'Tax Collector', term: 'TBD', href: 'https://thornbury.org' },
        ],
      },
    ],
  },
  {
    id: 'chester-county',
    name: 'Chester County',
    description:
      'Governed by an elected three-member Board of Commissioners plus nine elected row offices.',
    site: 'chesco.org',
    positionGroups: [
      {
        title: 'County Commissioner (Chester County)',
        officials: [
          { name: 'Josh Maxwell', position: 'Commissioner (Chair)', term: 'Expires Dec 2027', href: 'https://www.chesco.org/203' },
          { name: 'Marian Moskowitz', position: 'Commissioner (Vice Chair)', term: 'Expires Dec 2027', href: 'https://www.chesco.org/203' },
          { name: 'Eric Roe', position: 'Commissioner', term: 'Expires Dec 2027', href: 'https://www.chesco.org/203' },
        ],
      },
      {
        title: 'District Attorney',
        officials: [
          { name: 'Chris de Barrena-Sarobe', position: 'District Attorney', term: 'Expires Dec 2027', href: 'https://www.chesco.org/da' },
        ],
      },
      {
        title: 'Sheriff',
        officials: [
          { name: 'Kevin Dykes', position: 'Sheriff', term: 'Expires Dec 2027', href: 'https://www.chesco.org/sheriff' },
        ],
      },
      {
        title: 'Controller',
        officials: [
          { name: 'Nick Cherubino', position: 'Controller', term: 'Expires Dec 2029', href: 'https://www.chesco.org/controller' },
        ],
      },
      {
        title: 'Treasurer',
        officials: [
          { name: 'Patricia Maisano', position: 'Treasurer', term: 'Expires Dec 2029', href: 'https://www.chesco.org/treasurer' },
        ],
      },
      {
        title: 'Coroner',
        officials: [
          { name: 'Sophia Garcia-Jackson', position: 'Coroner', term: 'Expires Dec 2029', href: 'https://www.chesco.org/coroner' },
        ],
      },
      {
        title: 'Recorder of Deeds',
        officials: [
          { name: "Diane O'Dwyer", position: 'Recorder of Wills', term: 'Expires Dec 2027', href: 'https://www.chesco.org/recorder' },
        ],
      },
      {
        title: 'Register of Wills',
        officials: [
          { name: 'TBD', position: 'Register of Wills', term: 'TBD', href: 'https://www.chesco.org/register' },
        ],
      },
      {
        title: 'Clerk of Courts',
        officials: [
          { name: 'Caroline Bradley', position: 'Clerk of Courts', term: 'Expires Dec 2029', href: 'https://www.chesco.org/clerk' },
        ],
      },
      {
        title: 'Prothonotary',
        officials: [
          { name: 'Alex Christy', position: 'Prothonotary', term: 'Expires Dec 2029', href: 'https://www.chesco.org/prothonotary' },
        ],
      },
      {
        title: 'Court of Common Pleas Judge',
        officials: [
          { name: 'TBD', position: 'Court of Common Pleas Judges', term: 'TBD', href: 'https://www.chesco.org/judiciary', note: 'See chesco.org/judiciary.' },
        ],
      },
      {
        title: 'Magisterial District Judge (MDJ)',
        officials: [
          { name: 'TBD', position: 'Magisterial District Judges', term: 'TBD', href: 'https://www.chesco.org/judiciary', note: 'See chesco.org/judiciary.' },
        ],
      },
    ],
  },
  {
    id: 'delaware-county',
    name: 'Delaware County',
    description:
      'Governed by an elected five-member County Council plus elected row offices. Relevant for Thornbury Township (Delaware Co.) residents.',
    site: 'delcopa.gov',
    placeholderNote: DELAWARE_PLACEHOLDER_NOTE,
    officials: [
      { name: 'TBD', position: 'County Council Members (5)', term: 'TBD', href: 'https://delcopa.gov/council', note: 'Verify at delcopa.gov/council.' },
      { name: 'TBD', position: 'Row office officials', term: 'TBD', href: 'https://delcopa.gov', note: 'Verify at delcopa.gov.' },
    ],
  },
];

const FILTER_OPTIONS = [
  { id: 'wcasd', label: 'WCASD' },
  { id: 'borough', label: 'West Chester Borough' },
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

function Official({ official }) {
  const isTbd = official.name === 'TBD';

  return (
    <li className={styles.official}>
      <div className={styles.officialMain}>
        {isTbd ? (
          <span className={styles.officialTbd}>
            TBD
            <a
              href={official.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.verifyLink}
            >
              Verify ↗
            </a>
          </span>
        ) : (
          <a
            href={official.href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.officialName}
          >
            {official.name}
          </a>
        )}
        <span className={styles.officialPosition}>{official.position}</span>
      </div>
      <div className={styles.officialTerm}>
        <span className={styles.termLabel}>Term</span>
        <span className={official.term === 'TBD' ? styles.termTbd : styles.termValue}>
          {official.term}
        </span>
      </div>
      {official.note && <p className={styles.officialNote}>{official.note}</p>}
    </li>
  );
}

function PositionGroup({ group }) {
  const role = ROLE_INFO[group.title];

  return (
    <div className={styles.positionGroup}>
      <h3 className={styles.groupTitle}>{group.title}</h3>
      {role && (
        <>
          <p className={styles.groupDesc}>{role.description}</p>
          <p className={styles.groupKeyDecisions}>
            <span className={styles.keyDecisionsLabel}>Key decisions:</span>{' '}
            {role.keyDecisions}
          </p>
        </>
      )}
      <ul className={styles.officialsList}>
        {group.officials.map((official, i) => (
          <Official key={`${official.position}-${i}`} official={official} />
        ))}
      </ul>
    </div>
  );
}

export default function DirectoryClient() {
  const [selected, setSelected] = useState([]);

  const isAllActive = selected.length === 0;

  const toggleMunicipality = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const visibleEntities = isAllActive
    ? ENTITIES
    : ENTITIES.filter((entity) => selected.includes(entity.id));

  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>Government</div>
          <h1 className={styles.heading}>Government Directory</h1>
          <p className={styles.intro}>
            Who currently holds elected office across the greater West Chester
            area. This directory covers every government entity that serves
            local residents — the school board, the Borough, the seven
            surrounding townships, and county government in both Chester and
            Delaware counties. We keep it current as officials change.
          </p>
          <div className={styles.heroMeta}>
            <span className={styles.verified}>Last verified: September 2026</span>
            <span className={styles.corrections}>
              Notice an error? Contact us at{' '}
              <a
                href="mailto:hello@westchesterbythenumbers.com"
                className={styles.introLink}
              >
                hello@westchesterbythenumbers.com
              </a>
            </span>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.filterBar}>
          <div className={styles.filterHeader}>
            <div className={styles.filterLabel}>Filter by municipality</div>
            {!isAllActive && (
              <button
                type="button"
                className={styles.clearFilters}
                onClick={() => setSelected([])}
              >
                Clear filters
              </button>
            )}
          </div>
          <div className={styles.filterGroup} role="group" aria-label="Filter by municipality">
            <button
              type="button"
              className={`${styles.filterBtn} ${isAllActive ? styles.filterBtnActive : ''}`}
              aria-pressed={isAllActive}
              onClick={() => setSelected([])}
            >
              All
            </button>
            {FILTER_OPTIONS.map((option) => {
              const active = selected.includes(option.id);
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

        {visibleEntities.map((entity) => (
          <section key={entity.id} id={entity.id} className={styles.section}>
            <h2 className={styles.sectionHeading}>{entity.name}</h2>
            <p className={styles.sectionDescription}>{entity.description}</p>
            {entity.note && <p className={styles.sectionNote}>{entity.note}</p>}
            <a
              href={`https://${entity.site}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.siteLink}
            >
              {entity.site} ↗
            </a>

            {entity.positionGroups ? (
              entity.positionGroups.map((group) => (
                <PositionGroup key={group.title} group={group} />
              ))
            ) : (
              <>
                {entity.placeholderNote && (
                  <p className={styles.groupDesc}>{entity.placeholderNote}</p>
                )}
                <ul className={styles.officialsList}>
                  {entity.officials.map((official, i) => (
                    <Official key={`${official.position}-${i}`} official={official} />
                  ))}
                </ul>
              </>
            )}
          </section>
        ))}
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
