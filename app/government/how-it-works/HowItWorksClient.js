'use client';

import { useState } from 'react';
import styles from './how-it-works.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: 'county',
    label: 'County Government',
    tagline: 'County-wide services & administration',
    summary:
      'County government provides services spanning the entire county: managing courts and elections, operating the county health department and jail, maintaining county roads, and assessing property values for taxation.',
  },
  {
    id: 'municipal',
    label: 'Municipal Government',
    tagline: 'Borough & township services',
    summary:
      'Boroughs and townships are the most local layer of government. They provide services within their own boundaries: police, zoning and land use, local roads, stormwater, parks, and refuse collection.',
  },
  {
    id: 'school',
    label: 'School District',
    tagline: 'WCASD Board of Education',
    summary:
      'The West Chester Area School District is governed by a nine-member elected Board of Directors. The board sets education policy, approves the annual budget, and hires and evaluates the Superintendent.',
  },
  {
    id: 'judicial',
    label: 'Judicial',
    tagline: 'Courts & magistrates',
    summary:
      'Pennsylvania has a unified court system with two levels most residents encounter: the Court of Common Pleas (major trial court) and Magisterial District Judges (traffic, small claims, and preliminary criminal hearings).',
  },
];

// Helper: shared supervisor position template
function supervisorPosition(count) {
  return {
    id: 'supervisor',
    title: 'Township Supervisor',
    count,
    responsibilities:
      'An elected member of the Board of Supervisors, the governing body of the township. Supervisors set township policy, approve the annual budget, levy taxes, and make decisions on land use, zoning, roads, and public services.',
    powers:
      'Hires and oversees the Township Manager, who handles day-to-day operations. Approves land use decisions including zoning changes, subdivisions, and conditional use permits. Sets the annual tax rate.',
    reportsTo:
      'Elected by township voters. The board as a whole hires the Township Manager. The board elects a chair and vice chair from among its members each year.',
  };
}

const ENTITIES = [

  // ── COUNTY GOVERNMENT ──────────────────────────────────────────────────────

  {
    id: 'chester-county',
    categoryId: 'county',
    name: 'Chester County',
    note: null,
    governingBodyName: 'Board of Commissioners + Row Offices',
    bodySize: '3 Commissioners; 9 independently elected Row Officers',
    termInfo: 'All offices serve 4-year terms. Elected in odd-numbered years (e.g., 2023, 2027).',
    description:
      'Chester County is one of Pennsylvania\'s original three counties. It is governed by a three-member Board of Commissioners responsible for county-wide policy, fiscal management, and administration of county services. Nine separately elected "row officers" handle specific functions including law enforcement, fiscal oversight, and court administration. The county manages a budget of approximately $730 million and employs more than 2,600 people.',
    positions: [
      {
        id: 'commissioner',
        title: 'Commissioner',
        count: '3 seats',
        responsibilities:
          'One of three elected members of the chief governing body of Chester County. Responsible for county policy-making, fiscal management, and administration of county services including public health, courts, elections, and infrastructure.',
        powers:
          'Manages a budget of approximately $730 million and over 2,600 county employees. Appoints members of county authorities, boards, and commissions.',
        reportsTo:
          'Elected by and accountable to all Chester County voters. Appoints members of county boards, authorities, and commissions.',
      },
      {
        id: 'da',
        title: 'District Attorney',
        count: '1 seat',
        responsibilities:
          'The county\'s chief law enforcement officer and prosecutor. Responsible for prosecuting criminal cases on behalf of the Commonwealth of Pennsylvania. Oversees the DA\'s office, staff, and decisions about which cases to pursue.',
        powers:
          'Makes charging decisions for all felony and most misdemeanor cases in Chester County. Directs assistant district attorneys and investigative staff.',
        reportsTo:
          'Independently elected by Chester County voters. Reports to no other county official.',
      },
      {
        id: 'sheriff',
        title: 'Sheriff',
        count: '1 seat',
        responsibilities:
          'An officer of the county courts responsible for keeping the peace, serving court orders and subpoenas, transporting prisoners, and providing security in courtrooms. Also operates the county jail.',
        powers:
          'Executes orders of the Court of Common Pleas. Oversees Chester County Prison. Serves civil and criminal process throughout the county.',
        reportsTo:
          'Independently elected by Chester County voters. Serves the Court of Common Pleas.',
      },
      {
        id: 'controller',
        title: 'Controller',
        count: '1 seat',
        responsibilities:
          'The county\'s independent fiscal watchdog. Audits county finances, reviews expenditures, and ensures financial accountability across all county departments and offices.',
        powers:
          'May conduct audits of any county department, authority, or funded agency. Publishes financial reports for public review.',
        reportsTo:
          'Independently elected by Chester County voters. Reports to no other county official.',
      },
      {
        id: 'treasurer',
        title: 'Treasurer',
        count: '1 seat',
        responsibilities:
          'The custodian of all county funds. Receives and manages tax payments, state and federal grants, and other county revenues. Works alongside the Controller to ensure financial accuracy.',
        powers:
          'Controls the investment of county funds and manages cash flow for county operations.',
        reportsTo:
          'Independently elected by Chester County voters.',
      },
      {
        id: 'coroner',
        title: 'Coroner',
        count: '1 seat',
        responsibilities:
          'Investigates deaths occurring in the county to determine cause and manner of death. Certifies death certificates and serves as an independent check on law enforcement in cases of suspicious or unattended deaths.',
        powers:
          'May investigate any death in the county. Has authority to order autopsies and summon witnesses.',
        reportsTo:
          'Independently elected by Chester County voters. Reports to no other county official.',
      },
      {
        id: 'recorder',
        title: 'Recorder of Deeds',
        count: '1 seat',
        responsibilities:
          'Records and maintains real estate documents including deeds, mortgages, and liens. Serves as the official keeper of property ownership records for the county.',
        powers:
          'Official repository of all real estate transactions in Chester County. Documents recorded here provide legal public notice of property ownership and encumbrances.',
        reportsTo:
          'Independently elected by Chester County voters.',
      },
      {
        id: 'register',
        title: 'Register of Wills',
        count: '1 seat',
        responsibilities:
          'Probates wills and appoints estate representatives for people who die with or without a will. Also issues marriage licenses and maintains related records. Serves as Clerk of the Orphans\' Court.',
        powers:
          'Has authority over all probate and estate matters in the county. Appoints administrators for estates without a designated executor.',
        reportsTo:
          'Independently elected by Chester County voters. Also serves ex officio as Clerk of the Orphans\' Court.',
      },
      {
        id: 'clerk-courts',
        title: 'Clerk of Courts',
        count: '1 seat',
        responsibilities:
          'Maintains criminal court records, processes criminal filings, and manages the administrative functions of the criminal court system.',
        powers:
          'Official keeper of all criminal court records in Chester County. Issues criminal docket entries and manages the flow of criminal cases through the court system.',
        reportsTo:
          'Independently elected by Chester County voters. Serves the Court of Common Pleas.',
      },
      {
        id: 'prothonotary',
        title: 'Prothonotary',
        count: '1 seat',
        responsibilities:
          'The civil equivalent of the Clerk of Courts. Maintains civil court records, processes civil filings, and issues writs and other court documents.',
        powers:
          'Official keeper of all civil court records. Issues writs, subpoenas, and other legal process documents for civil matters.',
        reportsTo:
          'Independently elected by Chester County voters. Serves the Court of Common Pleas.',
      },
    ],
  },

  {
    id: 'delaware-county',
    categoryId: 'county',
    name: 'Delaware County',
    note: 'Relevant only for Thornbury Township (Delaware Co.) residents',
    governingBodyName: 'County Council + Row Offices',
    bodySize: '5-member County Council (elected by district); independently elected Row Officers',
    termInfo: '4-year staggered terms. County Council members elected by district under the home-rule charter.',
    description:
      'Delaware County operates under a home-rule charter adopted in 2020, replacing the traditional three-member Board of Commissioners with a five-member County Council elected by district. The county provides county-wide services including courts, elections, property assessment, and the county health department. Most residents of the greater West Chester area are not subject to Delaware County government — only those in Thornbury Township (Delaware Co.) are.',
    positions: [
      {
        id: 'delco-council',
        title: 'County Council Member',
        count: '5 seats, elected by district',
        responsibilities:
          'Delaware County\'s governing body under its home-rule charter. Responsible for county-wide policy, fiscal management, and administration of county services.',
        powers:
          'Sets the county budget, levies taxes, and oversees county operations. Appoints the County Executive and members of county boards and authorities.',
        reportsTo:
          'Elected by district by Delaware County voters. Accountable to their district constituents.',
      },
    ],
  },

  // ── MUNICIPAL GOVERNMENT ───────────────────────────────────────────────────

  {
    id: 'wc-borough',
    categoryId: 'municipal',
    name: 'Borough of West Chester',
    note: null,
    governingBodyName: 'Borough Council + Mayor',
    bodySize: '7-member Borough Council; 1 Mayor (elected at-large)',
    termInfo: '4-year staggered terms. Borough-wide elections held in odd-numbered years.',
    description:
      'West Chester Borough is the county seat of Chester County and is governed by a seven-member Borough Council and an elected Mayor. Council members each represent one of the Borough\'s seven wards. Council sets municipal policy and appoints the Borough Manager, who oversees all departments except the Police Department. The Mayor serves as chief executive and heads the Police Department.',
    positions: [
      {
        id: 'mayor',
        title: 'Mayor',
        count: '1 seat, elected at-large',
        responsibilities:
          'The Borough\'s chief executive and head of the Police Department. Directs the Police Chief and serves as the public face of Borough government. Does not have a vote on Borough Council but presides over council meetings.',
        powers:
          'Directs the Police Department. Presides over Borough Council meetings. May veto ordinances, subject to Council override.',
        reportsTo:
          'Elected at-large by all Borough voters. Directs the Police Chief.',
      },
      {
        id: 'council-member',
        title: 'Borough Council Member',
        count: '7 seats, one per ward',
        responsibilities:
          'One of seven elected representatives, each representing one of the Borough\'s seven wards. As a body, Borough Council sets municipal policy, approves the budget, levies taxes, and appoints the Borough Manager.',
        powers:
          'Appoints the Borough Manager (who oversees all departments except police). Approves the annual budget and capital plans. Enacts local ordinances and zoning regulations.',
        reportsTo:
          'Elected by ward constituents. As a body, the Council appoints and oversees the Borough Manager.',
      },
    ],
  },

  {
    id: 'east-goshen',
    categoryId: 'municipal',
    name: 'East Goshen Township',
    note: null,
    governingBodyName: 'Board of Supervisors',
    bodySize: '5-member Board of Supervisors',
    termInfo: '6-year staggered terms. Elections held in odd-numbered years.',
    description:
      'East Goshen Township is a Second Class Township governed by an elected Board of Supervisors. The board sets township policy, approves the annual budget, and oversees township services including roads, parks, stormwater management, and land use. The board hires a Township Manager to handle day-to-day operations.',
    positions: [supervisorPosition('5 seats')],
  },

  {
    id: 'west-goshen',
    categoryId: 'municipal',
    name: 'West Goshen Township',
    note: null,
    governingBodyName: 'Board of Supervisors',
    bodySize: '5-member Board of Supervisors',
    termInfo: '6-year staggered terms. Elections held in odd-numbered years.',
    description:
      'West Goshen Township is a Second Class Township governed by an elected Board of Supervisors. The board oversees township services, sets local tax rates, and manages land use decisions. The board hires a Township Manager for day-to-day administration.',
    positions: [supervisorPosition('5 seats')],
  },

  {
    id: 'east-bradford',
    categoryId: 'municipal',
    name: 'East Bradford Township',
    note: null,
    governingBodyName: 'Board of Supervisors',
    bodySize: '3-member Board of Supervisors',
    termInfo: '6-year staggered terms. Elections held in odd-numbered years.',
    description:
      'East Bradford Township is a Second Class Township governed by an elected three-member Board of Supervisors. The board handles local roads, land use decisions, and municipal services for this largely residential township.',
    positions: [supervisorPosition('3 seats')],
  },

  {
    id: 'west-whiteland',
    categoryId: 'municipal',
    name: 'West Whiteland Township',
    note: null,
    governingBodyName: 'Board of Supervisors',
    bodySize: '5-member Board of Supervisors',
    termInfo: '6-year staggered terms. Elections held in odd-numbered years.',
    description:
      'West Whiteland Township is a Second Class Township governed by an elected Board of Supervisors. Home to the Exton area, it is one of the more commercially active townships in Chester County. The board oversees a wide range of municipal services and land use decisions.',
    positions: [supervisorPosition('5 seats')],
  },

  {
    id: 'westtown',
    categoryId: 'municipal',
    name: 'Westtown Township',
    note: null,
    governingBodyName: 'Board of Supervisors',
    bodySize: '5-member Board of Supervisors',
    termInfo: '6-year staggered terms. Elections held in odd-numbered years.',
    description:
      'Westtown Township is a Second Class Township governed by an elected Board of Supervisors. The township is known for significant open space preservation efforts. The board oversees land use, roads, and municipal services.',
    positions: [supervisorPosition('5 seats')],
  },

  {
    id: 'thornbury-chester',
    categoryId: 'municipal',
    name: 'Thornbury Township (Chester Co.)',
    note: null,
    governingBodyName: 'Board of Supervisors',
    bodySize: '3-member Board of Supervisors',
    termInfo: '6-year staggered terms. Elections held in odd-numbered years.',
    description:
      'Thornbury Township in Chester County is a Second Class Township governed by a three-member Board of Supervisors. It borders Thornbury Township in Delaware County — these are two distinct municipalities with the same name in different counties, each with its own elected government.',
    positions: [supervisorPosition('3 seats')],
  },

  {
    id: 'thornbury-delaware',
    categoryId: 'municipal',
    name: 'Thornbury Township (Delaware Co.)',
    note: 'In Delaware County — relevant only for residents of this municipality',
    governingBodyName: 'Board of Supervisors',
    bodySize: '3-member Board of Supervisors',
    termInfo: '6-year staggered terms. Elections held in odd-numbered years.',
    description:
      'Thornbury Township in Delaware County is a Second Class Township governed by a three-member Board of Supervisors. Residents here are subject to Delaware County government, not Chester County. The township currently levies no municipal property tax. It borders Thornbury Township in Chester County — these are two distinct municipalities.',
    positions: [supervisorPosition('3 seats')],
  },

  // ── SCHOOL DISTRICT ────────────────────────────────────────────────────────

  {
    id: 'wcasd',
    categoryId: 'school',
    name: 'WCASD Board of Education',
    note: null,
    governingBodyName: 'Board of Directors',
    bodySize: '9-member Board of Directors (three voting regions)',
    termInfo: '4-year staggered terms. Elected in odd-numbered years.',
    description:
      'The West Chester Area School District serves students across multiple municipalities in Chester County. It is governed by a nine-member Board of Directors elected by residents of three geographic voting regions. The board is responsible for setting education policy, approving the annual budget (approximately $334 million), hiring and evaluating the Superintendent, negotiating employee contracts, and approving curriculum.',
    positions: [
      {
        id: 'director',
        title: 'Board Director',
        count: '9 seats (3 per region)',
        responsibilities:
          'One of nine elected members of the WCASD Board of Directors, representing one of three voting regions. As a body, the board sets school district policy, approves the annual budget, hires and evaluates the Superintendent, negotiates employee contracts, and approves curriculum.',
        powers:
          'Approves the approximately $334 million annual budget. Negotiates employee contracts. Approves curriculum and major district policies. Individual directors have no authority outside of board votes.',
        reportsTo:
          'Elected by regional voters. As a body, the board hires and evaluates the Superintendent.',
      },
      {
        id: 'board-president',
        title: 'Board President',
        count: '1 (elected annually by board members)',
        responsibilities:
          'Elected by fellow board members to preside over meetings, set the agenda in coordination with the Superintendent, and serve as the board\'s primary spokesperson.',
        powers:
          'Sets the meeting agenda in coordination with the Superintendent. Presides over all board meetings. Has no additional vote or authority beyond their role as a director.',
        reportsTo:
          'Elected annually by fellow board members. Serves the board as a whole.',
      },
      {
        id: 'board-vp',
        title: 'Board Vice President',
        count: '1 (elected annually by board members)',
        responsibilities:
          'Assists the President and assumes the President\'s role in their absence.',
        powers:
          'Assumes full authority of the Board President when the President is absent or unable to serve. Has no additional authority beyond their role as a director.',
        reportsTo:
          'Elected annually by fellow board members. Reports to the board as a whole.',
      },
    ],
  },

  // ── JUDICIAL ──────────────────────────────────────────────────────────────

  {
    id: 'chester-ccp',
    categoryId: 'judicial',
    name: 'Chester County Court of Common Pleas',
    note: null,
    governingBodyName: 'Court of Common Pleas',
    bodySize: 'Multiple judges, elected countywide',
    termInfo: '10-year terms. Elected countywide; subject to retention elections.',
    description:
      'The Chester County Court of Common Pleas is Pennsylvania\'s primary trial court at the county level. It handles civil litigation, criminal cases, family court (including divorce and custody), orphans\' court (estates and trusts), and juvenile matters. Common Pleas judges are the primary trial judges most residents will appear before.',
    positions: [
      {
        id: 'ccp-judge',
        title: 'Court of Common Pleas Judge',
        count: 'Multiple seats, countywide election',
        responsibilities:
          'A countywide elected judge serving a 10-year term. Hears civil, criminal, family, and orphans\' court cases. Common Pleas judges are the primary trial court judges in Pennsylvania\'s unified judicial system.',
        powers:
          'Presides over all major trial court proceedings in the county. Makes rulings on motions, conducts trials, and sentences convicted defendants. Judges are typically assigned to specific divisions (civil, criminal, family).',
        reportsTo:
          'Elected countywide. Subject to retention elections every 10 years. Supervised by the President Judge of the county.',
      },
    ],
  },

  {
    id: 'mdjs',
    categoryId: 'judicial',
    name: 'Magisterial District Judges',
    note: null,
    governingBodyName: 'Magisterial District Courts',
    bodySize: 'One MDJ per district; multiple districts in Chester County',
    termInfo: '6-year terms. Elected by district in odd-numbered years.',
    description:
      'Magisterial District Judges (MDJs) operate at the most local level of Pennsylvania\'s court system. Each MDJ serves a defined geographic district within the county. They are the first point of contact with the court system for most residents — handling traffic violations, small claims, landlord-tenant disputes, and preliminary hearings in criminal cases.',
    positions: [
      {
        id: 'mdj',
        title: 'Magisterial District Judge (MDJ)',
        count: 'One per district',
        responsibilities:
          'An elected judge serving a district within the county on a 6-year term. Handles minor civil disputes, landlord-tenant cases, small claims, traffic violations, and preliminary hearings in criminal cases. MDJs are the first point of contact with the court system for most residents.',
        powers:
          'Issues arrest warrants, sets bail in criminal cases, and conducts preliminary arraignments and hearings. Rules on civil claims up to $12,000. Handles landlord-tenant disputes including evictions.',
        reportsTo:
          'Elected by district voters. Part of the unified Pennsylvania court system, supervised by the President Judge of the Court of Common Pleas.',
      },
    ],
  },

  {
    id: 'delco-judiciary',
    categoryId: 'judicial',
    name: 'Delaware County Judiciary',
    note: 'Relevant only for Thornbury Township (Delaware Co.) residents',
    governingBodyName: 'Delaware County Court of Common Pleas + MDJ Districts',
    bodySize: 'Multiple judges and MDJ districts',
    termInfo: 'Common Pleas judges serve 10-year terms; MDJs serve 6-year terms.',
    description:
      'Delaware County has its own Court of Common Pleas and Magisterial District Judges, operating under the same Pennsylvania unified court system as Chester County. Residents of Thornbury Township (Delaware Co.) fall under Delaware County court jurisdiction for local matters. The structure and functions are identical to those described for Chester County courts.',
    positions: [
      {
        id: 'delco-ccp',
        title: 'Court of Common Pleas Judge',
        count: 'Multiple seats',
        responsibilities:
          'A countywide elected judge serving a 10-year term. Hears civil, criminal, family, and orphans\' court cases. Functions identically to Chester County Common Pleas judges.',
        powers:
          'Presides over all major trial court proceedings in Delaware County. Same authority and structure as Chester County.',
        reportsTo:
          'Elected countywide in Delaware County. Subject to retention elections every 10 years.',
      },
      {
        id: 'delco-mdj',
        title: 'Magisterial District Judge (MDJ)',
        count: 'One per district',
        responsibilities:
          'Handles minor civil disputes, landlord-tenant cases, small claims, traffic violations, and preliminary hearings in criminal cases within their district in Delaware County.',
        powers:
          'Issues arrest warrants, sets bail, conducts preliminary hearings, and rules on small claims. Same authority as Chester County MDJs.',
        reportsTo:
          'Elected by district voters in Delaware County.',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// WHO'S RESPONSIBLE — DATA
// ─────────────────────────────────────────────────────────────────────────────

const TAG_CONFIG = {
  school:   { label: 'School district', cls: styles.srvTagSchool },
  borough:  { label: 'Borough',         cls: styles.srvTagBorough },
  township: { label: 'Township',        cls: styles.srvTagTownship },
  county:   { label: 'County',          cls: styles.srvTagCounty },
  state:    { label: 'State',           cls: styles.srvTagState },
};

const FILTERS = [
  { id: 'all',      label: 'All services' },
  { id: 'township', label: 'Township' },
  { id: 'borough',  label: 'Borough' },
  { id: 'county',   label: 'County' },
  { id: 'state',    label: 'State' },
  { id: 'school',   label: 'School district' },
];

const SERVICES = [
  // ── School district ──
  {
    id: 'k12-education',
    icon: '🎓',
    name: 'Public K\u201312 education',
    tags: ['school'],
    responsible: 'WCASD Board of Education',
    howItWorks:
      'Public K-12 education across all 8 municipalities is entirely the responsibility of WCASD. The elected nine-member Board sets policy, approves a multi-hundred-million dollar annual budget, and hires the Superintendent. Individual municipalities have no authority over schools.',
    contact: 'WCASD district office: 484-266-1000',
    note: 'The school board is elected by region \u2014 all WCASD residents vote in school board elections regardless of which municipality they live in.',
  },
  {
    id: 'property-taxes',
    icon: '\uD83D\uDCCB',
    name: 'Property taxes',
    tags: ['school', 'county', 'borough', 'township'],
    responsible: 'WCASD / Chester County / Your municipality',
    howItWorks:
      'You receive three separate property tax bills from three different taxing bodies \u2014 your municipality (borough or township), Chester County, and WCASD. Each is set independently by its governing body and collected separately. School district taxes are typically the largest portion of a resident\u2019s total property tax bill. Chester County sets its own millage rate annually. Municipal rates vary by municipality.',
    contact: 'Your elected local Tax Collector for municipal and school taxes. Chester County Treasurer: 610-344-6370 for county taxes.',
    note: 'The three bills arrive at different times of year from different collectors. They are completely separate obligations.',
  },
  // ── Borough & Township ──
  {
    id: 'local-police',
    icon: '\uD83D\uDE94',
    name: 'Local police',
    tags: ['borough', 'township', 'county'],
    responsible: 'Mayor (Borough) / Board of Supervisors (townships)',
    howItWorks:
      'West Chester Borough has its own police department directed by the Mayor. Most townships have their own departments or share one \u2014 West Goshen has its own, Westtown and East Goshen share the Westtown-East Goshen Police Department, and East Bradford contracts with West Chester Borough. The County Sheriff handles court security and civil process, not day-to-day policing.',
    contact: '911 for emergencies. Your borough or township non-emergency line for local issues.',
    note: 'Police coverage varies by municipality \u2014 check with your specific township.',
  },
  {
    id: 'zoning-permits',
    icon: '\uD83C\uDFD7\uFE0F',
    name: 'Zoning & permits',
    tags: ['borough', 'township'],
    responsible: 'Your municipality (borough or township)',
    howItWorks:
      'Zoning ordinances and building permits are set and issued by your municipality \u2014 the borough or township where your property is located. Each municipality has its own zoning map and code. What\u2019s permitted in one township may not be permitted in another.',
    contact: 'West Chester Borough Planning & Zoning: 610-696-4971. For townships, contact your township office directly.',
    note: null,
  },
  {
    id: 'local-parks',
    icon: '\uD83C\uDF33',
    name: 'Local parks',
    tags: ['township', 'county'],
    responsible: 'Board of Supervisors / Chester County',
    howItWorks:
      'Township parks and recreation programs are operated by each township. Chester County also operates regional parks and trails. East Bradford is notable for its significant open space preservation efforts.',
    contact: 'Your township\u2019s parks department. Chester County Parks: 610-344-6415.',
    note: null,
  },
  {
    id: 'trash-recycling',
    icon: '\u267B\uFE0F',
    name: 'Trash & recycling',
    tags: ['borough', 'township'],
    responsible: 'Your municipality (borough or township)',
    howItWorks:
      'Trash and recycling collection is managed by your borough or township, typically through contracts with private haulers. Programs, pickup schedules, and accepted materials vary by municipality.',
    contact: 'Your township or borough public works department.',
    note: null,
  },
  {
    id: 'water-sewer',
    icon: '\uD83D\uDCA7',
    name: 'Water & sewer',
    tags: ['township'],
    responsible: 'Township or municipal authority',
    howItWorks:
      'Water and sewer is operated by a municipal authority or directly by the township, depending on location. Some areas are served by Pennsylvania American Water. Coverage varies widely.',
    contact: 'Check your water bill for your service provider.',
    note: 'Contact your township to find out who provides water and sewer at your address.',
  },
  {
    id: 'fire-ems',
    icon: '\uD83D\uDE92',
    name: 'Fire & EMS',
    tags: ['township', 'borough'],
    responsible: 'Township / Volunteer fire companies',
    howItWorks:
      'Fire protection is primarily provided by volunteer fire companies, supported financially by townships and the Borough. EMS is provided by Good Fellowship Ambulance and similar regional organizations.',
    contact: '911 for all emergencies.',
    note: 'Volunteer fire companies are independent nonprofits but rely on municipal funding.',
  },
  // ── County ──
  {
    id: 'criminal-prosecution',
    icon: '\u2696\uFE0F',
    name: 'Criminal prosecution',
    tags: ['county'],
    responsible: 'District Attorney',
    howItWorks:
      'The elected District Attorney decides whether and how to prosecute criminal cases in Chester County. The DA operates independently of local police and the commissioners. Local police make arrests; the DA decides what happens in court.',
    contact: 'Chester County DA\u2019s Office: 610-344-6801',
    note: 'Local police make arrests. The DA decides what happens in court. These are completely separate functions.',
  },
  {
    id: 'courts',
    icon: '\uD83C\uDFDB\uFE0F',
    name: 'Courts',
    tags: ['county'],
    responsible: 'Court of Common Pleas judges',
    howItWorks:
      'Civil, criminal, and family court cases are heard by elected Common Pleas judges. Magisterial District Judges handle minor civil matters, traffic violations, and preliminary hearings.',
    contact: 'Chester County Justice Center: 610-344-6000',
    note: null,
  },
  {
    id: 'elections',
    icon: '\uD83D\uDDF3\uFE0F',
    name: 'Elections & voting',
    tags: ['county'],
    responsible: 'Chester County Voter Services',
    howItWorks:
      'All elections \u2014 federal, state, county, and local \u2014 are administered by Chester County Voter Services. This includes voter registration, polling places, mail-in ballots, and certifying results. Your municipality has no role in running elections.',
    contact: 'Chester County Voter Services: 610-344-6410',
    note: 'Register to vote and request mail-in ballots through Chester County Voter Services, not your township or borough.',
  },
  {
    id: 'public-health',
    icon: '\uD83C\uDFE5',
    name: 'Public health',
    tags: ['county'],
    responsible: 'Chester County Health Dept.',
    howItWorks:
      'Public health services including disease surveillance, environmental health inspections, and health programs are provided by the Chester County Health Department. Individual municipalities have no public health departments.',
    contact: 'Chester County Health: 610-344-6225',
    note: null,
  },
  {
    id: 'library',
    icon: '\uD83D\uDCDA',
    name: 'Public library',
    tags: ['county'],
    responsible: 'Chester County Library System',
    howItWorks:
      'Public libraries are part of the Chester County Library System, funded through county taxes and state aid.',
    contact: 'Chester County Library: 610-280-2600',
    note: null,
  },
  // ── State ──
  {
    id: 'roads-snow',
    icon: '\uD83D\uDEE3\uFE0F',
    name: 'Roads & snow removal',
    tags: ['state', 'county', 'township', 'borough'],
    responsible: 'PennDOT / Chester County / Your municipality',
    howItWorks:
      'Road maintenance and snow removal responsibility follows road ownership \u2014 and there are three layers. PennDOT owns and maintains state routes like Route 202, Route 30, and Route 926. Chester County maintains county roads. Your township or borough maintains local streets. Snow removal follows the same ownership \u2014 which is why some roads get plowed faster than others during storms.',
    contact: 'PennDOT: 1-800-FIX-ROAD for state routes. Your township or borough for local roads.',
    note: 'Many residents don\u2019t realize the road in front of their house may be owned by a different government than their township. PennDOT prioritizes state routes first in major storms.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function HowItWorksClient() {
  const [layer, setLayer] = useState(1);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeEntityId, setActiveEntityId] = useState(null);
  const [openPositions, setOpenPositions] = useState(new Set());
  const [activeServiceId, setActiveServiceId] = useState(null);
  const [serviceFilter, setServiceFilter] = useState('all');

  const activeCategory = CATEGORIES.find((c) => c.id === activeCategoryId);
  const activeEntity = ENTITIES.find((e) => e.id === activeEntityId);
  const categoryEntities = ENTITIES.filter((e) => e.categoryId === activeCategoryId);

  function goToCategory(categoryId) {
    setActiveCategoryId(categoryId);
    setActiveEntityId(null);
    setOpenPositions(new Set());
    setLayer(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goToEntity(entityId) {
    setActiveEntityId(entityId);
    setOpenPositions(new Set());
    setLayer(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBackToCategories() {
    setLayer(1);
    setActiveCategoryId(null);
    setActiveEntityId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBackToEntities() {
    setLayer(2);
    setActiveEntityId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function togglePosition(posId) {
    setOpenPositions((prev) => {
      const next = new Set(prev);
      if (next.has(posId)) next.delete(posId);
      else next.add(posId);
      return next;
    });
  }

  function toggleService(id) {
    setActiveServiceId((prev) => (prev === id ? null : id));
  }

  function changeServiceFilter(filterId) {
    setServiceFilter(filterId);
    setActiveServiceId(null);
  }

  const visibleServices =
    serviceFilter === 'all'
      ? SERVICES
      : SERVICES.filter((s) => s.tags.includes(serviceFilter));

  return (
    <main className={styles.main}>

      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>Government</div>
          <h1 className={styles.heading}>How Local Government Works</h1>
          <p className={styles.intro}>
            Residents of the greater West Chester area are simultaneously governed
            by multiple overlapping bodies — county, municipal, school district,
            and judicial. This guide explains how each one works, what powers it
            holds, and how its members are chosen. For names of current
            officeholders, see the{' '}
            <a href="/government/directory" className={styles.introLink}>
              Government Directory →
            </a>
          </p>
        </div>
      </header>

      <div className={styles.content}>

        {/* ── Breadcrumb ── */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <button
            className={`${styles.breadcrumbItem} ${
              layer === 1 ? styles.breadcrumbActive : styles.breadcrumbLink
            }`}
            onClick={goBackToCategories}
            disabled={layer === 1}
          >
            All Categories
          </button>

          {layer >= 2 && activeCategory && (
            <>
              <span className={styles.breadcrumbSep}>/</span>
              <button
                className={`${styles.breadcrumbItem} ${
                  layer === 2 ? styles.breadcrumbActive : styles.breadcrumbLink
                }`}
                onClick={goBackToEntities}
                disabled={layer === 2}
              >
                {activeCategory.label}
              </button>
            </>
          )}

          {layer === 3 && activeEntity && (
            <>
              <span className={styles.breadcrumbSep}>/</span>
              <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>
                {activeEntity.name}
              </span>
            </>
          )}
        </nav>

        {/* ── Layer 1: Category cards ── */}
        {layer === 1 && (
          <section className={styles.categoriesGrid} aria-label="Government categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={styles.categoryCard}
                onClick={() => goToCategory(cat.id)}
                aria-label={`Explore ${cat.label}`}
              >
                <div className={styles.categoryCardInner}>
                  <div className={styles.categoryCardTagline}>{cat.tagline}</div>
                  <div className={styles.categoryCardLabel}>{cat.label}</div>
                  <p className={styles.categoryCardSummary}>{cat.summary}</p>
                  <div className={styles.categoryCardCta}>Explore &#8594;</div>
                </div>
              </button>
            ))}
          </section>
        )}

        {/* ── Layer 2: Entity list ── */}
        {layer === 2 && activeCategory && (
          <section aria-label={activeCategory.label}>
            <button className={styles.backBtn} onClick={goBackToCategories}>
              &#8592; Back to All Categories
            </button>

            <div className={styles.layerHeading}>{activeCategory.label}</div>
            <p className={styles.layerSubheading}>{activeCategory.summary}</p>

            <div className={styles.entitiesList}>
              {categoryEntities.map((entity) => (
                <button
                  key={entity.id}
                  className={styles.entityCard}
                  onClick={() => goToEntity(entity.id)}
                  aria-label={`View ${entity.name}`}
                >
                  <div className={styles.entityCardInner}>
                    <div className={styles.entityCardMain}>
                      <div className={styles.entityCardName}>{entity.name}</div>
                      {entity.note && (
                        <div className={styles.entityCardNote}>{entity.note}</div>
                      )}
                      <div className={styles.entityCardBody}>{entity.governingBodyName}</div>
                    </div>
                    <div className={styles.entityCardArrow}>&#8594;</div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Layer 3: Entity detail ── */}
        {layer === 3 && activeEntity && (
          <section aria-label={activeEntity.name}>
            <button className={styles.backBtn} onClick={goBackToEntities}>
              &#8592; Back to {activeCategory?.label}
            </button>

            {/* Entity header */}
            <div className={styles.entityHeader}>
              <h2 className={styles.entityHeaderTitle}>{activeEntity.name}</h2>
              {activeEntity.note && (
                <div className={styles.entityHeaderNote}>{activeEntity.note}</div>
              )}

              <div className={styles.entityMetaGrid}>
                <div className={styles.entityMeta}>
                  <div className={styles.entityMetaLabel}>Governing Body</div>
                  <div className={styles.entityMetaValue}>{activeEntity.governingBodyName}</div>
                </div>
                <div className={styles.entityMeta}>
                  <div className={styles.entityMetaLabel}>Composition</div>
                  <div className={styles.entityMetaValue}>{activeEntity.bodySize}</div>
                </div>
                <div className={styles.entityMeta}>
                  <div className={styles.entityMetaLabel}>Terms &amp; Elections</div>
                  <div className={styles.entityMetaValue}>{activeEntity.termInfo}</div>
                </div>
              </div>

              <p className={styles.entityDescription}>{activeEntity.description}</p>

              <a href="/government/directory" className={styles.directoryLink}>
                View current officeholders &#8594;
              </a>
            </div>

            {/* Positions */}
            <div className={styles.positionsSection}>
              <div className={styles.positionsSectionLabel}>Positions</div>

              {activeEntity.positions.map((pos) => {
                const isOpen = openPositions.has(pos.id);
                return (
                  <div key={pos.id} className={styles.positionItem}>
                    <button
                      className={styles.positionToggle}
                      onClick={() => togglePosition(pos.id)}
                      aria-expanded={isOpen}
                    >
                      <div className={styles.positionToggleLeft}>
                        <span className={styles.positionTitle}>{pos.title}</span>
                        {pos.count && (
                          <span className={styles.positionCount}>{pos.count}</span>
                        )}
                      </div>
                      <span
                        className={`${styles.positionArrow} ${
                          isOpen ? styles.positionArrowOpen : ''
                        }`}
                        aria-hidden="true"
                      >
                        &#9662;
                      </span>
                    </button>

                    <div
                      className={`${styles.positionBody} ${
                        isOpen ? styles.positionBodyOpen : ''
                      }`}
                    >
                      <div className={styles.positionBodyInner}>
                        <div className={styles.positionBodyContent}>
                          <div className={styles.positionSection}>
                            <div className={styles.positionSectionLabel}>
                              Responsibilities
                            </div>
                            <p className={styles.positionText}>{pos.responsibilities}</p>
                          </div>
                          <div className={styles.positionSection}>
                            <div className={styles.positionSectionLabel}>Key Powers</div>
                            <p className={styles.positionText}>{pos.powers}</p>
                          </div>
                          <div className={styles.positionSection}>
                            <div className={styles.positionSectionLabel}>
                              Reports To / Appoints
                            </div>
                            <p className={styles.positionText}>{pos.reportsTo}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>

      {/* ── Who's Responsible Section ── */}
      <section className={styles.srvSection} aria-labelledby="srv-heading">
        <div className={styles.srvSectionInner}>
          <h2 className={styles.srvSectionHeading} id="srv-heading">
            Who&#8217;s responsible for what?
          </h2>
          <p className={styles.srvSectionIntro}>
            Tap any service to see who handles it and how to get help.
          </p>
          <p className={styles.srvDisclaimer}>
            This covers the most common services residents interact with &mdash; it is not a comprehensive list of every government function.
          </p>

          {/* Filter buttons */}
          <div
            className={styles.srvFilters}
            role="group"
            aria-label="Filter by government level"
          >
            {FILTERS.map((f) => (
              <button
                key={f.id}
                className={`${styles.srvFilterBtn} ${
                  serviceFilter === f.id ? styles.srvFilterActive : ''
                }`}
                onClick={() => changeServiceFilter(f.id)}
                aria-pressed={serviceFilter === f.id}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Service cards */}
          <div className={styles.srvList}>
            {visibleServices.map((svc) => {
              const isOpen = activeServiceId === svc.id;
              return (
                <div key={svc.id} className={styles.srvCard}>
                  <button
                    className={styles.srvToggle}
                    onClick={() => toggleService(svc.id)}
                    aria-expanded={isOpen}
                  >
                    <span className={styles.srvIcon} aria-hidden="true">
                      {svc.icon}
                    </span>
                    <div className={styles.srvInfo}>
                      <div className={styles.srvName}>{svc.name}</div>
                      <div className={styles.srvTags}>
                        {svc.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`${styles.srvTag} ${TAG_CONFIG[tag].cls}`}
                          >
                            {TAG_CONFIG[tag].label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span
                      className={`${styles.srvArrow} ${isOpen ? styles.srvArrowOpen : ''}`}
                      aria-hidden="true"
                    >
                      &#9662;
                    </span>
                  </button>

                  <div
                    className={`${styles.srvBody} ${isOpen ? styles.srvBodyOpen : ''}`}
                  >
                    <div className={styles.srvBodyInner}>
                      <div className={styles.srvBodyContent}>
                        <div className={styles.srvDetail}>
                          <div className={styles.srvDetailLabel}>Responsible party</div>
                          <p className={styles.srvDetailText}>{svc.responsible}</p>
                        </div>
                        <div className={styles.srvDetail}>
                          <div className={styles.srvDetailLabel}>How it works</div>
                          <p className={styles.srvDetailText}>{svc.howItWorks}</p>
                        </div>
                        <div className={styles.srvDetail}>
                          <div className={styles.srvDetailLabel}>Who to contact</div>
                          <p className={styles.srvDetailText}>{svc.contact}</p>
                        </div>
                        {svc.note && (
                          <div className={styles.srvNote}>{svc.note}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>&#169; 2025 West Chester by the Numbers</span>
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
