# McHenry Lakehouse · Roadmap

What's live, what's next, and what each step needs from Yuri.
Effort is engineering time once the inputs are in hand. Impact is on direct bookings and guest experience.

## In progress
| Item | Status |
|---|---|
| Premium visual redesign (Figma design system + new pages) | In progress in this thread |
| Unsplash area and lifestyle imagery | Waiting on Unsplash email confirmation |

## Open items (blocking or degrading what's already built)
| Item | Why it matters | Needed from Yuri |
|---|---|---|
| VRBO iCal export link → `ICAL_URLS` in Coolify | Calendar shows sample dates until this is set | VRBO → Calendar → Import/Export → copy the export link |
| Where inquiry notifications go → `INQUIRY_WEBHOOK_URL` | Requests are saved to `data/inquiries.jsonl` but nobody is pinged | A Slack/Discord webhook, or an email address (we'd add an email relay) |
| Persistent volume for `/app/data` in Coolify | Inquiries are lost on redeploy without it | Add a volume in Coolify (2 minutes) |

## Feature options, ranked
| # | Feature | Impact | Effort | Needed from Yuri |
|---|---|---|---|---|
| 1 | **Seasonal pricing on the site**: low/high season rates, weekend minimums, cleaning and pet fees, "from $X/night" next to the calendar | High: guests want a ballpark before asking | ~1 hour | Your rates and fees |
| 2 | **Direct booking with deposit** via Stripe Checkout, so returning guests skip VRBO's ~15% guest fee | High: more margin per stay | ~2-4 hours | A Stripe account; deposit and cancellation policy |
| 3 | **Google Business Profile + SEO**: sitemap.xml, local "vacation rental McHenry IL" copy, Maps listing pointing here | High: makes the site findable outside VRBO | ~1 hour (sitemap + copy); profile claim is on Google | Claim the profile on Google (postcard/phone verification) |
| 4 | **Private guest welcome guide** at `/guide` (unlisted link): Wi-Fi, door code, pool/hot tub, trash day, boat rentals, restaurants | Medium: fewer repeat questions, better reviews | ~2 hours | Wi-Fi, codes, house instructions, favorite local spots |
| 5 | **Airbnb link + second iCal feed** merged into the calendar | Medium if listed on Airbnb | ~15 min (already supported: comma-separate `ICAL_URLS`) | Airbnb listing URL and its iCal export link |
| 6 | **Analytics** (Plausible or Umami self-hosted on Coolify) | Medium: see traffic sources and which photos convert | ~1 hour | OK to add one more Coolify service |
| 7 | **Hero video / drone clip** | High visual impact | ~1 hour | A 15-30 s clip (summer pool/lake ideally) |

**Recommended next three:** rates on the site (1), Google Business Profile + SEO (3), guest guide (4). Then Stripe direct booking (2).
