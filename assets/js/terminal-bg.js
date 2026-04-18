(function() {
  const canvas = document.createElement("canvas");
  canvas.id = "matrix-canvas";
  canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;z-index:-7;pointer-events:none;opacity:0.09;";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const CHARS = "#!/bin/bash>nmap-sS-sV>sqlmap-u>curl-X>python3>msfvenom>ssh>nikto>hydra>john>wireshark>burpsuite>grep>chmod>netstat>tcpdump>git>docker>AUTH>SELECT>whoami>uname>sudo>exit>/|\\{}[]();";
  const FS = 14;

  let cols, streams;

  function mkStream(randomY) {
    const len = 8 + Math.floor(Math.random() * 24);
    return {
      y: randomY ? Math.random() * 80 : -len - Math.random() * 60,
      speed: 0.4 + Math.random() * 1.6,
      len,
    };
  }

  function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / FS);
    streams = Array.from({ length: cols }, () => {
      const s = mkStream(false);
      s.y = Math.random() * (canvas.height / FS);
      return s;
    });
  }

  function rc() {
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }

  function draw() {
    ctx.fillStyle = "rgba(11, 15, 12, 0.045)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${FS}px "IBM Plex Mono", monospace`;

    for (let i = 0; i < cols; i++) {
      const s = streams[i];
      const x = i * FS;
      const head = Math.floor(s.y);

      // Bright glowing head
      ctx.fillStyle = "rgba(210, 255, 210, 0.95)";
      ctx.fillText(rc(), x, head * FS);

      // Fading trail
      for (let t = 1; t <= s.len; t++) {
        const row = head - t;
        if (row < 0) continue;
        const alpha = (1 - t / s.len) * 0.85;
        ctx.fillStyle = `rgba(34, 197, 94, ${alpha.toFixed(2)})`;
        ctx.fillText(rc(), x, row * FS);
      }

      s.y += s.speed;

      if ((s.y - s.len) * FS > canvas.height) {
        Object.assign(s, mkStream(false));
      }
    }
  }

  init();
  setInterval(draw, 50);
  window.addEventListener("resize", init);
})();
