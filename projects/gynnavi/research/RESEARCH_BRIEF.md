# GynNavi research notes

## Problem
Women can experience delays seeking fibroid-related care and accessing subsequent treatment. An evidence-linked app might support report organisation, appointment preparation and follow-up, but cannot remove cost, provider availability or societal barriers.

## Initial evidence
- **Single clinic, Ibadan (2025):** 138 women with symptomatic uterine fibroids; 62.3% presented 6+ months after symptom onset. For 137 women with treatment-timing data, 35.8% started treatment 3+ months after diagnosis. Not nationally representative.
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC12375158/
- **ACOG:** Patient education on uterine fibroids.
  - https://www.acog.org/womens-health/faqs/uterine-fibroids

## Competitor gap to evaluate
Symptom trackers and health-record tools already exist. Differentiation requires evidence of better **navigation between encounters**, transparent report citations, verifiable facility directories and follow-up completion. The claim that users will pay for this is untested.

## Research-only validation (initial)
Use published studies and *synthetic* patient journeys to evaluate document accuracy, traceability, workflow completeness, usability defects, privacy and XSS; never frame these tests as proof of clinical benefit or market demand.

## Roadmap
1. Name and IP clearance (CAC/NIPO/WIPO/domains); assign clinical advisor.
2. Broaden synthetic test fixtures and structured document field extraction.
3. Determine regulatory intended use, privacy architecture and safety test plan.
4. Verified facility search via authorised API (currently **not connected**).
5. Later: hosted AI with strict grounding, clinician review and evaluation before handling real medical data.

## Evidence vs. product hypothesis
The published delays are evidence of a health-system problem, not evidence of demand or effectiveness for GynNavi. Claims about improvements require evaluation.