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
          '<svg id="nmap-radar-svg" viewBox="0 0 300 300" class="radar-svg">' +
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
      help:             () => ['Commands:','  whoami          · who am I','  ls              · list filesystem','  cat <file>      · read file (try resume.txt, skills.txt, contact.txt)','  ls projects/    · list projects','  ls certs/       · list certifications','  ping <host>     · ping a host','  nmap             · port scan easter egg ;)','  clear            · clear terminal'],
      whoami:           () => ['Moriarty Puth','Offensive Security Researcher','Final-year cybersecurity student · Cambodia','API security · Binary exploitation · AI tooling'],
      ls:               () => ['resume.txt  skills.txt  contact.txt  projects/  certs/'],
      'ls projects/':   () => ['EES-Security-Case-Study/','CSS-GDIN-Security-Case-Study/','AUPP-CTF-Platform-Security/','bubble-scanner/  bubble-pop/  bubble-siphon/','AURA/  Sila-Entropy/'],
      'ls certs/':      () => ['EHE-Ethical-Hacking-Essentials.pdf','NDE-Network-Defense-Essentials.pdf','DFE-Digital-Forensics-Essentials.pdf','Cybersecurity-Attack-Defense-Specialization.pdf'],
      'cat resume.txt': () => ['──────────────────────────────────','Name:    Moriarty Puth','Role:    Offensive Security Researcher','Focus:   API security · Reverse engineering · AI tooling','Notable: Critical IDOR in Cambodian gov systems','         Top-80 crackmes.one ranking','Status:  Open to security roles','──────────────────────────────────'],
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
