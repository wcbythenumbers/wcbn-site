/* ── NAV ── */
.nav {
  background: var(--navy);
  border-bottom: 2px solid var(--gold);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navInner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navLogo {
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 500;
  color: var(--gold);
  letter-spacing: 0.15em;
}

.navLinks {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.navLinks a {
  color: var(--off-white);
  text-decoration: none;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: color 0.2s;
}

.navLinks a:hover {
  color: var(--gold);
}

.navCta {
  background: var(--gold) !important;
  color: var(--navy) !important;
  padding: 0.4rem 1rem;
  border-radius: 2px;
  font-weight: 500 !important;
}

.navCta:hover {
  background: var(--gold-light) !important;
}

/* ── HERO ── */
.hero {
  background: var(--navy);
  padding: 5rem 2rem 3rem;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 60px,
    rgba(201, 168, 76, 0.04) 60px,
    rgba(201, 168, 76, 0.04) 61px
  );
  pointer-events: none;
}

.heroGrid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.eyebrow::before {
  content: '';
  display: inline-block;
  width: 24px;
  height: 1px;
  background: var(--gold);
}

.headline {
  font-family: var(--font-display);
  font-size: clamp(2.8rem, 5vw, 4.5rem);
  font-weight: 900;
  line-height: 1.05;
  color: var(--white);
  margin-bottom: 1rem;
}

.headlineAccent {
  color: var(--gold);
}

.tagline {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--gold-light);
  letter-spacing: 0.05em;
  margin-bottom: 1.2rem;
}

.subtext {
  font-size: 1.05rem;
  line-height: 1.7;
  color: rgba(248, 246, 240, 0.75);
  font-weight: 300;
  max-width: 440px;
  margin-bottom: 2rem;
}

.heroBtn {
  display: inline-block;
  background: transparent;
  border: 1.5px solid var(--gold);
  color: var(--gold);
  padding: 0.75rem 1.75rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  transition: all 0.2s;
}

.heroBtn:hover {
  background: var(--gold);
  color: var(--navy);
}

.heroRight {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: rgba(201, 168, 76, 0.2);
  border: 1px solid rgba(201, 168, 76, 0.2);
}

.statCard {
  background: var(--navy-mid);
  padding: 1.75rem 1.5rem;
  transition: background 0.2s;
}

.statCard:hover {
  background: var(--navy-light);
}

.statLabel {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 0.6rem;
  line-height: 1.4;
}

.statNumber {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--white);
  line-height: 1;
}

.heroRule {
  max-width: 1200px;
  margin: 3rem auto 0;
  height: 1px;
  background: linear-gradient(90deg, var(--gold), transparent);
}

/* ── MISSION ── */
.mission {
  background: var(--off-white);
  padding: 4rem 2rem;
  border-bottom: 1px solid rgba(10, 25, 49, 0.1);
}

.missionInner {
  max-width: 800px;
  margin: 0 auto;
}

.missionLabel {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 1rem;
}

.missionQuote {
  font-family: var(--font-body);
  font-size: clamp(1.1rem, 2vw, 1.35rem);
  font-style: italic;
  font-weight: 300;
  line-height: 1.7;
  color: var(--navy);
  border-left: 3px solid var(--gold);
  padding-left: 1.5rem;
  quotes: none;
}

/* ── PILLARS ── */
.pillars {
  background: var(--white);
  padding: 5rem 2rem;
}

.pillarsInner {
  max-width: 1200px;
  margin: 0 auto;
}

.sectionTitle {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 3rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--navy);
}

.pillarGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  background: var(--navy);
}

.pillar {
  background: var(--white);
  padding: 2.5rem 2rem;
  transition: background 0.2s;
}

.pillar:hover {
  background: var(--off-white);
}

.pillarNumber {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  color: var(--gold);
  margin-bottom: 1rem;
}

.pillarH3 {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 0.75rem;
}

.pillarP {
  font-size: 0.95rem;
  line-height: 1.7;
  color: #444;
  font-weight: 300;
}

/* ── NEWSLETTER ── */
.newsletter {
  background: var(--navy);
  padding: 5rem 2rem;
}

.newsletterInner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.newsletterH2 {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--white);
  margin-bottom: 1rem;
}

.newsletterP {
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(248, 246, 240, 0.7);
  font-weight: 300;
}

.beehiivPlaceholder {
  border: 1.5px dashed rgba(201, 168, 76, 0.4);
  padding: 2.5rem;
  text-align: center;
  color: rgba(248, 246, 240, 0.5);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  line-height: 2;
}

/* ── FOOTER ── */
.footer {
  background: #060f1e;
  padding: 3rem 2rem;
  border-top: 2px solid var(--gold);
}

.footerInner {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.footerLogo {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--white);
  margin-bottom: 0.5rem;
}

.footerTagline {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: var(--gold);
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}

.footerLinks {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.footerLinks a {
  color: rgba(248, 246, 240, 0.5);
  text-decoration: none;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: color 0.2s;
}

.footerLinks a:hover {
  color: var(--gold);
}

.footerDisclaimer {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: rgba(248, 246, 240, 0.25);
  letter-spacing: 0.05em;
}

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .heroGrid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  .heroRight {
    grid-template-columns: 1fr 1fr;
  }

  .pillarGrid {
    grid-template-columns: 1fr;
  }

  .newsletterInner {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .navLinks a:not(.navCta) {
    display: none;
  }
}
