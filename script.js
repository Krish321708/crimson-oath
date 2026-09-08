(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = motionPreference.matches;

  // Real anchors preserve keyboard navigation, deep links and browser history.
  $$('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
    history.pushState(null, '', link.hash);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }));

  const tabs = $$('.tabs [role="tab"]');
  const pages = $$('.law-page');
  function selectLaw(index, focus = false) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      pages[i].hidden = i !== index;
    });
    if (focus) tabs[index].focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectLaw(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectLaw(next, true);
    });
  });

  // Native dialog supplies focus containment, Escape and inert background.
  const dialog = $('#oath');
  let origin;
  $$('[data-oath]').forEach(button => button.addEventListener('click', () => {
    origin = button;
    dialog.showModal();
    document.body.classList.add('modal-open');
    $('[data-close]').focus();
  }));
  $('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    origin?.focus({ preventScroll: true });
  });
  $('.seal-button').addEventListener('click', event => {
    event.currentTarget.disabled = true;
    event.currentTarget.textContent = 'The oath is sealed';
    $('.modal-seal').classList.add('sealed');
    $('.seal-status').textContent = 'Your word now stands without witness.';
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    $$('.reveal').forEach(element => revealObserver.observe(element));
    if (!reduced) document.documentElement.classList.add('motion-ready');
  }

  const hero = $('#gate'), realm = $('#realm'), relics = $('#relics'), finale = $('#finale');
  const nav = $$('.header nav a');
  const navSections = nav.map(link => document.getElementById(link.hash.slice(1)));
  const progress = $('.progress');
  const clamp = value => Math.max(0, Math.min(1, value));
  let metrics, frame = 0, previousTime = 0, activeId = '';
  const current = Object.create(null);
  const targets = Object.create(null);
  const properties = [
    [hero, '--plane-y'], [hero, '--ring-y'], [hero, '--word-x'],
    [hero, '--knight-y'], [hero, '--copy-y'], [realm, '--realm-y'],
    [realm, '--realm-panel-y'], [relics, '--relic-y'],
    [relics, '--relic-back-x'], [relics, '--relic-back-y'], [finale, '--final-x']
  ];
  function measure() {
    // Read geometry together, and only on resize or asset load.
    const bounds = element => ({ top: element.getBoundingClientRect().top + scrollY, height: element.offsetHeight });
    metrics = {
      height: innerHeight,
      max: Math.max(1, document.documentElement.scrollHeight - innerHeight),
      hero: bounds(hero), realm: bounds(realm), relics: bounds(relics), finale: bounds(finale),
      sections: navSections.map(element => ({ id: element.id, top: bounds(element).top }))
    };
    schedule();
  }
  function setTargets() {
    const { height, hero: h, realm: r, relics: a, finale: f } = metrics;
    const hp = clamp((scrollY - h.top) / Math.max(1, h.height - height));
    const rp = clamp((scrollY + height - r.top) / (r.height + height)) - 0.5;
    const ap = clamp((scrollY + height - a.top) / (a.height + height)) - 0.5;
    const fp = clamp((scrollY + height - f.top) / (f.height + height)) - 0.5;
    Object.assign(targets, {
      '--plane-y': hp * -80, '--ring-y': hp * 35, '--word-x': hp * -60,
      '--knight-y': hp * 45, '--copy-y': hp * -60,
      '--realm-y': rp * -100, '--realm-panel-y': rp * -80,
      '--relic-y': ap * -65, '--relic-back-x': ap * 24,
      '--relic-back-y': ap * 70, '--final-x': fp * -70
    });
  }
  function update(time) {
    frame = 0;
    if (!metrics) return;
    const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16;
    previousTime = time;
    const damping = 1 - Math.exp(-elapsed / 115);
    progress.style.transform = `scaleX(${clamp(scrollY / metrics.max)})`;
    // The last section above the reading line stays selected between chapters.
    const readingLine = scrollY + metrics.height * 0.35;
    const section = metrics.sections.filter(item => item.top <= readingLine).at(-1) || metrics.sections[0];
    if (section.id !== activeId) {
      activeId = section.id;
      nav.forEach(link => {
        if (link.hash === `#${activeId}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    setTargets();
    let unsettled = false;
    properties.forEach(([element, name]) => {
      const target = reduced ? 0 : targets[name];
      const value = current[name] ?? target;
      const next = reduced ? 0 : value + (target - value) * damping;
      const settled = Math.abs(target - next) < 0.08;
      current[name] = settled ? target : next;
      element.style.setProperty(name, `${current[name].toFixed(2)}px`);
      unsettled ||= !settled;
    });
    // No permanent animation loop: stop once the planes settle.
    if (unsettled) frame = requestAnimationFrame(update);
    else previousTime = 0;
  }
  function schedule() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(update);
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', measure, { passive: true });
  addEventListener('pageshow', measure);
  $$('img').forEach(img => { if (!img.complete) img.addEventListener('load', measure, { once: true }); });
  document.fonts?.ready.then(measure);
  motionPreference.addEventListener('change', event => {
    reduced = event.matches;
    document.documentElement.classList.toggle('motion-ready', !reduced);
    measure();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; previousTime = 0; }
    else measure();
  });
  measure();
})();
