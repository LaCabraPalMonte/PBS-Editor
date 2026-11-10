// PBS Editor — web pública. Sin dependencias: todo es mejora progresiva sobre el HTML.
(() => {
  'use strict';
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // En un navegador sin IntersectionObserver la página se enseña entera y sin efectos, no a medias
  const canObserve = 'IntersectionObserver' in window;

  // ---------- Navegación ----------
  const nav = $('#nav');
  const navLinks = $('#navLinks');
  const navToggle = $('#navToggle');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = open => {
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  };
  navToggle.addEventListener('click', () => setMenu(navToggle.getAttribute('aria-expanded') !== 'true'));
  navLinks.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') { setMenu(false); navToggle.focus(); }
  });

  // Marca en el menú la sección que se está leyendo
  const sectionLinks = new Map($$('a', navLinks).map(a => [a.getAttribute('href').slice(1), a]));
  const spy = canObserve && new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      sectionLinks.forEach((a, id) => a.toggleAttribute('aria-current', false));
      const link = sectionLinks.get(entry.target.id);
      if (link) link.setAttribute('aria-current', 'true');
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  if (spy) $$('main > section[id]').forEach(s => spy.observe(s));

  // ---------- Aparición al hacer scroll ----------
  const reveals = $$('.reveal');
  if (reducedMotion || !canObserve) {
    reveals.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(el => io.observe(el));
  }

  // ---------- Demo del hero: línea de texto <-> campo del editor ----------
  const demo = $('#demo');
  const spot = $('#spot');
  const lines = $$('.pbs-line', demo);
  let current = -1;
  let timer = null;

  const select = index => {
    current = index;
    lines.forEach((line, i) => line.setAttribute('aria-pressed', String(i === index)));
    const [x, y, w, h] = lines[index].dataset.spot.split(',');
    Object.assign(spot.style, { left: x + '%', top: y + '%', width: w + '%', height: h + '%' });
    spot.classList.add('on');
  };
  const stopCycle = () => { clearInterval(timer); timer = null; };
  const startCycle = () => {
    if (timer || reducedMotion) return;
    timer = setInterval(() => select((current + 1) % lines.length), 2800);
  };
  lines.forEach((line, i) => {
    line.addEventListener('click', () => { stopCycle(); select(i); });
    line.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { stopCycle(); select(i); } });
    line.addEventListener('focus', () => { stopCycle(); select(i); });
  });
  select(reducedMotion ? 2 : 0);
  // El ciclo solo corre mientras la demo está a la vista, y se para en cuanto el visitante la toca
  let touched = false;
  $('.pbs', demo).addEventListener('pointerdown', () => { touched = true; }, { once: true });
  lines.forEach(line => line.addEventListener('focus', () => { touched = true; }, { once: true }));
  if (canObserve) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !touched) startCycle(); else stopCycle();
    }, { threshold: 0.35 }).observe(demo);
  }

  // ---------- Galería por pestañas ----------
  const tabs = $$('#galTabs .tab');
  const showTab = (tab, focus = false) => {
    for (const t of tabs) {
      const active = t === tab;
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !active;
    }
    tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reducedMotion ? 'auto' : 'smooth' });
    if (focus) tab.focus({ preventScroll: true });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => showTab(tab));
    tab.addEventListener('keydown', e => {
      const move = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      let target = null;
      if (move) target = tabs[(i + move + tabs.length) % tabs.length];
      else if (e.key === 'Home') target = tabs[0];
      else if (e.key === 'End') target = tabs[tabs.length - 1];
      if (target) { e.preventDefault(); showTab(target, true); }
    });
  });

  // ---------- Visor de capturas ----------
  const lb = $('#lb');
  const lbImg = $('#lbImg');
  const lbCap = $('#lbCap');
  const lbCount = $('#lbCount');
  const lbStage = $('#lbStage');
  const shots = $$('.shot[data-full]');
  // Una misma captura puede salir en dos sitios de la página: en el visor cuenta una sola vez
  const items = [...new Map(shots.map(s => [s.dataset.full, s])).values()];
  let at = 0;

  const paint = () => {
    const item = items[at];
    lbImg.width = item.dataset.w;
    lbImg.height = item.dataset.h;
    lbImg.src = item.dataset.full;
    lbImg.alt = $('img', item).alt;
    lbImg.style.animation = 'none';
    void lbImg.offsetWidth; // reinicia la animación de entrada
    lbImg.style.animation = '';
    lbCap.textContent = item.dataset.cap;
    lbCount.textContent = `${at + 1} / ${items.length}`;
  };
  const step = delta => { at = (at + delta + items.length) % items.length; paint(); };
  const openAt = shot => {
    // Sin <dialog> (navegadores antiguos) se abre la captura tal cual, que es mejor que no hacer nada
    if (typeof lb.showModal !== 'function') { location.href = shot.dataset.full; return; }
    at = Math.max(0, items.findIndex(item => item.dataset.full === shot.dataset.full));
    paint();
    lb.showModal();
    document.documentElement.style.overflow = 'hidden';
  };
  shots.forEach(shot => shot.addEventListener('click', () => openAt(shot)));
  $('#lbPrev').addEventListener('click', () => step(-1));
  $('#lbNext').addEventListener('click', () => step(1));
  $('#lbClose').addEventListener('click', () => lb.close());
  lb.addEventListener('close', () => { document.documentElement.style.overflow = ''; });
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  });
  // Clic fuera de la imagen: cerrar
  lbStage.addEventListener('click', e => { if (e.target === lbStage) lb.close(); });
  // Deslizar en pantallas táctiles
  let startX = null;
  lbStage.addEventListener('pointerdown', e => { startX = e.pointerType === 'mouse' ? null : e.clientX; });
  lbStage.addEventListener('pointerup', e => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
  });

  // ---------- Novedades de la versión publicada ----------
  // version.json es el mismo manifiesto que consulta el launcher para avisar de actualizaciones
  fetch('version.json', { cache: 'no-cache' })
    .then(r => (r.ok ? r.json() : null))
    .then(data => {
      const notes = data && typeof data.notes === 'string' ? data.notes.trim() : '';
      if (!notes || notes.startsWith('[Borrador')) return;
      $('#dlNotesText').textContent = notes;
      $('#dlNotes').hidden = false;
    })
    .catch(() => {});

  // Todo ha arrancado: se cancela el plan B de index.html, que a los 4 s quita la clase «js» para que
  // el contenido que aparece al hacer scroll no se quede invisible si este archivo no carga o falla.
  clearTimeout(window.pbsBoot);
})();
