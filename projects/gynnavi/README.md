# GynNavi — Women's Health Navigation (v0.3)

**Research-informed, synthetic-data-only prototype. Not medical advice or a clinical product.** GynNavi is a provisional brand, not a cleared trademark.

GynNavi combines **GYN** (gynaecological health) with **NAVI** (navigation). The initial research use case is fibroid care navigation in Nigeria, with potential expansion to other women's-health conditions after research and independent evaluation.

## Working prototype

- Private, in-browser symptom and care-story builder with a fictional sample.
- Text-based ultrasound-report extraction using **deterministic patterns**, **not AI**; shows direct source lines and lets users review which excerpts enter the brief.
- Downloadable appointment-preparation brief, plus a user-managed follow-up checklist.
- Research and regulatory limitations displayed within the interface.
- Nigeria Health Facility Registry **planned only**. No live provider lookup or API keys.

## Try it

Open `index.html` locally in a modern browser. All sample data is fictional. The app makes no network requests and uses no account, analytics, persistent storage or backend. User entries are lost when the page refreshes or closes. **Do not enter real health information.**

## Project structure

- `index.html` — responsive interface
- `app.css` — styles
- `app.js` — interactive, session-only prototype
- `research/RESEARCH_BRIEF.md` — evidence basis and limitations
- `research/BRAND_RISK.md` — naming and trademark status

## Clinical and privacy boundaries

This application does **not** diagnose fibroids, provide treatment recommendations, interpret scan images, identify emergencies, or replace a clinician. PDFs and scanned images are **not** processed yet. A future clinical product will require a clinical advisor, safety evaluation, data protection review, intended-use/NAFDAC assessment, and validated workflows. Published reports can guide product hypotheses but do not establish consumer demand or effectiveness.

## Research foundation

A 2025 single-clinic study at UCH Ibadan of 138 women reported that 62.3% presented six months or more after symptoms began. In a subgroup of 137 women, 35.8% started treatment more than three months after diagnosis. This is **not** a Nigerian population estimate, and it does not show that an app reduces delays.

Study: https://pmc.ncbi.nlm.nih.gov/articles/PMC12375158/

Care guidance: https://www.acog.org/womens-health/faqs/uterine-fibroids

Facility registry documentation: https://hfr.fmohconnect.gov.ng/developers

## Brand status and licensing

A preliminary exact-name indexed-web and GitHub repository search on 12 November 2026 found no obvious GynNavi match. Official Nigerian/other-country trademark checks, CAC review, domain and app-store checks are **still outstanding**. No software licence is granted by this repository at this time; keep publication and licensing under founder review.

**v0.3 — 12 November 2026.**