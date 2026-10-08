# yerevent

Static site (GitHub Pages, `yerevent.club`) listing events in Armenia. Everything
lives in `index.html`; event data comes from `events.json` (synced from a Google
Sheet by `scripts/sync-events.js`). Don't hand-edit `events.json`.

## Festival bundles ("guides")

A bundle groups several events (a city festival, a fashion week, a weekend of
stages) into one festival-style page. They are data-driven: **adding a bundle
means adding an entry to `guides.json` and a redirect folder. Don't add
per-bundle code or CSS.** Every bundle gets the same look and behaviour below.

### Adding a bundle

1. Append an object to `guides.json`. Fields:
   - `slug`, `title`, `subtitle`, `dates` (every `YYYY-MM-DD` it runs),
     `blurb` (one or two plain sentences), `price` (e.g. `"Free"`), `source`
     (organiser's Instagram).
   - Optional: `stats` (pills under the hero; default is places / acts /
     price), `labelBy: "name"` + `namePrefix` (timeline labels use the event
     name with the prefix stripped instead of the stage genre).
   - `stages[]`: `n` (pin number, 1..), `place`, `short`, `lat`, `lng`,
     `genre`, `type`, `match` (lowercase venue keywords so duplicate sheet
     events at that venue are absorbed), optional `far: true` for an
     out-of-town venue (kept off the map's auto-zoom).
   - `stages[].events[]`: `name`, `date` (+ `endDate` if multi-day), `time`
     (display text like `"1 PM – 10 PM"`), `start`/`end` (decimal hours, e.g.
     `18.5`; leave out for untimed events), `lineup[]`, `link`, optional
     `price`, `star` / `starAt` / `starLabel` (headliner marker on the
     timeline), `also[]` (extra Instagram links for the same event, so their
     sheet copies are absorbed).
   - Give every event a `start` hour when the time is known. The day view
     sorts by it.
2. Add `<slug>/index.html`, a redirect page copied from `cityday/index.html`,
   with the title, `og:` tags and `?g=<slug>` updated.

### How bundles display (keep these choices)

**Colours and type:** the sunset gradient `--sunset` (apricot `#FFB15C` → pome
`#F04A5A` → plum `#7A1E5C`) with dark text `#1C0B12`; bundle titles in
italic *Cormorant Garamond* prefixed with `✦`; UI text in *Outfit*; section
headings in *Playfair Display* gold (`--gold`).

**Home page:** a sunset banner per bundle from 21 days before its first date
until it ends ("Coming up" / "Happening now"), with "Open the guide →".

**Calendar grid:** a bundle's events collapse into one sunset chip
(`✦ Title`) placed first in the day cell, so it doesn't bury other events.

**Day popup (tap a date):**
- Bundles come first, one block each, in `guides.json` order. Each bundle
  shows exactly once, even when two bundles share a day.
- Each block is framed (pome border, faint pome tint) and contains:
  1. the big orange `day-guide-head` box: `✦ Title`, then
     "N events · tap to open the map, timeline & lineups". Tapping it opens
     the bundle page on that day.
  2. a pill toggle, "▾ Hide these N events" / "▸ Show the N events", that
     folds the list. The choice is remembered per bundle while the page is
     open.
  3. the bundle's events, indented behind a pome left rule, **sorted by start
     time** (untimed last, then stage number).
- If the day has other events, a dashed gold bar at the very top reads
  "+ N more events outside the bundle(s) ↓" and scrolls to them.
- Other events follow under a gold "More events this day" heading with a
  rule and a count pill, also sorted by start time.

**Bundle page (`?g=slug`):** sunset hero with mountain silhouette, stat
pills, a "Free only" filter when free and paid events are mixed (green = free,
apricot outline = ticket, dashed = invite only), a "What's on at the same time"
timeline with day tabs, one map with numbered pins per stage, then stage
cards with lineups.

**Copy tone:** short, plain, friendly. No marketing filler.

### Checking a change

Serve the folder (`python3 -m http.server`) and open a bundle day in a
phone-width browser (430px). In a cloud session use Playwright with
`executablePath: '/opt/pw-browsers/chromium'`; the Leaflet map won't load
there, which is expected.
