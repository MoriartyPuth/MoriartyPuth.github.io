(() => {
  // ── Inject cursor on every page ────────────────────────────────────────────
  if (!document.querySelector('.cursor-dot')) {
    const dot = document.createElement('div'); dot.className = 'cursor-dot';
    const ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.prepend(ring); document.body.prepend(dot);
  }

  // ── Boot Sequence (index only, once per session) ───────────────────────────
  const bootScreen = document.getElementById('boot-screen');
  if (bootScreen) {
    const alreadyBooted = sessionStorage.getItem('booted');
    if (alreadyBooted) {
      bootScreen.remove();
    } else {
      sessionStorage.setItem('booted', '1');
      const container = bootScreen.querySelector('.boot-lines');
      const lines = [
        { text: '$ ssh moriarty@portfolio.sec', delay: 0 },
        { text: '> Establishing secure connection...', delay: 380 },
        { text: '> Loading security modules...', delay: 760, bar: true },
        { text: '> Authenticating credentials...', delay: 1350, ok: true },
        { text: '> Mounting portfolio filesystem...', delay: 1750, ok: true },
        { text: '', delay: 2100 },
        { text: 'ACCESS GRANTED', delay: 2350, granted: true },
      ];
      lines.forEach(({ text, delay, bar, ok, granted }) => {
        setTimeout(() => {
          const div = document.createElement('div');
          div.className = 'boot-line' + (granted ? ' boot-granted' : '');
          if (bar) {
            div.innerHTML = `${text} <span class="boot-bar">[<span class="boot-fill"></span>] 100%</span>`;
            setTimeout(() => div.querySelector('.boot-fill').classList.add('filled'), 30);
          } else if (ok) {
            div.innerHTML = `${text} <span class="boot-ok">[ OK ]</span>`;
          } else {
            div.textContent = text;
          }
          container.appendChild(div);
        }, delay);
      });
      setTimeout(() => {
        bootScreen.classList.add('boot-exit');
        setTimeout(() => bootScreen.remove(), 700);
      }, 3300);
    }
  }

  // ── Custom Cursor ──────────────────────────────────────────────────────────
  const cursorDot  = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');
  if (cursorDot && cursorRing) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursorDot.style.transform = `translate(${mx}px,${my}px)`;
    });
    const animRing = () => {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      cursorRing.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(animRing);
    };
    animRing();
    document.querySelectorAll('a,button,.featured-item,.lab-card,.repo-card,.wr-card,.live-card,.tool-card').forEach(el => {
      el.addEventListener('mouseenter', () => { cursorRing.classList.add('cursor-hover'); cursorDot.classList.add('cursor-hover'); });
      el.addEventListener('mouseleave', () => { cursorRing.classList.remove('cursor-hover'); cursorDot.classList.remove('cursor-hover'); });
    });
  }

  // ── Inject card-glint + terminal bar into cards ────────────────────────────
  document.querySelectorAll('.featured-item,.repo-card,.wr-card,.lab-card').forEach(card => {
    if (!card.querySelector('.card-glint')) {
      const g = document.createElement('div'); g.className = 'card-glint';
      card.insertBefore(g, card.firstChild);
    }
  });

  // Terminal bar on lab cards (category pages)
  document.querySelectorAll('.lab-card').forEach(card => {
    if (card.querySelector('.lab-terminal-bar')) return;
    const a = card.querySelector('h3 a');
    const name = a ? a.textContent.trim().toLowerCase().replace(/\s+/g,'-') : 'lab';
    const bar = document.createElement('div');
    bar.className = 'lab-terminal-bar';
    bar.innerHTML = `<span class="ltp">~/labs/$</span> <span class="ltc">${name}</span>`;
    card.insertBefore(bar, card.firstChild);
  });

  // ── Lab Card Banners ───────────────────────────────────────────────────────
  document.querySelectorAll('.lab-card').forEach(card => {
    if (card.querySelector('.lab-banner')) return;
    const iconEl = card.querySelector('.lab-icon');
    const iconClass = iconEl ? (Array.from(iconEl.classList).find(c => c !== 'lab-icon') || 'lab') : 'lab';
    const svg = iconEl?.querySelector('svg')?.outerHTML || '';
    const hex = () => (Math.random() * 255 | 0).toString(16).padStart(2, '0');
    const coords = `${hex()}:${hex()}:${hex()}`;
    const banner = document.createElement('div');
    banner.className = `lab-banner lb-${iconClass}`;
    banner.innerHTML = `<div class="lb-grid"></div><div class="lb-scan"></div><div class="lb-icon-wrap">${svg}</div><div class="lb-corners"><span></span><span></span><span></span><span></span></div><div class="lb-coords">${coords}</div>`;
    card.insertBefore(banner, card.firstChild);
  });

  // ── Text Scramble ──────────────────────────────────────────────────────────
  const CHARS = '!<>-_\\/[]{}=+*^?#ABCDEFabcdef0123456789@$%';
  function scramble(el) {
    const original = el.dataset.scramble || el.textContent;
    el.dataset.scramble = original;
    let frame = 0;
    const queue = original.split('').map(char => ({ to: char, start: Math.floor(Math.random()*10), end: Math.floor(Math.random()*10)+16, char: '' }));
    const tick = () => {
      let done = 0;
      el.textContent = queue.map((item, i) => {
        if (frame >= item.end) { done++; return item.to; }
        if (frame >= item.start) {
          if (!item.char || Math.random()<0.28) queue[i].char = CHARS[Math.floor(Math.random()*CHARS.length)];
          return queue[i].char;
        }
        return item.to;
      }).join('');
      if (done < queue.length) { frame++; requestAnimationFrame(tick); }
    };
    requestAnimationFrame(tick);
  }
  document.querySelectorAll('[data-scramble]').forEach(el => el.addEventListener('mouseenter', () => scramble(el)));
  const heroTitle = document.querySelector('.hero-title[data-scramble]');
  if (heroTitle) setTimeout(() => scramble(heroTitle), bootScreen ? 3500 : 200);

  // ── 3D Card Tilt ──────────────────────────────────────────────────────────
  document.querySelectorAll('.featured-item,.repo-card,.wr-card,.lab-card').forEach(card => {
    const glint = card.querySelector('.card-glint');
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const rx = ((y/r.height)-0.5)*-12, ry = ((x/r.width)-0.5)*12;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      if (glint) glint.style.background = `radial-gradient(circle at ${x}px ${y}px,rgba(34,197,94,0.08) 0%,transparent 65%)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      if (glint) glint.style.background = '';
    });
  });

  // ── Scroll Reveal ──────────────────────────────────────────────────────────
  const sectionSelectors = '.spotlight,.live-projects,.writeups-section,.stats-row,.pinned-section,.pinned-grid,.bubble-suite,.skills-section,.tooling-section,.certs-section,.featured-categories,.recent-activity,.cta-section,.cat-hero,.labs-grid';
  const childSelectors   = '.featured-item,.lab-card,.repo-card,.wr-card,.category-card,.skill-item,.cert-item,.tool-card,.live-card,.activity-item';

  document.querySelectorAll(sectionSelectors).forEach(el => el.classList.add('sr'));
  document.querySelectorAll(childSelectors).forEach((el, i) => {
    el.classList.add('sr');
    el.style.transitionDelay = `${(i % 5) * 0.08}s`;
  });

  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('sr-in'); revealIO.unobserve(e.target); } });
  }, { threshold: 0.06 });
  document.querySelectorAll('.sr').forEach(el => revealIO.observe(el));

  // ── Stats Count-up ─────────────────────────────────────────────────────────
  const statEls = document.querySelectorAll('.stat-number[data-target]');
  if (statEls.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target, target = parseInt(el.dataset.target, 10);
        let cur = 0; const step = Math.max(1, target/40);
        const t = setInterval(() => { cur = Math.min(cur+step,target); el.textContent = Math.floor(cur); if (cur>=target) clearInterval(t); }, 28);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    statEls.forEach(el => io.observe(el));
  }

  // ── Session Timer ──────────────────────────────────────────────────────────
  const timerEl = document.querySelector('.session-timer');
  if (timerEl) {
    const t0 = Date.now();
    setInterval(() => {
      const s = Math.floor((Date.now()-t0)/1000);
      timerEl.textContent = [Math.floor(s/3600), Math.floor((s%3600)/60), s%60].map(n=>String(n).padStart(2,'0')).join(':');
    }, 1000);
  }

  // ── nmap Easter Egg ────────────────────────────────────────────────────────
  let nmapBuf = '';
  const nmapLines = [
    { t: 'Starting Nmap 7.94 ( https://nmap.org )', c: '' },
    { t: 'Scanning moriarty.portfolio (127.0.0.1) ...', c: '' },
    { t: '', c: '' },
    { t: 'PORT      STATE  SERVICE      VERSION', c: 'nmap-header' },
    { t: '22/tcp    open   ssh          OpenSSH 9.3p2', c: 'nmap-open' },
    { t: '80/tcp    open   http         nginx 1.24.0', c: 'nmap-open' },
    { t: '443/tcp   open   ssl/https    nginx 1.24.0', c: 'nmap-open' },
    { t: '8080/tcp  open   http-proxy   bubble-scanner v2.1', c: 'nmap-open' },
    { t: '9001/tcp  open   recon        sila-entropy v1.0', c: 'nmap-open' },
    { t: '', c: '' },
    { t: 'Nmap done: 1 IP address (1 host up) scanned in 2.47s', c: 'nmap-done-line' },
  ];
  function showNmap() {
    if (document.getElementById('nmap-popup')) return;
    const popup = document.createElement('div'); popup.id = 'nmap-popup';
    popup.innerHTML = `<div class="nmap-titlebar"><span>$ nmap -sV -p- moriarty.portfolio</span><button class="nmap-close">✕</button></div><div class="nmap-body"></div>`;
    document.body.appendChild(popup);
    const body = popup.querySelector('.nmap-body');
    popup.querySelector('.nmap-close').addEventListener('click', () => popup.remove());
    nmapLines.forEach(({ t, c }, i) => {
      setTimeout(() => {
        const div = document.createElement('div');
        div.className = 'nmap-line' + (c ? ' '+c : '');
        div.textContent = t;
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
      }, i * 200);
    });
    setTimeout(() => { if (popup.parentNode) { popup.classList.add('nmap-fade'); setTimeout(()=>popup.remove(),600); } }, 9000);
  }
  document.addEventListener('keydown', e => {
    if (e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return;
    nmapBuf = (nmapBuf + e.key).slice(-4);
    if (nmapBuf.toLowerCase()==='nmap') { nmapBuf=''; showNmap(); }
  });

  // ── Mobile Menu ────────────────────────────────────────────────────────────
  const menuBtn = document.querySelector('[data-menu]');
  const sidebar  = document.querySelector('.sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.querySelectorAll('.nav a').forEach(l => l.addEventListener('click', () => sidebar.classList.remove('open')));
    document.addEventListener('keydown', e => { if (e.key==='Escape') sidebar.classList.remove('open'); });
  }

  // ── Search ─────────────────────────────────────────────────────────────────
  const searchInput = document.querySelector('.search input');
  if (!searchInput) return;
  const cards2 = Array.from(document.querySelectorAll('.card'));
  const resultsEl = document.querySelector('[data-search-results]');
  const idx = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];
  const esc = v => v.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]||c);
  const renderResults = (items, query) => {
    if (!resultsEl) return;
    if (!query) { resultsEl.classList.remove('active'); resultsEl.innerHTML=''; return; }
    resultsEl.classList.add('active');
    if (!items.length) { resultsEl.innerHTML=`<div class="search-result empty">No results for "${esc(query)}".</div>`; return; }
    resultsEl.innerHTML = items.slice(0,8).map(item => {
      const tags=(item.tags||[]).slice(0,3).map(t=>`<span class="pill">${esc(t)}</span>`).join('');
      return `<a class="search-result" href="${esc(item.url)}"><div class="search-result-title">${esc(item.title)}</div><div class="search-result-meta">${esc(item.summary||'')}</div><div class="search-result-tags">${tags}</div></a>`;
    }).join('');
  };
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    cards2.forEach(c => { c.style.display = q ? (c.textContent.toLowerCase().includes(q)?'':'none') : ''; });
    if (!q) { renderResults([],''); return; }
    const terms = q.split(/\s+/);
    renderResults(idx.filter(item => { const h=`${item.title} ${item.summary} ${(item.tags||[]).join(' ')}`.toLowerCase(); return terms.every(t=>h.includes(t)); }), q);
  });
})();
