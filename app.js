(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const image = $('diagram-image');
  const canvas = $('canvas');
  const viewer = $('viewer');
  const select = $('diagram-select');
  let panzoom;
  let currentView = '';
  let currentIndex = -1;
  let loaded = false;
  let requestId = 0;
  let naturalWidth = 0;
  let naturalHeight = 0;
  let restoreFocus;
  const controls = ['zoom-in', 'zoom-out', 'reset'];

  function fitImage() {
    if (!loaded || !canvas.clientWidth || !canvas.clientHeight) return;
    const fit = Math.min((canvas.clientWidth - 48) / naturalWidth, (canvas.clientHeight - 48) / naturalHeight, 1);
    image.style.width = `${naturalWidth * fit}px`;
    image.style.height = `${naturalHeight * fit}px`;
    panzoom?.reset({ animate: false });
  }

  function setLoading(state, message = 'Loading diagram…') {
    loaded = !state;
    image.classList.toggle('loading', state);
    $('load-status').hidden = !state;
    $('load-status').textContent = message;
    controls.forEach((id) => { $(id).disabled = state || !panzoom; });
  }

  function loadSheet() {
    const sheet = window.DIAGRAMS[currentView].sheets[currentIndex];
    const thisRequest = ++requestId;
    panzoom?.destroy();
    panzoom = null;
    setLoading(true);
    $('zoom-level').textContent = '100%';
    image.removeAttribute('style');
    image.alt = `${sheet.title}. ${sheet.description}`;
    $('sheet-title').textContent = sheet.title;
    $('sample-badge').hidden = !sheet.sample;
    const path = sheet.file.split('/').map(encodeURIComponent).join('/');
    $('download').href = path;
    $('download').download = sheet.file.split('/').pop();
    // Preload to keep an older request from replacing a newly selected sheet.
    const preload = new Image();
    preload.onload = () => {
      if (thisRequest !== requestId) return;
      image.onload = () => {
        if (thisRequest !== requestId) return;
        naturalWidth = image.naturalWidth || 1000;
        naturalHeight = image.naturalHeight || 700;
        setLoading(false);
        fitImage();
        if (typeof window.Panzoom === 'function') {
          panzoom = window.Panzoom(image, { maxScale: 12, minScale: 0.25, step: 0.25, cursor: 'grab', canvas: true, animate: false });
          controls.forEach((id) => { $(id).disabled = false; });
        } else {
          $('load-status').textContent = 'Zoom controls could not load. Use the download button to view the SVG.';
          $('load-status').hidden = false;
        }
      };
      image.src = path;
    };
    preload.onerror = () => {
      if (thisRequest !== requestId) return;
      setLoading(true, 'Diagram unavailable. Check its file path in diagrams.js, then reload the page.');
    };
    preload.src = path;
  }

  function route() {
    const [requested = 'class', sheetNumber = '1'] = location.hash.slice(1).split('/');
    const view = Object.hasOwn(window.DIAGRAMS, requested) ? requested : 'class';
    const viewChanged = currentView !== view;
    document.querySelectorAll('[data-view]').forEach((link) => {
      if (link.dataset.view === view) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    const data = window.DIAGRAMS[view];
    const parsedIndex = Number(sheetNumber) - 1;
    const index = Number.isInteger(parsedIndex) && parsedIndex >= 0 && parsedIndex < data.sheets.length ? parsedIndex : 0;
    if (!viewChanged && currentIndex === index) return;
    currentView = view;
    currentIndex = index;
    $('breadcrumb').textContent = data.title;
    document.title = `${data.title} · Simulation Atlas`;
    $('diagram-title').textContent = data.title;
    $('diagram-category').textContent = data.category;
    $('diagram-intro').textContent = data.intro;
    $('next-diagram').href = `#${data.next}`;
    $('next-diagram').textContent = `Next: ${data.nextLabel} →`;
    select.replaceChildren(...data.sheets.map((sheet, i) => {
      const option = document.createElement('option');
      option.value = String(i); option.textContent = `${String(i + 1).padStart(2, '0')} · ${sheet.title}`;
      return option;
    }));
    select.value = String(index);
    loadSheet();
    if (viewChanged) window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function syncFullscreen() {
    const active = document.fullscreenElement === viewer || viewer.classList.contains('expanded');
    $('fullscreen').setAttribute('aria-label', active ? 'Exit full screen' : 'Enter full screen');
    $('fullscreen').title = active ? 'Exit full screen (Esc)' : 'Full screen (F)';
    $('fullscreen').textContent = active ? '✕' : '⛶';
    requestAnimationFrame(fitImage);
  }

  function closeFallback() {
    viewer.classList.remove('expanded');
    document.body.style.overflow = '';
    document.querySelectorAll('[data-fullscreen-inert]').forEach((el) => { el.inert = false; el.removeAttribute('data-fullscreen-inert'); });
    syncFullscreen();
    restoreFocus?.focus();
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement === viewer) { await document.exitFullscreen(); return; }
    if (viewer.classList.contains('expanded')) { closeFallback(); return; }
    restoreFocus = document.activeElement;
    if (viewer.requestFullscreen) {
      try { await viewer.requestFullscreen(); return; } catch { /* Use an in-page full-screen viewer when unavailable. */ }
    }
    viewer.classList.add('expanded');
    document.body.style.overflow = 'hidden';
    let child = viewer;
    while (child.parentElement && child.parentElement !== document.documentElement) {
      for (const sibling of child.parentElement.children) {
        if (sibling !== child && !sibling.inert) { sibling.inert = true; sibling.setAttribute('data-fullscreen-inert', ''); }
      }
      child = child.parentElement;
    }
    syncFullscreen();
    $('fullscreen').focus();
  }

  select.addEventListener('change', () => { location.hash = `${currentView}/${Number(select.value) + 1}`; });
  $('zoom-in').addEventListener('click', () => panzoom?.zoomIn());
  $('zoom-out').addEventListener('click', () => panzoom?.zoomOut());
  $('reset').addEventListener('click', fitImage);
  $('fullscreen').addEventListener('click', toggleFullscreen);
  canvas.addEventListener('wheel', (event) => { if (panzoom) panzoom.zoomWithWheel(event); }, { passive: false });
  canvas.addEventListener('dblclick', fitImage);
  image.addEventListener('panzoomchange', (event) => { $('zoom-level').textContent = `${Math.round(event.detail.scale * 100)}%`; });
  viewer.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLSelectElement || event.ctrlKey || event.metaKey || event.altKey) return;
    const keys = ['+', '=', '-', '0', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'f', 'F'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    if (event.key === '+' || event.key === '=') panzoom?.zoomIn();
    if (event.key === '-') panzoom?.zoomOut();
    if (event.key === '0') fitImage();
    if (event.key.toLowerCase() === 'f') toggleFullscreen();
    const delta = 60 / (panzoom?.getScale() || 1);
    const offsets = { ArrowLeft: [delta, 0], ArrowRight: [-delta, 0], ArrowUp: [0, delta], ArrowDown: [0, -delta] };
    if (offsets[event.key]) panzoom?.pan(...offsets[event.key], { relative: true });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && viewer.classList.contains('expanded')) closeFallback();
    if (event.key === 'Tab' && viewer.classList.contains('expanded')) {
      const focusables = [...viewer.querySelectorAll('a[href], button:not(:disabled), [tabindex="0"]')];
      const first = focusables[0], last = focusables.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('fullscreenchange', syncFullscreen);
  new ResizeObserver(() => { if (loaded) fitImage(); }).observe(canvas);
  window.addEventListener('hashchange', route);
  route();
})();
