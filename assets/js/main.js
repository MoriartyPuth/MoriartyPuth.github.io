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
        { text: '> Establishing secure connection...', delay: 360 },
        { text: '> Loading security modules...', delay: 720, bar: true },
        { text: '> Authenticating credentials...', delay: 1300, ok: true },
        { text: '> Mounting portfolio filesystem...', delay: 1680, ok: true },
        { text: '', delay: 1980 },
        { text: '$ whoami', delay: 2160, cmd: true },
        { text: 'moriarty', delay: 2560, who: true, role: 'offensive security researcher' },
        { text: '$ id', delay: 2980, cmd: true },
        { text: 'uid=1337(moriarty) gid=1337(redteam) groups=gov-disclosure,crackmes,api-sec', delay: 3320, idline: true },
        { text: '', delay: 3640 },
        { text: 'ACCESS GRANTED', delay: 3860, granted: true },
      ];
      lines.forEach(({ text, delay, bar, ok, granted, cmd, who, role, idline }) => {
        setTimeout(() => {
          const div = document.createElement('div');
          div.className = 'boot-line' + (granted ? ' boot-granted' : '') + (cmd ? ' boot-cmd' : '') + (who ? ' boot-who' : '') + (idline ? ' boot-id' : '');
          if (bar) {
            div.innerHTML = `${text} <span class="boot-bar">[<span class="boot-fill"></span>] 100%</span>`;
            setTimeout(() => div.querySelector('.boot-fill').classList.add('filled'), 30);
          } else if (ok) {
            div.innerHTML = `${text} <span class="boot-ok">[ OK ]</span>`;
          } else if (who) {
            div.innerHTML = `${text} <span class="boot-who-role">// ${role}</span>`;
          } else {
            div.textContent = text;
          }
          container.appendChild(div);
        }, delay);
      });
      setTimeout(() => {
        bootScreen.classList.add('boot-exit');
        setTimeout(() => bootScreen.remove(), 700);
      }, 4900);
    }
  }

  // ── Custom Cursor ──────────────────────────────────────────────────────────
  const cursorDot  = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');
  const finePointer = !window.matchMedia || window.matchMedia('(pointer: fine)').matches;
  if (cursorDot && cursorRing && !finePointer) {
    // Touch / coarse pointer: drop the custom cursor entirely (no stuck dot, no idle rAF loop)
    cursorDot.remove(); cursorRing.remove();
  } else if (cursorDot && cursorRing) {
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

  // Terminal bar on lab cards (category pages only — skip cards with .lab-term)
  document.querySelectorAll('.lab-card').forEach(card => {
    if (card.querySelector('.lab-terminal-bar')) return;
    if (card.querySelector('.lab-term')) return;
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
    if (card.querySelector('.lab-term')) return;
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
  if (heroTitle) setTimeout(() => scramble(heroTitle), bootScreen ? 5100 : 200);

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
  const childSelectors   = '.featured-item,.lab-card,.repo-card,.wr-card,.category-card,.skill-item,.cert-item,.tool-card,.live-card,.activity-item,.showcase-band';

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
    const start = bootScreen ? 5900 : 700;
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
    setTimeout(crack, bootScreen ? 5700 : 900);
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

  // ── Contact Terminal ──────────────────────────────────────────────────────
  if (!document.getElementById('rev-shell')) {
    const rs = document.createElement('div');
    rs.id = 'rev-shell';
    rs.innerHTML = `<div class="rs-bar"><span class="rs-nc">nc -lvnp 4444</span><button class="rs-close">✕</button></div><div id="rs-body" class="rs-body"><div class="rs-line rs-dim">Listening on [0.0.0.0] port 4444</div></div>`;
    document.body.appendChild(rs);
    const rsBody = document.getElementById('rs-body');
    rs.querySelector('.rs-close').addEventListener('click', () => rs.remove());
    const addText = (text, cls, delay) => setTimeout(() => {
      const d = document.createElement('div');
      d.className = 'rs-line' + (cls ? ' ' + cls : '');
      d.textContent = text;
      rsBody.appendChild(d);
    }, delay);
    const addLink = (label, text, href, cls, delay) => setTimeout(() => {
      const d = document.createElement('div');
      d.className = 'rs-line ' + cls;
      d.innerHTML = `<span class="rs-arrow">→</span> <span class="rs-lbl">${label}</span> <a href="${href}" target="_blank" rel="noopener" class="rs-contact-link">${text}</a>`;
      rsBody.appendChild(d);
    }, delay);
    addText('Connection received on [recruiter]', 'rs-conn', 3200);
    addText('whoami', 'rs-input', 3900);
    addText('Moriarty Puth — Offensive Security', 'rs-root', 4500);
    addLink('email   ', 'p.camboeav@gmail.com',                          'mailto:p.camboeav@gmail.com',                                    'rs-contact', 5100);
    addLink('linkedin', '/in/puthcambo-eav-7249b1325',                   'https://www.linkedin.com/in/puthcambo-eav-7249b1325/',            'rs-contact', 5600);
    addLink('github  ', '/MoriartyPuth',                                  'https://github.com/MoriartyPuth',                                'rs-contact', 6100);
    addText('moriarty@sec:~# ▋', 'rs-prompt', 6700);
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

  // ── Page Transition ───────────────────────────────────────────────────────
  const ptEl = document.createElement('div');
  ptEl.id = 'page-transition';
  ptEl.classList.add('pt-active');
  document.body.appendChild(ptEl);
  requestAnimationFrame(() => setTimeout(() => ptEl.classList.remove('pt-active'), 60));
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#') || a.target === '_blank') return;
    a.addEventListener('click', e => {
      e.preventDefault();
      ptEl.classList.add('pt-active');
      setTimeout(() => { window.location.href = href; }, 320);
    });
  });

  // ── Threat Intel Feed ─────────────────────────────────────────────────────
  const threatFeedEl = document.getElementById('threat-feed');
  if (threatFeedEl) {
    const cves = [
      { id: 'CVE-2024-6387', sev: 'Critical', pkg: 'OpenSSH',       cls: 'tf-crit' },
      { id: 'CVE-2024-3094', sev: 'Critical', pkg: 'XZ Utils',      cls: 'tf-crit' },
      { id: 'CVE-2024-4577', sev: 'Critical', pkg: 'PHP CGI',       cls: 'tf-crit' },
      { id: 'CVE-2024-1086', sev: 'High',     pkg: 'Linux Kernel',  cls: 'tf-high' },
      { id: 'CVE-2024-2961', sev: 'High',     pkg: 'glibc iconv',   cls: 'tf-high' },
      { id: 'CVE-2024-7971', sev: 'High',     pkg: 'Chrome V8',     cls: 'tf-high' },
      { id: 'CVE-2024-0519', sev: 'Critical', pkg: 'Chrome V8',     cls: 'tf-crit' },
      { id: 'CVE-2024-38112', sev: 'High',    pkg: 'Windows MSHTML', cls: 'tf-high' },
    ];
    let tfIdx = 0;
    const showCve = () => {
      const c = cves[tfIdx % cves.length];
      threatFeedEl.classList.remove('tf-in');
      void threatFeedEl.offsetWidth;
      threatFeedEl.innerHTML = `<span class="tf-id">${c.id}</span><span class="${c.cls}">${c.sev}</span><span class="tf-pkg">${c.pkg}</span>`;
      threatFeedEl.classList.add('tf-in');
      tfIdx++;
    };
    showCve();
    setInterval(showCve, 4000);
  }

  // ── Skill Radar — Nmap + MSF Combo ───────────────────────────────────────
  (function() {
    var radarEl = document.getElementById('skills-radar');
    if (!radarEl) return;
    var skills = [
      { label: 'Exploitation', val: 0.90 },
      { label: 'Recon',        val: 0.85 },
      { label: 'Rev Eng',      val: 0.80 },
      { label: 'Malware',      val: 0.75 },
      { label: 'Blue Team',    val: 0.70 },
      { label: 'AI Security',  val: 0.75 },
    ];
    var cx = 150, cy = 150, R = 90, N = skills.length;
    function pt(r, i) {
      var a = (i / N) * Math.PI * 2 - Math.PI / 2;
      return [+(cx + r * Math.cos(a)).toFixed(2), +(cy + r * Math.sin(a)).toFixed(2)];
    }
    function polyPts(fn) {
      return skills.map(function(s, i) { return pt(fn(s, i), i).join(','); }).join(' ');
    }
    var grids = [0.25, 0.5, 0.75, 1].map(function(f) {
      return '<polygon points="' + polyPts(function() { return R * f; }) + '" fill="none" stroke="rgba(34,197,94,0.1)" stroke-width="1"/>';
    }).join('');
    var axes = skills.map(function(_, i) {
      var p = pt(R, i);
      return '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0] + '" y2="' + p[1] + '" stroke="rgba(34,197,94,0.15)" stroke-width="1"/>';
    }).join('');
    var radarLabels = skills.map(function(s, i) {
      var p = pt(R + 22, i);
      var anchor = p[0] < cx - 5 ? 'end' : p[0] > cx + 5 ? 'start' : 'middle';
      return '<text x="' + p[0] + '" y="' + p[1] + '" text-anchor="' + anchor + '" class="radar-lbl">' + s.label + '</text>';
    }).join('');
    var rdots = skills.map(function(s, i) {
      var p = pt(R * s.val, i);
      return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.5" class="radar-dot" style="fill:rgba(34,197,94,0);stroke:var(--accent);stroke-width:1.5;transition:fill 0.4s ease"/>';
    }).join('');
    radarEl.innerHTML =
      '<div class="nmap-body">' +
        '<div class="nmap-scan-col"><div id="nmap-lines"></div><div id="nmap-msf-line" class="nmap-msf-line"></div></div>' +
        '<div class="nmap-radar-col">' +
          '<svg id="nmap-radar-svg" viewBox="-45 -15 390 330" class="radar-svg">' +
            grids + axes +
            '<polygon id="nmap-poly" points="' + polyPts(function() { return 0; }) + '" class="radar-poly"/>' +
            rdots + radarLabels +
          '</svg>' +
        '</div>' +
      '</div>';
    var polyEl  = document.getElementById('nmap-poly');
    var dotEls  = Array.prototype.slice.call(document.querySelectorAll('#nmap-radar-svg .radar-dot'));
    var linesEl = document.getElementById('nmap-lines');
    var msfEl   = document.getElementById('nmap-msf-line');
    var radarIO = new IntersectionObserver(function(entries) {
      if (!entries[0].isIntersecting) return;
      radarIO.disconnect();
      setTimeout(runNmap, 300);
    }, { threshold: 0.25 });
    radarIO.observe(radarEl);
    function appendLine(html, cls) {
      var div = document.createElement('div');
      div.className = 'nmap-line' + (cls ? ' ' + cls : '');
      div.innerHTML = html;
      linesEl.appendChild(div);
    }
    function runNmap() {
      var t = 0;
      function after(ms, fn) { t += ms; setTimeout(fn, t); }
      after(0,   function() { appendLine('<span class="nmap-g">$</span> nmap --script skills moriarty.sec'); });
      after(350, function() { appendLine('<span class="nmap-d">Starting Nmap 7.94 ( https://nmap.org )</span>'); });
      after(280, function() { appendLine('<span class="nmap-d">Initiating skill scan on moriarty.sec ...</span>'); });
      after(300, function() { appendLine('&nbsp;'); });
      skills.forEach(function(s, i) {
        after(460, (function(si) {
          return function() {
            var pct = Math.round(skills[si].val * 100);
            var pad = new Array(Math.max(2, 20 - skills[si].label.length) + 1).join('.');
            appendLine(
              '<span class="nmap-lbl">' + skills[si].label + '</span>' +
              '<span class="nmap-dots">' + pad + '</span>' +
              '<span class="nmap-pct"> ' + pct + '%</span>' +
              '<span class="nmap-open">  [open]</span>',
              'nmap-skill'
            );
            dotEls[si].style.fill = 'var(--accent)';
            var pts = skills.map(function(ss, ii) {
              return pt(ii <= si ? R * ss.val : 0, ii).join(',');
            }).join(' ');
            polyEl.setAttribute('points', pts);
            if (si === 0) polyEl.classList.add('radar-poly-animate');
          };
        })(i));
      });
      after(900, function() {
        msfEl.innerHTML =
          '<span class="nmap-g">msf6</span> <span class="nmap-d">exploit</span>' +
          '(<span class="nmap-pct">moriarty</span>) &gt; ' +
          '<span id="nmap-msf-cmd"></span><span class="nmap-cur">_</span>';
        var cmdEl = document.getElementById('nmap-msf-cmd');
        var curEl = msfEl.querySelector('.nmap-cur');
        var cmd = 'show capabilities';
        var ci = 0;
        var iv = setInterval(function() {
          cmdEl.textContent += cmd[ci++];
          if (ci >= cmd.length) {
            clearInterval(iv);
            curEl.style.display = 'none';
            var finalPts = skills.map(function(ss, ii) { return pt(R * ss.val, ii).join(','); }).join(' ');
            setTimeout(function() { polyEl.setAttribute('points', finalPts); polyEl.classList.add('radar-poly-animate'); }, 300);
          }
        }, 60);
      });
    }
  })();

  // ── Shodan Certs ──────────────────────────────────────────────────────────
  (function() {
    var shodanEl = document.getElementById('shodan-certs');
    if (!shodanEl) return;
    var certs = [
      { name: 'Ethical Hacking Essentials (EHE)',              org: 'EC-Council / Coursera', port: '443/tcp', tags: 'ethical-hacking, penetration-testing', url: 'https://www.coursera.org/account/accomplishments/records/UTXCK9XRPVCR' },
      { name: 'Network Defense Essentials (NDE)',               org: 'EC-Council / Coursera', port: '443/tcp', tags: 'network-defense, blue-team',           url: 'https://www.coursera.org/account/accomplishments/records/LI0DN7QNQ4DK' },
      { name: 'Digital Forensics Essentials (DFE)',             org: 'EC-Council / Coursera', port: '443/tcp', tags: 'forensics, incident-response',          url: 'https://www.coursera.org/account/accomplishments/records/TPU5FV3A8GYH' },
      { name: 'Cybersecurity Attack and Defense Fundamentals',  org: 'EC-Council / Coursera', port: '443/tcp', tags: 'attack, defense, specialization',       url: 'https://www.coursera.org/account/accomplishments/specialization/O9CR1A5CW0YQ' },
    ];
    var shodanIO = new IntersectionObserver(function(entries) {
      if (!entries[0].isIntersecting) return;
      shodanIO.disconnect();
      runShodan();
    }, { threshold: 0.2 });
    shodanIO.observe(shodanEl);
    function runShodan() {
      var delay = 0;
      certs.forEach(function(cert, i) {
        delay += i === 0 ? 200 : 700;
        setTimeout(function(c, idx) { revealCard(c, idx); }, delay, cert, i);
      });
    }
    function revealCard(cert, i) {
      var card = document.createElement('div');
      card.className = 'shodan-card';
      var qid = 'shq' + i, rid = 'shr' + i, cid = 'shc' + i;
      card.innerHTML =
        '<div class="shodan-query">' +
          '<span class="shodan-prompt">shodan search</span> ' +
          '<span class="shodan-typing" id="' + qid + '"></span>' +
          '<span class="shodan-cur" id="' + cid + '">_</span>' +
        '</div>' +
        '<div class="shodan-result" id="' + rid + '" style="display:none">' +
          '<div class="shodan-row"><span class="shodan-key">[SHODAN]</span><span class="shodan-val shodan-host">cert.moriarty.sec</span></div>' +
          '<div class="shodan-row"><span class="shodan-key">org:</span><span class="shodan-val">' + cert.org + '</span></div>' +
          '<div class="shodan-row"><span class="shodan-key">port:</span><span class="shodan-val">' + cert.port + ' &nbsp;<span class="shodan-open">open</span></span></div>' +
          '<div class="shodan-row"><span class="shodan-key">cert:</span><span class="shodan-val shodan-certname">' + cert.name + '</span></div>' +
          '<div class="shodan-row"><span class="shodan-key">tags:</span><span class="shodan-val shodan-tags">' + cert.tags + '</span></div>' +
          '<div class="shodan-row shodan-link-row"><a href="' + cert.url + '" target="_blank" rel="noopener" class="shodan-link">→ View Certificate</a></div>' +
        '</div>';
      shodanEl.appendChild(card);
      var typingEl = document.getElementById(qid);
      var curEl    = document.getElementById(cid);
      var resultEl = document.getElementById(rid);
      var query = '"' + cert.name.slice(0, 32) + '"';
      var ci = 0;
      var iv = setInterval(function() {
        typingEl.textContent += query[ci++];
        if (ci >= query.length) {
          clearInterval(iv);
          curEl.style.display = 'none';
          setTimeout(function() { resultEl.style.display = ''; resultEl.classList.add('shodan-reveal'); }, 200);
        }
      }, 28);
    }
  })();

  // ── CrackMapExec Tooling Stack ───────────────────────────────────────────
  (function() {
    var cmeEl = document.getElementById('cme-tools');
    if (!cmeEl) return;
    var tools = [
      { name: 'Python',       tag: 'offensive-tooling' },
      { name: 'Bash',         tag: 'automation'        },
      { name: 'Linux',        tag: 'environment'       },
      { name: 'MITRE ATT&CK', tag: 'framework'         },
      { name: 'OSINT',        tag: 'recon'             },
      { name: 'SIEM',         tag: 'detection'         },
    ];
    var cmeIO = new IntersectionObserver(function(entries) {
      if (!entries[0].isIntersecting) return;
      cmeIO.disconnect();
      runCME();
    }, { threshold: 0.2 });
    cmeIO.observe(cmeEl);

    function addLine(html, cls, delay) {
      setTimeout(function() {
        var div = document.createElement('div');
        div.className = 'cme-line' + (cls ? ' ' + cls : '');
        div.innerHTML = html;
        cmeEl.appendChild(div);
      }, delay);
    }

    function runCME() {
      var host = 'moriarty.sec';
      var pre  = '<span class="cme-smb">SMB</span> <span class="cme-host">' + host + '</span> <span class="cme-port">445</span> <span class="cme-name">MORIARTY</span> ';
      addLine('<span class="cme-dim">CrackMapExec 5.4.0  —  by byt3bl33d3r &amp; mpgn</span>', 'cme-header', 0);
      addLine(pre + '<span class="cme-info">[*]</span> <span class="cme-dim">Windows 10 Pro (name:MORIARTY) (domain:sec)</span>', '', 350);
      addLine(pre + '<span class="cme-info">[*]</span> <span class="cme-dim">scanning tooling stack...</span>', '', 650);
      addLine('&nbsp;', '', 850);
      tools.forEach(function(t, i) {
        var pad = new Array(Math.max(2, 16 - t.name.length) + 1).join('.');
        addLine(
          pre +
          '<span class="cme-plus">[+]</span> ' +
          '<span class="cme-tool-name">' + t.name + '</span>' +
          '<span class="cme-pad">' + pad + '</span>' +
          '<span class="cme-pwned">PWNED</span>' +
          ' <span class="cme-tag">(' + t.tag + ')</span>',
          'cme-tool-line',
          1000 + i * 420
        );
      });
    }
  })();

  // ── OpenStack Cloud Console ───────────────────────────────────────────────
  (function() {
    var osEl = document.getElementById('openstack-console');
    if (!osEl) return;
    var osIO = new IntersectionObserver(function(entries) {
      if (!entries[0].isIntersecting) return;
      osIO.disconnect();
      setTimeout(run, 300);
    }, { threshold: 0.3 });
    osIO.observe(osEl);
    var uid = 0;
    function addLine(html, cls) {
      var d = document.createElement('div');
      d.className = 'os-line' + (cls ? ' ' + cls : '');
      d.innerHTML = html;
      osEl.appendChild(d);
      return d;
    }
    function typeCmd(cmd, done) {
      var tid = 'os-t' + (uid++), cid = 'os-c' + uid;
      addLine('<span class="os-prompt">$</span> <span id="' + tid + '"></span><span class="os-cur" id="' + cid + '">_</span>');
      var span = document.getElementById(tid), cur = document.getElementById(cid), i = 0;
      var iv = setInterval(function() {
        span.textContent += cmd[i++];
        if (i >= cmd.length) { clearInterval(iv); cur.style.display = 'none'; if (done) setTimeout(done, 150); }
      }, 24);
    }
    function bootAnim(done) {
      var bid = 'os-b' + (uid++);
      addLine('<span class="os-dim">  Booting</span> <span id="' + bid + '"></span>');
      var d = document.getElementById(bid), c = 0;
      var iv = setInterval(function() {
        d.textContent += '.';
        if (++c >= 10) {
          clearInterval(iv);
          d.innerHTML += ' <span class="os-active">ACTIVE</span>';
          if (done) setTimeout(done, 280);
        }
      }, 65);
    }
    var labs = [
      { cmd: 'openstack server create --image CentOS-9 --flavor m1.xlarge lab-controller',
        fields: [['name','lab-controller'],['flavor','m1.xlarge · 4 vCPU · 8 GB RAM'],['image','CentOS Stream 9'],['status','BUILD']],
        repo: 'CentOS-Openstack-Epoxy', modules: '43 modules', level: 'Expert' },
      { cmd: 'openstack server create --image CentOS-Stream-10 --flavor m1.medium lab-primary',
        fields: [['name','lab-primary'],['flavor','m1.medium · 2 vCPU · 4 GB RAM'],['image','CentOS Stream 10'],['status','BUILD']],
        repo: 'CentOS-Primary-Server-Lab', modules: '18 modules', level: 'Intermediate' }
    ];
    function runLab(lab, next) {
      typeCmd(lab.cmd, function() {
        lab.fields.forEach(function(f, i) {
          setTimeout(function() {
            var isStat = f[0] === 'status';
            addLine(
              '  <span class="os-bullet">▸</span> ' +
              '<span class="os-key">' + f[0] + '</span>' +
              '<span class="os-colon"> : </span>' +
              (isStat
                ? '<span class="os-build">' + f[1] + '</span>'
                : '<span class="os-val">' + f[1] + '</span>')
            );
          }, 120 + i * 120);
        });
        setTimeout(function() {
          bootAnim(function() {
            addLine(
              '<span class="os-plus">[+]</span> ' +
              '<span class="os-repo">' + lab.repo + '</span>' +
              '<span class="os-sep"> ─── </span>' +
              '<span class="os-mod">' + lab.modules + '</span>' +
              '<span class="os-sep"> ─── </span>' +
              '<span class="os-lvl">' + lab.level + '</span>'
            );
            if (next) { setTimeout(function() { addLine('&nbsp;'); setTimeout(next, 180); }, 420); }
          });
        }, 120 + lab.fields.length * 120 + 160);
      });
    }
    function run() { runLab(labs[0], function() { runLab(labs[1], null); }); }
  })();

  // ── Lab Card Terminal Animation ───────────────────────────────────────────
  (function() {
    var configs = [
      { id: 'lab-term-1', cmd: 'ssh root@lab-controller',
        out: [
          { text: '> Connecting to OpenStack Epoxy...', cls: 'lt-info', delay: 380 },
          { text: '> Nova ACTIVE · Neutron/OVN ACTIVE · 43 modules loaded', cls: 'lt-ok', delay: 860 },
        ]
      },
      { id: 'lab-term-2', cmd: 'ssh root@lab-primary',
        out: [
          { text: '> Connecting to CentOS Stream 10...', cls: 'lt-info', delay: 380 },
          { text: '> DNS ACTIVE · Apache ACTIVE · 18 modules loaded', cls: 'lt-ok', delay: 860 },
        ]
      },
    ];
    var UID = 0;
    function typePrompt(el, cmd, done) {
      var sid = 'lt-s' + (UID++), cid = 'lt-c' + UID;
      var d = document.createElement('div');
      d.className = 'lt-line lt-cmd';
      d.innerHTML = '<span class="lt-ps">~/labs/$</span> <span id="' + sid + '"></span><span class="lt-cur" id="' + cid + '">_</span>';
      el.appendChild(d);
      var span = document.getElementById(sid), cur = document.getElementById(cid), i = 0;
      var iv = setInterval(function() {
        span.textContent += cmd[i++];
        if (i >= cmd.length) { clearInterval(iv); cur.style.display = 'none'; if (done) setTimeout(done, 150); }
      }, 36);
    }
    configs.forEach(function(cfg) {
      var el = document.getElementById(cfg.id);
      if (!el) return;
      var io = new IntersectionObserver(function(entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        setTimeout(function() {
          typePrompt(el, cfg.cmd, function() {
            cfg.out.forEach(function(o) {
              setTimeout(function() {
                var d = document.createElement('div');
                d.className = 'lt-line ' + o.cls;
                d.textContent = o.text;
                el.appendChild(d);
              }, o.delay);
            });
          });
        }, 300);
      }, { threshold: 0.4 });
      io.observe(el);
    });
  })();

  // ── Mobile Burp Overlay (touch support) ───────────────────────────────────
  document.querySelectorAll('.burp-hint').forEach(hint => {
    hint.addEventListener('touchstart', e => { e.stopPropagation(); hint.closest('.featured-item').querySelector('.burp-overlay').classList.add('active'); }, { passive: true });
  });
  document.querySelectorAll('.burp-close').forEach(btn => {
    btn.addEventListener('touchstart', e => { e.stopPropagation(); btn.closest('.burp-overlay').classList.remove('active'); }, { passive: true });
  });

  // ── Interactive Terminal (toggle with ` key) ───────────────────────────────
  function buildIterm() {
    if (document.getElementById('iterm')) return;
    const el = document.createElement('div');
    el.id = 'iterm';
    el.innerHTML = `<div class="iterm-bar"><span class="burp-dots"><i class="bd-r"></i><i class="bd-y"></i><i class="bd-g"></i></span><span class="iterm-title">moriarty@sec:~</span><button class="iterm-x">✕</button></div><div id="iterm-body" class="iterm-body"></div><div class="iterm-row"><span class="iterm-ps">moriarty@sec:~$&nbsp;</span><input id="iterm-in" class="iterm-in" type="text" autocomplete="off" spellcheck="false" /></div>`;
    document.body.appendChild(el);
    const body = el.querySelector('#iterm-body');
    const input = el.querySelector('#iterm-in');
    el.querySelector('.iterm-x').addEventListener('click', () => el.classList.remove('iterm-open'));
    const print = (lines, cls) => {
      (Array.isArray(lines) ? lines : [lines]).forEach(l => {
        const d = document.createElement('div');
        d.className = 'iterm-out' + (cls ? ' '+cls : '');
        d.textContent = l;
        body.appendChild(d);
      });
      body.scrollTop = body.scrollHeight;
    };
    print(['Type "help" for available commands.'], 'iterm-dim');
    const history = []; let histIdx = -1;
    const CMDS = {
      help:             () => ['Commands:','  whoami            · who am I (jumps to ~/whoami)','  ls                · list filesystem','  cat <file>        · read file (try about.txt, playground.txt, resume.txt)','  fortune           · random hacker / dev quote','  ls case-studies/  · list security case studies','  ls tools/         · list offensive tools','  ls community/     · list open-source projects','  nmap              · port scan easter egg ;)','  clear             · clear terminal'],
      whoami:           () => { var s = document.querySelector('.about-section'); if (s) setTimeout(function () { s.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 250); return ['Moriarty Puth','Offensive Security Researcher','Final-year cybersecurity student · Cambodia','API security · Binary exploitation · AI tooling','','↓ jumping to ~/whoami']; },
      ls:               () => ['about.txt  playground.txt  resume.txt  skills.txt  contact.txt  case-studies/  tools/  community/'],
      'cat about.txt':      () => { var o = document.querySelectorAll('.about-tty .term-out'); return o[0] ? [o[0].textContent] : ['cat: about.txt: No such file or directory']; },
      'cat playground.txt': () => { var o = document.querySelectorAll('.about-tty .term-out'); return o[1] ? [o[1].textContent] : ['cat: playground.txt: No such file or directory']; },
      fortune:          () => { var f = window.getFortune && window.getFortune(); if (!f) return ['fortune: command not found']; return f.a ? ['"' + f.t + '"', '    — ' + f.a] : ['"' + f.t + '"']; },
      'ls case-studies/': () => ['EES-ANPR/    CSS-GDIN/    AUPP-CTF/','DoccameraDLL/    JoulHub/    SOP/','OWIT-Global/','','7 cases · authorized · coordinated disclosure'],
      'ls tools/':        () => ['bubble-scanner/    bubble-pop/    bubble-siphon/','AURA/    Sila-Entropy/    Nocturne/'],
      'ls community/':    () => ['NETH/    Khmer-OCR/    Rice-Disease-Detector/','','open source · Cambodia'],
      'cat resume.txt': () => ['──────────────────────────────────','Name:    Moriarty Puth','Role:    Offensive Security Researcher','Focus:   API security · Reverse engineering · AI tooling','Notable: Critical IDOR in Cambodian gov systems','         Top-80 crackmes.one ranking','Status:  Currently employed · building for fun','──────────────────────────────────'],
      'cat skills.txt': () => ['Web/API Exploitation  ▓▓▓▓▓▓▓▓▓░  90%','Reconnaissance        ▓▓▓▓▓▓▓▓░░  85%','Reverse Engineering   ▓▓▓▓▓▓▓▓░░  80%','Malware Analysis      ▓▓▓▓▓▓▓░░░  75%','Blue Team             ▓▓▓▓▓▓▓░░░  70%','AI Security           ▓▓▓▓▓▓▓░░░  75%'],
      'cat contact.txt':() => ['email:    p.camboeav@gmail.com','linkedin: linkedin.com/in/puthcambo-eav-7249b1325','github:   github.com/MoriartyPuth'],
      nmap:             () => { setTimeout(showNmap, 200); return ['[*] Launching nmap scan on moriarty.portfolio...']; },
    };
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        if (!cmd) return;
        history.unshift(cmd); histIdx = -1;
        const echo = document.createElement('div');
        echo.className = 'iterm-out iterm-echo';
        echo.textContent = 'moriarty@sec:~$ ' + cmd;
        body.appendChild(echo);
        input.value = '';
        if (cmd.toLowerCase() === 'clear') { body.innerHTML = ''; return; }
        const key = cmd.toLowerCase();
        const fn = CMDS[key] || CMDS[key.split(' ').slice(0,2).join(' ')] || CMDS[key.split(' ')[0]];
        const out = fn ? fn(cmd.split(' ').slice(1)) : [`bash: ${cmd.split(' ')[0]}: command not found`];
        if (out) print(out);
        body.scrollTop = body.scrollHeight;
      } else if (e.key === 'ArrowUp')   { e.preventDefault(); if (histIdx < history.length-1) input.value = history[++histIdx]; }
        else if (e.key === 'ArrowDown') { e.preventDefault(); histIdx > 0 ? input.value = history[--histIdx] : (histIdx=-1, input.value=''); }
    });
    setTimeout(() => { el.classList.add('iterm-open'); input.focus(); }, 50);
  }
  document.addEventListener('keydown', e => {
    if (e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return;
    if (e.key === '`') {
      const t = document.getElementById('iterm');
      if (t) { t.classList.toggle('iterm-open'); if (t.classList.contains('iterm-open')) t.querySelector('.iterm-in').focus(); }
      else buildIterm();
    }
  });

  // ── 404 path display ──────────────────────────────────────────────────────
  const e404path = document.getElementById('e404-path');
  if (e404path) e404path.textContent = window.location.pathname;

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

// ════════════════════════════════════════════════════════════════════════════
//  Interactive Command Bar  —  visible REPL with navigation + recon
// ════════════════════════════════════════════════════════════════════════════
(function () {
  const body = document.getElementById('cmdbar-body');
  const input = document.getElementById('cmdbar-in');
  if (!body || !input) return;

  const PAGES = {
    home: 'index.html', categories: 'categories.html',
    labs: 'category-labs.html', infra: 'category-infrastructure.html',
    re: 'category-reverse-engineering.html', 'reverse-engineering': 'category-reverse-engineering.html',
    blue: 'category-blue-team.html', 'blue-team': 'category-blue-team.html',
    ml: 'category-ml-ai.html', ai: 'category-ml-ai.html',
    nocturne: 'https://nocturne-production-281a.up.railway.app/'
  };
  const SECTIONS = {
    threat: '.threat-board', board: '.threat-board',
    disclosure: '.field-ops', timeline: '.field-ops', ops: '.field-ops', operations: '.field-ops',
    reports: '.field-ops', cases: '.field-ops', fieldreports: '.field-ops',
    community: '.community-section', tools: '.bubble-suite', bubble: '.bubble-suite',
    live: '.live-projects', writeups: '.writeups-section',
    skills: '.skills-tooling-row', certs: '.certs-section', scan: '.nikto-section',
    top: '.hero', contact: '.site-footer', footer: '.site-footer'
  };
  const CASES = {
    'f.01': { n: 'EES / ANPR', u: 'https://github.com/MoriartyPuth-Labs/EES-Security-Case-Study', s: '9.8 CRIT' },
    'f.02': { n: 'CSS-GDIN',   u: 'https://github.com/MoriartyPuth-Labs/CSS-GDIN-Security-Case-Study', s: '7.5 HIGH' },
    'f.03': { n: 'AUPP CTF',   u: 'https://github.com/MoriartyPuth-Labs/AUPP-CTF-Platform-Security-Study-Case', s: '1C·3H' },
    'f.04': { n: 'DOCCAMERA',  u: 'https://github.com/MoriartyPuth-Labs/DoccameraDLL-Security-Case-Study', s: '4C·8H' },
    'f.05': { n: 'JOULHUB',    u: 'https://github.com/MoriartyPuth-Labs/Joulhub-Security-Case-Study', s: '2H·3M' },
    'f.06': { n: 'SOP',        u: 'https://github.com/MoriartyPuth-Labs/SOP-Security-Case-Study', s: '2C·6H' },
    'f.07': { n: 'OWIT GLOBAL',u: 'https://github.com/MoriartyPuth-Labs/OWIT-Global-Security-Case-Study', s: '8.1 HIGH' }
  };

  const print = (lines, cls) => {
    (Array.isArray(lines) ? lines : [lines]).forEach(l => {
      const d = document.createElement('div');
      d.className = 'cmdbar-out' + (cls ? ' ' + cls : '');
      d.innerHTML = l;
      body.appendChild(d);
    });
    body.scrollTop = body.scrollHeight;
  };
  const scrollTo = sel => {
    const el = document.querySelector(sel);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return true; }
    return false;
  };

  function recon() {
    const ua = navigator.userAgent;
    const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox'
      : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Unknown';
    const os = /Windows NT 10/.test(ua) ? 'Windows 10/11' : /Windows/.test(ua) ? 'Windows'
      : /Mac OS X/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android'
      : /iPhone|iPad/.test(ua) ? 'iOS' : /Linux/.test(ua) ? 'Linux' : 'Unknown';
    let tz = '—'; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {}
    const rows = [
      ['os', os], ['browser', browser], ['platform', navigator.platform || '—'],
      ['lang', navigator.language || '—'], ['timezone', tz],
      ['screen', screen.width + 'x' + screen.height], ['viewport', innerWidth + 'x' + innerHeight],
      ['cores', (navigator.hardwareConcurrency || '?') + ' vCPU'],
      ['touch', (navigator.maxTouchPoints > 0 ? 'yes' : 'no')],
      ['referrer', (document.referrer || 'direct').replace(/^https?:\/\//, '').slice(0, 40)],
      ['online', navigator.onLine ? 'up' : 'down']
    ];
    print('<span class="cb-dim">$ nmap -sV -O --fingerprint visitor.local</span>', 'cb-dim');
    print('Starting Nmap 7.94 — host discovery on <span class="cb-hl">visitor.local</span>', 'cb-dim');
    print('<span class="cb-ok">Host is up</span> (0.0013s latency). Fingerprinting target...', '');
    rows.forEach((r, i) => setTimeout(() => {
      print('<span class="cb-key">' + r[0].padEnd(9, ' ').replace(/ /g, '&nbsp;') + '</span><span class="cb-arrow">:</span> <span class="cb-val">' + r[1] + '</span>', 'cb-recon-row');
    }, 90 + i * 90));
    setTimeout(() => print('<span class="cb-ok">[+]</span> target acquired — no data stored. relax, it\'s a party trick. 🎯', 'cb-good'), 90 + rows.length * 90 + 120);
  }

  function nmap() {
    const lines = [
      ['<span class="cb-dim">$ nmap -sV -p- moriarty.portfolio</span>', 'cb-dim'],
      ['PORT      STATE  SERVICE      VERSION', 'cb-dim'],
      ['22/tcp    open   ssh          OpenSSH 9.3p2', 'cb-ok'],
      ['80/tcp    open   http         nginx 1.24.0', 'cb-ok'],
      ['443/tcp   open   ssl/https    nginx 1.24.0', 'cb-ok'],
      ['8080/tcp  open   http-proxy   bubble-scanner v2.1', 'cb-ok'],
      ['9001/tcp  open   recon        sila-entropy v1.0', 'cb-ok'],
      ['1337/tcp  open   shell        moriarty-backdoor (joke)', 'cb-good'],
      ['Nmap done: 1 host up — scanned in 2.47s', 'cb-dim']
    ];
    lines.forEach((l, i) => setTimeout(() => print(l[0], l[1]), i * 110));
  }

  const CMDS = {
    help: () => [
      '<span class="cb-good">Available commands:</span>',
      '&nbsp;<span class="cb-cmd">whoami</span>            who is this',
      '&nbsp;<span class="cb-cmd">ls</span> / <span class="cb-cmd">cat &lt;file&gt;</span>     browse (resume.txt, skills.txt, contact.txt)',
      '&nbsp;<span class="cb-cmd">cases</span>             list field reports',
      '&nbsp;<span class="cb-cmd">open &lt;target&gt;</span>      open a page or case  (open labs · open f.01)',
      '&nbsp;<span class="cb-cmd">goto &lt;section&gt;</span>    scroll to a section  (goto threat · goto tools)',
      '&nbsp;<span class="cb-cmd">recon</span>             fingerprint this visitor 😈',
      '&nbsp;<span class="cb-cmd">nmap</span>              scan the portfolio',
      '&nbsp;<span class="cb-cmd">contact</span>           how to reach me',
      '&nbsp;<span class="cb-cmd">banner</span> · <span class="cb-cmd">sudo</span> · <span class="cb-cmd">clear</span>',
      '<span class="cb-dim">tip: there\'s a classic cheat code hidden on this page ↑↑↓↓…</span>'
    ],
    whoami: () => ['<span class="cb-good">Moriarty Puth</span> — Offensive Security Researcher',
      'Final-year cybersecurity student · Cambodia',
      'API security · Binary exploitation · AI tooling'],
    ls: () => ['<span class="cb-dir">projects/</span>  <span class="cb-dir">certs/</span>  <span class="cb-dir">cases/</span>  resume.txt  skills.txt  contact.txt'],
    cases: () => Object.entries(CASES).map(([k, v]) =>
      '<span class="cb-cmd">' + k.toUpperCase() + '</span>  <span class="cb-val">' + v.n.padEnd(13, ' ') + '</span> <span class="cb-dim">' + v.s + '</span>  <span class="cb-dim">open ' + k + '</span>'),
    'cat resume.txt': () => ['────────────────────────────', 'Name:    Moriarty Puth', 'Role:    Offensive Security Researcher',
      'Focus:   API sec · Reverse engineering · AI tooling', 'Notable: Critical IDOR in Cambodian gov systems',
      '         Top-80 crackmes.one', 'Status:  <span class="cb-ok">Open to security roles</span>', '────────────────────────────'],
    'cat skills.txt': () => ['Web/API Exploitation  ▓▓▓▓▓▓▓▓▓░  90%', 'Reconnaissance        ▓▓▓▓▓▓▓▓░░  85%',
      'Reverse Engineering   ▓▓▓▓▓▓▓▓░░  80%', 'Malware Analysis      ▓▓▓▓▓▓▓░░░  75%',
      'Blue Team             ▓▓▓▓▓▓▓░░░  70%', 'AI Security           ▓▓▓▓▓▓▓░░░  75%'],
    'cat contact.txt': () => CMDS.contact(),
    contact: () => ['<span class="cb-key">email&nbsp;&nbsp;&nbsp;</span> <a href="mailto:p.camboeav@gmail.com" class="cb-link">p.camboeav@gmail.com</a>',
      '<span class="cb-key">linkedin</span> <a href="https://www.linkedin.com/in/puthcambo-eav-7249b1325/" target="_blank" rel="noopener" class="cb-link">/in/puthcambo-eav-7249b1325</a>',
      '<span class="cb-key">github&nbsp;&nbsp;</span> <a href="https://github.com/MoriartyPuth" target="_blank" rel="noopener" class="cb-link">/MoriartyPuth</a>'],
    banner: () => ['<span class="cb-good">' +
      '┌─[ moriarty@sec ]─[ ~/portfolio ]\n└──╼ offensive security · authorized research only</span>'],
    sudo: (a) => (a && a.join(' ').includes('su'))
      ? ['<span class="cb-dim">[sudo] password for visitor:</span>', '<span class="cb-good">nice try 😏 — you don\'t get root here, but I respect the hustle.</span>']
      : ['<span class="cb-err">visitor is not in the sudoers file. This incident will be reported.</span>'],
    clear: () => { body.innerHTML = ''; return null; }
  };

  function open(args) {
    const t = (args[0] || '').toLowerCase();
    if (!t) return ['<span class="cb-err">usage: open &lt;page|case&gt;  — e.g. open labs · open f.01</span>'];
    if (CASES[t]) { print('opening <span class="cb-hl">' + CASES[t].n + '</span> on GitHub…', 'cb-dim'); window.open(CASES[t].u, '_blank', 'noopener'); return null; }
    if (PAGES[t]) { const url = PAGES[t]; print('navigating to <span class="cb-hl">' + t + '</span>…', 'cb-dim'); setTimeout(() => location.href = url, 350); return null; }
    return ['<span class="cb-err">no such target: ' + t + '</span>', '<span class="cb-dim">try: ' + Object.keys(PAGES).join(' · ') + ' · f.01–f.07</span>'];
  }
  function goto(args) {
    const t = (args[0] || '').toLowerCase();
    if (SECTIONS[t]) { return scrollTo(SECTIONS[t]) ? null : ['<span class="cb-err">section not on this page</span>']; }
    return ['<span class="cb-err">unknown section: ' + t + '</span>', '<span class="cb-dim">try: ' + Object.keys(SECTIONS).slice(0, 8).join(' · ') + '…</span>'];
  }

  const history = []; let hi = -1;
  function run(raw) {
    const cmd = raw.trim(); if (!cmd) return;
    history.unshift(cmd); hi = -1;
    const echo = document.createElement('div');
    echo.className = 'cmdbar-out cmdbar-echo';
    echo.innerHTML = '<span class="cmdbar-ps-sm">visitor@moriarty.sec:~$</span> ' + cmd.replace(/</g, '&lt;');
    body.appendChild(echo);
    const parts = cmd.split(/\s+/); const key = cmd.toLowerCase(); const head = parts[0].toLowerCase(); const args = parts.slice(1);
    let out;
    if (head === 'recon') { recon(); out = null; }
    else if (head === 'nmap') { nmap(); out = null; }
    else if (head === 'open') out = open(args);
    else if (head === 'goto' || head === 'cd') out = goto(args);
    else if (head === 'echo') out = [args.join(' ').replace(/</g, '&lt;')];
    else if (head === 'date') out = [new Date().toString()];
    else if (CMDS[key]) out = CMDS[key]();
    else if (CMDS[parts.slice(0, 2).join(' ').toLowerCase()]) out = CMDS[parts.slice(0, 2).join(' ').toLowerCase()]();
    else if (CMDS[head]) out = CMDS[head](args);
    else out = ['<span class="cb-err">' + head.replace(/</g, '&lt;') + ': command not found</span> <span class="cb-dim">— type help</span>'];
    if (out) print(out);
    body.scrollTop = body.scrollHeight;
  }

  print('<span class="cb-dim">Welcome. This is a real shell — type <span class="cb-cmd">help</span> to explore. (or just <span class="cb-cmd">recon</span> 😉)</span>');
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { run(input.value); input.value = ''; }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (hi < history.length - 1) input.value = history[++hi]; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); hi > 0 ? input.value = history[--hi] : (hi = -1, input.value = ''); }
    else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); body.innerHTML = ''; }
  });
})();

// ════════════════════════════════════════════════════════════════════════════
//  Threat Board  —  count-up stats + animated heat strip
// ════════════════════════════════════════════════════════════════════════════
(function () {
  const board = document.querySelector('.threat-board');
  if (!board) return;
  const io = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    board.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      if (target === 0) { el.textContent = '0'; el.classList.add('tb-zero-glow'); return; }
      let cur = 0; const step = Math.max(1, target / 32);
      const t = setInterval(() => { cur = Math.min(cur + step, target); el.textContent = Math.floor(cur); if (cur >= target) clearInterval(t); }, 26);
    });
    const bar = document.getElementById('tb-heat-bar');
    if (bar) bar.querySelectorAll('.tb-seg').forEach((seg, i) => {
      setTimeout(() => { seg.style.flexBasis = seg.dataset.w + '%'; seg.classList.add('tb-seg-in'); }, 120 + i * 160);
    });
  }, { threshold: 0.3 });
  io.observe(board);
})();

// ════════════════════════════════════════════════════════════════════════════
//  Per-Case Evidence Drawer  —  slide-out forensic detail for field reports
// ════════════════════════════════════════════════════════════════════════════
(function () {
  const cards = document.querySelectorAll('.fr-card');
  if (!cards.length) return;
  const EVID = {
    'F.01': { title: 'EES / ANPR — Insecure Direct Object Reference', target: 'Ministry of Interior · ANPR System', cvss: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H — 9.8 CRITICAL',
      req: 'GET /api/v1/bureaus/1042 HTTP/1.1\nHost: ees.gov.kh\nAuthorization: Bearer eyJhbGciOiJIUzI1...',
      res: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"id":1042,"bureau":"[REDACTED]",\n "records":[ ... 100+ entries ... ]}',
      impact: 'Sequential bureau IDs let any authenticated user enumerate 100+ law-enforcement bureau records belonging to other tenants.',
      fix: 'Enforce object-level authorization on every record fetch; replace predictable integer IDs with unguessable UUIDs.', repo: 'https://github.com/MoriartyPuth-Labs/EES-Security-Case-Study' },
    'F.02': { title: 'CSS-GDIN — Broken Access Control', target: 'Gov Complaint System · Spring Boot', cvss: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N — 7.5 HIGH',
      req: 'GET /api/complaints/all HTTP/1.1\nHost: css-gdin.gov.kh\n# no Authorization header',
      res: 'HTTP/1.1 200 OK\n\n{"total":1247,"records":[\n  {"id":1,"name":"[REDACTED]", ... }]}',
      impact: 'An unauthenticated endpoint returned 1,000+ citizen complaint records including PII.',
      fix: 'Apply authentication + authorization filters to all data endpoints; deny-by-default routing.', repo: 'https://github.com/MoriartyPuth-Labs/CSS-GDIN-Security-Case-Study' },
    'F.03': { title: 'AUPP CTF — Cloudflare Origin Exposure + WAF Bypass', target: 'University CTF Platform', cvss: '1 Critical · 3 High — 26 findings',
      req: 'curl -H "Host: ctf.aupp.edu.kh" https://[ORIGIN-IP]/\n# Cloudflare proxy bypassed',
      res: 'HTTP/1.1 200 OK  ← served directly by origin\nDDoS exposure: 0% → 80%',
      impact: 'Exposed origin IP allowed attackers to bypass Cloudflare protections and hit the server directly.',
      fix: 'Restrict origin firewall to Cloudflare IP ranges; rotate the origin IP after exposure.', repo: 'https://github.com/MoriartyPuth-Labs/AUPP-CTF-Platform-Security-Study-Case' },
    'F.04': { title: 'DoccameraDLL — Zero-Auth WebSocket Hardware Access', target: 'Document-camera DLL bridge', cvss: '4 Critical · 8 High — 19 findings',
      req: 'ws://localhost:3456/\n→ {"cmd":"read_id_card"}',
      res: '← [CITIZEN ID DATA]\n← [LIVE CAMERA STREAM]\n# no authentication layer',
      impact: 'Any local process (incl. a malicious webpage) could drive the camera and read scanned national-ID data.',
      fix: 'Require an origin allowlist + per-session token on the WebSocket; bind to loopback with auth handshake.', repo: 'https://github.com/MoriartyPuth-Labs/DoccameraDLL-Security-Case-Study' },
    'F.05': { title: 'JoulHub — CORS Misconfiguration → Credential Theft', target: 'joulhub.com · SaaS', cvss: '2 High · 3 Medium — 10× OWASP',
      req: 'GET /api/account HTTP/1.1\nOrigin: https://attacker.com\nCookie: session=...',
      res: 'Access-Control-Allow-Origin: https://attacker.com\nAccess-Control-Allow-Credentials: true',
      impact: 'Reflected Origin with credentials enabled cross-site reads of authenticated responses — full account takeover PoC.',
      fix: 'Never reflect arbitrary Origins with credentials; use a strict allowlist of trusted origins.', repo: 'https://github.com/MoriartyPuth-Labs/Joulhub-Security-Case-Study' },
    'F.06': { title: 'SOP — IDOR + Undeployed Patches', target: 'Van Mgmt System · FastAPI / Railway', cvss: '2 Critical · 6 High — 19 findings',
      req: 'GET /api/vans/[ID] HTTP/1.1\nAuthorization: (none)',
      res: 'HTTP/1.1 200 OK\n→ IDOR + path traversal\n# fixes coded, never deployed',
      impact: 'Object references were exploitable and remediation code existed but was never shipped to production.',
      fix: 'Authorize every object access; add a deploy gate so security fixes reach production and are verified.', repo: 'https://github.com/MoriartyPuth-Labs/SOP-Security-Case-Study' },
    'F.07': { title: 'OWIT Global — Auth-Filter Bypass', target: 'Insurance SaaS · Spring Boot / .NET / AWS EKS', cvss: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N — 8.1 HIGH',
      req: 'GET /docs/[endpoint] HTTP/1.1\nAuthorization: (none)',
      res: 'HTTP/1.1 200 OK\n→ unauthorized file upload / read / callback',
      impact: 'The authentication filter could be bypassed on document endpoints, exposing upload/read/callback flows.',
      fix: 'Normalize paths before filter evaluation; apply the auth filter to all sub-paths and callbacks.', repo: 'https://github.com/MoriartyPuth-Labs/OWIT-Global-Security-Case-Study' }
  };

  const drawer = document.createElement('div');
  drawer.id = 'evidence-drawer';
  drawer.innerHTML = '<div class="ev-scrim"></div><aside class="ev-panel" role="dialog" aria-label="Case evidence"><div class="ev-bar"><span class="burp-dots"><i class="bd-r"></i><i class="bd-y"></i><i class="bd-g"></i></span><span class="ev-bar-title">forensic://evidence</span><button class="ev-x" aria-label="Close">✕</button></div><div class="ev-content"></div></aside>';
  document.body.appendChild(drawer);
  const content = drawer.querySelector('.ev-content');
  const close = () => drawer.classList.remove('ev-open');
  drawer.querySelector('.ev-x').addEventListener('click', close);
  drawer.querySelector('.ev-scrim').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  function openDrawer(id) {
    const d = EVID[id]; if (!d) return;
    content.innerHTML =
      '<div class="ev-case">' + id + ' <span class="ev-case-cvss">' + d.cvss + '</span></div>' +
      '<h4 class="ev-title">' + d.title + '</h4>' +
      '<div class="ev-target">▸ ' + d.target + '</div>' +
      '<div class="ev-block"><div class="ev-label">REQUEST</div><pre class="ev-pre ev-req">' + d.req + '</pre></div>' +
      '<div class="ev-block"><div class="ev-label">RESPONSE</div><pre class="ev-pre ev-res">' + d.res + '</pre></div>' +
      '<div class="ev-block"><div class="ev-label ev-label--red">IMPACT</div><p class="ev-text">' + d.impact + '</p></div>' +
      '<div class="ev-block"><div class="ev-label ev-label--green">REMEDIATION</div><p class="ev-text">' + d.fix + '</p></div>' +
      '<a class="ev-repo" href="' + d.repo + '" target="_blank" rel="noopener">View full case study on GitHub →</a>';
    drawer.classList.add('ev-open');
  }

  cards.forEach(card => {
    const caseEl = card.querySelector('.fr-case');
    if (!caseEl) return;
    const id = caseEl.textContent.trim();
    if (!EVID[id]) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fr-evbtn';
    btn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> evidence';
    btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openDrawer(id); });
    const foot = card.querySelector('.fr-card-foot');
    (foot || card).appendChild(btn);
  });
})();

// ════════════════════════════════════════════════════════════════════════════
//  Konami Code  —  ↑↑↓↓←→←→ B A  →  root shell unlock
// ════════════════════════════════════════════════════════════════════════════
(function () {
  const SEQ = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  let pos = 0;
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const k = e.key.toLowerCase();
    pos = (k === SEQ[pos]) ? pos + 1 : (k === SEQ[0] ? 1 : 0);
    if (pos === SEQ.length) { pos = 0; unlock(); }
  });

  function unlock() {
    if (document.getElementById('konami-root')) return;
    const ov = document.createElement('div');
    ov.id = 'konami-root';
    ov.innerHTML =
      '<canvas id="konami-rain"></canvas>' +
      '<div class="kr-term">' +
        '<div class="kr-bar"><span class="burp-dots"><i class="bd-r"></i><i class="bd-y"></i><i class="bd-g"></i></span>' +
        '<span class="kr-bar-title">root@moriarty:~# — PRIVILEGE ESCALATED</span><button class="kr-x" aria-label="Close">✕</button></div>' +
        '<div class="kr-body" id="kr-body"></div>' +
      '</div>';
    document.body.appendChild(ov);
    requestAnimationFrame(() => ov.classList.add('kr-open'));
    const closeKr = () => { stop = true; ov.classList.remove('kr-open'); setTimeout(() => ov.remove(), 400); };
    ov.querySelector('.kr-x').addEventListener('click', closeKr);
    ov.addEventListener('click', e => { if (e.target === ov) closeKr(); });

    const krBody = document.getElementById('kr-body');
    const lines = [
      { t: '$ ./privesc.sh --konami', c: 'kr-cmd', d: 200 },
      { t: '[*] exploiting CVE-1986-KONAMI (the classic)…', c: 'kr-dim', d: 700 },
      { t: '[+] 30 extra lives granted', c: 'kr-ok', d: 1300 },
      { t: '[+] uid=0(root) gid=0(root) — you found the secret', c: 'kr-ok', d: 1800 },
      { t: '', c: '', d: 2200 },
      { t: 'Well played. If you went looking for the cheat code,', c: 'kr-white', d: 2400 },
      { t: 'we\'d probably get along. I\'m open to security roles —', c: 'kr-white', d: 2800 },
      { t: 'let\'s talk.', c: 'kr-white', d: 3200 },
      { t: 'LINK::mailto:p.camboeav@gmail.com::→ p.camboeav@gmail.com', c: 'link', d: 3700 },
      { t: 'LINK::https://github.com/MoriartyPuth::→ github.com/MoriartyPuth', c: 'link', d: 4000 },
      { t: 'root@moriarty:~# ▋', c: 'kr-prompt', d: 4500 }
    ];
    lines.forEach(l => setTimeout(() => {
      const d = document.createElement('div');
      d.className = 'kr-line ' + (l.c || '');
      if (l.t.startsWith('LINK::')) {
        const [, href, label] = l.t.split('::');
        d.innerHTML = '<a href="' + href + '" target="_blank" rel="noopener" class="kr-link">' + label + '</a>';
      } else d.textContent = l.t;
      krBody.appendChild(d); krBody.scrollTop = krBody.scrollHeight;
    }, l.d));

    // matrix rain
    const canvas = document.getElementById('konami-rain');
    const ctx = canvas.getContext('2d');
    let stop = false;
    function size() { canvas.width = innerWidth; canvas.height = innerHeight; }
    size(); addEventListener('resize', size);
    const cols = Math.floor(innerWidth / 14);
    const drops = new Array(cols).fill(1);
    const glyphs = 'アカサタナ0123456789ABCDEFモリアーティ$#%&'.split('');
    (function draw() {
      if (stop) return;
      ctx.fillStyle = 'rgba(4,8,4,0.08)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#22c55e'; ctx.font = '14px monospace';
      drops.forEach((y, i) => {
        ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * 14, y * 14);
        if (y * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      requestAnimationFrame(draw);
    })();
  }
})();

// ════════════════════════════════════════════════════════════════════════════
//  Visitor Recon Toast  —  subtle once-per-session fingerprint nudge
// ════════════════════════════════════════════════════════════════════════════
(function () {
  if (!document.getElementById('cmdbar-body')) return;            // index only
  if (sessionStorage.getItem('reconToast')) return;
  sessionStorage.setItem('reconToast', '1');
  const booted = sessionStorage.getItem('booted');
  const delay = booted ? 2200 : 6200;
  setTimeout(() => {
    let os = 'your machine';
    const ua = navigator.userAgent;
    if (/Windows/.test(ua)) os = 'Windows'; else if (/Mac OS X/.test(ua)) os = 'macOS';
    else if (/Android/.test(ua)) os = 'Android'; else if (/iPhone|iPad/.test(ua)) os = 'iOS'; else if (/Linux/.test(ua)) os = 'Linux';
    let tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {}
    const toast = document.createElement('div');
    toast.id = 'recon-toast';
    toast.innerHTML =
      '<div class="rt-head"><span class="rt-dot"></span>passive recon</div>' +
      '<div class="rt-line">target: <b>' + os + '</b>' + (tz ? ' · ' + tz : '') + '</div>' +
      '<div class="rt-cta">type <code>recon</code> in the shell for the full scan →</div>' +
      '<button class="rt-x" aria-label="Dismiss">✕</button>';
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('rt-in'));
    const kill = () => { toast.classList.remove('rt-in'); setTimeout(() => toast.remove(), 400); };
    toast.querySelector('.rt-x').addEventListener('click', kill);
    setTimeout(kill, 9000);
  }, delay);
})();

// ════════════════════════════════════════════════════════════════════════════
//  Field Operations Console  —  master/detail case browser (merged reports+board)
// ════════════════════════════════════════════════════════════════════════════
(function () {
  const list = document.getElementById('fo-list');
  const detail = document.getElementById('fo-detail');
  if (!list || !detail) return;
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  const CASES = [
    { id: 'F.01', name: 'EES / ANPR', target: 'Ministry of Interior · ANPR System',
      sev: '9.8', sevClass: 'crit', type: 'IDOR · Mobile', findings: '1 Critical',
      statusText: 'Patched < 24h', statusClass: 'done',
      cvss: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H · 9.8 CRITICAL',
      req: 'GET /api/v1/bureaus/1042 HTTP/1.1\nHost: ees.gov.kh\nAuthorization: Bearer eyJhbGciOiJIUzI1...',
      res: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"id":1042,"bureau":"[REDACTED]",\n "records":[ ... 100+ entries ... ]}',
      impact: 'Sequential bureau IDs let any authenticated user enumerate 100+ law-enforcement bureau records belonging to other tenants.',
      fix: 'Enforce object-level authorization on every record fetch; replace predictable integer IDs with unguessable UUIDs.',
      repo: 'https://github.com/MoriartyPuth-Labs/EES-Security-Case-Study' },
    { id: 'F.02', name: 'CSS-GDIN', target: 'Gov Complaint System · Spring Boot',
      sev: '7.5', sevClass: 'high', type: 'IDOR · BAC', findings: '1 High',
      statusText: 'Patched < 24h', statusClass: 'done',
      cvss: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N · 7.5 HIGH',
      req: 'GET /api/complaints/all HTTP/1.1\nHost: css-gdin.gov.kh\n# no Authorization header',
      res: 'HTTP/1.1 200 OK\n\n{"total":1247,"records":[\n  {"id":1,"name":"[REDACTED]", ... }]}',
      impact: 'An unauthenticated endpoint returned 1,000+ citizen complaint records including PII.',
      fix: 'Apply authentication + authorization filters to all data endpoints; deny-by-default routing.',
      repo: 'https://github.com/MoriartyPuth-Labs/CSS-GDIN-Security-Case-Study' },
    { id: 'F.03', name: 'AUPP CTF', target: 'University CTF Platform',
      sev: 'CRIT', sevClass: 'crit', type: 'External + Internal', findings: '1 Crit · 3 High (26 total)',
      statusText: 'Report Delivered', statusClass: 'info',
      cvss: '1 Critical · 3 High · 26 findings across 6 sessions',
      req: 'curl -H "Host: ctf.aupp.edu.kh" https://[ORIGIN-IP]/\n# Cloudflare proxy bypassed',
      res: 'HTTP/1.1 200 OK  ← served directly by origin\nDDoS exposure: 0% → 80%',
      impact: 'Exposed origin IP allowed attackers to bypass Cloudflare protections and hit the server directly.',
      fix: 'Restrict origin firewall to Cloudflare IP ranges; rotate the origin IP after exposure.',
      repo: 'https://github.com/MoriartyPuth-Labs/AUPP-CTF-Platform-Security-Study-Case' },
    { id: 'F.04', name: 'DoccameraDLL', target: 'Document-camera DLL bridge',
      sev: 'CRIT', sevClass: 'crit', type: 'API · Hardware', findings: '4 Crit · 8 High (19 total)',
      statusText: 'Remediation', statusClass: 'active',
      cvss: '4 Critical · 8 High · 19 findings',
      req: 'ws://localhost:3456/\n→ {"cmd":"read_id_card"}',
      res: '← [CITIZEN ID DATA]\n← [LIVE CAMERA STREAM]\n# no authentication layer',
      impact: 'Any local process (including a malicious webpage) could drive the camera and read scanned national-ID data.',
      fix: 'Require an origin allowlist + per-session token on the WebSocket; bind to loopback with an auth handshake.',
      repo: 'https://github.com/MoriartyPuth-Labs/DoccameraDLL-Security-Case-Study' },
    { id: 'F.05', name: 'JoulHub', target: 'joulhub.com · SaaS Platform',
      sev: 'HIGH', sevClass: 'high', type: 'Web App · CORS', findings: '2 High · 3 Med (10× OWASP)',
      statusText: 'Report Delivered', statusClass: 'info',
      cvss: '2 High · 3 Medium · 10× OWASP categories',
      req: 'GET /api/account HTTP/1.1\nOrigin: https://attacker.com\nCookie: session=...',
      res: 'Access-Control-Allow-Origin: https://attacker.com\nAccess-Control-Allow-Credentials: true',
      impact: 'Reflected Origin with credentials enabled cross-site reads of authenticated responses — full account-takeover PoC.',
      fix: 'Never reflect arbitrary Origins with credentials; use a strict allowlist of trusted origins.',
      repo: 'https://github.com/MoriartyPuth-Labs/Joulhub-Security-Case-Study' },
    { id: 'F.06', name: 'SOP', target: 'Van Mgmt System · FastAPI / Railway',
      sev: 'CRIT', sevClass: 'crit', type: 'White-box + Black-box', findings: '2 Crit · 6 High (19 total)',
      statusText: 'Report Delivered', statusClass: 'info',
      cvss: '2 Critical · 6 High · 19 findings',
      req: 'GET /api/vans/[ID] HTTP/1.1\nAuthorization: (none)',
      res: 'HTTP/1.1 200 OK\n→ IDOR + path traversal\n# fixes coded, never deployed',
      impact: 'Object references were exploitable and remediation code existed but was never shipped to production.',
      fix: 'Authorize every object access; add a deploy gate so security fixes actually reach production and are verified.',
      repo: 'https://github.com/MoriartyPuth-Labs/SOP-Security-Case-Study' },
    { id: 'F.07', name: 'OWIT Global', target: 'Insurance SaaS · Spring Boot / .NET / AWS EKS',
      sev: '8.1', sevClass: 'high', type: 'Black-box', findings: '1 High · 3 Med (13 total)',
      statusText: 'Remediation', statusClass: 'active',
      cvss: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N · 8.1 HIGH',
      req: 'GET /docs/[endpoint] HTTP/1.1\nAuthorization: (none)',
      res: 'HTTP/1.1 200 OK\n→ unauthorized file upload / read / callback',
      impact: 'The authentication filter could be bypassed on document endpoints, exposing upload/read/callback flows.',
      fix: 'Normalize paths before filter evaluation; apply the auth filter to all sub-paths and callbacks.',
      repo: 'https://github.com/MoriartyPuth-Labs/OWIT-Global-Security-Case-Study' }
  ];

  list.innerHTML = CASES.map((c, i) =>
    '<button class="fo-row' + (i === 0 ? ' fo-row--active' : '') + '" role="tab" data-i="' + i + '" aria-selected="' + (i === 0 ? 'true' : 'false') + '">' +
      '<span class="fo-row-dot fo-dot--' + c.statusClass + '"></span>' +
      '<span class="fo-row-id">' + c.id + '</span>' +
      '<span class="fo-row-name">' + c.name + '</span>' +
      '<span class="fo-sev fo-sev--' + c.sevClass + '">' + c.sev + '</span>' +
    '</button>'
  ).join('');

  function renderDetail(c) {
    detail.innerHTML =
      '<div class="fo-d-top">' +
        '<div>' +
          '<div class="fo-d-case">' + c.id + ' <span class="fo-d-status fo-status--' + c.statusClass + '">' + c.statusText + '</span></div>' +
          '<h4 class="fo-d-title">' + c.name + '</h4>' +
          '<div class="fo-d-target">▸ ' + esc(c.target) + '</div>' +
        '</div>' +
        '<span class="fo-sev fo-sev--' + c.sevClass + ' fo-sev--lg">' + c.sev + '</span>' +
      '</div>' +
      '<div class="fo-d-meta">' +
        '<div><span class="fo-d-k">TYPE</span><span class="fo-d-v">' + esc(c.type) + '</span></div>' +
        '<div><span class="fo-d-k">FINDINGS</span><span class="fo-d-v">' + esc(c.findings) + '</span></div>' +
        '<div class="fo-d-meta-wide"><span class="fo-d-k">CVSS</span><span class="fo-d-v fo-d-cvss">' + esc(c.cvss) + '</span></div>' +
      '</div>' +
      '<div class="fo-d-ev">' +
        '<div class="fo-d-evcol"><div class="fo-d-label">REQUEST</div><pre class="fo-d-pre fo-d-req">' + esc(c.req) + '</pre></div>' +
        '<div class="fo-d-evcol"><div class="fo-d-label">RESPONSE</div><pre class="fo-d-pre fo-d-res">' + esc(c.res) + '</pre></div>' +
      '</div>' +
      '<div class="fo-d-block"><span class="fo-d-label fo-d-label--red">IMPACT</span><p class="fo-d-text">' + esc(c.impact) + '</p></div>' +
      '<div class="fo-d-block"><span class="fo-d-label fo-d-label--green">REMEDIATION</span><p class="fo-d-text">' + esc(c.fix) + '</p></div>' +
      '<a class="fo-d-repo" href="' + c.repo + '" target="_blank" rel="noopener">View full case study on GitHub →</a>';
  }
  renderDetail(CASES[0]);

  const rows = () => list.querySelectorAll('.fo-row');
  function select(i) {
    rows().forEach((r, j) => {
      r.classList.toggle('fo-row--active', j === i);
      r.setAttribute('aria-selected', j === i ? 'true' : 'false');
    });
    renderDetail(CASES[i]);
  }
  list.addEventListener('click', e => {
    const row = e.target.closest('.fo-row');
    if (row) select(parseInt(row.dataset.i, 10));
  });
  list.addEventListener('keydown', e => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const cur = list.querySelector('.fo-row--active');
    let i = cur ? parseInt(cur.dataset.i, 10) : 0;
    i = e.key === 'ArrowDown' ? Math.min(CASES.length - 1, i + 1) : Math.max(0, i - 1);
    select(i);
    rows()[i].focus();
  });
})();

// ════════════════════════════════════════════════════════════════════════════
//  Tool Demo Terminals  —  type a command + show output inside each tool card
// ════════════════════════════════════════════════════════════════════════════
(function () {
  var configs = [
    { id: 'tool-term-1', ps: '~/aura $', cmd: 'aura scan 10.10.14.0/24 --chain',
      out: [
        { t: '[*] recon: 14 hosts up · 92 ports open', c: 'tt-info', d: 420 },
        { t: '[+] 3 exploit-paths mapped → report.json', c: 'tt-ok', d: 940 }
      ] },
    { id: 'tool-term-2', ps: '~/sila $', cmd: 'sila-entropy audit --wordlist km.txt',
      out: [
        { t: '[*] model: Khmer + EN linguistic analysis', c: 'tt-info', d: 420 },
        { t: '[+] 1,204 weak credentials flagged', c: 'tt-ok', d: 940 }
      ] }
  ];
  var UID = 0;
  function typePrompt(el, ps, cmd, done) {
    var sid = 'tt-s' + (UID++), cid = 'tt-c' + UID;
    var d = document.createElement('div');
    d.className = 'tt-line tt-cmd';
    d.innerHTML = '<span class="tt-ps">' + ps + '</span> <span id="' + sid + '"></span><span class="tt-cur" id="' + cid + '">_</span>';
    el.appendChild(d);
    var span = document.getElementById(sid), cur = document.getElementById(cid), i = 0;
    var iv = setInterval(function () {
      span.textContent += cmd[i++];
      if (i >= cmd.length) { clearInterval(iv); cur.style.display = 'none'; if (done) setTimeout(done, 150); }
    }, 34);
  }
  configs.forEach(function (cfg) {
    var el = document.getElementById(cfg.id);
    if (!el) return;
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      setTimeout(function () {
        typePrompt(el, cfg.ps, cfg.cmd, function () {
          cfg.out.forEach(function (o) {
            setTimeout(function () {
              var d = document.createElement('div');
              d.className = 'tt-line ' + o.c;
              d.textContent = o.t;
              el.appendChild(d);
            }, o.d);
          });
        });
      }, 250);
    }, { threshold: 0.5 });
    io.observe(el);
  });
})();

// ── Footer year (keeps copyright current automatically) ──────────────────────
(function () {
  var fy = document.getElementById('footer-year');
  if (fy) fy.textContent = new Date().getFullYear();
})();

// ════════════════════════════════════════════════════════════════════════════
//  Section Index Rail  —  scroll-spy nav in the left gutter (wide screens only)
// ════════════════════════════════════════════════════════════════════════════
(function () {
  var defs = [
    { n: '01', label: 'Top',          sel: '.hero' },
    { n: '02', label: 'Case Studies', sel: '.field-ops' },
    { n: '03', label: 'Community',    sel: '.community-section' },
    { n: '04', label: 'Tools',        sel: '.pinned-section' },
    { n: '05', label: 'Writeups',     sel: '.writeups-section' },
    { n: '06', label: 'Skills',       sel: '.skills-tooling-row' },
    { n: '07', label: 'whoami',       sel: '.about-section' }
  ];
  var items = defs
    .map(function (d) { return { d: d, el: document.querySelector(d.sel) }; })
    .filter(function (x) { return x.el; });
  if (items.length < 3) return;   // home only

  var rail = document.createElement('nav');
  rail.className = 'section-rail';
  rail.setAttribute('aria-label', 'Section index');
  rail.innerHTML = '<div class="srail-head">// index</div>';
  items.forEach(function (x, i) {
    var a = document.createElement('a');
    a.className = 'srail-item' + (i === 0 ? ' srail-item--active' : '');
    a.href = 'javascript:void(0)';
    a.innerHTML = '<span class="srail-num">' + x.d.n + '</span><span class="srail-label">' + x.d.label + '</span>';
    a.addEventListener('click', function () { x.el.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    x.link = a;
    rail.appendChild(a);
  });
  document.body.appendChild(rail);

  function setActive(el) {
    items.forEach(function (x) { x.link.classList.toggle('srail-item--active', x.el === el); });
  }
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target); });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  items.forEach(function (x) { obs.observe(x.el); });
})();

/* ── Bubble Suite tabbed output panel + pipeline animation ── */
(function () {
  var panel = document.querySelector('.bsuite-panel');
  if (!panel) return;

  var cards  = Array.from(document.querySelectorAll('[data-bsuite-phase]'));
  var runBtn = document.getElementById('bsuite-run');
  var animTimer = null;
  var isRunning = false;

  /* ── pipeline content ── */
  var P = [
    /* Phase 0 – scanner (BUBBLE-BASH) */
    { p:0, h:'<span class="kali-user">┌──(bubble㉿kali)</span><span class="kali-path">-[~/tools]</span>', d:0 },
    { p:0, h:'<span class="kali-path">└─<span class="kali-dollar">$</span></span> ./bubble_scanner.sh <span class="kali-arg">http://192.168.1.150</span>', d:80 },
    { p:0, h:'', d:250 },
    { p:0, h:'<span class="kali-cyan">● BUBBLE-BASH REPORT EDITION V37.0 ●</span>', d:300 },
    { p:0, h:'<span class="kali-dim">Loot &amp; TXT Report: ./bubble_loot_1771677480</span>', d:150 },
    { p:0, h:'', d:100 },
    { p:0, h:'<span class="kali-orange">── DIVE START: http://192.168.1.150 ──</span>', d:220 },
    { p:0, h:'<span class="kali-orange">[!] POP! Found: http://192.168.1.150/</span>', d:450 },
    { p:0, h:'', d:100 },
    { p:0, h:'<span class="kali-dim">─────────────────────────────────────────</span>', d:80 },
    { p:0, h:'          SCAN COMPLETE', d:120 },
    { p:0, h:'<span class="kali-dim">─────────────────────────────────────────</span>', d:80 },
    { p:0, h:'', d:100 },
    { p:0, h:'<span class="kali-good">[+]</span> All findings saved to: <span class="kali-val">./bubble_loot_1771677480/final_report.txt</span>', d:120 },
    { p:0, h:'<span class="kali-good">[+]</span> Leaked files and secrets saved in: <span class="kali-val">./bubble_loot_1771677480</span>', d:120 },
    { p:0, h:'', d:60 },
    { p:0, h:'<span class="kali-info">[*]</span> Handoff <span class="kali-arrow">→</span> bubble-pop : <span class="kali-good">target confirmed</span>', d:220 },
    /* Phase 1 – pop */
    { p:1, h:'<span class="kali-user">┌──(bubble㉿kali)</span><span class="kali-path">-[~/tools]</span>', d:500 },
    { p:1, h:'<span class="kali-path">└─<span class="kali-dollar">$</span></span> ./bubble_pop.sh <span class="kali-arg">https://api.site.com/v1/user</span>', d:80 },
    { p:1, h:'', d:60 },
    { p:1, h:'<span class="kali-info">[*]</span> Target    : <span class="kali-val">https://api.site.com/v1/user</span>', d:120 },
    { p:1, h:'<span class="kali-info">[*]</span> Wordlist  : <span class="kali-val">/usr/share/wordlists/params/common.txt</span>', d:80 },
    { p:1, h:'<span class="kali-info">[*]</span> Threads   : <span class="kali-val">10</span>  |  Timeout: <span class="kali-val">5s</span>', d:80 },
    { p:1, h:'', d:60 },
    { p:1, h:'<span class="kali-good">[+]</span> ?debug=true       <span class="kali-arrow">→</span> <span class="kali-code">200</span>  internal config exposed', d:190 },
    { p:1, h:'<span class="kali-good">[+]</span> ?version=v2       <span class="kali-arrow">→</span> <span class="kali-code">200</span>  undocumented endpoint found', d:190 },
    { p:1, h:'<span class="kali-good">[+]</span> ?admin=1          <span class="kali-arrow">→</span> <span class="kali-code">403</span>  parameter exists (restricted)', d:190 },
    { p:1, h:'<span class="kali-warn">[!]</span> IDOR candidate   <span class="kali-arrow">→</span> /v1/user?id=<span class="kali-hl">2</span> accessible', d:190 },
    { p:1, h:'', d:60 },
    { p:1, h:'<span class="kali-info">[*]</span> Completed — <span class="kali-good">4 findings</span> in 8.4s', d:120 },
    { p:1, h:'<span class="kali-info">[*]</span> Handoff <span class="kali-arrow">→</span> bubble-siphon : <span class="kali-good">target 192.168.1.150 confirmed</span>', d:220 },
    /* Phase 2 – siphon */
    { p:2, h:'<span class="kali-user">┌──(bubble㉿kali)</span><span class="kali-path">-[~/tools]</span>', d:500 },
    { p:2, h:'<span class="kali-path">└─<span class="kali-dollar">$</span></span> curl -X POST -F <span class="kali-arg">"file=@bubble_siphon.sh"</span> http://192.168.1.150/profile.php', d:80 },
    { p:2, h:'', d:350 },
    { p:2, h:'<span class="kali-html">&lt;!DOCTYPE html&gt;</span>', d:100 },
    { p:2, h:'<span class="kali-html">&lt;html&gt;&lt;head&gt;&lt;title&gt;profile&lt;/title&gt;&lt;/head&gt;</span>', d:80 },
    { p:2, h:'<span class="kali-html">&lt;link rel="stylesheet" href="bootstrap.min.css"&gt;</span>', d:80 },
    { p:2, h:'<span class="kali-html">&lt;body&gt;</span>', d:60 },
    { p:2, h:'<span class="kali-html">  &lt;nav class="navbar navbar-inverse navbar-fixed-top"&gt;...&lt;/nav&gt;</span>', d:80 },
    { p:2, h:'<span class="kali-html">  &lt;br&gt;&lt;br&gt;&lt;br&gt;</span>', d:60 },
    { p:2, h:'  <span class="kali-hl" style="font-size:14px;letter-spacing:.03em;">FLAG{N7...}</span>', d:300 },
    { p:2, h:'', d:60 },
    { p:2, h:'<span class="kali-good">[+]</span> Extraction complete — <span class="kali-good">flag captured</span>', d:160 },
  ];

  /* pre elements */
  var pres = [
    document.getElementById('bsp-0'),
    document.getElementById('bsp-1'),
    document.getElementById('bsp-2'),
  ];

  function setActiveCard(idx) {
    cards.forEach(function (c) { c.classList.remove('tool-card--phase-active', 'phase-strip-item--active'); });
    if (cards[idx]) cards[idx].classList.add('tool-card--phase-active');
  }

  function switchTab(idx) {
    panel.querySelectorAll('.bstab').forEach(function (t) { t.classList.remove('bstab--active'); });
    panel.querySelectorAll('.bstab-pane').forEach(function (p) { p.classList.remove('bstab-pane--active'); });
    var tab  = panel.querySelector('.bstab[data-tab="' + idx + '"]');
    var pane = panel.querySelector('.bstab-pane[data-pane="' + idx + '"]');
    if (tab)  tab.classList.add('bstab--active');
    if (pane) pane.classList.add('bstab-pane--active');
    setActiveCard(idx);
  }

  var paused = false;
  var loopIdx = 0;
  var loopPhase = 0;

  function resetPres() {
    pres.forEach(function (p) { if (p) p.innerHTML = ''; });
  }

  function stopAnim() {
    if (animTimer) { clearTimeout(animTimer); animTimer = null; }
    isRunning = false;
  }

  function tick() {
    if (paused) return;

    if (loopIdx >= P.length) {
      /* end of pipeline — stop */
      isRunning = false;
      return;
    }

    var line = P[loopIdx];
    if (line.p !== loopPhase) {
      loopPhase = line.p;
      switchTab(loopPhase);
    }
    if (pres[loopPhase]) {
      var s = document.createElement('span');
      s.innerHTML = line.h;
      pres[loopPhase].appendChild(s);
      pres[loopPhase].appendChild(document.createTextNode('\n'));
    }
    loopIdx++;
    animTimer = setTimeout(tick, line.d);
  }

  function startLoop() {
    if (isRunning || paused) return;
    isRunning = true;
    tick();
  }

  /* pause / resume button */
  if (runBtn) {
    runBtn.addEventListener('click', function () {
      paused = !paused;
      if (paused) {
        stopAnim();
        runBtn.textContent = '▶ Resume';
        runBtn.classList.add('is-running');
      } else {
        runBtn.textContent = '❚❚ Pause';
        runBtn.classList.remove('is-running');
        isRunning = false;
        startLoop();
      }
    });
  }

  /* auto-start when panel enters viewport; respect reduced-motion */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    /* static fill for reduced-motion users */
    var grouped = [[],[],[]];
    P.forEach(function (l) { grouped[l.p].push(l.h); });
    grouped.forEach(function (lines, i) {
      if (pres[i]) pres[i].innerHTML = lines.map(function (h) { return '<span>' + h + '</span>'; }).join('\n');
    });
    if (runBtn) runBtn.style.display = 'none';
  } else {
    var suiteObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { startLoop(); suiteObs.disconnect(); }
    }, { threshold: 0.25 });
    suiteObs.observe(panel);
  }

  /* tab clicks */
  panel.querySelectorAll('.bstab').forEach(function (btn) {
    btn.addEventListener('click', function () { switchTab(parseInt(this.dataset.tab, 10)); });
  });

  /* phase card clicks */
  cards.forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      var idx = parseInt(this.dataset.bsuitePhase, 10);
      switchTab(idx);
      setTimeout(function () { panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 60);
    });
  });
})();

/* ── Tool output bands (AURA + Sila-Entropy) ── */
(function () {
  var pairs = [
    { triggerId: 'aura-trigger',  bandId: 'aura-output-band' },
    { triggerId: 'sila-trigger',  bandId: 'sila-output-band' },
  ];

  pairs.forEach(function (pair) {
    var trigger = document.getElementById(pair.triggerId);
    var band    = document.getElementById(pair.bandId);
    if (!trigger || !band) return;

    function closeAll() {
      pairs.forEach(function (p) {
        var t = document.getElementById(p.triggerId);
        var b = document.getElementById(p.bandId);
        if (!t || !b) return;
        b.classList.remove('is-open');
        t.setAttribute('aria-expanded', 'false');
        b.setAttribute('aria-hidden', 'true');
      });
    }

    trigger.addEventListener('click', function () {
      var wasOpen = band.classList.contains('is-open');
      closeAll();
      if (!wasOpen) {
        band.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        band.setAttribute('aria-hidden', 'false');
        setTimeout(function () { band.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 80);
      }
    });

    band.querySelector('.sila-band-close').addEventListener('click', function () {
      band.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      band.setAttribute('aria-hidden', 'true');
      trigger.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });
})();

/* ── Fortune: random quote on each page load ── */
(function () {
  var quotes = [
    /* security / hacker */
    { t: 'The quieter you become, the more you are able to hear.', a: 'Kali Linux' },
    { t: 'Security is a process, not a product.', a: 'Bruce Schneier' },
    { t: 'Amateurs hack systems, professionals hack people.', a: 'Bruce Schneier' },
    { t: "There's no patch for human stupidity.", a: 'Kevin Mitnick' },
    { t: 'Given enough eyeballs, all bugs are shallow.', a: "Linus's Law" },
    { t: 'This is our world now... the world of the electron and the switch.', a: 'The Hacker Manifesto' },
    { t: 'We seek after knowledge... and you call us criminals.', a: 'The Hacker Manifesto' },
    { t: 'Hack the planet!', a: 'Hackers (1995)' },
    /* programming wisdom */
    { t: 'There are only two hard things in Computer Science: cache invalidation and naming things.', a: 'Phil Karlton' },
    { t: 'Talk is cheap. Show me the code.', a: 'Linus Torvalds' },
    { t: 'Premature optimization is the root of all evil.', a: 'Donald Knuth' },
    { t: 'Any fool can write code a computer can understand. Good programmers write code humans can understand.', a: 'Martin Fowler' },
    { t: 'Programs must be written for people to read, and only incidentally for machines to execute.', a: 'Abelson & Sussman' },
    { t: 'First, solve the problem. Then, write the code.', a: 'John Johnson' },
    { t: 'Code never lies, comments sometimes do.', a: 'Ron Jeffries' },
    /* jokes */
    { t: "Some people, when confronted with a problem, think 'I know, I'll use regular expressions.' Now they have two problems.", a: 'Jamie Zawinski' },
    { t: "There are 10 kinds of people in the world: those who understand binary and those who don't." },
    { t: "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?'" },
    { t: 'Why do programmers prefer dark mode? Because light attracts bugs.' },
    { t: '99 little bugs in the code... take one down, patch it around, 127 little bugs in the code.' },
    { t: "It's not a bug — it's an undocumented feature." },
    { t: 'To understand recursion, you must first understand recursion.' },
    { t: 'It works on my machine.' },
  ];

  /* shared picker — reused by the interactive shell's `fortune` command */
  window.getFortune = function () {
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  var el = document.getElementById('fortune-quote');
  if (!el) return;

  var q = window.getFortune();

  el.innerHTML = '';
  var text = document.createElement('span');
  text.className = 'fortune-text';
  text.textContent = '"' + q.t + '"';
  el.appendChild(text);
  if (q.a) {
    var attr = document.createElement('span');
    attr.className = 'fortune-attr';
    attr.textContent = q.a;
    el.appendChild(attr);
  }
})();
