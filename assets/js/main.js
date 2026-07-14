/* ============================================================
   SDRONES — Interfaz: encabezado, menú móvil, animaciones de
   aparición, formulario → WhatsApp y Calendly.
   ============================================================ */
(function () {
  const WA = '5215578889720'; // WhatsApp de SDrones (conectado a ManyChat)

  /* ---------- encabezado con fondo al hacer scroll ---------- */
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 24);
  }, { passive: true });

  /* ---------- menú móvil (pantalla completa, con X) ---------- */
  const burger = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  function closeMobileMenu() {
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  burger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  mobileMenu.addEventListener('click', (e) => { if (e.target.closest('a')) closeMobileMenu(); });
  document.getElementById('mobileMenuClose').addEventListener('click', closeMobileMenu);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobileMenu(); });
  // Animación escalonada de los enlaces
  document.querySelectorAll('#mobileNav a').forEach((a, i) => {
    a.style.animationDelay = (i * 55) + 'ms';
  });

  /* ---------- animación de aparición (misma que ECOS) ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealIO.unobserve(e.target);
      }
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (Math.min(i % 6, 5) * 60) + 'ms';
    revealIO.observe(el);
  });

  /* ---------- formulario → WhatsApp ---------- */
  const form = document.getElementById('leadForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const lines = [form.dataset.intro || 'Hola SDRONES, quiero información.', ''];
      for (const [k, v] of f.entries()) {
        const label = form.querySelector(`[name="${k}"]`).closest('.field').querySelector('label').textContent;
        lines.push(label + ' ' + v);
      }
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n')), '_blank');
    });
  }

  /* ---------- Calendly ---------- */
  const calBtn = document.getElementById('calBtn');
  if (calBtn) {
    calBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.Calendly) {
        Calendly.initPopupWidget({ url: 'https://calendly.com/santibamedw2/30min' });
      } else {
        window.open('https://calendly.com/santibamedw2/30min', '_blank');
      }
    });
  }
})();
