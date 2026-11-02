# McHenry Lakehouse

Marketing website for a 4-bedroom private-lake cabin with a heated pool in McHenry, Illinois.
Live at **https://mchenry.geekysquirrels.com**. Bookings: [VRBO listing 2934337](https://www.vrbo.com/2934337).

## What's on the site
The home page is kept short: hero, photo preview, live availability calendar and the request form.
Everything else lives on its own page, reachable from the menu (full menu on desktop, three-line menu on phones and tablets):
- `/photos`: all photos grouped by area, with lightbox
- `/house`: house overview, sleeping arrangements and amenities
- `/reviews`: guest reviews with rating breakdown
- `/area`: nearby lakes, parks and attractions, map and directions from O'Hare, Chicago, Milwaukee and Metra
- `/rules`: house rules, safety information and FAQ

The shared header and footer are in `public/_nav.html` and `public/_footer.html`; the server inserts them into every page.
The inquiry form has a honeypot and rate limiting. SEO: meta/Open Graph tags and schema.org `VacationRental` data.

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
