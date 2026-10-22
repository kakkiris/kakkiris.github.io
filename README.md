# kakkiris.github.io

Kerem Akkiris's portfolio: case studies across product, design, consulting and AI solutions. Live at [kakkiris.github.io](https://kakkiris.github.io/).

One set of content serves four readers. The lens switch (`/?lens=product|design|consulting|ai`) reorders the work and decides which case study section opens first, and case study links carry the lens through.

## Build

Requires Node 22.23.4 or later.

```bash
npm ci
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Checks

Every build runs these, and fails on any problem:

- `check:dashes`: no em dashes in source, copy, alt text or metadata.
- `check:copy`: no real client, person or place names (checked against salted hashes in `scripts/forbidden-terms.json`; the plain list lives outside the repository), no banned AI-sounding words, no US spellings and no questions in the copy. With `PORTFOLIO_LAUNCH=1`, as in the deploy, it also fails on any draft wording.
- `check:links`: every internal link, anchor and lens URL resolves.

## Structure

| Path | What is there |
| --- | --- |
| `src/pages/` | Home, About, the 404 page, the sitemap, and one route for every case study |
| `src/content/cases/` | The case study bodies |
| `src/data/` | Case summaries, the lens map, the section template and the diagram data |
| `src/components/` | Header, hero, work index, and the case study parts (sections, annotated screenshots, diagrams) |
| `src/scripts/` | Small modules for the hero sequence, lens switch, sections, theme and scroll reveals |
| `public/` | Self-hosted font subsets, share cards, the CV and the favicon |
| `scripts/` | The checks, plus local tools to subset fonts and render share cards |

Built with Astro, with no client-side framework. Set in Newsreader and Inter.

## Deploy

GitHub Actions builds the site and publishes it to GitHub Pages on every push to `main` (`.github/workflows/deploy.yml`).
