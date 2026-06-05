(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  function initNavbar() {
    const navbar  = $('#navbar');
    const toggle  = $('#navToggle');
    const menu    = $('#navMenu');
    if (!navbar || !toggle || !menu) return;

    on(window, 'scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    const openMenu  = () => { menu.classList.add('open'); toggle.classList.add('open'); toggle.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; };
    const closeMenu = () => { menu.classList.remove('open'); toggle.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); document.body.style.overflow=''; };

    on(toggle, 'click', () => menu.classList.contains('open') ? closeMenu() : openMenu());
    $$('.nav-link', menu).forEach(l => on(l, 'click', closeMenu));
    on(document, 'click', e => { if (menu.classList.contains('open') && !menu.contains(e.target) && !toggle.contains(e.target)) closeMenu(); });
    on(document, 'keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu(); });
  }

  function initActiveNav() {
    const sections = $$('section[id]');
    const links    = $$('.nav-link');
    if (!sections.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.id;
          links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    sections.forEach(s => obs.observe(s));
  }

  function initParticles() {
    const container = $('#heroParticles');
    if (!container) return;
    const TOTAL = window.innerWidth < 768 ? 18 : 35;
    for (let i = 0; i < TOTAL; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.cssText = `left:${Math.random()*100}%;top:${20+Math.random()*75}%;--dur:${3+Math.random()*5}s;--delay:${Math.random()*6}s;width:${1+Math.random()*3}px;height:${1+Math.random()*3}px;opacity:0;background:${Math.random()>.6?'var(--morado-light)':'var(--verde)'};`;
      container.appendChild(p);
    }
  }

  function initScrollReveal() {
    const els = $$('.reveal');
    if (!els.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const grids = '.conferencias-grid,.temas-grid,.gallery-grid,.temas-row-2';
        const delay = entry.target.closest(grids)
          ? Array.from(entry.target.parentElement.children).indexOf(entry.target) * 80 : 0;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
  }


  function initGallery() {
    const items    = $$('.gallery-item');
    const modal    = $('#galleryModal');
    const closeBtn = $('#modalClose');
    const labelEl  = $('#modalLabel');

    // FIX: modalPlaceholder debe ir DESPUÉS del guard,
    // si modal es null el querySelector lanza TypeError y rompe todo el script
    if (!modal || !items.length) return;

    const modalPlaceholder = $('.modal-placeholder', modal);

    let current = 0;
    const currentLang = () => document.documentElement.dataset.lang || 'es';

    const getLabel = (item) => {
      const ph = item.querySelector('.gallery-placeholder');
      if (!ph) return '';
      return currentLang() === 'en'
        ? (ph.dataset.labelEn || ph.dataset.label || '')
        : (ph.dataset.label || '');
    };

    const updateModalImage = () => {
      if (!modalPlaceholder) return;
      
      const clickedImg = items[current].querySelector('.gallery-img');
      const fallback = modalPlaceholder.querySelector('.modal-fallback');
      const oldImg = modalPlaceholder.querySelector('.modal-injected-img');
      if (oldImg) oldImg.remove();

      if (clickedImg) {
        const newImg = document.createElement('img');
        newImg.src = clickedImg.src;
        newImg.alt = clickedImg.alt || getLabel(items[current]);
        newImg.className = 'modal-injected-img';
        
        modalPlaceholder.style.background = 'transparent';
        
        newImg.style.position = 'absolute';
        newImg.style.top = '0';
        newImg.style.left = '0';
        newImg.style.width = '100%';
        newImg.style.height = '100%';
        newImg.style.display = 'block';
        newImg.style.objectFit = 'cover';
        newImg.style.objectPosition = 'center';
        newImg.style.borderRadius = 'inherit';

        if (fallback) fallback.style.display = 'none';
        modalPlaceholder.appendChild(newImg);
      } else {
        modalPlaceholder.style.background = '';
        if (fallback) fallback.style.display = '';
      }
    };

    const openModal = idx => {
      current = idx;
      if (labelEl) labelEl.textContent = getLabel(items[current]);
      
      // Ajuste responsive directamente en JS sin tocar el CSS
      if (window.innerWidth <= 768) {
        const modalContent = $('.modal-content', modal);
        if (modalContent) {
          modalContent.style.width = '95%';
          modalContent.style.padding = '16px';
        }
        if (modalPlaceholder) modalPlaceholder.style.aspectRatio = '4 / 3';
      }

      updateModalImage();
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => { 
      modal.hidden = true; 
      document.body.style.overflow = ''; 
      
      // Restauramos los estilos inline
      const modalContent = $('.modal-content', modal);
      if (modalContent) {
        modalContent.style.width = '';
        modalContent.style.padding = '';
      }
      if (modalPlaceholder) {
        modalPlaceholder.style.aspectRatio = '';
        modalPlaceholder.style.background = '';
      }
      
      const injectedImg = modalPlaceholder?.querySelector('.modal-injected-img');
      if (injectedImg) injectedImg.remove();
      
      const fallback = modalPlaceholder?.querySelector('.modal-fallback');
      if (fallback) fallback.style.display = '';

      items[current]?.focus(); 
    };

    const navigate = dir => { 
      current = (current + dir + items.length) % items.length; 
      if (labelEl) labelEl.textContent = getLabel(items[current]);
      updateModalImage();
    };

    items.forEach((item, i) => {
      on(item, 'click', () => openModal(i));
      on(item, 'keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(i); } });
    });
    
    on(closeBtn, 'click', closeModal);
    on($('#modalPrev'), 'click', () => navigate(-1));
    on($('#modalNext'), 'click', () => navigate(1));
    
    on(modal, 'click', e => { if (e.target === modal || e.target.classList.contains('modal-content-wrapper')) closeModal(); });
    on(document, 'keydown', e => {
      if (modal.hidden) return;
      if (e.key === 'Escape')      closeModal();
      if (e.key === 'ArrowLeft')   navigate(-1);
      if (e.key === 'ArrowRight')  navigate(1);
    });
  }


  function initBackToTop() {
    const btn = $('#backToTop');
    if (!btn) return;
    on(window, 'scroll', () => { btn.hidden = window.scrollY <= 400; }, { passive: true });
    on(btn, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }


  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(link => {
      on(link, 'click', e => {
        const href = link.getAttribute('href');
        if (href === '#') return;
        const target = $(href);
        if (!target) return;
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
      });
    });
  }


  function initCounters() {
    const stats = $$('.stat-num');
    const data  = [{ target: 50, suffix: '+' }, { target: 2, suffix: 'K+' }, { target: 2, suffix: '' }];
    if (!stats.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        const el  = entry.target;
        const idx = stats.indexOf(el);
        if (idx < 0 || !data[idx]) return;
        const { target, suffix } = data[idx];
        const start = performance.now();
        const step  = now => {
          const p = Math.min((now - start) / 1600, 1);
          el.textContent = '';
          el.appendChild(document.createTextNode(Math.round((1 - Math.pow(1-p,3)) * target)));
          const sup = document.createElement('sup'); sup.textContent = suffix; el.appendChild(sup);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    stats.forEach(s => obs.observe(s));
  }


  function initCardTilt() {
    if (window.matchMedia('(hover: none)').matches) return;
    $$('.conf-card, .tema-card, .etica-card').forEach(card => {
      on(card, 'mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform = `translateY(-4px) rotateX(${-y*5}deg) rotateY(${x*5}deg)`;
      });
      on(card, 'mouseleave', () => { card.style.transform = ''; });
    });
  }


  function initLangSwitch() {
    const html = document.documentElement;

    function applyLang(lang) {
      html.setAttribute('data-lang', lang);
      html.setAttribute('lang', lang === 'en' ? 'en' : 'es');

      // Traduce textos generales
      $$('[data-es]').forEach(el => {
        const text = el.dataset[lang];
        if (text === undefined) return;
        const hasChildElements = Array.from(el.childNodes).some(n => n.nodeType === 1);
        if (!hasChildElements) {
          el.textContent = text;
        }
      });

      // Lógica original tuya para ocultar columnas del glosario
      $$('.gl-def-es').forEach(td => { td.hidden = (lang === 'en'); });
      $$('.gl-def-en').forEach(td => { td.hidden = (lang === 'es'); });

      // Placeholder del buscador
      const search = $('#glossarySearch');
      if (search) {
        search.placeholder = lang === 'en'
          ? (search.dataset.placeholderEn || 'Search term...')
          : (search.dataset.placeholderEs || 'Buscar término...');
      }

      // Actualizar visualmente todos los botones de idioma
      $$('.lang-switch').forEach(btn2 => {
        const flagEl = btn2.querySelector('.lang-switch-flag');
        const textEl = btn2.querySelector('.lang-switch-text');
        if (lang === 'en') {
          if (flagEl) flagEl.textContent = '🇺🇸';
          if (textEl) textEl.textContent = 'EN';
          btn2.setAttribute('aria-label', 'Switch to Spanish');
          btn2.title = 'Switch to Spanish';
        } else {
          if (flagEl) flagEl.textContent = '🇨🇴';
          if (textEl) textEl.textContent = 'ES';
          btn2.setAttribute('aria-label', 'Cambiar a inglés');
          btn2.title = 'Cambiar a inglés';
        }
      });

      try { localStorage.setItem('coltic-lang', lang); } catch(e) {}
    }

    // Eliminamos el bloque que frenaba la ejecución y atamos el evento a TODOS los botones
    const langBtns = $$('.lang-switch');
    langBtns.forEach(btn => {
      on(btn, 'click', () => {
        const current = html.dataset.lang || 'es';
        applyLang(current === 'es' ? 'en' : 'es');
      });
    });

    // Cargar preferencia guardada
    try {
      const saved = localStorage.getItem('coltic-lang');
      if (saved && saved !== 'es') applyLang(saved);
      else applyLang('es'); // Forzamos ejecución inicial por seguridad
    } catch(e) {}
  }


  function initGlossary() {
    const searchInput = $('#glossarySearch');
    const filterBtns  = $$('.filter-btn');
    const rows        = $$('#glossaryBody tr');
    const emptyMsg    = $('#glossaryEmpty');
    const countEl     = $('#visibleCount');
    if (!searchInput && !filterBtns.length) return;

    let currentCat   = 'all';
    let currentQuery = '';

    function applyFilters() {
      let visible = 0;
      rows.forEach(row => {
        const catOk = currentCat === 'all' || row.dataset.cat === currentCat;
        const qOk   = !currentQuery || row.textContent.toLowerCase().includes(currentQuery);
        row.classList.toggle('hidden', !(catOk && qOk));
        if (catOk && qOk) visible++;
      });
      if (countEl) countEl.textContent = visible;
      if (emptyMsg) emptyMsg.hidden = visible > 0;
    }

    if (searchInput) on(searchInput, 'input', e => { currentQuery = e.target.value.toLowerCase().trim(); applyFilters(); });
    filterBtns.forEach(btn => {
      on(btn, 'click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCat = btn.dataset.cat;
        applyFilters();
      });
    });
  }


  function init() {
    initNavbar();
    initActiveNav();
    initParticles();
    initScrollReveal();
    initGallery();
    initBackToTop();
    initSmoothScroll();
    initCounters();
    initCardTilt();
    initLangSwitch();
    initGlossary();

    $$('.hero .reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 200 + i * 150);
    });
  }

  if (document.readyState === 'loading') {
    on(document, 'DOMContentLoaded', init);
  } else {
    init();
  }

})();