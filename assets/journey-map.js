(() => {
  // Weiming Tu's career stops, verified against his CV (see content-spec.md).
  // dx/dy/anchor place the text label relative to the dot; tuned so the five
  // labels do not collide or run off the edge of the map at 1400/1000/600px.
  // To edit a stop, change the values below (lon/lat set the pin, dx/dy/anchor
  // nudge the label) -- no other file needs to change.
  const DEFAULT_STOPS = [
    { id: "shanghai", city: "Shanghai", lon: 121.47, lat: 31.23, years: "Tongji, 2013–2017", dx: 14, dy: 28, anchor: "start" },
    { id: "beijing", city: "Beijing", lon: 116.41, lat: 39.90, years: "Tsinghua, 2017–2020", dx: 14, dy: -16, anchor: "start" },
    { id: "oxford", city: "Oxford", lon: -1.26, lat: 51.75, years: "DPhil, 2020–2024", dx: -18, dy: -34, anchor: "end" },
    { id: "boston", city: "Boston", lon: -71.06, lat: 42.36, years: "MIT, 2024–2026", dx: -14, dy: 24, anchor: "end" },
    { id: "singapore", city: "Singapore", lon: 103.82, lat: 1.35, years: "NTU, now", dx: 14, dy: 22, anchor: "start", current: true }
  ];

  const THEMES = {
    dark:  { land:"#161e27", edge:"#0c1218", grat:"#1b2530", arc:"#5fd0e0", glow:"rgba(95,208,224,0.65)",
             dot:"#5fd0e0", leader:"#3d5563", label:"#e7ecf1", year:"#7f8f9e" },
    light: { land:"#d7dfcd", edge:"#c2cdb4", grat:"#e3e8dc", arc:"#3d7a4e", glow:"rgba(61,122,78,0.30)",
             dot:"#2f6b43", leader:"#a9b79c", label:"#1b2418", year:"#6f7a68" }
  };

  const ATLAS = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";

  const waitForLibs = () => new Promise((resolve, reject) => {
    const t0 = Date.now();
    const tick = () => {
      if (window.d3 && window.topojson) return resolve();
      if (Date.now() - t0 > 20000) return reject(new Error("d3/topojson did not load"));
      setTimeout(tick, 60);
    };
    tick();
  });

  class JourneyMap extends HTMLElement {
    connectedCallback() {
      if (this._init) return;
      this._init = true;
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = `<style>
        :host { display:block; width:100%; height:100%; }
        .wrap { position:relative; width:100%; height:100%; }
        svg { display:block; width:100%; height:100%; overflow:visible; }
        .land { fill:var(--jm-land,#161e27); stroke:var(--jm-edge,#0c1218); stroke-width:0.6; }
        .grat { fill:none; stroke:var(--jm-grat,#1b2530); stroke-width:0.5; }
        .arc { fill:none; stroke:var(--jm-arc,#5fd0e0); stroke-width:1.6; stroke-linecap:round;
               filter:drop-shadow(0 0 6px var(--jm-glow,rgba(95,208,224,0.65))); opacity:0.95;
               transition:stroke-dashoffset 1250ms cubic-bezier(.4,0,.2,1); }
        .leader { stroke:var(--jm-leader,#3d5563); stroke-width:0.8; opacity:0; transition:opacity 600ms ease; }
        .leader.on { opacity:1; }
        .dot { fill:var(--jm-dot,#5fd0e0); opacity:0; transition:opacity 500ms ease; }
        .dot.on { opacity:1; }
        .halo { fill:none; stroke:var(--jm-dot,#5fd0e0); stroke-width:1; opacity:0; }
        .halo.on { animation:pulse 2.6s ease-out infinite; }
        @keyframes pulse { 0%{r:4;opacity:.7} 100%{r:22;opacity:0} }
        .lbl { font-family:"IBM Plex Mono",ui-monospace,monospace; font-size:11px;
               letter-spacing:0.06em; fill:var(--jm-label,#e7ecf1); opacity:0; transition:opacity 600ms ease; }
        .lbl.on { opacity:1; }
        .yr { font-family:"IBM Plex Mono",ui-monospace,monospace; font-size:10px;
              letter-spacing:0.08em; fill:var(--jm-year,#7f8f9e); opacity:0; transition:opacity 600ms ease; }
        .yr.on { opacity:1; }
      </style><div class="wrap"><svg></svg></div>`;
      this.svg = this.shadowRoot.querySelector("svg");
      waitForLibs()
        .then(() => fetch(ATLAS).then(r => r.json()))
        .then(topo => {
          this.world = window.topojson.feature(topo, topo.objects.countries);
          this.draw();
          const ro = new ResizeObserver(() => this.draw());
          ro.observe(this);
        })
        .catch(e => console.warn("journey-map:", e.message));
    }

    stops() {
      const raw = this.getAttribute("stops");
      if (!raw) return DEFAULT_STOPS;
      try { const p = JSON.parse(raw); return Array.isArray(p) && p.length ? p : DEFAULT_STOPS; }
      catch (e) { return DEFAULT_STOPS; }
    }

    static get observedAttributes() { return ["stops", "animate", "theme"]; }
    attributeChangedCallback() { if (this.world) this.draw(); }

    draw() {
      const d3 = window.d3;
      if (!this.world) return;
      const th = THEMES[this.getAttribute("theme")] || THEMES.dark;
      Object.keys(th).forEach(k => this.style.setProperty("--jm-" + k, th[k]));
      const w = this.clientWidth || 960;
      const h = this.clientHeight || Math.round(w * 0.5);
      if (!w || !h) return;
      const svg = d3.select(this.svg).attr("viewBox", `0 0 ${w} ${h}`);
      svg.selectAll("*").remove();

      const proj = d3.geoNaturalEarth1().rotate([-12, 0]).fitExtent(
        [[Math.max(8, w * 0.02), h * 0.06], [w - Math.max(8, w * 0.02), h * 0.94]],
        { type: "Sphere" }
      );
      const path = d3.geoPath(proj);

      svg.append("path").attr("class", "grat").attr("d", path({ type: "Sphere" }));
      svg.append("path").attr("class", "grat").attr("d", path(d3.geoGraticule10()));
      svg.append("g").selectAll("path").data(this.world.features).join("path")
        .attr("class", "land").attr("d", path);

      const STOPS = this.stops();
      const LEGS = STOPS.slice(1).map((_, i) => [i, i + 1]);
      const pts = STOPS.map(s => { const p = proj([s.lon, s.lat]); return { ...s, x: p[0], y: p[1] }; });
      const animate = this.getAttribute("animate") !== "false";

      const arcs = LEGS.map(([a, b]) => {
        const p0 = pts[a], p1 = pts[b];
        const mx = (p0.x + p1.x) / 2, my = (p0.y + p1.y) / 2;
        const dx = p1.x - p0.x, dy = p1.y - p0.y;
        const len = Math.hypot(dx, dy) || 1;
        const bow = Math.max(18, len * 0.18);
        const cx = mx - (dy / len) * bow, cy = my + (dx / len) * bow;
        return svg.append("path").attr("class", "arc")
          .attr("d", `M${p0.x},${p0.y} Q${cx},${cy} ${p1.x},${p1.y}`);
      });

      const nodes = pts.map(p => {
        const g = svg.append("g");
        if (Math.hypot(p.dx, p.dy) > 18) {
          g.append("line").attr("class", "leader")
            .attr("x1", p.x + (p.dx > 0 ? 3 : -3)).attr("y1", p.y)
            .attr("x2", p.x + p.dx - (p.dx > 0 ? 3 : -3)).attr("y2", p.y + p.dy - 4);
        }
        g.append("circle").attr("class", "halo").attr("cx", p.x).attr("cy", p.y).attr("r", 4);
        g.append("circle").attr("class", "dot").attr("cx", p.x).attr("cy", p.y)
          .attr("r", p.current ? 4.5 : 3);
        const t = g.append("text").attr("class", "lbl")
          .attr("x", p.x + p.dx).attr("y", p.y + p.dy).attr("text-anchor", p.anchor)
          .text(p.city);
        const y = g.append("text").attr("class", "yr")
          .attr("x", p.x + p.dx).attr("y", p.y + p.dy + 13).attr("text-anchor", p.anchor)
          .text(p.years);
        return { g, p, t, y };
      });

      const reveal = i => {
        const n = nodes[i]; if (!n) return;
        n.g.select(".dot").classed("on", true);
        n.g.select(".leader").classed("on", true);
        n.t.classed("on", true); n.y.classed("on", true);
        if (n.p.current) n.g.select(".halo").classed("on", true);
      };

      if (!animate) {
        arcs.forEach(a => a.attr("stroke-dasharray", null));
        nodes.forEach((_, i) => reveal(i));
        return;
      }

      arcs.forEach(a => {
        const L = a.node().getTotalLength();
        a.attr("stroke-dasharray", L).attr("stroke-dashoffset", L);
      });
      reveal(0);
      let t = 420;
      arcs.forEach((a, i) => {
        setTimeout(() => a.attr("stroke-dashoffset", 0), t);
        setTimeout(() => reveal(i + 1), t + 950);
        t += 1000;
      });
    }
  }

  if (!customElements.get("journey-map")) customElements.define("journey-map", JourneyMap);
})();
