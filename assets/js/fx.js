/* ============================================================
   SDRONES — Fondo interactivo (mismo motor que ECOS Media MX)
   - Partículas con patrones de movimiento constantes (campo de
     flujo), repulsión del mouse y aceleración con el scroll.
   - Logos "S" flotantes: pocos, transparentes, rodando, aparecen
     y se desvanecen; a veces en otro color.
   - Luz de fondo que sigue al cursor (variables --mx/--my).
   - Ondas de eco al hacer clic.
   ============================================================ */
(function () {
  const canvas = document.getElementById('bgParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, particles = [], sprites = [];
  const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, lastX: 0, lastY: 0 };
  let scrollBoost = 0, scrollDir = 0, lastScrollY = window.scrollY, hueShift = 0, t = 0;

  // Colores de marca: cian, cian claro y plata azulada
  const COLORS = [
    { r: 52,  g: 227, b: 240 },   // cian
    { r: 18,  g: 182, b: 198 },   // cian profundo
    { r: 176, g: 198, b: 216 },   // plata azulada
  ];

  /* ---------- logos flotantes (la "S" de SDrones) ---------- */
  const SPRITE_SRCS = ['s-cyan.png', 's-cyan.png', 's-cyan.png', 's-white.png', 's-slate.png'];
  const spriteImgs = SPRITE_SRCS.map(f => {
    const img = new Image();
    img.src = 'assets/img/' + f;
    return img;
  });

  function newSprite() {
    const img = spriteImgs[(Math.random() * spriteImgs.length) | 0];
    const size = 55 + Math.random() * 80;
    return {
      img,
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.012,   // rueda lentamente
      maxA: 0.08 + Math.random() * 0.1,      // opacidad tenue
      life: 0,
      ttl: 900 + Math.random() * 900,        // ~15-30 s de vida
      age: 0,
    };
  }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initParticles();
  }

  function initParticles() {
    const isSmall = W < 700;
    const target = Math.min(isSmall ? 55 : 130, Math.floor((W * H) / 14000));
    particles = [];
    for (let i = 0; i < target; i++) {
      const c = COLORS[(Math.random() * COLORS.length) | 0];
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        r: 1 + Math.random() * 2.2,
        c,
        a: c.r === 52 ? 0.75 : 0.5,
        tw: Math.random() * Math.PI * 2,
      });
    }
    sprites = [];
    const nSprites = isSmall ? 3 : 5;
    for (let i = 0; i < nSprites; i++) {
      const s = newSprite();
      s.age = Math.random() * s.ttl * 0.6; // desfasados
      sprites.push(s);
    }
  }

  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mouse.vx = e.clientX - mouse.lastX;
    mouse.vy = e.clientY - mouse.lastY;
    mouse.lastX = mouse.x = e.clientX;
    mouse.lastY = mouse.y = e.clientY;
    // La luz del fondo sigue al cursor
    document.documentElement.style.setProperty('--mx', (e.clientX / W * 100) + '%');
    document.documentElement.style.setProperty('--my', (e.clientY / H * 100) + '%');
    hueShift = (e.clientX / W - 0.5) * 26;
  }, { passive: true });

  window.addEventListener('mouseout', () => { mouse.x = -9999; mouse.y = -9999; });

  window.addEventListener('scroll', () => {
    const dy = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    scrollBoost = Math.min(8, Math.abs(dy) * 0.12);
    scrollDir = Math.sign(dy);
    const doc = document.documentElement;
    const p = window.scrollY / Math.max(1, doc.scrollHeight - window.innerHeight);
    doc.style.setProperty('--scroll', p.toFixed(3));
  }, { passive: true });

  const LINK_DIST = 120;

  // Campo de flujo: corriente que gira lentamente según posición y tiempo,
  // para que las partículas siempre tengan patrones de movimiento visibles.
  function flowAngle(x, y) {
    return Math.sin(x * 0.0016 + t * 0.006) + Math.cos(y * 0.0014 - t * 0.004);
  }

  function applyForces(p, mouseRadius, flowForce) {
    const dx = p.x - mouse.x, dy = p.y - mouse.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < mouseRadius * mouseRadius) {
      const d = Math.sqrt(d2) || 1;
      const f = (mouseRadius - d) / mouseRadius;
      p.vx += (dx / d) * f * 0.6 + mouse.vx * f * 0.012;
      p.vy += (dy / d) * f * 0.6 + mouse.vy * f * 0.012;
    }
    const ang = flowAngle(p.x, p.y);
    p.vx += Math.cos(ang) * flowForce;
    p.vy += Math.sin(ang) * flowForce;
    if (scrollBoost > 0.3) p.vy -= scrollDir * scrollBoost * 0.05;
  }

  function frame() {
    t++;
    // Si la página cargó con la pestaña oculta (viewport 0), reintenta el tamaño.
    if ((W === 0 || H === 0) && window.innerWidth > 0) resize();
    ctx.clearRect(0, 0, W, H);
    const boost = 1 + scrollBoost;
    scrollBoost *= 0.94;

    /* ---- logos S flotantes (detrás de las partículas) ---- */
    for (let i = 0; i < sprites.length; i++) {
      const s = sprites[i];
      s.age++;
      if (s.age > s.ttl) { sprites[i] = newSprite(); continue; }
      const fadeIn = Math.min(1, s.age / 140);
      const fadeOut = Math.min(1, (s.ttl - s.age) / 140);
      s.life = Math.min(fadeIn, fadeOut);

      applyForces(s, 190, 0.008);
      s.x += s.vx * boost;
      s.y += s.vy * boost;
      s.vx *= 0.986; s.vy *= 0.986;
      s.rot += (s.rotV + (Math.abs(s.vx) + Math.abs(s.vy)) * 0.002) * boost;
      const m = s.size;
      if (s.x < -m) s.x = W + m; else if (s.x > W + m) s.x = -m;
      if (s.y < -m) s.y = H + m; else if (s.y > H + m) s.y = -m;

      if (s.img.complete && s.img.naturalWidth) {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rot);
        ctx.globalAlpha = s.maxA * s.life;
        ctx.drawImage(s.img, -s.size / 2, -s.size / 2, s.size, s.size);
        ctx.restore();
      }
    }

    /* ---- partículas ---- */
    for (const p of particles) {
      applyForces(p, 150, 0.014);
      p.x += p.vx * boost;
      p.y += p.vy * boost;
      p.vx *= 0.975; p.vy *= 0.975;

      if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;

      p.tw += 0.02;
      const twinkle = 0.75 + Math.sin(p.tw) * 0.25;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c.r},${p.c.g},${p.c.b},${(p.a * twinkle).toFixed(3)})`;
      ctx.fill();
    }

    /* ---- líneas de conexión (constelación) ---- */
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK_DIST * LINK_DIST) {
          const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.18;
          ctx.strokeStyle = `hsla(${185 + hueShift}, 78%, 60%, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(frame);
  }

  resize();
  if (!reduced) {
    requestAnimationFrame(frame);
  } else {
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c.r},${p.c.g},${p.c.b},0.35)`;
      ctx.fill();
    }
  }

  /* ---------- ondas de eco al hacer clic ---------- */
  if (window.matchMedia('(pointer: fine)').matches && !reduced) {
    window.addEventListener('mousedown', (e) => {
      for (let i = 0; i < 2; i++) {
        const ring = document.createElement('div');
        ring.className = 'click-echo' + (i ? ' alt' : '');
        ring.style.left = e.clientX + 'px';
        ring.style.top = e.clientY + 'px';
        document.body.appendChild(ring);
        setTimeout(() => ring.remove(), 800);
      }
    }, { passive: true });
  }
})();
