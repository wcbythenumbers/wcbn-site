'use client';

import { useState } from 'react';
import Link from 'next/link';
import { slugifyName } from '../../../lib/slug';
import { isValidMunicipalityId } from '../../../lib/entities';
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
  'Board of Auditors': {
    description:
      "An independently elected board responsible for auditing the township's financial records each year. Auditors review township accounts, verify expenditures, and certify that public funds were spent appropriately. They operate independently of the Board of Supervisors. Note: some townships use hired accounting firms instead of elected auditors — check with your township.",
    keyDecisions:
      "approval or rejection of the township's annual financial audit, flagging discrepancies or irregularities in township spending.",
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

/* Names that mark an unverified officeholder — rendered muted/italic with a Verify link. */
const PLACEHOLDER_NAMES = ['TBD', 'Not confirmed'];
/* Term values that mark unknown/unpublished terms — rendered muted/italic. */
const UNKNOWN_TERMS = ['TBD', 'Not confirmed', 'Not published'];

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
          { name: 'Daryl Durnell', position: 'President', tag: 'Region 2', term: 'Dec 2027', href: 'https://www.wcasd.net/school-board' },
        ],
      },
      {
        title: 'School Board Director',
        officials: [
          { name: 'Gary Bevilacqua', position: 'Vice President', tag: 'Region 3', term: 'Dec 2027', href: 'https://www.wcasd.net/school-board' },
          { name: 'Karen Fleming', position: 'Director', tag: 'Region 2', term: 'Dec 2029', href: 'https://www.wcasd.net/school-board' },
          { name: 'Dr. Beth Campbell', position: 'Director', tag: 'Region 3', term: 'Dec 2029', href: 'https://www.wcasd.net/school-board' },
          { name: 'Dr. Laura Detre', position: 'Director', tag: 'Region 3', term: 'Dec 2029', href: 'https://www.wcasd.net/school-board' },
          { name: 'Katy Frey', position: 'Director', tag: 'Region 1', term: 'Dec 2027', href: 'https://www.wcasd.net/school-board' },
          { name: 'Ramon Jackson', position: 'Director', tag: 'Region 1', term: 'Dec 2027', href: 'https://www.wcasd.net/school-board' },
          { name: 'Ashley Lahm', position: 'Director', tag: 'Region 2', term: 'Dec 2027', href: 'https://www.wcasd.net/school-board' },
          { name: 'Jewell Parkinson', position: 'Director', tag: 'Region 1', term: 'Dec 2029', href: 'https://www.wcasd.net/school-board' },
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
          { name: 'Lillian L. DeBaptiste', position: 'Mayor', term: '~January 2030', href: 'https://www.west-chester.com/213/Mayor' },
        ],
      },
      {
        title: 'Borough Council Member',
        officials: [
          { name: 'Jerry Szczepaniak', position: 'Ward 1 Council Member', term: '~2029', href: 'https://www.west-chester.com/227' },
          {
            name: 'Bryan Travis',
            position: 'Ward 2 Council Member',
            term: '~2027',
            href: 'https://www.west-chester.com/227',
            infoNote: 'To verify, contact West Chester Borough at 610-696-4971 or visit west-chester.com/227',
          },
          { name: 'Brian J. McGinnis', position: 'Ward 3 Council Member', term: '~2029', href: 'https://www.west-chester.com/227' },
          {
            name: 'Nicole Scimone',
            position: 'Ward 4 Council Member',
            term: '~2027',
            href: 'https://www.west-chester.com/227',
            infoNote: 'To verify, contact West Chester Borough at 610-696-4971 or visit west-chester.com/227',
          },
          { name: 'Stephen Marvin', position: 'Ward 5 Council Member', term: '~2029', href: 'https://www.west-chester.com/227' },
          {
            name: 'Bernie Flynn',
            position: 'Ward 6 Council Member',
            term: '~2027',
            href: 'https://www.west-chester.com/227',
            infoNote: 'To verify, contact West Chester Borough at 610-696-4971 or visit west-chester.com/227',
          },
          { name: 'Lisa Kearns', position: 'Ward 7 Council Member', term: '~2029', href: 'https://www.west-chester.com/227' },
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
          { name: 'Cody Bright', position: 'Chair', term: '2027', href: 'https://eastgoshen.org/boards/board-of-supervisors/' },
          { name: 'Barbara Emery', position: 'Vice Chair', term: '2029', href: 'https://eastgoshen.org/boards/board-of-supervisors/' },
          { name: 'Peter Hicks', position: 'Supervisor', term: '2029', href: 'https://eastgoshen.org/boards/board-of-supervisors/' },
          { name: 'Ann Duffield', position: 'Supervisor', term: '2031', href: 'https://eastgoshen.org/boards/board-of-supervisors/' },
          { name: 'Larry Massaro', position: 'Supervisor', term: '2031', href: 'https://eastgoshen.org/boards/board-of-supervisors/' },
        ],
      },
      {
        title: 'Tax Collector',
        officials: [
          { name: 'Carl W. Griffin', position: 'Tax Collector', term: '~2029', href: 'https://eastgoshen.org' },
        ],
      },
      {
        title: 'Board of Auditors',
        officials: [
          { name: 'Karen deSimone', position: 'Auditor', term: '2027', href: 'https://eastgoshen.org/boards/board-of-auditors/' },
          { name: 'Diana Masha', position: 'Auditor', term: '2029', href: 'https://eastgoshen.org/boards/board-of-auditors/' },
          { name: 'Clara Thorne', position: 'Auditor', term: '2031', href: 'https://eastgoshen.org/boards/board-of-auditors/' },
        ],
      },
    ],
  },
  {
    id: 'west-goshen',
    name: 'West Goshen Township',
    description: 'Five elected supervisors.',
    site: 'westgoshen.org',
    positionGroups: [
      {
        title: 'Board of Supervisors',
        officials: [
          { name: 'Ashley Gagné', position: 'Chair', term: '2031', href: 'https://westgoshen.org/158/Board-of-Supervisors' },
          { name: 'Tinamarie Smith', position: 'Vice Chair', term: '2027', href: 'https://westgoshen.org/158/Board-of-Supervisors' },
          { name: 'Shaun Walsh', position: 'Supervisor', term: '2029', href: 'https://westgoshen.org/158/Board-of-Supervisors' },
          { name: 'John Hellmann', position: 'Supervisor', term: '2027', href: 'https://westgoshen.org/158/Board-of-Supervisors' },
          { name: 'Nate Wolman', position: 'Supervisor', term: '2029', href: 'https://westgoshen.org/158/Board-of-Supervisors' },
        ],
      },
      {
        title: 'Tax Collector',
        officials: [
          { name: 'David Kahl', position: 'Tax Collector', term: '~2029', href: 'https://westgoshen.org/169/Tax-Collector' },
        ],
      },
      {
        title: 'Board of Auditors',
        officials: [
          { name: 'Carter Membrino', position: 'Auditor', term: 'Not confirmed', href: 'https://westgoshen.org/157/Boards-Commissions' },
          {
            name: 'Not confirmed',
            position: 'Auditor (seat 2)',
            href: 'https://westgoshen.org',
            infoNote: 'To verify, contact West Goshen Township at westgoshen.org',
          },
          {
            name: 'Not confirmed',
            position: 'Auditor (seat 3)',
            href: 'https://westgoshen.org',
            infoNote: 'To verify, contact West Goshen Township at westgoshen.org',
          },
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
          { name: 'Jeff Huckabee', position: 'Chair', term: 'Not confirmed', href: 'https://www.eastbradford.org' },
          { name: 'Bruce W. Laverty', position: 'Vice Chair', term: 'Dec 31, 2027', href: 'https://www.eastbradford.org' },
          { name: 'Debbie Maynard', position: 'Supervisor', term: 'Dec 31, 2031', href: 'https://www.eastbradford.org' },
        ],
      },
      {
        title: 'Tax Collector',
        officials: [
          { name: 'David Cambridge', position: 'Tax Collector', term: 'Dec 31, 2029', href: 'https://www.eastbradford.org/180/Board-of-Auditors-Tax-Collector' },
        ],
      },
      {
        title: 'Board of Auditors',
        officials: [
          { name: 'James VanderWaal', position: 'Auditor', term: 'Dec 31, 2027', href: 'https://www.eastbradford.org/180/Board-of-Auditors-Tax-Collector' },
          { name: 'Bill Phifer', position: 'Auditor', term: 'Dec 31, 2029', href: 'https://www.eastbradford.org/180/Board-of-Auditors-Tax-Collector' },
          { name: 'Richard ("Rick") Davis', position: 'Auditor', term: 'Dec 31, 2031', href: 'https://www.eastbradford.org/180/Board-of-Auditors-Tax-Collector' },
        ],
      },
    ],
  },
  {
    id: 'west-whiteland',
    name: 'West Whiteland Township',
    description: 'Three elected supervisors serving six-year staggered terms.',
    site: 'westwhiteland.org',
    positionGroups: [
      {
        title: 'Board of Supervisors',
        officials: [
          { name: 'Brian Dunn', position: 'Chair', term: 'Dec 31, 2027', href: 'https://westwhiteland.org/165/Board-of-Supervisors' },
          { name: 'Rajesh Kumbhardare', position: 'Vice Chair', term: 'Dec 31, 2031', href: 'https://westwhiteland.org/165/Board-of-Supervisors' },
          {
            name: 'Libby Madarasz',
            position: 'Supervisor',
            term: 'Dec 31, 2027',
            href: 'https://westwhiteland.org/165/Board-of-Supervisors',
            note: "Filled vacancy left by Jo Ann Kelton's October 2025 resignation.",
          },
        ],
      },
      {
        title: 'Tax Collector',
        officials: [
          { name: 'Arati Joshi', position: 'Tax Collector', term: '~2029', href: 'https://westwhiteland.org' },
        ],
      },
      {
        title: 'Board of Auditors',
        officials: [
          { name: 'Michael Kling', position: 'Chair', term: 'Jan 2, 2030', href: 'https://westwhiteland.org/164/Board-of-Auditors' },
          { name: 'Deepak Gupta', position: 'Vice Chair', term: 'Jan 5, 2032', href: 'https://westwhiteland.org/164/Board-of-Auditors' },
          { name: 'Vijay Vinayak Bedekar', position: 'Secretary', term: 'Jan 3, 2028', href: 'https://westwhiteland.org/164/Board-of-Auditors' },
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
          { name: 'Jodi Nawrocki', position: 'Chair', term: '2031', href: 'https://westtownpa.org/board-of-supervisors/' },
          { name: 'Fred (Frederick) Magner', position: 'Vice Chair', term: '2027', href: 'https://westtownpa.org/board-of-supervisors/' },
          { name: 'Tom Foster', position: 'Supervisor', term: '2027', href: 'https://westtownpa.org/board-of-supervisors/' },
        ],
      },
      {
        title: 'Tax Collector',
        officials: [
          { name: 'Christopher Thomson', position: 'Tax Collector', term: 'Not confirmed', href: 'https://westtownpa.org' },
        ],
      },
      {
        title: 'Board of Auditors',
        officials: [
          { name: 'Jim Hanak', position: 'Auditor', term: 'Not confirmed', href: 'https://westtownpa.org' },
          {
            name: 'Not confirmed',
            position: 'Auditor (seat 2)',
            href: 'https://westtownpa.org',
            infoNote: 'To verify, contact Westtown Township at westtownpa.org',
          },
          {
            name: 'Not confirmed',
            position: 'Auditor (seat 3)',
            href: 'https://westtownpa.org',
            infoNote: 'To verify, contact Westtown Township at westtownpa.org',
          },
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
          { name: 'James Benoit', position: 'Chairman', term: '2031', href: 'https://www.thornburytwp.com/index.php/board-of-supervisors/' },
          { name: 'Joseph Lisa', position: 'Vice Chairman', term: 'Not confirmed', href: 'https://www.thornburytwp.com/index.php/board-of-supervisors/' },
          { name: 'Robert C. Wiggins', position: 'Supervisor', term: '2031', href: 'https://www.thornburytwp.com/index.php/board-of-supervisors/' },
          { name: 'Paul Manidis', position: 'Supervisor', term: '2029', href: 'https://www.thornburytwp.com/index.php/board-of-supervisors/' },
          { name: 'Eric C. Burling', position: 'Supervisor', term: 'Not confirmed', href: 'https://www.thornburytwp.com/index.php/board-of-supervisors/' },
        ],
      },
      {
        title: 'Tax Collector',
        officials: [
          { name: 'Audrey E. Hudak', position: 'Tax Collector', term: '2029', href: 'https://www.thornburytwp.com/index.php/taxes/' },
        ],
      },
      {
        title: 'Board of Auditors',
        officials: [
          { name: 'Grace Benoit', position: 'Auditor', term: '2031', href: 'https://www.thornburytwp.com/index.php/taxes/' },
          { name: 'Joseph J. Spall III', position: 'Auditor', term: 'Not confirmed', href: 'https://www.thornburytwp.com/index.php/taxes/' },
          {
            name: 'Not confirmed',
            position: 'Auditor (seat 3)',
            href: 'https://www.thornburytwp.com/index.php/taxes/',
            infoNote: 'To verify, contact Thornbury Township (Chester Co.) at 610-399-8383',
          },
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
          { name: 'Michael J. Mattson', position: 'Chairman', term: 'Not published', href: 'https://www.thornbury.org/elected-officials' },
          { name: 'Sheri L. Perkins', position: 'Vice Chair', term: 'Not published', href: 'https://www.thornbury.org/elected-officials' },
          { name: 'Greg DeMarco', position: 'Supervisor', term: 'Not published', href: 'https://www.thornbury.org/elected-officials' },
        ],
      },
      {
        title: 'Tax Collector',
        officials: [
          { name: 'Katie Gricco', position: 'Tax Collector', term: 'Not published', href: 'https://www.thornbury.org/elected-officials' },
        ],
      },
      {
        title: 'Board of Auditors',
        officials: [
          { name: 'Albert DeFruscio', position: 'Auditor', term: 'Not published', href: 'https://www.thornbury.org/elected-officials' },
          { name: 'Elizabeth Stefanide', position: 'Auditor', term: 'Not published', href: 'https://www.thornbury.org/elected-officials' },
          { name: 'Joyce Price', position: 'Auditor', term: 'Not published', href: 'https://www.thornbury.org/elected-officials' },
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
          { name: 'Josh Maxwell', position: 'Commissioner (Chair)', tag: 'Democratic', term: '2027', href: 'https://www.chesco.org/203/Commissioners' },
          { name: 'Marian D. Moskowitz', position: 'Commissioner (Vice Chair)', tag: 'Democratic', term: '2027', href: 'https://www.chesco.org/4364/Marian-D-Moskowitz' },
          { name: 'Eric M. Roe', position: 'Commissioner', tag: 'Republican', term: '2027', href: 'https://www.chesco.org/5479/Eric-M-Roe' },
        ],
      },
      {
        title: 'District Attorney',
        officials: [
          { name: 'Chris de Barrena-Sarobe', position: 'District Attorney', tag: 'Democratic', term: '2027', href: 'https://www.chesco.org/5480/District-Attorney-Chris-de-Barrena-Sarob' },
        ],
      },
      {
        title: 'Sheriff',
        officials: [
          { name: 'Kevin D. Dykes', position: 'Sheriff', tag: 'Democratic', term: '2027', href: 'https://www.chesco.org/167/Sheriff' },
        ],
      },
      {
        title: 'Controller',
        officials: [
          { name: 'Nick Cherubino', position: 'Controller', tag: 'Democratic', term: '2029', href: 'https://www.chesco.org/controller' },
        ],
      },
      {
        title: 'Treasurer',
        officials: [
          { name: 'Patricia Maisano', position: 'Treasurer', tag: 'Democratic', term: '2029', href: 'https://www.chesco.org/161/Treasurer' },
        ],
      },
      {
        title: 'Coroner',
        officials: [
          { name: 'Sophia Garcia-Jackson', position: 'Coroner', tag: 'Democratic', term: '2029', href: 'https://www.chesco.org/coroner' },
        ],
      },
      {
        title: 'Recorder of Deeds',
        officials: [
          { name: "Diane O'Dwyer", position: 'Recorder of Deeds', tag: 'Democratic', term: '2027', href: 'https://www.chesco.org/recorder' },
        ],
      },
      {
        title: 'Register of Wills',
        officials: [
          { name: 'Michele Vaughn', position: 'Register of Wills', tag: 'Democratic', term: '2027', href: 'https://www.chesco.org/168/Register-of-Wills-Orphans-Court' },
        ],
      },
      {
        title: 'Clerk of Courts',
        officials: [
          { name: 'Caroline Bradley', position: 'Clerk of Courts', tag: 'Democratic', term: '2029', href: 'https://www.chesco.org/clerk' },
        ],
      },
      {
        title: 'Prothonotary',
        officials: [
          { name: 'Alex Christy', position: 'Prothonotary', tag: 'Democratic', term: '2027', href: 'https://www.chesco.org/prothonotary' },
        ],
      },
      {
        title: 'Court of Common Pleas Judge',
        note: 'Chester County does not publish term expiration dates for sitting judges. For full judicial information visit chesco.org/184/Judges.',
        officials: [
          { name: 'Hon. Ann Marie Wheatcraft', position: 'President Judge', href: 'https://www.chesco.org/604/Honorable-Ann-Marie-Wheatcraft' },
          { name: 'John L. Hall', position: 'Judge', href: 'https://www.chesco.org/1333/County-Court-of-Common-Pleas' },
          { name: 'Patrick Carmody', position: 'Judge', href: 'https://www.chesco.org/1333/County-Court-of-Common-Pleas' },
          { name: 'Allison Bell Royer', position: 'Judge', href: 'https://www.chesco.org/1333/County-Court-of-Common-Pleas' },
          { name: 'Bret M. Binder', position: 'Judge', href: 'https://www.chesco.org/1333/County-Court-of-Common-Pleas' },
          { name: 'Analisa Sondergaard', position: 'Judge', href: 'https://www.chesco.org/1333/County-Court-of-Common-Pleas' },
          { name: 'Anthony T. Verwey', position: 'Judge', href: 'https://www.chesco.org/1333/County-Court-of-Common-Pleas' },
          { name: 'Alita A. Rovito', position: 'Judge', href: 'https://www.chesco.org/1333/County-Court-of-Common-Pleas' },
          { name: 'Fredda Lewis Maddox', position: 'Judge', href: 'https://www.chesco.org/1333/County-Court-of-Common-Pleas' },
          { name: 'Deborah S. Ryan', position: 'Judge', href: 'https://www.chesco.org/1333/County-Court-of-Common-Pleas' },
          { name: 'Sarah B. Black', position: 'Judge', href: 'https://www.chesco.org/1333/County-Court-of-Common-Pleas' },
          { name: 'Nicole R. Forzato', position: 'Judge', href: 'https://www.chesco.org/1333/County-Court-of-Common-Pleas' },
          { name: 'Thomas P. McCabe', position: 'Judge', href: 'https://www.chesco.org/1333/County-Court-of-Common-Pleas' },
          { name: 'Clay N. Cauley Sr.', position: 'Judge', href: 'https://www.chesco.org/1333/County-Court-of-Common-Pleas' },
          { name: 'Mackenzie W. Smith', position: 'Judge', href: 'https://www.chesco.org/1333/County-Court-of-Common-Pleas' },
        ],
      },
      {
        title: 'Magisterial District Judge (MDJ)',
        officials: [
          {
            name: 'Marc Lieberman',
            position: 'MDJ 15-1-01',
            covers: 'West Chester Borough (Wards 3, 6, 7), East Bradford Township',
            href: 'https://www.chesco.org/BusinessDirectoryII.aspx?BID=104',
          },
          {
            name: 'VACANT',
            position: 'MDJ 15-1-02',
            covers: 'East Goshen Township, Westtown Township (Voting District 2 only)',
            href: 'https://www.chesco.org/BusinessDirectoryII.aspx?BID=105',
          },
          {
            name: 'Marian T. Vito',
            position: 'MDJ 15-1-04',
            covers: 'West Chester Borough (Wards 1, 2, 4, 5)',
            href: 'https://www.chesco.org/BusinessDirectoryII.aspx?BID=107',
          },
          {
            name: 'Anthony ("Tony") DiFrancesca',
            position: 'MDJ 15-2-03',
            covers: 'West Goshen Township, Thornbury Township (Chester Co.), Westtown Township (Voting Districts 1, 3, 4, 5)',
            href: 'https://www.chesco.org/BusinessDirectoryII.aspx?BID=110',
          },
          {
            name: 'Erin Bruno',
            position: 'MDJ 15-4-03',
            covers: 'West Whiteland Township, East Whiteland Township',
            href: 'https://www.chesco.org/BusinessDirectoryII.aspx?BID=120',
          },
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
    note:
      'Delaware County does not have elected Coroner, Clerk of Courts, or Prothonotary positions. The county uses an appointed Chief Medical Examiner and a consolidated Office of Judicial Support for these functions.',
    positionGroups: [
      {
        title: 'County Council Member',
        officials: [
          { name: 'Richard R. Womack', position: 'Council Chair', tag: 'Democratic', term: '~2030', href: 'https://www.delcopa.gov/council' },
          { name: 'Christine A. Reuther', position: 'Council Vice Chair', tag: 'Democratic', term: '~2028', href: 'https://www.delcopa.gov/council' },
          { name: 'Dr. Monica Taylor', position: 'Council Member', tag: 'Democratic', term: '~2028', href: 'https://www.delcopa.gov/council' },
          { name: 'Elaine Paul Schaefer', position: 'Council Member', tag: 'Democratic', term: '~2028', href: 'https://www.delcopa.gov/council' },
          { name: 'Joanne Phillips', position: 'Council Member', tag: 'Democratic', term: '~2030', href: 'https://www.delcopa.gov/council' },
        ],
      },
      {
        title: 'District Attorney',
        officials: [
          {
            name: 'Tanner Rouse',
            position: 'District Attorney',
            term: '~2028',
            href: 'https://www.delcopa.gov',
            note: "Appointed to complete predecessor's term.",
          },
        ],
      },
      {
        title: 'Sheriff',
        officials: [
          { name: 'Siddiq Kamara', position: 'Sheriff', tag: 'Democratic', term: '~2030', href: 'https://www.delcopa.gov' },
        ],
      },
      {
        title: 'Controller',
        officials: [
          { name: 'Louis F. Rosenthal', position: 'Controller', tag: 'Democratic', term: '~2030', href: 'https://www.delcopa.gov' },
        ],
      },
      {
        title: 'Treasurer',
        officials: [
          {
            name: 'James P. ("Jim") Hackett',
            position: 'Treasurer',
            term: 'Not confirmed',
            href: 'https://www.delcopa.gov/treasurer',
            nameInfoNote: 'To verify, visit delcopa.gov/treasurer',
          },
        ],
      },
      {
        title: 'Recorder of Deeds',
        officials: [
          {
            name: 'Robert A. Auclair, Esq.',
            position: 'Recorder of Deeds',
            term: 'Not confirmed',
            href: 'https://www.delcopa.gov',
            nameInfoNote: 'To verify, visit delcopa.gov',
          },
        ],
      },
      {
        title: "Register of Wills / Clerk of Orphans' Court",
        officials: [
          { name: 'Vincent Rongione, Esq.', position: "Register of Wills / Clerk of Orphans' Court", tag: 'Democratic', term: '~2030', href: 'https://www.delcopa.gov' },
        ],
      },
      {
        title: 'Magisterial District Judge (MDJ)',
        officials: [
          {
            name: 'Wendy B. Roberts, Esq.',
            position: 'MDJ 32-2-49',
            covers: 'Thornbury Township (Delaware Co.), Bethel, Chadds Ford & Concord Townships',
            term: 'Dec 31, 2027',
            href: 'https://delcopa.gov/courts/district-judges/courts-list',
          },
        ],
      },
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
  const isVacant = official.name === 'VACANT';
  const isPlaceholder = PLACEHOLDER_NAMES.includes(official.name);
  const isUnknownTerm = UNKNOWN_TERMS.includes(official.term);

  return (
    <li className={styles.official}>
      <div className={styles.officialMain}>
        {isVacant ? (
          <span className={styles.officialVacant}>VACANT</span>
        ) : isPlaceholder ? (
          <span className={styles.officialTbd}>
            {official.name}
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
          <span className={styles.officialNameRow}>
            <a
              href={official.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.officialName}
            >
              {official.name}
            </a>
            {official.nameInfoNote && (
              <details className={styles.nameInfoIndicator}>
                <summary className={styles.nameInfoIcon} aria-label="More info">
                  ⓘ
                </summary>
                <p className={styles.infoNoteText}>{official.nameInfoNote}</p>
              </details>
            )}
          </span>
        )}
        <span className={styles.officialPosition}>
          {official.position}
          {official.tag && <span className={styles.officialTag}> · {official.tag}</span>}
        </span>
      </div>
      {official.term && (
        <div className={styles.officialTerm}>
          <span className={styles.termLabel}>Term</span>
          <span className={isUnknownTerm ? styles.termTbd : styles.termValue}>
            {official.term}
          </span>
        </div>
      )}
      {official.covers && (
        <p className={styles.officialCovers}>Covers: {official.covers}</p>
      )}
      {official.note && <p className={styles.officialNote}>{official.note}</p>}
      {official.infoNote && (
        <details className={styles.infoIndicator}>
          <summary className={styles.infoIcon} aria-label="More info">
            ⓘ
          </summary>
          <p className={styles.infoNoteText}>{official.infoNote}</p>
        </details>
      )}
      {!isVacant && !isPlaceholder && (
        <Link href={`/votes/${slugifyName(official.name)}`} className={styles.voteLink}>
          Voting record →
        </Link>
      )}
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
      {group.note && <p className={styles.sectionNote}>{group.note}</p>}
      <ul className={styles.officialsList}>
        {group.officials.map((official, i) => (
          <Official key={`${official.position}-${i}`} official={official} />
        ))}
      </ul>
    </div>
  );
}

export default function DirectoryClient({ initialEntity } = {}) {
  const [selected, setSelected] = useState(() =>
    isValidMunicipalityId(initialEntity) ? [initialEntity] : []
  );

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

            {entity.positionGroups.map((group) => (
              <PositionGroup key={group.title} group={group} />
            ))}
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
