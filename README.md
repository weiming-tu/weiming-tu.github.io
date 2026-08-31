# The Tu Lab website

A plain static website (no build step, no server-side code). Open
`index.html` in a browser to preview it. This site is not published yet:
it is being reviewed with Dr Tu before it goes live, so treat it as a
local, working draft for now. When it is ready, it can be published to
GitHub Pages or any static host (see "Publishing later", below).

This README is written for editing the content, not the code. You do not
need to know how to program to make the changes below: find the text in
`index.html` using your editor's Find function (Cmd+F), change it, save,
and refresh the browser.

## Where things live

```
tu-lab-web/
  index.html          <- all page content and layout
  .nojekyll            <- tells GitHub Pages not to run Jekyll on this repo
  assets/
    style.css          <- all colours, fonts, spacing
    journey-map.js      <- the animated career map (custom component)
    weiming-photo.jpg    <- Dr Tu's photo
```

There is no database and no content management system: every fact on the
page is plain text inside `index.html`.

## Adding a team member

The team roster currently has one placeholder person per not-yet-named
role (four Postdoctoral Fellows, two PhD Students, one Research Associate,
one Visiting PhD Student), grouped into `.team-card` blocks by role, plus
the Principal Investigator card with Dr Tu's real entry. Each placeholder
is deliberately not a plausible fake person: it shows the role as the
heading (e.g. "Postdoctoral Fellow 2") and "Name to be added" underneath,
with a plain tinted circle instead of a photo.

To fill one in, open `index.html` and search for `TEAM ROSTER` (Cmd+F).
That comment sits inside the `<section id="team">` block, directly above
the roster, and shows exactly what HTML to use for one person once their
name is known, and what each field means:

- `name` -- the person's full name, as they want it shown
- `role` -- a short line under the name (job title, or a research topic)
- `photo` -- optional; if you have a photo, put it in a new
  `assets/team/` folder and point to it; if not, use the placeholder
  circle shown in the template

Find the placeholder `.team-person` block for that role and replace it
in place with the filled-in version (name on top, role underneath -- the
opposite order from the placeholder, which puts the role on top on
purpose so it never reads as a real person). Do this one placeholder at a
time as names are confirmed; don't add, remove or renumber the people
around it. If a whole new role group is ever needed, copy an entire
`.team-card` block and give it a new `<h3>` heading. Nothing else needs to
change: the grid re-flows itself as cards are added. Once every position
is filled, the "Openings" card and the "Joining" line below the grid can
be updated to say so.

## Adding or editing a publication

Search for `<section id="publications"`. Each paper is one `<div
class="pub-row">` block, grouped under a year heading (`<div
class="pub-year-heading">`). To add a paper:

1. Find the right year group (or add a new `<div class="pub-year-group">`
   for a new year, placed newest-first).
2. Copy an existing `.pub-row` block within it.
3. Update the title (keep the quotation marks and the link), the DOI in
   both the `href="https://doi.org/..."` and the small `doi.org/...` text
   line, the author list, and the venue.
4. Wrap Dr Tu's name in `<span class="tu">Tu Weiming</span>` wherever it
   appears in the author list -- this is what makes his name bold. Do not
   shorten or hide the author list, however long it is. There is no
   separate "first author" badge: the full author list already shows
   where he sits, so it would only restate what is visible. The one
   exception is joint first authorship, which isn't visible from order
   alone -- see the 2022 ACS Synthetic Biology entry's inline "(equal
   contribution)" note inside the author line for the pattern to copy
   if a future paper needs it.

The four short "Research" cards near the top of the page (`<section
id="research">`) also link out to a handful of representative papers each;
if you add a major new paper in one of those four areas you may want to
add its link there too, but it is optional -- the full list under
"Publications" is the complete record.

## Changing the career map

The map in the hero banner is driven by `assets/journey-map.js`. Near the
top of that file is a list called `DEFAULT_STOPS`, five entries like this:

```js
{ id: "oxford", city: "Oxford", lon: -1.26, lat: 51.75, years: "DPhil, 2020–2024", dx: -18, dy: -34, anchor: "end" },
```

- `city` and `years` are the text shown on the map.
- `lon` / `lat` are the map coordinates of that city (look them up if you
  add a new city).
- `dx` / `dy` nudge the label away from the dot so it doesn't sit on top
  of the pin or the line; `anchor: "end"` right-aligns the label (put it
  to the left of the dot), `anchor: "start"` left-aligns it (put it to the
  right). If a new label overlaps the line or another label, nudge `dx`/
  `dy` a little and reload the page to check.
- Add `current: true` to the one entry that is the present-day stop (it
  gets a small pulsing ring).

We edit `DEFAULT_STOPS` directly (rather than passing the stops through an
HTML attribute on the `<journey-map>` tag in `index.html`) because it
keeps all five stops in one plain, well-commented file, and matches how
the component already behaves when no attribute is supplied -- there is
only one place to look.

## Colours, fonts and spacing

All of this lives in `assets/style.css`, with named custom properties
(`--bg`, `--accent`, etc.) at the very top of the file if you want to
retint the whole site consistently.

## Checking your changes

Because this is a plain static site, you can preview it without installing
anything: open a terminal in this folder and run

```
python3 -m http.server 8000
```

then visit `http://localhost:8000` in a browser. (Opening `index.html`
directly by double-clicking also mostly works, except some browsers block
the map's map-data fetch from a `file://` page -- the local server avoids
that.)

## Publishing later

This is not done yet, and should wait until the content has been reviewed
and approved. When that review is complete, publishing is: push this
folder to a GitHub repository and turn on GitHub Pages for it (Settings ->
Pages -> deploy from the branch's root). The `.nojekyll` file is already
there so GitHub serves the site exactly as written, with no extra setup
needed at that point.
