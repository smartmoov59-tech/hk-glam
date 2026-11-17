/* HK GLAM — motion & réservation */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const PHONE = '+33659057534';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mq = (q) => window.matchMedia(q).matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  $('.y').textContent = new Date().getFullYear();

  /* ---------- Split text ---------- */
  $$('.split-chars').forEach(el => {
    const t = el.textContent; el.textContent = '';
    [...t].forEach(ch => { const s = document.createElement('span'); s.className = 'char'; s.textContent = ch; el.appendChild(s); });
  });
  $$('.split-words').forEach(el => {
    const words = el.textContent.trim().split(/\s+/); el.textContent = '';
    words.forEach((w, i) => {
      const m = document.createElement('span'); m.className = 'wmask';
      const s = document.createElement('span'); s.className = 'word'; s.textContent = w;
      m.appendChild(s); el.appendChild(m); if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  /* ---------- Sparkles ---------- */
  const sp = $('.sparkles');
  if (sp) for (let i = 0; i < 22; i++) {
    const s = document.createElement('i');
    s.style.left = Math.random() * 100 + '%'; s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = (Math.random() * 4).toFixed(2) + 's';
    const k = (0.4 + Math.random() * 0.9).toFixed(2); s.style.width = s.style.height = (6 * k) + 'px';
    sp.appendChild(s);
  }

  /* ---------- Fallback sans GSAP ---------- */
  if (!hasGsap) {
    document.body.classList.remove('is-loading'); $('.loader').remove();
    initCommon(null); return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const ease = 'expo.out';

  /* ---------- Lenis ---------- */
  let lenis = null;
  if (!reduce && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  /* ---------- Loader ---------- */
  const loader = $('.loader');
  const lines = $$('.gem-line');
  lines.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  gsap.set('.hero .char', { yPercent: 110 });
  gsap.set(['.hero__eyebrow', '.hero__lead', '.hero__ctas', '.hero__rating', '.hero__scroll', '.nav'], { autoAlpha: 0, y: 30 });
  gsap.set(loader, { clipPath: 'polygon(50% -60%, 160% 50%, 50% 160%, -60% 50%)' });

  const counter = { v: 0 };
  const countEl = $('.loader__count span');
  const tlL = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
  const dur = reduce ? 0.3 : 2.9;
  const wordL = $$('.loader__word span');
  gsap.set(wordL, { yPercent: 115 });
  gsap.set(['.loader__tag', '.loader__count'], { autoAlpha: 0, y: 12 });
  gsap.set('.loader__word .g', { backgroundSize: '220% 100%', backgroundPosition: '100% 0' });
  tlL.to(lines, { strokeDashoffset: 0, duration: 1.4, stagger: 0.2 }, 0)
     .to('.loader__count', { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.1)
     .to(counter, { v: 100, duration: dur - 0.2, ease: 'power2.inOut', onUpdate: () => countEl.textContent = Math.round(counter.v) }, 0)
     .fromTo('.loader__mono', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' }, 0.7)
     .to(wordL, { yPercent: 0, duration: 1.1, stagger: 0.06, ease: 'expo.out' }, 0.55)
     .to('.loader__word .g', { backgroundPosition: '0% 0', duration: 1.8, ease: 'power2.inOut' }, 1)
     .to('.loader__tag', { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 1.2)
     .to(wordL, { yPercent: -115, duration: 0.7, stagger: 0.035, ease: 'power3.in' }, dur)
     .to(['.loader__count', '.loader__tag', '.loader__mono'], { autoAlpha: 0, y: -16, duration: 0.45, stagger: 0.04 }, dur)
     .to(loader, { clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)', duration: reduce ? 0.3 : 1.25, ease: 'expo.inOut' }, dur + 0.25)
     .to('.loader__emblem', { scale: 0.2, rotate: 45, duration: 1.1, ease: 'expo.inOut' }, dur + 0.25)
     .from('.hero__video', { scale: 1.5, duration: 2.2, ease: 'expo.out' }, dur + 0.4)
     .to('.hero .char', { yPercent: 0, duration: 1.4, stagger: 0.07, ease }, dur + 0.75)
     .to(['.nav', '.hero__eyebrow', '.hero__lead', '.hero__ctas', '.hero__rating', '.hero__scroll'], { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08, ease }, dur + 1.05)
     .add(() => { loader.remove(); document.body.classList.remove('is-loading'); lenis && lenis.start(); ScrollTrigger.refresh(); }, dur + 1.5);

  initCommon(lenis);

  if (reduce) { initReduced(); return; }

  /* ---------- Progress bar ---------- */
  gsap.to('.progress span', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  /* ---------- Hero parallax (scroll + souris) ---------- */
  $$('.hero [data-depth]').forEach(el => {
    const d = parseFloat(el.dataset.depth);
    gsap.to(el, { yPercent: d * 28, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  });
  gsap.to('.hero__content', { autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: '80% top', scrub: true } });
  if (fine) {
    const mid = $('.hero__mid'), med = $('.hero__video');
    const qx = gsap.quickTo(mid, 'x', { duration: 1.2, ease: 'power3' }), qy = gsap.quickTo(mid, 'y', { duration: 1.2, ease: 'power3' });
    const vx = gsap.quickTo(med, 'x', { duration: 1.6, ease: 'power3' }), vy = gsap.quickTo(med, 'y', { duration: 1.6, ease: 'power3' });
    $('.hero').addEventListener('mousemove', e => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      qx(nx * 50); qy(ny * 35); vx(nx * -18); vy(ny * -12);
    });
  }

  /* ---------- Marquee piloté par le scroll ---------- */
  const rows = $$('.marquee__row').map(row => {
    const track = $('.marquee__track', row);
    row.appendChild(track.cloneNode(true)); row.appendChild(track.cloneNode(true));
    const tracks = $$('.marquee__track', row);
    const dir = parseFloat(row.dataset.dir);
    const tw = gsap.fromTo(tracks, { xPercent: dir > 0 ? 0 : -100 }, { xPercent: dir > 0 ? -100 : 0, duration: dir > 0 ? 28 : 34, ease: 'none', repeat: -1 });
    return tw;
  });
  let scrollDir = 1;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: self => {
      const v = self.getVelocity();
      const d = self.direction; if (d !== scrollDir) scrollDir = d;
      const boost = 1 + Math.min(Math.abs(v) / 450, 5);
      rows.forEach(tw => gsap.to(tw, { timeScale: boost * scrollDir, duration: 0.25, overwrite: true }));
      gsap.delayedCall(0.25, () => rows.forEach(tw => gsap.to(tw, { timeScale: scrollDir, duration: 1.2, ease: 'power2.out', overwrite: true })));
    }
  });
  gsap.fromTo('.marquee', { rotate: -1.2 }, { rotate: 1.2, ease: 'none', scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- Titres mot par mot ---------- */
  $$('.split-words').forEach(el => {
    if (el.closest('.hero')) return;
    gsap.from($$('.word', el), { yPercent: 115, rotate: 4, duration: 1.2, stagger: 0.06, ease,
      scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  $$('.eyebrow').forEach(el => {
    if (el.closest('.hero')) return;
    gsap.from(el, { autoAlpha: 0, x: -30, duration: 1, ease, scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  const mm = gsap.matchMedia();

  /* ---------- Rituel : section pinnée ---------- */
  /* Une seule timeline « scrubbée » : chaque étape glisse en continu avec le scroll
     (plus de bascule brutale), puis s'aimante doucement sur l'étape la plus proche. */
  const steps = $$('.step'), imgs = $$('.rituel__img');
  function buildRituel(perStep) {
    gsap.set(steps, { autoAlpha: 0, y: 50 });
    gsap.set(steps[0], { autoAlpha: 1, y: 0 });
    gsap.set(imgs, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(imgs[0], { clipPath: 'inset(0% 0% 0% 0%)' });
    gsap.set('.rituel__bar span', { scaleX: 1 / steps.length });
    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.addLabel('s0', 0);
    for (let i = 1; i < steps.length; i++) {
      const t = i - 1;
      tl.to(steps[i - 1], { autoAlpha: 0, y: -50, duration: 0.35, ease: 'power2.in' }, t + 0.1)
        .fromTo(steps[i], { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, t + 0.5)
        .to(imgs[i], { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power2.inOut' }, t + 0.1)
        .fromTo($('img', imgs[i]), { scale: 1.25 }, { scale: 1, duration: 0.9, ease: 'power2.out' }, t + 0.1)
        .to($('img', imgs[i - 1]), { scale: 0.92, yPercent: -6, duration: 0.8, ease: 'power2.inOut' }, t + 0.1)
        .to('.rituel__bar span', { scaleX: (i + 1) / steps.length, duration: 0.8, ease: 'power2.inOut' }, t + 0.1)
        .addLabel('s' + i, t + 1);
    }
    tl.to({}, { duration: 0.35 });
    const st = ScrollTrigger.create({
      trigger: '.rituel', start: 'top top', end: '+=' + (steps.length * perStep) + '%', pin: '.rituel__pin',
      animation: tl, scrub: 1.1, anticipatePin: 1,
      snap: { snapTo: 'labelsDirectional', duration: { min: 0.35, max: 0.9 }, delay: 0.08, ease: 'power2.inOut' }
    });
    return () => { st.kill(); tl.kill(); };
  }
  mm.add('(min-width: 821px)', () => {
    const k = buildRituel(75);
    const g = gsap.to('.rituel__gem', { rotate: 180, ease: 'none', scrollTrigger: { trigger: '.rituel', start: 'top top', end: '+=300%', scrub: true } });
    return () => { k(); g.scrollTrigger && g.scrollTrigger.kill(); g.kill(); };
  });
  mm.add('(max-width: 820px)', () => buildRituel(60));

  /* ---------- Prestations : défilement horizontal ---------- */
  const track = $('.presta__track');
  mm.add('(min-width: 641px)', () => {
    const dist = () => track.scrollWidth - innerWidth;
    const tw = gsap.to(track, { x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.presta', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 } });
    $$('.card__img img', track).forEach(img => {
      gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: img.closest('.card'), containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } });
    });
    gsap.from($$('.card', track), { y: 120, rotate: 3, autoAlpha: 0, duration: 1.2, stagger: 0.1, ease, scrollTrigger: { trigger: '.presta', start: 'top 70%' } });
    return () => { gsap.set(track, { x: 0 }); };
  });
  mm.add('(max-width: 640px)', () => {
    const vp = $('.presta__viewport');
    vp.style.overflowX = 'auto'; vp.style.scrollSnapType = 'x mandatory'; vp.style.webkitOverflowScrolling = 'touch';
    $$('.card, .presta__end', track).forEach(c => c.style.scrollSnapAlign = 'center');
    return () => { vp.removeAttribute('style'); };
  });

  /* ---------- Duo : rideau d'entrée ---------- */
  gsap.from('.duo__panel', { clipPath: 'inset(100% 0% 0% 0% round 22px)', duration: 1.5, stagger: 0.18, ease: 'expo.inOut',
    scrollTrigger: { trigger: '.duo__panels', start: 'top 80%' } });

  /* ---------- Chiffres animés ---------- */
  $$('.stat__n').forEach(el => {
    const to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10), o = { v: 0 };
    gsap.to(o, { v: to, duration: 2.4, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' },
      onUpdate: () => el.textContent = o.v.toFixed(dec).replace('.', ',') });
  });
  gsap.from('.stat', { y: 60, autoAlpha: 0, stagger: 0.12, duration: 1.1, ease, scrollTrigger: { trigger: '.stats', start: 'top 70%' } });
  gsap.fromTo('.stats__bg', { rotate: -20, scale: 0.8 }, { rotate: 20, scale: 1.15, ease: 'none', scrollTrigger: { trigger: '.stats', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- Galerie : révélation en losange ---------- */
  $$('.g').forEach((g, i) => {
    gsap.fromTo(g, { clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)' },
      { clipPath: 'polygon(50% -60%, 160% 50%, 50% 160%, -60% 50%)', duration: 1.6, ease: 'expo.inOut', delay: (i % 4) * 0.08,
        scrollTrigger: { trigger: g, start: 'top 88%' }, onComplete: () => g.style.clipPath = 'none' });
    gsap.fromTo($('img', g), { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: g, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ---------- CTA ---------- */
  $$('.cta__l').forEach(l => { const t = l.innerHTML; l.innerHTML = '<span style="display:inline-block">' + t + '</span>'; });
  gsap.from('.cta__l > span', { yPercent: 110, duration: 1.4, stagger: 0.12, ease, scrollTrigger: { trigger: '.cta', start: 'top 60%' } });
  gsap.fromTo('.cta__video', { scale: 1.35 }, { scale: 1.05, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- Infos / réservation entrées ---------- */
  gsap.from('.infos__map', { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: '.infos', start: 'top 75%' } });
  gsap.from('.hours li', { x: 40, autoAlpha: 0, stagger: 0.06, duration: 0.9, ease, scrollTrigger: { trigger: '.hours', start: 'top 85%' } });
  gsap.from('.bk', { y: 80, rotateX: 8, autoAlpha: 0, duration: 1.3, ease, transformPerspective: 1200, scrollTrigger: { trigger: '.bk', start: 'top 85%' } });

  /* ---------- Footer géant ---------- */
  gsap.from('.footer__giant span', { yPercent: 100, autoAlpha: 0, rotate: 8, stagger: 0.06, ease: 'power3.out',
    scrollTrigger: { trigger: '.footer__giant', start: 'top 98%', end: 'bottom 95%', scrub: 1 } });

  /* ---------- Tilt 3D + reflet ---------- */
  if (fine) {
    $$('.tilt, .g').forEach(el => {
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' }), ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' });
      gsap.set(el, { transformPerspective: 900 });
      const amp = el.classList.contains('g') ? 6 : 9;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        ry((x - 0.5) * amp * 2); rx((0.5 - y) * amp * 2);
        el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%');
      });
      el.addEventListener('mouseleave', () => { rx(0); ry(0); });
    });

    /* Boutons magnétiques */
    $$('.magnetic').forEach(b => {
      const qx = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' }), qy = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
      const sx = gsap.quickTo($('span', b), 'x', { duration: 0.5, ease: 'power3' }), sy = gsap.quickTo($('span', b), 'y', { duration: 0.5, ease: 'power3' });
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        qx(x * 0.3); qy(y * 0.4); sx(x * 0.12); sy(y * 0.15);
      });
      b.addEventListener('mouseleave', () => { qx(0); qy(0); sx(0); sy(0); });
    });

    /* Curseur losange */
    const c = $('.cursor');
    const cx = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3' }), cy = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3' });
    addEventListener('mousemove', e => { cx(e.clientX); cy(e.clientY); });
    document.addEventListener('mouseover', e => c.classList.toggle('is-hover', !!e.target.closest('a, button, label, .g, .card, .duo__panel')));
  }

  function initReduced() {}

  /* =========================================================
     Partie commune (avec ou sans animations)
     ========================================================= */
  function initCommon(lenis) {
    /* Ancres */
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const t = $(id); if (!t) return;
      e.preventDefault(); closeMenu();
      if (lenis) lenis.scrollTo(t, { offset: id === '#top' ? 0 : -10, duration: 1.6 }); else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    }));

    /* Nav qui se cache / réapparaît + bouton flottant */
    const nav = $('.nav'), fab = $('.fab'), hero = $('.hero');
    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY, hh = hero.offsetHeight;
      nav.classList.toggle('is-solid', y > hh * 0.85);
      if (!nav.classList.contains('menu-open')) nav.classList.toggle('is-hidden', y > lastY && y > 200);
      fab.classList.toggle('is-on', y > hh * 0.6);
      lastY = y;
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    /* Menu mobile plein écran */
    const burger = $('.nav__burger'), menu = $('.menu');
    let open = false;
    function openMenu() {
      open = true; burger.setAttribute('aria-expanded', 'true'); menu.setAttribute('aria-hidden', 'false'); nav.classList.add('menu-open'); nav.classList.remove('is-hidden');
      lenis && lenis.stop();
      if (window.gsap) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.to('.menu__bg', { clipPath: 'polygon(100% 0, -100% 0, 100% 200%, 100% 200%)', duration: 0.9, ease: 'expo.inOut' });
        gsap.to('.menu__links a', { opacity: 1, y: 0, stagger: 0.06, duration: 0.9, delay: 0.35, ease: 'expo.out' });
        gsap.to('.menu__foot', { opacity: 1, delay: 0.7, duration: 0.6 });
      } else { menu.style.visibility = 'visible'; $('.menu__bg').style.clipPath = 'none'; $$('.menu__links a, .menu__foot').forEach(a => { a.style.opacity = 1; a.style.transform = 'none'; }); }
      $('.menu__links a').focus({ preventScroll: true });
    }
    function closeMenu() {
      if (!open) return; open = false; burger.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-hidden', 'true'); nav.classList.remove('menu-open');
      lenis && lenis.start();
      if (window.gsap) {
        gsap.to('.menu__links a', { opacity: 0, y: 40, duration: 0.3 });
        gsap.to('.menu__foot', { opacity: 0, duration: 0.2 });
        gsap.to('.menu__bg', { clipPath: 'polygon(100% 0, 100% 0, 100% 0, 100% 0)', duration: 0.7, ease: 'expo.inOut', onComplete: () => gsap.set(menu, { visibility: 'hidden' }) });
      } else menu.style.visibility = 'hidden';
    }
    burger.addEventListener('click', () => open ? closeMenu() : openMenu());
    addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    /* Duo panels */
    const panels = $$('.duo__panel');
    panels.forEach(p => {
      const act = () => panels.forEach(q => q.classList.toggle('is-open', q === p));
      p.addEventListener('click', act); p.addEventListener('focus', act);
      if (fine) p.addEventListener('mouseenter', act);
      p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
    });

    /* Vidéo CTA : lecture seulement à l'écran */
    const v = $('.cta__video');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause(); }), { rootMargin: '200px' }).observe(v);
    }
    const hv = $('.hero__video'); hv.play && hv.play().catch(() => {});

    /* Avis : carrousel */
    const revs = $$('.review'), dotsWrap = $('.reviews__dots');
    let ri = 0, timer;
    revs.forEach((r, i) => {
      const d = document.createElement('button'); d.setAttribute('role', 'tab'); d.setAttribute('aria-label', 'Avis ' + (i + 1));
      d.setAttribute('aria-selected', i === 0 ? 'true' : 'false'); d.addEventListener('click', () => showRev(i, true)); dotsWrap.appendChild(d);
    });
    const dots = $$('button', dotsWrap);
    if (window.gsap) gsap.set(revs[0], { autoAlpha: 1 });
    function showRev(i, user) {
      i = (i + revs.length) % revs.length; if (i === ri) return;
      const prev = revs[ri]; ri = i; const nx = revs[i];
      dots.forEach((d, k) => d.setAttribute('aria-selected', k === i ? 'true' : 'false'));
      if (window.gsap && !reduce) {
        gsap.to(prev, { autoAlpha: 0, y: -40, duration: 0.6, ease: 'power3.in', onComplete: () => prev.classList.remove('is-active') });
        nx.classList.add('is-active');
        gsap.fromTo(nx, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 1.1, delay: 0.45, ease: 'expo.out' });
        gsap.fromTo($('p', nx), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.4, delay: 0.5, ease: 'expo.inOut' });
      } else { prev.classList.remove('is-active'); prev.style.opacity = 0; nx.classList.add('is-active'); nx.style.opacity = 1; nx.style.visibility = 'visible'; }
      if (user) restart();
    }
    function restart() { clearInterval(timer); timer = setInterval(() => showRev(ri + 1), 6500); }
    $$('.rbtn').forEach(b => b.addEventListener('click', () => showRev(ri + parseInt(b.dataset.dir, 10), true)));
    restart();

    /* Horaires : jour courant + statut */
    const now = new Date(), day = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
    const li = $(`.hours li[data-d="${day}"]`); li && li.classList.add('today');
    const status = $('.infos__status');
    const isOpen = day !== 0 && h >= 9 && h < 19;
    status.textContent = isOpen ? 'Ouvert en ce moment · jusqu’à 19 h' : (day === 6 && h >= 19 || day === 0 ? 'Fermé · réouverture lundi à 9 h' : (h < 9 ? 'Fermé · ouvre aujourd’hui à 9 h' : 'Fermé · réouverture demain à 9 h'));
    status.style.setProperty('--st', isOpen ? '#3d9a5b' : '#b5485a');

    initBooking();
  }

  /* =========================================================
     Réservation : génère un SMS pré-rempli (aucun service tiers)
     ========================================================= */
  function initBooking() {
    const form = $('#bk'), panels = $$('.bk__panel', form), bars = $$('.bk__steps span', form), err = $('.bk__err', form);
    const daysEl = $('.days', form), slotsEl = $('.slots', form);
    let step = 0;
    const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const fmtLong = d => d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

    // 18 prochains jours ouvrés (pas le dimanche)
    const start = new Date(); start.setHours(0, 0, 0, 0);
    let added = 0;
    for (let k = 0; added < 18 && k < 30; k++) {
      const d = new Date(start); d.setDate(start.getDate() + k);
      if (d.getDay() === 0) continue;
      if (k === 0 && new Date().getHours() * 60 + new Date().getMinutes() > 17 * 60) continue; // plus aucun créneau libre aujourd'hui
      const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const lab = document.createElement('label'); lab.className = 'day';
      lab.innerHTML = `<input type="radio" name="day" value="${iso}" aria-label="${fmtLong(d)}"><span><small>${k === 0 ? 'Auj.' : DAYS[d.getDay()]}</small><b>${d.getDate()}</b><small>${d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')}</small></span>`;
      daysEl.appendChild(lab); added++;
    }
    function buildSlots(iso) {
      slotsEl.innerHTML = '';
      const today = new Date(); const isToday = iso === today.toISOString().slice(0, 10) || (new Date(iso + 'T00:00').toDateString() === today.toDateString());
      for (let m = 9 * 60; m <= 18 * 60; m += 30) {
        const hh = String(Math.floor(m / 60)).padStart(2, '0'), mn = String(m % 60).padStart(2, '0');
        const past = isToday && (m <= today.getHours() * 60 + today.getMinutes() + 60);
        const lab = document.createElement('label'); lab.className = 'slot';
        lab.innerHTML = `<input type="radio" name="time" value="${hh}:${mn}" ${past ? 'disabled' : ''}><span>${hh}h${mn}</span>`;
        slotsEl.appendChild(lab);
      }
      if (window.gsap && !reduce) gsap.from($$('.slot', slotsEl), { y: 14, autoAlpha: 0, stagger: 0.02, duration: 0.5, ease: 'power3.out' });
    }
    // Flèches de défilement des jours
    const prevB = $('.days-nav--prev', form), nextB = $('.days-nav--next', form);
    const updNav = () => {
      const max = daysEl.scrollWidth - daysEl.clientWidth - 8;
      prevB.disabled = daysEl.scrollLeft <= 8; nextB.disabled = daysEl.scrollLeft >= max;
      daysEl.classList.toggle('at-end', daysEl.scrollLeft >= max);
    };
    const page = dir => daysEl.scrollBy({ left: dir * daysEl.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
    prevB.addEventListener('click', () => page(-1)); nextB.addEventListener('click', () => page(1));
    daysEl.addEventListener('scroll', updNav, { passive: true }); addEventListener('resize', updNav);
    daysEl.setAttribute('data-lenis-prevent-wheel', '');
    form.addEventListener('click', e => { if (e.target.closest('[data-next]')) setTimeout(updNav, 60); });
    updNav();
    daysEl.addEventListener('change', e => { if (e.target.name === 'day') buildSlots(e.target.value); });
    const firstDay = $('input[name="day"]', daysEl);
    if (firstDay) { firstDay.checked = true; buildSlots(firstDay.value); }

    // Pré-sélection depuis les cartes prestations
    const mapPick = { 'Onglerie': 'Manucure russe', 'Beauté du regard': 'Beauté du regard', 'Soin du visage': 'Soin du visage', 'Soin des pieds': 'Soin des pieds', 'Blanchiment dentaire': 'Blanchiment dentaire', 'Mise en beauté': 'Mise en beauté' };
    $$('[data-pick]').forEach(a => a.addEventListener('click', () => {
      const v = mapPick[a.dataset.pick]; const inp = $(`input[name="service"][value="${v}"]`, form); if (inp) inp.checked = true;
      go(0);
    }));

    const val = () => {
      const fd = new FormData(form);
      return { service: fd.get('service'), note: (fd.get('note') || '').trim(), day: fd.get('day'), time: fd.get('time'), name: (fd.get('name') || '').trim(), phone: (fd.get('phone') || '').trim() };
    };
    function fail(msg, el) { err.textContent = msg; const p = panels[step]; p.classList.remove('shake'); void p.offsetWidth; p.classList.add('shake'); el && el.focus(); }
    function check(s) {
      const d = val(); err.textContent = '';
      if (s === 0 && !d.service) { fail('Choisissez une prestation pour continuer.', $('input[name="service"]', form)); return false; }
      if (s === 1 && (!d.day || !d.time)) { fail('Choisissez un jour et un horaire.', $('input[name="time"]:not(:disabled)', form)); return false; }
      if (s === 2) {
        if (d.name.length < 2) { fail('Indiquez votre prénom et votre nom.', $('input[name="name"]', form)); return false; }
        if (d.phone.replace(/\D/g, '').length < 10) { fail('Indiquez un numéro de téléphone valide.', $('input[name="phone"]', form)); return false; }
      }
      return true;
    }
    function go(n) {
      const prev = step; step = n;
      panels.forEach((p, i) => p.classList.toggle('is-active', i === n));
      bars.forEach((b, i) => b.classList.toggle('on', i <= n));
      err.textContent = '';
      if (n === 2) fillTicket();
      if (window.gsap && !reduce && prev !== n) gsap.fromTo(panels[n], { autoAlpha: 0, x: n > prev ? 40 : -40 }, { autoAlpha: 1, x: 0, duration: 0.7, ease: 'expo.out' });
      const lg = $('legend', panels[n]); lg && lg.setAttribute('tabindex', '-1');
      if (prev !== n) lg && lg.focus({ preventScroll: true });
    }
    function fillTicket() {
      const d = val();
      $('[data-t="service"]', form).textContent = d.service || '–';
      $('[data-t="when"]', form).textContent = d.day ? fmtLong(new Date(d.day + 'T00:00')) + ' · ' + (d.time || '').replace(':', 'h') : '–';
    }
    form.addEventListener('click', e => {
      if (e.target.closest('[data-next]')) { if (check(step)) go(step + 1); }
      if (e.target.closest('[data-prev]')) go(step - 1);
      if (e.target.closest('[data-copy]')) copyMsg();
      if (e.target.closest('[data-ics]')) downloadIcs();
    });
    form.addEventListener('change', e => { if (e.target.name === 'service' && window.innerWidth > 640) { /* reste sur l'étape */ } });

    function message() {
      const d = val();
      const when = fmtLong(new Date(d.day + 'T00:00')) + ' à ' + d.time.replace(':', 'h');
      return `Bonjour HK GLAM, je souhaite prendre rendez-vous :\n• Prestation : ${d.service}\n• Date : ${when}` + (d.note ? `\n• Précision : ${d.note}` : '') + `\n• Nom : ${d.name}\n• Tél : ${d.phone}\nMerci de me confirmer ce créneau !`;
    }
    form.addEventListener('submit', e => {
      e.preventDefault();
      for (let s = 0; s < 3; s++) if (!check(s)) { if (s !== step) go(s); check(s); return; }
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const url = `sms:${PHONE}${ios ? '&' : '?'}body=${encodeURIComponent(message())}`;
      window.location.href = url;
      const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1;
      err.style.color = '#3d7a52';
      err.textContent = mobile ? 'Votre application SMS s’ouvre avec le message prêt : il ne reste qu’à appuyer sur Envoyer.' : 'Sur ordinateur, le SMS ne peut pas toujours s’ouvrir : copiez le message et envoyez-le depuis votre téléphone au 06 59 05 75 34, ou appelez.';
      setTimeout(() => err.style.color = '', 9000);
    });
    function copyMsg() {
      if (!check(0) || !check(1) || !check(2)) return;
      const txt = message();
      const done = () => { err.style.color = '#3d7a52'; err.textContent = 'Message copié. Collez-le dans un SMS au 06 59 05 75 34.'; };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, () => prompt('Copiez ce message :', txt));
      else prompt('Copiez ce message :', txt);
    }
    function downloadIcs() {
      if (!check(0) || !check(1)) return;
      const d = val(); const [y, mo, da] = d.day.split('-'); const [hh, mm] = d.time.split(':');
      const pad = n => String(n).padStart(2, '0');
      const startDt = `${y}${mo}${da}T${hh}${mm}00`;
      const end = new Date(+y, +mo - 1, +da, +hh, +mm + 60);
      const endDt = `${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}T${pad(end.getHours())}${pad(end.getMinutes())}00`;
      const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//HK GLAM//Reservation//FR', 'BEGIN:VEVENT',
        'UID:' + Date.now() + '@hkglam', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        'DTSTART;TZID=Europe/Paris:' + startDt, 'DTEND;TZID=Europe/Paris:' + endDt,
        'SUMMARY:HK GLAM – ' + d.service + ' (à confirmer)', 'LOCATION:HK GLAM\\, 183 Av. de Strasbourg\\, 54000 Nancy',
        'DESCRIPTION:Demande de rendez-vous envoyée à HK GLAM (06 59 05 75 34). En attente de confirmation.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'rdv-hk-glam.ics';
      document.body.appendChild(a); a.click(); a.remove();
    }
  }
})();
