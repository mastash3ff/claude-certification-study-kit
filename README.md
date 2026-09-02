# Claude Certification Study Kit

An independent, open-source catalog and practice application for the current Claude certification portfolio.

| Track | Role | Level | Official exam | Original practice |
| --- | --- | --- | ---: | ---: |
| `CCAO-F` | Associate | Foundations | 60 items | 30 questions |
| `CCDV-F` | Developer | Foundations | 53 items | 25 questions |
| `CCAR-F` | Architect | Foundations | 60 items | 30 questions |
| `CCAR-P` | Architect | Professional | 63 items | 38 questions |

The application includes 27 blueprint domain guides, full-track diagnostics, immediate-feedback domain drills, local progress persistence, and JSON export/import. It has no accounts, analytics, backend, or copied exam questions.

## Run locally

Use Node 24 or newer.

```bash
npm ci
npm run dev
```

Astro serves the project under its configured Pages base path at <http://localhost:4321/claude-certification-study-kit/>.

## Verify and build

```bash
npm run check
npm run build
npm run test:e2e
```

`npm run check` type-checks the application, validates every track, objective, question, rationale, and source reference, then runs the focused unit tests. `npm run build` produces the static site and Pagefind search index in `dist/`.

## Repository map

```text
src/
|-- components/              interactive quizzes and reusable UI
|-- content/certifications/  track, domain, and applied-practice notes
|-- data/questions/          original objective-mapped question banks
|-- data/tracks.json         certification catalog and source registry
|-- lib/                     scoring, persistence, and catalog logic
`-- pages/                   static public routes
scripts/                     content-contract validation
tests/                       unit and browser tests
.github/                     contribution forms and automation
```

## Editorial boundaries

- Official exam guides and certification pages define scope.
- Product documentation resolves technical behavior.
- Community material is labeled as calibration, not authority.
- Local percentages are study signals, not Anthropic scaled scores or pass predictions.
- All questions are original and map to one published objective.

The source catalog was reviewed on 2026-09-01. Certification details can change without notice; verify scheduling and policy details with Anthropic before purchasing an exam.

## Contributing and licenses

See [CONTRIBUTING.md](CONTRIBUTING.md) for the content contract and local checks. Application code is available under the [MIT License](LICENSE). Original written study content and question banks are available under [CC BY 4.0](LICENSE-CONTENT).

Claude and Anthropic are trademarks of Anthropic PBC. This project is not affiliated with or endorsed by Anthropic.
