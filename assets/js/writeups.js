/* Writeup page — data-driven shell tree.
   To add a writeup: drop one entry in the right dir's `files` array below.
   Branch glyphs (├── / └──) and the summary count are computed automatically.
   `dir` is the repo subfolder the writeup actually lives in (defaults to
   'labs' if omitted — that's Crackmes-WriteUp's flat layout). Vulnhub-WriteUp
   is split by platform: 'vulnhub' | 'aupp' | 'tryhackme' — match it to
   wherever the folder really sits in that repo, it won't always equal `cls`.
   Tag a newly-added entry with `added: 'YYYY-MM'` to feature it in the
   "recent" strip at the top of the page — omit it once it's not new anymore. */
(function () {
  var mount = document.getElementById('wtree-mount');
  if (!mount) return;

  var CB = 'https://github.com/MoriartyPuth-Labs/Crackmes-WriteUp';
  var VB = 'https://github.com/MoriartyPuth-Labs/Vulnhub-WriteUp';

  var dirs = [
    {
      name: 'vulnhub/', repo: VB, verb: 'rooted', label: 'VulnHub · updated weekly',
      files: [
        { folder: 'DC1-Lab',            dir: 'vulnhub', name: 'dc1',            tech: 'Drupalgeddon2 RCE + SUID privesc',          tag: 'VULNHUB', cls: 'vulnhub' },
        { folder: 'Bulldog1-Lab',       dir: 'vulnhub', name: 'bulldog1',       tech: 'Django command injection → root',           tag: 'VULNHUB', cls: 'vulnhub' },
        { folder: 'N7-Lab',             dir: 'vulnhub', name: 'n7',             tech: 'blind time-based SQLi',                     tag: 'VULNHUB', cls: 'vulnhub' },
        { folder: 'Holynix1-Lab',       dir: 'vulnhub', name: 'holynix1',       tech: 'SQLi + LFI → tar.gz privesc',               tag: 'VULNHUB', cls: 'vulnhub', added: '2026-07' },
        { folder: 'Jigsaw1-Lab',        dir: 'vulnhub', name: 'jigsaw1',        tech: 'UDP sniffing + port knocking → ret2libc',   tag: 'VULNHUB', cls: 'vulnhub', added: '2026-07' },
        { folder: 'Katana-Lab',         dir: 'vulnhub', name: 'katana',         tech: 'Linux capabilities privesc (cap_setuid)',   tag: 'VULNHUB', cls: 'vulnhub', added: '2026-07' },
        { folder: 'SkyDog-Lab',         dir: 'vulnhub', name: 'skydog',         tech: '6-flag CTF — ExifTool, CeWL, writable cron', tag: 'VULNHUB', cls: 'vulnhub', added: '2026-07' },
        { folder: 'StarWars1-Lab',      dir: 'vulnhub', name: 'starwars1',      tech: 'Steganography + CeWL wordlist + Hydra',     tag: 'VULNHUB', cls: 'vulnhub', added: '2026-07' },
        { folder: 'Sunset-Dusk-Lab',    dir: 'vulnhub', name: 'sunset-dusk',    tech: 'MySQL INTO OUTFILE → Docker group privesc', tag: 'VULNHUB', cls: 'vulnhub', added: '2026-07' },
        { folder: 'Sunset-Sunrise-Lab', dir: 'vulnhub', name: 'sunset-sunrise', tech: 'Weborf dir traversal + Wine privesc',       tag: 'VULNHUB', cls: 'vulnhub', added: '2026-07' },
        { folder: 'SuperMario-Lab',     dir: 'vulnhub', name: 'supermario',     tech: 'OverlayFS kernel exploit + SSH brute force', tag: 'VULNHUB', cls: 'vulnhub', added: '2026-07' },
        { folder: 'VulnOS1-Lab',        dir: 'vulnhub', name: 'vulnos1',        tech: 'distcc RCE + Webmin file disclosure',       tag: 'VULNHUB', cls: 'vulnhub', added: '2026-07' },
        { folder: 'VulnOS2-Lab',        dir: 'vulnhub', name: 'vulnos2',        tech: 'OpenDocMan SQLi → kernel privesc',          tag: 'VULNHUB', cls: 'vulnhub', added: '2026-07' }
      ]
    },
    {
      name: 'crackmes/', repo: CB, verb: 'solved', label: 'crackmes.one',
      files: [
        { folder: 'The-Alchemist-Lock-Lab',            name: 'the-alchemists-lock', tech: 'packer unpacking & patching',     tag: 'REV', cls: 'rev' },
        { folder: 'MalwareTech-VM1-Lab',               name: 'malwaretech-vm1',     tech: 'custom VM — bytecode analysis',    tag: 'REV', cls: 'rev' },
        { folder: 'Catgirl.crack-Lab',                 name: 'catgirl.crack',       tech: '.NET assembly — IL disassembly',   tag: 'REV', cls: 'rev' },
        { folder: 'Willy-Wonka-Chocolate-Factory-Lab', name: 'willy-wonka',         tech: 'Windows PE — constraint solving',  tag: 'REV', cls: 'rev' },
        { folder: 'CryMore-Lab',                       name: 'crymore',             tech: 'network spoofing — killswitch bypass', tag: 'REV', cls: 'rev' },
        { folder: 'Bobs-Gambling-Lab',                 name: 'bobs-gambling',       tech: 'Windows PE — integer overflow',    tag: 'REV', cls: 'rev' },
        { folder: 'Roullete-Simulator-Lab',            name: 'roullete-simulator',  tech: 'Java — PRNG prediction',           tag: 'REV', cls: 'rev' }
      ]
    },
    {
      name: 'tryhackme/', repo: VB, verb: 'rooted', label: 'TryHackMe',
      files: [
        { folder: 'Pickle-Rick-Lab', dir: 'tryhackme', name: 'pickle-rick', tech: 'command injection + privesc', tag: 'THM', cls: 'thm' }
      ]
    },
    {
      name: 'aupp program/', repo: VB, verb: 'completed', label: 'AUPP coursework',
      files: [
        { folder: 'Full-Chain-SQLi-Case-Study',               dir: 'aupp', name: 'full-chain-sqli',     tech: 'end-to-end SQL injection chain',    tag: 'AUPP', cls: 'aupp' },
        { folder: 'Server-Exploitation-Post-Exploitation-Lab', dir: 'aupp', name: 'server-exploitation', tech: 'Linux exploit + forensic audit',    tag: 'AUPP', cls: 'aupp' },
        { folder: 'MSFVenom-and-Trojan-Lab',                  dir: 'aupp', name: 'msfvenom-trojan',     tech: 'payload engineering + evasion',     tag: 'AUPP', cls: 'aupp' },
        { folder: 'Linux-Data-Analysis-Lab',                  dir: 'aupp', name: 'linux-data-analysis', tech: 'forensic text processing',          tag: 'AUPP', cls: 'aupp' },
        { folder: 'Network-Security-Reconnaissance-Lab',      dir: 'aupp', name: 'network-recon',       tech: 'subnet scanning + profiling',       tag: 'AUPP', cls: 'aupp' }
      ]
    }
  ];

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function href(dir, f) {
    return dir.repo + '/tree/main/' + (f.dir || 'labs') + '/' + f.folder;
  }

  // flatten once — feeds both the "recent" strip and the pager's search list
  var flat = [];
  dirs.forEach(function (dir) {
    dir.files.forEach(function (f) {
      flat.push({ dirName: dir.name, repo: dir.repo, dir: dir, f: f, url: href(dir, f) });
    });
  });

  /* ── Tree render (folders start collapsed — see A: collapse by default) ── */
  var html = '', total = 0;
  dirs.forEach(function (dir, di) {
    var lastDir = di === dirs.length - 1;
    var dirBranch = lastDir ? '└──' : '├──';
    var cont = lastDir ? '    ' : '│   ';
    total += dir.files.length;

    var count = dir.files.length + ' ' + dir.verb + ' · ' + dir.label;
    html +=
      '<div class="wtree-dir" data-dir="' + di + '">' +
        '<span class="wtree-branch">' + dirBranch + '</span>' +
        '<span class="wtree-fold" aria-hidden="true">▸</span>' +
        '<a class="wtree-dirname" href="' + dir.repo + '" target="_blank" rel="noopener">' + esc(dir.name) + '</a>' +
        '<span class="wtree-count">' + esc(count) + '</span>' +
      '</div>' +
      '<div class="wtree-files wtree-collapsed" data-files="' + di + '">';

    dir.files.forEach(function (f, fi) {
      var branch = cont + (fi === dir.files.length - 1 ? '└──' : '├──');
      html +=
        '<a class="wtree-file" href="' + href(dir, f) + '" target="_blank" rel="noopener">' +
          '<span class="wtree-branch">' + branch + '</span>' +
          '<span class="wtree-fname">' + esc(f.name) + '</span>' +
          '<span class="wtree-tech">' + esc(f.tech) + '</span>' +
          '<span class="wtree-tag tag--' + f.cls + '">' + esc(f.tag) + '</span>' +
        '</a>';
    });

    html += '</div>';
  });

  mount.innerHTML = html;

  var sum = document.getElementById('wtree-summary');
  if (sum) sum.textContent = dirs.length + ' directories, ' + total + ' writeups · click a folder to unfold · click a file to open on GitHub';

  mount.querySelectorAll('.wtree-dir').forEach(function (row) {
    row.addEventListener('click', function (e) {
      if (e.target.closest('.wtree-dirname')) return;
      var di = row.getAttribute('data-dir');
      var files = mount.querySelector('.wtree-files[data-files="' + di + '"]');
      if (!files) return;
      var collapsed = files.classList.toggle('wtree-collapsed');
      var fold = row.querySelector('.wtree-fold');
      if (fold) fold.textContent = collapsed ? '▸' : '▾';
    });
  });

  /* ── C: "recent" strip — newest-tagged entries, framed as a log tail ── */
  var recentMount = document.getElementById('wtree-recent-mount');
  if (recentMount) {
    var recent = flat.filter(function (x) { return !!x.f.added; }).slice(-5);
    if (recent.length) {
      var rhtml =
        '<div class="wtree-line wtree-cmd"><span class="wtree-prompt">visitor@moriarty</span><span class="wtree-sep">:</span><span class="wtree-path">~/writeups</span><span class="wtree-dollar">$</span> tail -n ' + recent.length + ' .git/RECENT</div>';
      recent.forEach(function (x) {
        rhtml +=
          '<a class="wtree-recent-row" href="' + x.url + '" target="_blank" rel="noopener">' +
            '<span class="wtree-recent-badge">NEW</span>' +
            '<span class="wtree-recent-path">' + esc(x.dirName) + esc(x.f.name) + '</span>' +
            '<span class="wtree-recent-tech">' + esc(x.f.tech) + '</span>' +
          '</a>';
      });
      rhtml += '<div class="wtree-line" style="height:10px"></div>';
      recentMount.innerHTML = rhtml;
    }
  }

  /* ── B: full pager — "less ~/writeups", fuzzy search across everything ── */
  var triggerMount = document.getElementById('wtree-pager-trigger-mount');
  if (triggerMount) {
    triggerMount.innerHTML =
      '<div class="wtree-line wtree-cmd wtree-pager-trigger" id="wtree-pager-open" role="button" tabindex="0">' +
        '<span class="wtree-prompt">visitor@moriarty</span><span class="wtree-sep">:</span><span class="wtree-path">~/writeups</span><span class="wtree-dollar">$</span> ' +
        '<span class="wtree-pager-cmdtext">less ~/writeups --search</span> ' +
        '<span class="wtree-dim">(browse &amp; search all ' + total + ')</span>' +
      '</div>';
  }

  function fuzzyMatch(query, text) {
    if (!query) return true;
    query = query.toLowerCase();
    text = text.toLowerCase();
    var qi = 0;
    for (var ti = 0; ti < text.length && qi < query.length; ti++) {
      if (text[ti] === query[qi]) qi++;
    }
    return qi === query.length;
  }

  var pager = null, pagerList = null, pagerStatus = null, pagerInput = null;

  function buildPager() {
    if (pager) return;
    pager = document.createElement('div');
    pager.id = 'wtree-pager';
    pager.className = 'wtree-pager';
    pager.innerHTML =
      '<div class="wtree-pager-scrim"></div>' +
      '<div class="wtree-pager-panel" role="dialog" aria-label="Search writeups">' +
        '<div class="wtree-pager-chrome">' +
          '<span class="wtree-dots"><i></i><i></i><i></i></span>' +
          '<span class="wtree-pager-title">less ~/writeups</span>' +
          '<button type="button" class="wtree-pager-x" aria-label="Close">✕</button>' +
        '</div>' +
        '<div class="wtree-pager-searchrow">' +
          '<span class="wtree-pager-slash">/</span>' +
          '<input type="text" id="wtree-pager-search" class="wtree-pager-search" placeholder="search name, technique, platform…" autocomplete="off" spellcheck="false" />' +
        '</div>' +
        '<div class="wtree-pager-list" id="wtree-pager-list"></div>' +
        '<div class="wtree-pager-status" id="wtree-pager-status"></div>' +
      '</div>';
    document.body.appendChild(pager);

    pagerList = pager.querySelector('#wtree-pager-list');
    pagerStatus = pager.querySelector('#wtree-pager-status');
    pagerInput = pager.querySelector('#wtree-pager-search');

    pager.querySelector('.wtree-pager-scrim').addEventListener('click', closePager);
    pager.querySelector('.wtree-pager-x').addEventListener('click', closePager);
    pagerInput.addEventListener('input', renderPagerList);

    document.addEventListener('keydown', function (e) {
      if (!pager.classList.contains('wtree-pager-open')) return;
      var typing = document.activeElement === pagerInput;
      if (e.key === 'Escape') { closePager(); return; }
      if (e.key === 'q' && !typing) { closePager(); return; }
      if (e.key === '/' && !typing) { e.preventDefault(); pagerInput.focus(); }
    });

    renderPagerList();
  }

  function renderPagerList() {
    var q = pagerInput.value.trim();
    var matches = flat.filter(function (x) {
      var hay = x.dirName + ' ' + x.f.name + ' ' + x.f.tech + ' ' + x.f.tag;
      return fuzzyMatch(q, hay);
    });
    if (!matches.length) {
      pagerList.innerHTML = '<div class="wtree-pager-empty">-- no matches --</div>';
    } else {
      pagerList.innerHTML = matches.map(function (x) {
        return '<a class="wtree-pager-row" href="' + x.url + '" target="_blank" rel="noopener">' +
          '<span class="wtree-pager-dir">' + esc(x.dirName) + '</span>' +
          '<span class="wtree-pager-name">' + esc(x.f.name) + '</span>' +
          '<span class="wtree-pager-tech">' + esc(x.f.tech) + '</span>' +
          '<span class="wtree-pager-tag tag--' + x.f.cls + '">' + esc(x.f.tag) + '</span>' +
        '</a>';
      }).join('');
    }
    pagerStatus.textContent = q
      ? '-- ' + matches.length + '/' + flat.length + ' matches --'
      : '-- ' + flat.length + ' items · type to search · Esc/q to close --';
  }

  function openPager(presetQuery) {
    buildPager();
    pagerInput.value = presetQuery || '';
    renderPagerList();
    pager.classList.add('wtree-pager-open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { pagerInput.focus(); }, 50);
  }

  function closePager() {
    if (!pager) return;
    pager.classList.remove('wtree-pager-open');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('#wtree-pager-open')) openPager();
  });
  document.addEventListener('keydown', function (e) {
    var el = e.target.closest('#wtree-pager-open');
    if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openPager(); }
  });

  /* ── real shell — the prompt at the bottom now actually works ──────────
     ls / cd / cat / open / less, scoped to this page's writeup tree.     */
  var shellOut = document.getElementById('wtree-shell-out');
  var shellInput = document.getElementById('wtree-shell-in');
  var cwdLabel = document.getElementById('wtree-cwd');
  if (shellOut && shellInput) {
    var cwd = null; // null = root; else a dir object from `dirs`

    function updateCwdLabel() {
      if (cwdLabel) cwdLabel.textContent = cwd ? '~/writeups/' + cwd.name.replace(/\/$/, '') : '~/writeups';
    }

    function resolveDir(query) {
      if (!query) return null;
      var q = query.trim().toLowerCase();
      var exact = dirs.filter(function (d) { return d.name.replace(/\/$/, '').toLowerCase() === q; });
      if (exact.length === 1) return exact[0];
      var prefix = dirs.filter(function (d) { return d.name.toLowerCase().indexOf(q) === 0; });
      if (prefix.length === 1) return prefix[0];
      var fuzzy = dirs.filter(function (d) { return fuzzyMatch(q, d.name.toLowerCase()); });
      if (fuzzy.length === 1) return fuzzy[0];
      return null;
    }

    function resolveFile(query) {
      if (!query) return null;
      var q = query.trim().toLowerCase();
      if (q.indexOf('/') !== -1) {
        var parts = q.split('/');
        var d = resolveDir(parts[0]);
        if (!d) return null;
        var rest = parts.slice(1).join('/');
        var m = d.files.filter(function (f) { return f.name.toLowerCase() === rest; });
        return m.length ? { dir: d, f: m[0] } : null;
      }
      var pool = cwd ? cwd.files.map(function (f) { return { dir: cwd, f: f }; }) : flat.map(function (x) { return { dir: x.dir, f: x.f }; });
      var exact = pool.filter(function (x) { return x.f.name.toLowerCase() === q; });
      if (exact.length === 1) return exact[0];
      var partial = pool.filter(function (x) { return x.f.name.toLowerCase().indexOf(q) === 0; });
      if (partial.length === 1) return partial[0];
      return null;
    }

    function cmdLs(args) {
      var d = args[0] ? resolveDir(args[0]) : cwd;
      if (args[0] && !d) return ['<span class="cb-err">ls: no such folder: ' + esc(args[0]) + '</span>'];
      if (!d) {
        return dirs.map(function (x) {
          return '<span class="cb-dir">' + esc(x.name) + '</span>&nbsp;&nbsp;<span class="cb-dim">' + x.files.length + ' ' + esc(x.verb) + '</span>';
        });
      }
      return d.files.map(function (f) {
        return '<span class="wtree-fname">' + esc(f.name) + '</span>&nbsp;&nbsp;<span class="cb-dim">' + esc(f.tech) + '</span>';
      });
    }

    function cmdCd(args) {
      var target = args[0];
      if (!target || target === '~' || target === '/' || target === '..') { cwd = null; updateCwdLabel(); return null; }
      var d = resolveDir(target);
      if (!d) return ['<span class="cb-err">cd: no such folder: ' + esc(target) + '</span>'];
      cwd = d; updateCwdLabel(); return null;
    }

    function cmdCat(args) {
      var target = args.join(' ');
      if (!target) return ['<span class="cb-err">usage: cat &lt;writeup&gt;</span>'];
      var m = resolveFile(target);
      if (!m) return ['<span class="cb-err">cat: not found: ' + esc(target) + '</span>', '<span class="cb-dim">try: ls' + (cwd ? '' : ' vulnhub') + '</span>'];
      return [
        '<span class="wtree-tag tag--' + m.f.cls + '">' + esc(m.f.tag) + '</span> <span class="wtree-fname">' + esc(m.f.name) + '</span>',
        esc(m.f.tech),
        '<span class="cb-dim">open ' + esc(m.f.name) + '</span>'
      ];
    }

    function cmdOpen(args) {
      var target = args.join(' ');
      if (!target) return ['<span class="cb-err">usage: open &lt;writeup&gt;</span>'];
      var m = resolveFile(target);
      if (!m) return ['<span class="cb-err">open: not found: ' + esc(target) + '</span>'];
      shellPrint('<span class="cb-dim">opening <span class="cb-hl">' + esc(m.f.name) + '</span> on GitHub…</span>');
      window.open(href(m.dir, m.f), '_blank', 'noopener');
      return null;
    }

    function cmdLess(args) {
      var q = args.join(' ');
      openPager(q);
      return ['<span class="cb-dim">opening pager' + (q ? ' — searching "' + esc(q) + '"' : '') + '…</span>'];
    }

    var SHELL_HELP = [
      '<span class="cb-good">Available commands:</span>',
      '&nbsp;<span class="cb-cmd">ls [folder]</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;list folders, or a folder’s writeups',
      '&nbsp;<span class="cb-cmd">cd &lt;folder&gt;</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;enter a folder  (cd .. to go back)',
      '&nbsp;<span class="cb-cmd">cat &lt;writeup&gt;</span>&nbsp;&nbsp;&nbsp;&nbsp;show its technique',
      '&nbsp;<span class="cb-cmd">open &lt;writeup&gt;</span>&nbsp;&nbsp;&nbsp;open it on GitHub',
      '&nbsp;<span class="cb-cmd">less [query]</span>&nbsp;&nbsp;&nbsp;&nbsp;open the full pager, optionally pre-searched',
      '&nbsp;<span class="cb-cmd">find &lt;query&gt;</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;alias for less &lt;query&gt;',
      '&nbsp;<span class="cb-cmd">pwd</span> · <span class="cb-cmd">clear</span>'
    ];

    function shellPrint(lines, cls) {
      (Array.isArray(lines) ? lines : [lines]).forEach(function (l) {
        var d = document.createElement('div');
        d.className = 'cmdbar-out' + (cls ? ' ' + cls : '');
        d.innerHTML = l;
        shellOut.appendChild(d);
      });
      shellOut.scrollTop = shellOut.scrollHeight;
    }

    var shellHistory = [], shellHi = -1;
    function shellRun(raw) {
      var cmd = raw.trim();
      if (!cmd) return;
      shellHistory.unshift(cmd); shellHi = -1;
      var echo = document.createElement('div');
      echo.className = 'cmdbar-out cmdbar-echo';
      echo.innerHTML = '<span class="cmdbar-ps-sm">' + esc(cwd ? '~/writeups/' + cwd.name.replace(/\/$/, '') : '~/writeups') + '$</span> ' + esc(cmd);
      shellOut.appendChild(echo);

      var parts = cmd.split(/\s+/);
      var head = parts[0].toLowerCase();
      var args = parts.slice(1);
      var out;
      if (head === 'help') out = SHELL_HELP;
      else if (head === 'ls') out = cmdLs(args);
      else if (head === 'cd') out = cmdCd(args);
      else if (head === 'cat') out = cmdCat(args);
      else if (head === 'open') out = cmdOpen(args);
      else if (head === 'less') out = cmdLess(args);
      else if (head === 'find' || head === 'grep') out = cmdLess(args);
      else if (head === 'pwd') out = [esc(cwd ? '~/writeups/' + cwd.name.replace(/\/$/, '') : '~/writeups')];
      else if (head === 'tree') out = ['<span class="cb-dim">↑ the tree is shown above — try ‘ls’ to browse from here</span>'];
      else if (head === 'clear') { shellOut.innerHTML = ''; out = null; }
      else out = ['<span class="cb-err">' + esc(head) + ': command not found</span> <span class="cb-dim">— type help</span>'];
      if (out) shellPrint(out);
      shellOut.scrollTop = shellOut.scrollHeight;
    }

    shellPrint('<span class="cb-dim">Type <span class="cb-cmd">help</span> to see what you can do here.</span>');
    shellInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { shellRun(shellInput.value); shellInput.value = ''; }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (shellHi < shellHistory.length - 1) shellInput.value = shellHistory[++shellHi]; }
      else if (e.key === 'ArrowDown') { e.preventDefault(); shellHi > 0 ? shellInput.value = shellHistory[--shellHi] : (shellHi = -1, shellInput.value = ''); }
    });
  }
})();
