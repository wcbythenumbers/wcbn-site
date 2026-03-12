'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Nav.module.css';

const NAV_ITEMS = [
  {
    label: 'Taxes & Budget',
    items: [
      { label: 'Property Tax Explainer', href: '#' },
      { label: 'Tax Rate Comparisons', href: '#' },
      { label: 'Where Your Tax Dollars Go', href: '#' },
      { label: 'WCASD Budget', href: '#' },
      { label: 'Borough Budget', href: '#' },
      { label: 'Township Budgets', href: '#' },
    ],
  },
  {
    label: 'Schools',
    items: [
      { label: 'Board Meeting Recaps', href: '#' },
      { label: 'Enrollment & Staffing', href: '#' },
      { label: 'Performance Data', href: '#' },
      { label: 'Board Member Directory', href: '#' },
    ],
  },
  {
    label: 'Government',
    items: [
      { label: 'Borough of West Chester', href: '#' },
      { label: 'WCASD', href: '#' },
      { label: 'East Goshen Township', href: '#' },
      { label: 'West Goshen Township', href: '#' },
      { label: 'East Bradford Township', href: '#' },
      { label: 'West Whiteland Township', href: '#' },
      { label: 'Westtown Township', href: '#' },
      { label: 'Thornbury Township', href: '#' },
      { divider: true },
      { label: 'Board & Council Meeting Recaps', href: '#' },
    ],
  },
  {
    label: 'Elections',
    items: [
      { label: 'Results & Turnout', href: '#' },
      { label: 'Candidate Filings', href: '#' },
      { label: 'Voting Records', href: '#' },
    ],
  },
  {
    label: 'Calendar',
    href: '/calendar',
  },
  {
    label: 'About',
    href: '/about',
  },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const closeMobileMenu = () => {
    setMenuOpen(false);
    setOpenDropdown(null);
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.logo}>
          WCBN
        </Link>

        {/* Desktop menu */}
        <ul className={styles.menu}>
          {NAV_ITEMS.map((item) => (
            <li key={item.label} className={styles.navItem}>
              {item.href ? (
                <Link href={item.href} className={styles.navLink}>
                  {item.label}
                </Link>
              ) : (
                <>
                  <span className={styles.navLink}>
                    {item.label}
                    <span className={styles.arrow}>▾</span>
                  </span>
                  <div className={styles.dropdown}>
                    {item.items.map((sub, i) =>
                      sub.divider ? (
                        <div key={`divider-${i}`} className={styles.dropdownDivider} />
                      ) : (
                        <a key={sub.label} href={sub.href} className={styles.dropdownLink}>
                          {sub.label}
                        </a>
                      )
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        <Link href="/subscribe" className={styles.navCta}>Subscribe</Link>

        {/* Hamburger button */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className={styles.mobileItem}>
              {item.href ? (
                <Link href={item.href} className={styles.mobileLink} onClick={closeMobileMenu}>
                  {item.label}
                </Link>
              ) : (
                <>
                  <button
                    className={styles.mobileToggle}
                    onClick={() => toggleDropdown(item.label)}
                  >
                    {item.label}
                    <span className={`${styles.arrow} ${openDropdown === item.label ? styles.arrowOpen : ''}`}>
                      ▾
                    </span>
                  </button>
                  {openDropdown === item.label && (
                    <div className={styles.mobileDropdown}>
                      {item.items.map((sub, i) =>
                        sub.divider ? (
                          <div key={`divider-${i}`} className={styles.mobileDivider} />
                        ) : (
                          <a key={sub.label} href={sub.href} className={styles.mobileSubLink}>
                            {sub.label}
                          </a>
                        )
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
