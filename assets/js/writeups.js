/* Writeup page — data-driven shell tree.
   To add a writeup: drop one entry in the right dir's `files` array below.
   Branch glyphs (├── / └──) and the summary count are computed automatically. */
(function () {
  var mount = document.getElementById('wtree-mount');
  if (!mount) return;

  var CB = 'https://github.com/MoriartyPuth-Labs/Crackmes-WriteUp';
  var VB = 'https://github.com/MoriartyPuth-Labs/Vulnhub-WriteUp';

  var dirs = [
    {
      name: 'crackmes/', repo: CB, count: '7 solved · crackmes.one',
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
      name: 'vulnhub/', repo: VB, count: '9 rooted · vulnhub · thm · aupp',
      files: [
        { folder: 'DC1-Lab',                                  name: 'dc1',                 tech: 'Drupalgeddon2 RCE + SUID privesc',  tag: 'VULNHUB', cls: 'vulnhub' },
        { folder: 'Bulldog1-Lab',                             name: 'bulldog1',            tech: 'Django command injection → root',   tag: 'VULNHUB', cls: 'vulnhub' },
        { folder: 'N7-Lab',                                   name: 'n7',                  tech: 'blind time-based SQLi',             tag: 'VULNHUB', cls: 'vulnhub' },
        { folder: 'Full-Chain-SQLi-Case-Study',               name: 'full-chain-sqli',     tech: 'end-to-end SQL injection chain',    tag: 'AUPP', cls: 'aupp' },
        { folder: 'Server-Exploitation-Post-Exploitation-Lab', name: 'server-exploitation', tech: 'Linux exploit + forensic audit',    tag: 'AUPP', cls: 'aupp' },
        { folder: 'MSFVenom-and-Trojan-Lab',                  name: 'msfvenom-trojan',     tech: 'payload engineering + evasion',     tag: 'AUPP', cls: 'aupp' },
        { folder: 'Linux-Data-Analysis-Lab',                  name: 'linux-data-analysis', tech: 'forensic text processing',          tag: 'AUPP', cls: 'aupp' },
        { folder: 'Network-Security-Reconnaissance-Lab',      name: 'network-recon',       tech: 'subnet scanning + profiling',       tag: 'AUPP', cls: 'aupp' },
        { folder: 'Pickle-Rick-Lab',                          name: 'pickle-rick',         tech: 'command injection + privesc',       tag: 'THM',  cls: 'thm' }
      ]
    }
  ];

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var html = '', total = 0;
  dirs.forEach(function (dir, di) {
    var lastDir = di === dirs.length - 1;
    var dirBranch = lastDir ? '└──' : '├──';
    var cont = lastDir ? '    ' : '│   ';   // continuation indent under this dir
    total += dir.files.length;

    html +=
      '<div class="wtree-dir" data-dir="' + di + '">' +
        '<span class="wtree-branch">' + dirBranch + '</span>' +
        '<span class="wtree-fold" aria-hidden="true">▾</span>' +
        '<a class="wtree-dirname" href="' + dir.repo + '" target="_blank" rel="noopener">' + esc(dir.name) + '</a>' +
        '<span class="wtree-count">' + esc(dir.count) + '</span>' +
      '</div>' +
      '<div class="wtree-files" data-files="' + di + '">';

    dir.files.forEach(function (f, fi) {
      var branch = cont + (fi === dir.files.length - 1 ? '└──' : '├──');
      html +=
        '<a class="wtree-file" href="' + dir.repo + '/tree/main/labs/' + f.folder + '" target="_blank" rel="noopener">' +
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
  if (sum) sum.textContent = dirs.length + ' directories, ' + total + ' writeups · click a folder to fold · click a file to open on GitHub';

  // click a directory row to collapse/expand its files (the repo link keeps working)
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
})();
