import { getCommunityProfile } from '../../../lib/sheets';
import CommunityClient from './CommunityClient';
import DataNote from '../../components/DataNote';
import styles from './community.module.css';

export const revalidate = 3600;

export const metadata = {
  title: 'Community Profile — West Chester by the Numbers',
  description:
    'Census Bureau estimates for each municipality, shown next to the school district, the county and Pennsylvania.',
};

export default async function CommunityPage() {
  const data = await getCommunityProfile();
  return (
    <CommunityClient
      {...data}
      dataNote={
        <DataNote>
          Source: U.S. Census Bureau, American Community Survey 2020–2024 5-year estimates, Data Profiles DP02 (social), DP03 (economic), DP04 (housing) and DP05 (demographic), from data.census.gov. These are survey estimates averaged over five years, not counts. Each estimate has a margin of error at 90% confidence, shown as ±; the true value is likely within that range. Margins of error are larger for smaller places, so differences between places or from the county may not be meaningful when the ranges overlap. Dollar figures are in 2024 dollars. Municipal figures are for the whole municipality; the school district figures cover the West Chester Area School District&apos;s full area. Poverty status is not determined for people living in college dormitories, military barracks or institutions. We do not adjust or recalculate any figures; all values are as published by the Census Bureau. Charts show the same published estimates as the tables; the thin line on each bar shows its margin of error.
          <br />
          <a
            className={styles.noteLink}
            href="https://data.census.gov/table/ACSDP5Y2024.DP05"
            target="_blank"
            rel="noopener noreferrer"
          >
            View these tables on data.census.gov
          </a>
        </DataNote>
      }
    />
  );
}
