// Agents: labelled cursors drag each block into place as the page scrolls (Figma-style multiplayer).
// Decoration only: content stays in the DOM, is readable without JS, and is skipped for reduced motion.
(() => {
  if (!window.matchMedia || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const AGENTS = [["Marcos", "#d5bdff"], ["API", "#5ee6a8"], ["Banco", "#ffb86b"], ["Interface", "#ff9bd2"], ["Deploy", "#8fd0ff"]];
  // [selector, agent, side]: the preview sits at the right edge, so it is pulled in from the left.
  const LOAD = [[".hero h1", 3, 1], [".hero-project-preview", 0, -1]];
  const SCROLL = [".about-heading", ".about-copy", ".section-intro", ".case-study", ".skills-heading", ".skill-card", ".contact-panel"];
  const LOAD_MS = 1400;

  const clamp = (v) => Math.min(1, Math.max(0, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const mix = (a, b, t) => a + (b - a) * t;

  // Absolute layer in document coordinates, so cursors scroll natively with the page.
  const layer = document.createElement("div");
  layer.className = "agent-layer";
  layer.setAttribute("aria-hidden", "true");
  document.body.append(layer);
  const part = (className, color) => {
    const node = document.createElement("div");
    node.className = className;
    node.style.setProperty("--agent", color);
    layer.append(node);
    return node;
  };

  const blocks = [];
  const add = (el, mode, agent, side, fixedSide = false) => {
    const [name, color] = AGENTS[agent % AGENTS.length];
    const slot = part("agent-slot", color);
    const box = part("agent-box", color);
    const cursor = part("agent-cursor", color);
    cursor.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 2v18l4.6-4.4 3.3 6.9 3-1.4-3.3-6.8H18z"/></svg><span></span><i></i>';
    cursor.querySelector("span").textContent = name;
    blocks.push({ el, mode, side, fixedSide, slot, box, cursor, p: 0, t0: 0, done: false });
  };
  LOAD.forEach(([selector, agent, side]) => document.querySelectorAll(selector).forEach((el) => add(el, "load", agent, side, true)));
  let count = 0;
  SCROLL.forEach((selector) => document.querySelectorAll(selector).forEach((el) => {
    add(el, "scroll", count, count % 2 ? 1 : -1);
    count += 1;
  }));

  let vw = 0;
  const render = (b) => {
    const { p } = b;
    const travel = ease(seg(p, 0, 0.3));
    const drag = ease(seg(p, 0.38, 0.85));
    const leave = ease(seg(p, 0.9, 1));
    const press = seg(p, 0.3, 0.38) - seg(p, 0.85, 0.9);
    const rest = 1 - drag;
    const ox = b.dx * rest;
    const oy = 70 * rest;
    const rot = -2.5 * b.side * rest;
    const scale = mix(0.97, 1, drag);

    const s = b.el.style;
    s.translate = `${ox}px ${oy}px`;
    s.rotate = `${rot}deg`;
    s.scale = `${scale}`;
    s.opacity = `${p < 0.38 ? mix(0.15, 0.55, seg(p, 0.3, 0.38)) : mix(0.55, 1, drag)}`;

    // The grab point follows the block's rotation and scale around its centre.
    const rad = (rot * Math.PI) / 180;
    const vx = (b.gx - b.w / 2) * scale;
    const vy = (b.gy - b.h / 2) * scale;
    const gx = b.x + ox + b.w / 2 + vx * Math.cos(rad) - vy * Math.sin(rad);
    const gy = b.y + oy + b.h / 2 + vx * Math.sin(rad) + vy * Math.cos(rad);
    const cx = p < 0.3 ? mix(b.from, gx, travel) : mix(gx, gx + b.side * 160, leave);
    const cy = p < 0.3 ? mix(gy + 140, gy, travel) : mix(gy, gy - 110, leave);
    const ring = seg(p, 0.85, 0.97);
    const c = b.cursor.style;
    c.transform = `translate(${cx - 3.7}px, ${cy - 1.8}px)`;
    c.opacity = `${seg(p, 0, 0.06) * (1 - leave)}`;
    c.setProperty("--press", press);
    c.setProperty("--ring-s", mix(0.3, 2.4, ring));
    c.setProperty("--ring-o", ring > 0 ? 1 - ring : 0);

    b.slot.style.transform = `translate(${b.x}px, ${b.y}px)`;
    b.slot.style.opacity = `${seg(p, 0.05, 0.2) * (1 - seg(p, 0.82, 0.9))}`;
    b.box.style.transform = `translate(${b.x + ox}px, ${b.y + oy}px) rotate(${rot}deg) scale(${scale})`;
    b.box.style.opacity = `${seg(p, 0.3, 0.36) * (1 - seg(p, 0.85, 0.9))}`;
  };

  const measure = () => {
    const root = document.documentElement;
    const vh = window.innerHeight;
    // A collapsed viewport (hidden iframe/pane) would turn progress into NaN for good.
    if (!root.clientWidth || !vh) return;
    vw = root.clientWidth;
    layer.style.height = "0px";
    const live = blocks.filter((b) => !b.done);
    live.forEach(({ el }) => {
      el.style.translate = el.style.rotate = el.style.scale = "";
    });
    live.forEach((b) => {
      const r = b.el.getBoundingClientRect();
      b.w = b.el.offsetWidth;
      b.h = b.el.offsetHeight;
      b.x = r.left + r.width / 2 - b.w / 2 + scrollX;
      b.y = r.top + r.height / 2 - b.h / 2 + scrollY;
      // Column blocks move outward (grid neighbours never collide); full-width ones alternate.
      const center = b.x + b.w / 2;
      const wide = b.w > vw * 0.6;
      if (!wide && !b.fixedSide) b.side = center < vw / 2 ? -1 : 1;
      b.from = (wide ? b.side > 0 : center > vw / 2) ? vw + 40 : -40;
      b.dx = b.side * Math.min(120, vw * 0.1);
      b.gx = Math.min(b.w * 0.3, 220);
      b.gy = Math.min(36, b.h * 0.3);
      for (const node of [b.slot, b.box]) {
        node.style.width = `${b.w}px`;
        node.style.height = `${b.h}px`;
      }
    });
    // Clamp the end to the max scroll so blocks near the bottom still finish.
    const maxScroll = root.scrollHeight - vh;
    live.forEach((b) => {
      b.start = b.y - vh * 0.92 + (b.x / vw) * vh * 0.08;
      b.end = Math.max(b.start + 1, Math.min(b.y - vh * 0.42, maxScroll));
    });
    layer.style.height = `${root.scrollHeight}px`;
    live.forEach(render);
  };

  const finish = (b) => {
    b.done = true;
    const s = b.el.style;
    s.translate = s.rotate = s.scale = s.opacity = "";
    b.slot.remove();
    b.box.remove();
    b.cursor.remove();
  };

  const progress = (b) => (b.end > b.start ? clamp((scrollY - b.start) / (b.end - b.start)) : 0);
  let frame = 0;
  const tick = (now) => {
    frame = 0;
    let busy = false;
    for (const b of blocks) {
      if (b.done) continue;
      const before = b.p;
      if (b.mode === "load") {
        b.p = now < b.t0 ? 0 : clamp((now - b.t0) / LOAD_MS);
        busy = true;
      } else {
        // Ease toward the scroll position so a fast flick still shows the cursors working.
        const target = progress(b);
        b.p += (target - b.p) * 0.14;
        if (Math.abs(target - b.p) < 0.002) b.p = target;
        else busy = true;
      }
      if (b.p >= 1) finish(b);
      else if (b.p !== before) render(b);
    }
    if (busy) frame = requestAnimationFrame(tick);
  };
  const kick = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };
  const remeasure = () => {
    measure();
    kick();
  };

  measure();
  // Blocks already on screen are built on a timer; blocks already passed start finished.
  const now = performance.now();
  let queued = 0;
  for (const b of blocks) {
    if (b.mode === "scroll") {
      const target = progress(b);
      if (target >= 1) finish(b);
      else if (target > 0) b.mode = "load";
    }
    if (!b.done && b.mode === "load") {
      b.t0 = now + 350 + queued * 320;
      queued += 1;
    }
  }
  kick();

  addEventListener("scroll", kick, { passive: true });
  addEventListener("load", remeasure);
  document.fonts?.ready.then(remeasure);
  new ResizeObserver(remeasure).observe(document.body);
  // Keyboard users never land on a half-built block.
  document.addEventListener("focusin", (event) => blocks.forEach((b) => !b.done && b.el.contains(event.target) && finish(b)));
  addEventListener("beforeprint", () => blocks.forEach((b) => !b.done && finish(b)));
})();
