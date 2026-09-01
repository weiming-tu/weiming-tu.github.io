# The Tu Lab website

A plain static website (no build step, no server-side code). Open
`index.html` in a browser to preview it locally.

**The site lives at https://weiming-tu.github.io** once GitHub Pages is
switched on. The code is already on GitHub, but Pages itself has to be
enabled once, by the repository owner, and only the owner can do it:

> GitHub, this repository, **Settings** > **Pages** > under "Build and
> deployment", set **Source** to *Deploy from a branch*, then **Branch**
> to `main` and folder `/ (root)`, and Save. The first build takes a few
> minutes. After that, every push republishes the site automatically.

Until that switch is flipped, https://weiming-tu.github.io returns a 404
even though the files are present in the repository.

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
role (four Postdoctoral Fellows, two PhD Students, three Master's
Students, one Research Associate, one Visiting PhD Student), grouped into
`.team-card` blocks by role, plus the Principal Investigator card with Dr
Tu's real entry. Each placeholder is deliberately not a plausible fake
person: it shows the role as the heading (e.g. "Postdoctoral Fellow 2")
and "Name to be added" underneath, with a plain tinted circle instead of
a photo.

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
around it. The grid re-flows itself as photos are added, so nothing else
needs to change for that.

The roster grid (`.team-grid` in `assets/style.css`) is fixed at two
columns on purpose, not auto-fit: with six role panels of very different
lengths (one person up to four), a wider auto-fit grid left ragged
whitespace under the shorter panels in a row, and left the section
trailing off with a gap on one side. Two columns pairs the panels in
document order so the last row (Research Associate, Visiting PhD
Student) is even and the section ends flush. If a whole new role group
is added later, or the number of people in one changes a lot, re-check
the rendered page at a few widths to confirm the columns still balance
reasonably -- rebalancing may mean adjusting `grid-template-columns`, not
just adding a card.

The "Joining" line below the grid is the only place the site mentions
whether positions are open; there is deliberately no separate panel or
note in the grid duplicating it, so update that one line if that ever
changes.

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

## Publishing changes

The repository is `weiming-tu/weiming-tu.github.io` and the site is served
from the `main` branch's root. The `.nojekyll` file tells GitHub to serve
the files exactly as written, with no build step.

To publish an edit:

```
git add -A
git commit -m "a short note on what changed"
git push
```

The live site updates within a minute or two. If nothing appears, check
that Pages is switched on (see the top of this file): the switch is a
one-time step and only the repository owner can flip it.
