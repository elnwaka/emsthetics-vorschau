// emsthetics DIY Cluster Set

// PLATZHALTER: Stripe Payment Link hier eintragen (Stripe Dashboard > Payment Links)
const CHECKOUT_URL = 'https://buy.stripe.com/DEIN-LINK';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Checkout-Links ---------- */

const checkoutReady = !CHECKOUT_URL.includes('DEIN-LINK');
document.querySelectorAll('[data-checkout]').forEach((a) => {
  if (checkoutReady) {
    a.href = CHECKOUT_URL;
    a.rel = 'noopener';
  }
});
if (!checkoutReady) console.warn('[emsthetics] Stripe-Link fehlt noch: CHECKOUT_URL in assets/js/main.js setzen.');

document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

/* ---------- Produktgalerie (Hero) ---------- */

(function productGallery() {
  const track = document.getElementById('pg-track');
  const thumbs = Array.from(document.querySelectorAll('.pg__thumbs button'));
  if (!track || !thumbs.length) return;
  const slides = Array.from(track.children);
  const setActive = (i) => thumbs.forEach((t, k) => t.setAttribute('aria-current', String(k === i)));
  const go = (i) => {
    const k = Math.max(0, Math.min(slides.length - 1, i));
    track.scrollTo({ left: slides[k].offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
    setActive(k);
  };

  thumbs.forEach((t, i) => t.addEventListener('click', () => go(i)));
  track.addEventListener('keydown', (e) => {
    const cur = thumbs.findIndex((t) => t.getAttribute('aria-current') === 'true');
    if (e.key === 'ArrowRight') go(cur + 1);
    if (e.key === 'ArrowLeft') go(cur - 1);
  });

  // Beim Wischen das passende Vorschaubild markieren
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.isIntersecting && setActive(slides.indexOf(e.target)));
    }, { root: track, threshold: 0.6 });
    slides.forEach((s) => io.observe(s));
  }

  // Erstes Bild kommt sofort, die anderen nach dem Seitenaufbau, damit Wischen nie leer ist
  window.addEventListener('load', () => track.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = 'eager')));
})();

/* ---------- Lash Map ---------- */

// mm: Laengen von innen nach aussen (5 Zonen), img: Foto des Looks
const LOOKS = {
  natural: { mm: [9, 10, 11, 12, 11], img: 'assets/img/lash-natural.jpg', text: 'Dichter als deine Naturwimpern, aber kaum als Cluster zu erkennen. Der beste Einstieg.' },
  doll: { mm: [10, 12, 14, 13, 11], img: 'assets/img/lash-doll.jpg', text: 'Die längsten Cluster sitzen in der Mitte. Das Auge wirkt runder und offener.' },
  cat: { mm: [9, 10, 12, 14, 16], img: 'assets/img/lash-cat.jpg', text: 'Wird nach außen immer länger und zieht das Auge optisch nach oben.' },
  wispy: { mm: [10, 11, 12, 13, 12], img: 'assets/img/lash-wispy.jpg', text: 'Einzelne längere Spikes zwischen kürzeren Clustern. Sieht aus wie Extensions.' },
};
const ZONE_WHERE = ['innen', '', 'Mitte', '', 'außen'];

(function lashMap() {
  const img = document.getElementById('look-img');
  const zonesEl = document.getElementById('zones');
  const textEl = document.getElementById('look-text');
  const tabs = Array.from(document.querySelectorAll('.looks [data-look]'));
  if (!img || !tabs.length) return;

  // Die anderen Looks vorladen, sobald die Map in die Naehe kommt, damit der Wechsel sofort sitzt
  let preloaded = false;
  const preload = () => {
    if (preloaded) return;
    preloaded = true;
    Object.values(LOOKS).forEach((l) => {
      const i = new Image();
      i.src = l.img;
    });
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        preload();
      }
    }, { rootMargin: '600px' });
    io.observe(img);
  } else {
    preload();
  }

  let swap = 0;
  function showImage(src) {
    if (img.getAttribute('src') === src) return;
    if (reduceMotion) {
      img.src = src;
      return;
    }
    const id = ++swap;
    img.classList.add('is-fading');
    setTimeout(() => {
      if (id !== swap) return;
      const done = () => id === swap && img.classList.remove('is-fading');
      img.addEventListener('load', done, { once: true });
      img.src = src;
      if (img.complete) done();
    }, 180);
  }

  function setLook(look) {
    const { mm, img: src, text } = LOOKS[look];
    const name = tabs.find((b) => b.dataset.look === look).textContent;
    showImage(src);
    img.alt = `Auge mit Cluster-Lashes im Look ${name}`;
    zonesEl.innerHTML = mm
      .map((v, i) => `<li><span class="mm">${v} mm</span><span class="where">${ZONE_WHERE[i] || '&nbsp;'}</span></li>`)
      .join('');
    textEl.textContent = text;
    tabs.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.look === look)));
  }

  tabs.forEach((b, i) => {
    b.addEventListener('click', () => {
      preload();
      setLook(b.dataset.look);
    });
    b.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      setLook(next.dataset.look);
    });
  });
})();

/* ---------- Mobile Kaufleiste ---------- */

(function buybar() {
  const bar = document.getElementById('buybar');
  const heroBuy = document.getElementById('hero-buy');
  const cta = document.getElementById('kaufen');
  if (!bar || !heroBuy || !cta || !('IntersectionObserver' in window)) return;
  const state = { hero: true, cta: false };
  const update = () => {
    const on = !state.hero && !state.cta;
    bar.classList.toggle('is-on', on);
    bar.setAttribute('aria-hidden', String(!on));
    bar.querySelector('a').tabIndex = on ? 0 : -1;
  };
  new IntersectionObserver(([e]) => { state.hero = e.isIntersecting || e.boundingClientRect.top > 0; update(); }).observe(heroBuy);
  new IntersectionObserver(([e]) => { state.cta = e.isIntersecting; update(); }).observe(cta);
})();
