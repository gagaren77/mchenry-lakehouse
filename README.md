# McHenry Lakehouse

Marketing website for a 4-bedroom private-lake cabin with a heated pool in McHenry, Illinois.
Live at **https://mchenry.geekysquirrels.com**. Bookings: [VRBO listing 2934337](https://www.vrbo.com/2934337).

## What's on the site
- Hero, house overview and sleeping arrangements
- Photo gallery with lightbox
- Amenities, house rules and important information
- **Availability calendar** (booked vs. available nights, pick check-in/check-out, carries dates into the request form)
- Guest reviews with rating breakdown
- About the area (nearby lakes, parks and attractions with drive times)
- How to get there: Google Maps embed plus one-click directions from O'Hare, Chicago, Milwaukee and the Metra station
- FAQ and an inquiry form (with honeypot + rate limiting)
- SEO: meta/Open Graph tags and schema.org `VacationRental` data

## Content and design
- **All content lives in [`site.config.json`](site.config.json)**: name, hero, facts, sleeping, amenities, highlights, seasons, rating, reviews, area guide, routes, rules, FAQ and the photo list. Edit it and reload; the server re-reads it when it changes.
- Pages are rendered on the server by [`views.js`](views.js) (home, `/photos`, `/area`, `/info`, plus `/sitemap.xml`). To run the same site for another rental, change the config, replace `public/photos`, and set `ICAL_URLS`.
- Design tokens (colors, type, radii) are at the top of [`public/styles.css`](public/styles.css) and mirror the Figma design system file.
- Optional Unsplash area imagery: add entries under `unsplash.images` in the config (keys match `area.places[].img`, plus `banner`). Images are hotlinked and credited per Unsplash guidelines.
- Roadmap and open items: [`ROADMAP.md`](ROADMAP.md).

## Run locally
```bash
node server.js          # http://localhost:3000  (Node 18+, no dependencies)
```
or with Docker:
```bash
docker build -t mchenry-lakehouse . && docker run -p 3000:3000 mchenry-lakehouse
```

## Configuration (environment variables)
| Variable | Purpose |
|---|---|
| `ICAL_URLS` | One or more iCal export links (comma or space separated), e.g. the VRBO export link (VRBO → Calendar → Import/Export → Export) and the Airbnb one. Booked nights are read from these and cached. |
| `ICAL_CACHE_MINUTES` | How long to cache the calendar (default 30). |
| `INQUIRY_WEBHOOK_URL` | Optional. Each inquiry is POSTed here as JSON (`text`/`content` fields work with Slack, Discord, Make, Zapier, n8n). |
| `DATA_DIR` | Where `inquiries.jsonl` is written (default `./data`). Mount a volume here in Coolify to keep inquiries across deploys. |
| `PORT` | Default 3000. |

Without `ICAL_URLS`, the calendar uses `data/bookings.json` (dates are `YYYY-MM-DD`; `end` is the checkout day).

## Deploy (Coolify)
New resource → Public repository → this repo, build pack **Dockerfile**, port **3000**, domain `https://mchenry.geekysquirrels.com`, health check `/healthz`.
