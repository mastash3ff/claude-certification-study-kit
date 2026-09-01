# Claude Certified Architect Study Kit

An unofficial, diagnostic-first study kit for Anthropic's two architect certifications:

| Track | Domains | Official exam | Local diagnostic |
|---|---:|---:|---:|
| Claude Certified Architect – Foundations (`CCAR-F`) | 5 | 60 items / 120 minutes | 30 items |
| Claude Certified Architect – Professional (`CCAR-P`) | 7 | 63 items / 120 minutes | 38 items |

The local questions are original. Each one maps to a published objective in the official Exam Guide, version 1.0, effective July 2026. The kit contains no live, reconstructed, or copied exam questions.

## Start here

```bash
python3 -m http.server 8000 -d app
```

Open <http://localhost:8000>, choose a track, and take the full diagnostic before reading the detailed notes. Progress stays in the browser and can be exported as JSON.

Then follow this sequence:

1. Review the domains ranked by weighted study priority.
2. Read the matching [track guide](docs/study-strategy.md) and primary documentation.
3. Complete the relevant [Foundations labs](docs/ccar-f/labs.md) or [Professional capstone](docs/ccar-p/capstone.md).
4. Retake missed objectives as domain drills.
5. Use a full external mock for unseen calibration.

The app reports raw percentages. Anthropic uses scaled scores, and no public raw-to-scaled conversion exists. A local score is therefore never labeled as an Anthropic score or a pass prediction.

## What to trust

Use the [official Exam Guides and Academy courses](docs/resources.md) as the source of scope. Use product documentation to resolve technical details. Community guides and candidate reports are useful for explanation and difficulty calibration, but they are not authoritative.

The certification is currently limited to people at Claude Partner Network organizations. The former official practice exam was retired during the move to Pearson VUE; the current Exam Guides contain sample questions instead. Confirm current eligibility, pricing, policies, and blueprints in the [Anthropic certification FAQ](https://anthropic-partners.skilljar.com/page/faq-certifications) before scheduling.

## Repository map

- `app/` — static study application and question data
- `docs/` — study strategy, curated sources, track notes, labs, and capstone
- `scripts/check.py` — content-contract and test runner
- `tests/` — focused content and scoring tests

## Check the repository

```bash
python3 scripts/check.py
```

Source catalog last reviewed: **2026-09-01**. Anthropic marks its Exam Guides as subject to change without notice.
