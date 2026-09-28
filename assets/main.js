// Otevírací doba – denně 13:00–18:00 (od 21. 9. 2026, dle Instagramu) (při změně upravit i texty v index.html)
const HOURS = { open: 13 * 60, close: 18 * 60 };
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

(function status() {
  const el = document.getElementById("status");
  if (!el) return;
  const parts = new Intl.DateTimeFormat("cs-CZ", { timeZone: "Europe/Prague", hour: "2-digit", minute: "2-digit", hour12: false })
    .formatToParts(new Date());
  const now = +parts.find(p => p.type === "hour").value * 60 + +parts.find(p => p.type === "minute").value;
  const label = el.querySelector("span");
  if (now >= HOURS.open && now < HOURS.close) {
    el.classList.add("is-open");
    label.textContent = "Právě otevřeno · do 18:00";
  } else if (now < HOURS.open) {
    label.textContent = "Zavřeno · otevíráme ve 13:00";
  } else {
    label.textContent = "Zavřeno · zítra od 13:00";
  }
})();

// Mobilní menu
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
burger.addEventListener("click", () => {
  const open = burger.getAttribute("aria-expanded") !== "true";
  burger.setAttribute("aria-expanded", open);
  nav.classList.toggle("is-open", open);
});
nav.addEventListener("click", e => {
  if (e.target.tagName === "A") {
    burger.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  }
});

// Běžící pás – obsah zdvojíme, aby smyčka navazovala
const track = document.querySelector(".marquee__track");
if (track) track.innerHTML += track.innerHTML;

// ---------- Stékající poleva ----------
// Každý okraj dostane řadu kapek. Délka kapek roste se scrollem (u hlavičky po načtení)
// a jemně „dýchá“; pod některými kapkami občas odkápne kapička.
const SVGNS = "http://www.w3.org/2000/svg";

function rng(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

function buildDrip(el, i) {
  const W = el.clientWidth, H = el.clientHeight;
  const header = el.dataset.drip === "header";
  const r = rng(1234 + i * 99);
  const band = header ? 0 : 4;
  const drips = [];
  let x = r() * 20;
  while (x < W) {
    const w = (header ? 10 : 22) + r() * (header ? 16 : 40);
    x += (header ? 20 : 12) + r() * (header ? 90 : 60);
    if (x + w > W) break;
    drips.push({
      x, w,
      base: (header ? 2 : 8) + r() * (header ? 6 : 24),
      grow: (header ? 8 : 30) + r() * (H - (header ? 30 : 60)),
      phase: r() * 6.28,
      drop: r() < (header ? .15 : .3),
    });
    x += w;
  }
  const svg = document.createElementNS(SVGNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("preserveAspectRatio", "none");
  const bandPath = document.createElementNS(SVGNS, "path");
  bandPath.setAttribute("d", `M0 0H${W}V${band}H0Z`);
  svg.appendChild(bandPath);
  for (const d of drips) {
    d.path = document.createElementNS(SVGNS, "path");
    svg.appendChild(d.path);
    if (d.drop && !reduce) {
      d.g = document.createElementNS(SVGNS, "g");
      const c = document.createElementNS(SVGNS, "circle");
      c.setAttribute("r", (d.w * .28).toFixed(1));
      c.setAttribute("class", "drop");
      c.style.setProperty("--d", (3.5 + r() * 3).toFixed(2) + "s");
      c.style.setProperty("--delay", (r() * 5).toFixed(2) + "s");
      d.g.appendChild(c);
      svg.appendChild(d.g);
    }
  }
  el.replaceChildren(svg);
  return { el, drips, band, header, p: reduce ? 1 : 0, start: performance.now() };
}

function draw(edge, t) {
  for (const d of edge.drips) {
    const breathe = reduce ? 0 : Math.sin(t / 900 + d.phase) * 3;
    const h = Math.max(2, d.base + edge.p * d.grow + breathe);
    const r = d.w / 2, x = d.x, y = edge.band + h;
    // krček u okraje je širší, aby kapka „vytékala“ z polevy
    d.path.setAttribute("d",
      `M${x - 6} 0Q${x} 0 ${x} ${edge.band + 8}V${y}a${r} ${r} 0 0 0 ${d.w} 0V${edge.band + 8}Q${x + d.w} 0 ${x + d.w + 6} 0Z`);
    if (d.g) d.g.setAttribute("transform", `translate(${x + r} ${y + r * .7})`);
  }
}

let edges = [];
function setup() {
  edges = [...document.querySelectorAll(".drip-edge")].map(buildDrip);
  edges.forEach(e => draw(e, 0));
}
setup();

let resizeTimer, lastW = innerWidth;
addEventListener("resize", () => {
  if (innerWidth === lastW) return; // mobil mění výšku při scrollu – kapky kvůli tomu nepřestavujeme
  lastW = innerWidth;
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(setup, 150);
});

function frame(t) {
  const vh = innerHeight;
  for (const e of edges) {
    const rect = e.el.getBoundingClientRect();
    if (rect.bottom < -50 || rect.top > vh + 50) continue;
    if (e.header) {
      const k = Math.min(1, (t - e.start) / 1800);
      e.p = 1 - Math.pow(1 - k, 3);
    } else {
      const target = Math.min(1, Math.max(0, (vh - rect.top) / (vh * .75)));
      e.p += (target - e.p) * .08;
    }
    draw(e, t);
  }
  requestAnimationFrame(frame);
}
if (!reduce) requestAnimationFrame(frame);

// Jemné vynoření bloků
const targets = document.querySelectorAll(".treat, .board, .machine, .partner, .route li, .quotes blockquote, .map");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.15 });
  targets.forEach(t => { t.classList.add("reveal"); io.observe(t); });
}

document.getElementById("year").textContent = new Date().getFullYear();
