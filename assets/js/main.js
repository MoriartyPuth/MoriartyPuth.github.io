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

  // ── Gobuster Feed ──────────────────────────────────────────────────────────
  const gobFeed = document.getElementById('gobuster-feed');
  if (gobFeed) {
    const paths = [
      { p: '/api/v1/auth',       code: 200, size: '892' },
      { p: '/api/v1/users',      code: 403, size: '—' },
      { p: '/.git/config',       code: 200, size: '294',   flag: true },
      { p: '/admin',             code: 302, size: '—' },
      { p: '/api/v1/reports',    code: 401, size: '—' },
      { p: '/uploads',           code: 403, size: '—' },
      { p: '/api/health',        code: 200, size: '48' },
      { p: '/swagger.json',      code: 200, size: '18432', flag: true },
      { p: '/api/v1/internal',   code: 200, size: '2841',  flag: true },
    ];
    const start = bootScreen ? 4400 : 700;
    paths.forEach(({ p, code, size, flag }, i) => {
      setTimeout(() => {
        const d = document.createElement('div');
        d.className = 'gob-line' + (flag ? ' gob-flag' : '');
        const cc = code === 200 ? 'gob-200' : code >= 300 && code < 400 ? 'gob-3xx' : 'gob-err';
        d.innerHTML = `<span class="gob-plus">[+]</span> <span class="gob-path">${p}</span> <span class="${cc}">${code}</span> <span class="gob-size">[${size}]</span>${flag ? ' <span class="gob-bang">◀ interesting</span>' : ''}`;
        gobFeed.appendChild(d);
      }, start + i * 240);
    });
  }

  // ── John the Ripper (Sidebar Name Cracker) ─────────────────────────────────
  const sidebarH1 = document.querySelector('.sidebar .brand h1');
  if (sidebarH1) {
    const real = sidebarH1.textContent;
    const lbl = document.createElement('div');
    lbl.className = 'jtr-label';
    lbl.textContent = 'john --wordlist=rockyou.txt hash.txt';
    sidebarH1.after(lbl);
    const HEX = '0123456789abcdefABCDEF$!@#%&*?';
    const crack = () => {
      let tick = 0; const steps = 22;
      const iv = setInterval(() => {
        sidebarH1.textContent = real.split('').map((c, i) => {
          if (c === ' ') return ' ';
          return Math.random() < tick / steps ? c : HEX[Math.floor(Math.random() * HEX.length)];
        }).join('');
        if (++tick > steps) {
          clearInterval(iv);
          sidebarH1.textContent = real;
          lbl.textContent = '✓ CRACKED  [00:00:03]';
          lbl.classList.add('jtr-done');
          setTimeout(() => lbl.remove(), 3200);
        }
      }, 75);
    };
    setTimeout(crack, bootScreen ? 4200 : 900);
  }

  // ── Nikto Scan (scroll-triggered) ─────────────────────────────────────────
  const niktoFill = document.getElementById('nikto-fill');
  if (niktoFill) {
    const niktoLog = document.getElementById('nikto-log');
    const niktoCount = document.getElementById('nikto-count');
    const niktoFindings = document.getElementById('nikto-findings');
    const niktoLines = [
      '+ Server: nginx/1.24.0',
      '+ /: Uncommon header X-Powered-By found, with contents: Express',
      '+ /.git/config: Git config file found — source code exposed',
      '+ /swagger.json: Swagger API docs exposed without auth',
      '+ /api/v1/internal: Unauthenticated endpoint returns 200',
      '+ 6577 requests: 3 item(s) reported on remote host',
    ];
    const nikIO = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      nikIO.disconnect();
      let cur = 0;
      const t = setInterval(() => {
        cur = Math.min(cur + 109, 6577);
        niktoFill.style.width = (cur / 6577 * 100).toFixed(2) + '%';
        if (niktoCount) niktoCount.textContent = cur.toLocaleString();
        if (cur >= 6577) clearInterval(t);
      }, 28);
      let findings = 0;
      niktoLines.forEach((line, i) => {
        setTimeout(() => {
          if (niktoLog) {
            const d = document.createElement('div');
            d.className = 'nikto-log-line' + (line.startsWith('+') ? ' nkl-found' : '');
            d.textContent = line;
            niktoLog.appendChild(d);
          }
          if (line.startsWith('+') && !line.includes('Server') && !line.includes('header') && niktoFindings) {
            niktoFindings.textContent = ++findings;
          }
        }, 800 + i * 500);
      });
    }, { threshold: 0.2 });
    nikIO.observe(niktoFill);
  }

  // ── Burp Suite Raw Request Overlay ────────────────────────────────────────
  const burpData = [
    `GET /api/v1/vehicles/1043 HTTP/1.1\nHost: ees.gov.kh\nAuthorization: Bearer eyJhbGciOiJIUzI1NiJ9...\nX-User-ID: 1042\n\n◀ Response ▶\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{"id":1043,"plate":"RR-4821",\n "owner":"[REDACTED]",\n "bureau":"Law Enforcement MoI"}`,
    `GET /api/complaints?userId=1 HTTP/1.1\nHost: css-gdin.gov.kh\nCookie: JSESSIONID=3f8ab21c...\n\n◀ Response ▶\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{"total":1247,"page":1,\n "records":[{"id":1,"name":"[REDACTED]",\n "complaint":"...","status":"open"}]}`,
    `POST /api/admin/users/reset HTTP/1.1\nHost: ctf.aupp.edu.kh\nContent-Type: application/json\nAuthorization: Bearer <user_token>\n\n{"userId":"*"}\n\n◀ Response ▶\n\nHTTP/1.1 200 OK\n\n{"status":"ok","affected":142}`
  ];
  document.querySelectorAll('.featured-item.breach-card').forEach((card, i) => {
    if (card.querySelector('.burp-overlay')) return;
    const ov = document.createElement('div');
    ov.className = 'burp-overlay';
    ov.innerHTML = `<div class="burp-topbar"><span class="burp-dots"><i class="bd-r"></i><i class="bd-y"></i><i class="bd-g"></i></span><span class="burp-title">Burp Suite — Repeater</span><button class="burp-close">✕</button></div><pre class="burp-raw">${burpData[i] || ''}</pre>`;
    card.appendChild(ov);
    const hint = document.createElement('div');
    hint.className = 'burp-hint';
    hint.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> raw request`;
    card.appendChild(hint);
    hint.addEventListener('click', e => { e.stopPropagation(); ov.classList.add('active'); });
    ov.querySelector('.burp-close').addEventListener('click', e => { e.stopPropagation(); ov.classList.remove('active'); });
  });

  // ── Reverse Shell Listener ─────────────────────────────────────────────────
  if (!document.getElementById('rev-shell')) {
    const rs = document.createElement('div');
    rs.id = 'rev-shell';
    rs.innerHTML = `<div class="rs-bar"><span class="rs-nc">nc -lvnp 4444</span><button class="rs-close">✕</button></div><div id="rs-body" class="rs-body"><div class="rs-line rs-dim">Listening on [0.0.0.0] port 4444</div></div>`;
    document.body.appendChild(rs);
    const rsBody = document.getElementById('rs-body');
    rs.querySelector('.rs-close').addEventListener('click', () => rs.remove());
    const add = (text, cls, delay) => setTimeout(() => {
      const d = document.createElement('div');
      d.className = 'rs-line' + (cls ? ' ' + cls : '');
      d.textContent = text;
      rsBody.appendChild(d);
      rsBody.scrollTop = rsBody.scrollHeight;
    }, delay);
    add('Connection received on 10.10.14.1 52341', 'rs-conn', 3800);
    add('id', 'rs-input', 4600);
    add('uid=0(root) gid=0(root) groups=0(root)', 'rs-root', 5200);
    add('moriarty@target:~# ▋', 'rs-prompt', 5900);
  }

  // ── Wireshark Packet Strip ─────────────────────────────────────────────────
  if (!document.getElementById('ws-strip')) {
    const pkts = [
      '14:23:01.124  10.10.14.1 → 192.168.1.1  TCP  [SYN] :443',
      '14:23:01.126  192.168.1.1 → 10.10.14.1  TCP  [SYN,ACK]',
      '14:23:01.129  10.10.14.1 → 192.168.1.1  HTTP GET /api/v1/users',
      '14:23:01.132  192.168.1.1 → 10.10.14.1  HTTP 200 OK  1247 bytes',
      '14:23:01.890  10.10.14.1 → 192.168.1.1  HTTP GET /api/v1/vehicles/1043',
      '14:23:01.894  192.168.1.1 → 10.10.14.1  HTTP 200 OK  892 bytes',
      '14:23:02.101  10.10.14.1 → 192.168.1.1  HTTP POST /api/admin/reset',
      '14:23:02.108  192.168.1.1 → 10.10.14.1  HTTP 200 OK  PWNED',
    ];
    const ws = document.createElement('div');
    ws.id = 'ws-strip';
    const inner = pkts.concat(pkts).map(p => `<span class="ws-pkt">${p}</span>`).join('');
    ws.innerHTML = `<div class="ws-inner">${inner}</div>`;
    document.body.appendChild(ws);
  }

  // ── Metasploit Prompt (categories page) ────────────────────────────────────
  const msfBody = document.getElementById('msf-body');
  if (msfBody) {
    const lines = [
      { t: 'msf6 > use auxiliary/recon/moriarty_portfolio', cls: 'msf-cmd', d: 500 },
      { t: 'msf6 auxiliary(recon/moriarty_portfolio) > set RHOSTS moriarty.portfolio', cls: 'msf-cmd', d: 1300 },
      { t: 'RHOSTS => moriarty.portfolio', cls: 'msf-val', d: 1900 },
      { t: 'msf6 auxiliary(recon/moriarty_portfolio) > run', cls: 'msf-cmd', d: 2500 },
      { t: '[*] Starting recon module against moriarty.portfolio...', cls: 'msf-info', d: 3200 },
      { t: '[+] Labs Walkthrough       — 9 modules loaded', cls: 'msf-found', d: 3900 },
      { t: '[+] Reverse Engineering    — 7 modules loaded', cls: 'msf-found', d: 4400 },
      { t: '[+] Blue Team Projects     — active', cls: 'msf-found', d: 4900 },
      { t: '[+] ML & AI Security       — active', cls: 'msf-found', d: 5400 },
      { t: '[*] 4 surfaces enumerated. Scan complete.', cls: 'msf-info', d: 6100 },
    ];
    lines.forEach(({ t, cls, d }) => setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'msf-line ' + cls;
      el.textContent = t;
      msfBody.appendChild(el);
    }, d));
  }

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
