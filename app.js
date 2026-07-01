/* ============================================================
   ROLL & GO — app.js v3 (Completo)
   Modular · GSAP + ScrollTrigger · Lenis · VanillaTilt · SplitType
   ============================================================ */

'use strict';

/* ── Constants ───────────────────────────────────────────── */
const DATA_PATHS = {
  menu: './data/menu.json',
  business: './data/business.json'
};
const CAT_LABEL = { clasico: 'Clásico', panizado: 'Panizado', veggie: 'Veggie' };
let businessConfig = {
  nombre: 'Roll & Go',
  whatsapp: '1151816111',
  whatsappFull: '541151816111',
  direccion: 'Terrada 592'
};


/* ─────────────────────────────────────────────────────────
   MODULE: SMOOTH SCROLL — Lenis
───────────────────────────────────────────────────────── */
let lenis;

function initLenis() {
  if (typeof Lenis === 'undefined') return;

  lenis = new Lenis({
    lerp:   0.085,
    smooth: true,
    direction: 'vertical',
    gestureDirection: 'vertical',
  });

  // Connect Lenis with GSAP ticker
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    // Standalone RAF loop
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
}

/* Smooth anchor scroll with Lenis */
function handleAnchorClicks() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('navbar')?.offsetHeight || 68;
      if (lenis) {
        lenis.scrollTo(target, { offset: -navH - 12, duration: 1.2 });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 12;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}


/* ─────────────────────────────────────────────────────────
   MODULE: NAVBAR
───────────────────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}


/* ─────────────────────────────────────────────────────────
   MODULE: MOBILE MENU
───────────────────────────────────────────────────────── */
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeBtn   = document.getElementById('mobileClose');
  const backdrop   = document.getElementById('mobileMenuBackdrop');
  if (!hamburger || !mobileMenu) return;

  let closeTimer;

  const open  = () => {
    clearTimeout(closeTimer);
    mobileMenu.removeAttribute('hidden');
    requestAnimationFrame(() => mobileMenu.classList.add('is-open'));
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (typeof lenis !== 'undefined' && lenis) lenis.stop();
    pushModalState();
  };
  const close = () => {
    mobileMenu.classList.remove('is-open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (typeof lenis !== 'undefined' && lenis) lenis.start();
    closeTimer = window.setTimeout(() => {
      if (!mobileMenu.classList.contains('is-open')) {
        mobileMenu.setAttribute('hidden', '');
      }
    }, 400);
    popModalStateIfNeeded();
  };
  const toggle = () => mobileMenu.hasAttribute('hidden') || !mobileMenu.classList.contains('is-open') ? open() : close();

  hamburger.addEventListener('click', toggle);
  if (closeBtn) closeBtn.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', close));

  const cartLink = document.getElementById('mobileMenuCartLink');
  cartLink?.addEventListener('click', (e) => {
    e.preventDefault();
    close();
    setTimeout(() => {
      toggleCart(true);
    }, 150);
  });
}


/* ─────────────────────────────────────────────────────────
   MODULE: HERO ANIMATIONS (GSAP + SplitType)
───────────────────────────────────────────────────────── */
function initHero() {
  if (typeof gsap === 'undefined') {
    // CSS fallback — just show everything
    document.querySelectorAll('#heroEyebrow,#heroLogoWrapper,#heroLogoImg,#heroSub,#heroStats,#heroCta')
      .forEach(el => { 
        el.style.opacity = '1'; 
        el.style.transform = 'none'; 
        el.style.filter = 'none'; 
      });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Set initial states for clean Apple/Vercel reveal
  gsap.set('#heroLogoImg', { scale: 1.08, opacity: 0, filter: "blur(12px)" });
  gsap.set('#heroEyebrow', { y: 20, opacity: 0 });
  gsap.set('#heroSub',     { y: 20, opacity: 0 });
  gsap.set('#heroStats',   { y: 20, opacity: 0 });
  gsap.set('#heroCta',     { y: 20, opacity: 0 });

  // Timeline Sequence
  tl.to('#heroLogoImg', { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.4, ease: "power4.out" })
    .to('#heroEyebrow', { y: 0, opacity: 1, duration: 0.6 }, '-=1.0')
    .to('#heroSub',     { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
    .to('#heroStats',   { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
    .to('#heroCta',     { y: 0, opacity: 1, duration: 0.6 }, '-=0.4');
}




/* ─────────────────────────────────────────────────────────
   MODULE: SCROLL REVEALS (GSAP + ScrollTrigger)
───────────────────────────────────────────────────────── */
function initScrollReveals() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // CSS fallback
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('[data-reveal]').forEach((el, i) => {
    const delay = i * 0.04;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          y: 0, opacity: 1,
          duration: 0.7,
          delay,
          ease: 'power3.out',
          onComplete: () => el.classList.add('is-visible'),
        });
      },
    });
  });

  // Section titles — staggered
  document.querySelectorAll('.section-header').forEach(header => {
    const children = header.querySelectorAll('[data-reveal]');
    children.forEach((child, i) => {
      gsap.set(child, { y: 28, opacity: 0 });
    });
    ScrollTrigger.create({
      trigger: header,
      start: 'top 84%',
      once: true,
      onEnter: () => {
        gsap.to(children, {
          y: 0, opacity: 1,
          duration: 0.65,
          stagger: 0.1,
          ease: 'power3.out',
        });
      },
    });
  });


}


/* ─────────────────────────────────────────────────────────
   MODULE: VANILLA TILT on menu cards
───────────────────────────────────────────────────────── */
function initTilt(cards) {
  const supportsHover = window.matchMedia('(hover: hover)').matches;

  if (typeof VanillaTilt !== 'undefined' && supportsHover) {
    VanillaTilt.init(cards, {
      max:        12,
      speed:      500,
      glare:      true,
      'max-glare': 0.12,
      scale:      1.03,
      perspective: 900,
      reset:      true,
      'mouse-event-element': null,
    });

    cards.forEach(card => {
      let isHovered = false;
      card.addEventListener('mouseenter', () => {
        isHovered = true;
      });
      card.addEventListener('tiltChange', () => {
        if (isHovered) {
          card.classList.add('tilt-active');
        }
      });
      card.addEventListener('mouseleave', () => {
        isHovered = false;
        card.classList.remove('tilt-active');
      });
    });

  } else {
    // JS fallback tilt for desktop
    if (supportsHover) {
      const TILT_X = 9;
      const TILT_Y = 13;

      cards.forEach(card => {
        let raf;
        card.addEventListener('mousemove', (e) => {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const nx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
            const ny = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
            card.style.transform = `perspective(900px) rotateY(${nx * TILT_Y}deg) rotateX(${-ny * TILT_X}deg) scale(1.03)`;
            card.classList.add('tilt-active');
          });
        });

        card.addEventListener('mouseleave', () => {
          cancelAnimationFrame(raf);
          card.style.transition = 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)';
          card.style.transform  = '';
          card.classList.remove('tilt-active');
          card.addEventListener('transitionend', () => {
            card.style.transition = '';
          }, { once: true });
        });
      });
    }

    // Mobile: Touch feedback only (removed floating animation)
    if (!supportsHover) {
      cards.forEach((card, i) => {
        // Touch press feedback
        card.addEventListener('pointerdown', () => {
          card.style.transition = 'transform 0.12s ease';
          card.style.transform  = 'scale(0.97)';
        });
        ['pointerup', 'pointercancel'].forEach(evt => {
          card.addEventListener(evt, () => {
            card.style.transition = 'transform 0.4s cubic-bezier(0.22,1,0.36,1)';
            card.style.transform  = '';
          });
        });
      });
    }
  }
}


/* ─────────────────────────────────────────────────────────
   MODULE: MAGNETIC BUTTONS
───────────────────────────────────────────────────────── */
function initMagneticButtons() {
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  if (!supportsHover || typeof gsap === 'undefined') return;

  document.querySelectorAll('.btn-magnetic').forEach(btn => {
    const strength = 0.3;

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'power3.out' });
    });
  });
}


/* ─────────────────────────────────────────────────────────
   MODULE: MENU FILTER
───────────────────────────────────────────────────────── */
let activeFilter = 'all';

function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-tab');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.filter === activeFilter) return;

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;

      filterCards(activeFilter);
    });
  });
}

function filterCards(filter) {
  const cards = document.querySelectorAll('.menu-card');
  let visibleIndex = 0;

  cards.forEach(card => {
    const match = filter === 'all' || card.dataset.category === filter;

    if (match) {
      card.style.display = '';
      const delay = visibleIndex * 0.06;

      if (typeof gsap !== 'undefined') {
        gsap.fromTo(card,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.45, delay, ease: 'power2.out',
            onComplete: () => card.classList.add('is-visible') }
        );
      } else {
        card.classList.add('is-visible');
      }
      visibleIndex++;
    } else {
      if (typeof gsap !== 'undefined') {
        gsap.to(card, {
          opacity: 0, y: 10, duration: 0.25, ease: 'power2.in',
          onComplete: () => { card.style.display = 'none'; card.classList.remove('is-visible'); }
        });
      } else {
        card.style.display = 'none';
        card.classList.remove('is-visible');
      }
    }
  });
}


/* ─────────────────────────────────────────────────────────
   MODULE: API FETCH
   ───────────────────────────────────────────────────────── */
async function fetchJson(path) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`No se pudo cargar ${path}`);
  }
  return res.json();
}

async function loadBusinessConfig() {
  try {
    businessConfig = { ...businessConfig, ...await fetchJson(DATA_PATHS.business) };
  } catch (err) {
    console.warn('[RollGo] Business data fallback:', err);
  }
}

function getWhatsAppUrl(message) {
  return `https://wa.me/${businessConfig.whatsappFull}?text=${encodeURIComponent(message)}`;
}

function buildOrderMessage({ nombre, telefono, productos, cantidades, notas, direccion }) {
  const lines = [
    '🍣 *Nuevo Pedido — Roll & Go*',
    '',
    `👤 *Nombre:* ${nombre}`,
    `📞 *Teléfono:* ${telefono}`,
    '',
    '*Productos:*',
    ...productos.map((producto, index) => `  • ${producto} ×${cantidades[index] || 1} (Tubo de 10 u.)`)
  ];

  if (notas) lines.push('', `📝 *Notas:* ${notas}`);
  if (direccion) lines.push(`📍 *Dirección:* ${direccion}`);
  return lines.join('\n');
}

function buildContactMessage({ nombre, telefono, mensaje }) {
  return [
    '💬 *Consulta — Roll & Go*',
    '',
    `👤 *Nombre:* ${nombre}`,
    `📞 *Teléfono:* ${telefono}`,
    `📝 *Mensaje:* ${mensaje}`
  ].join('\n');
}

function cleanText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function phoneDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function markFieldInvalid(field, invalid = true) {
  if (!field) return;
  field.classList.toggle('is-invalid', invalid);
  field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
}

function clearFormValidation(form) {
  form?.querySelectorAll('.is-invalid').forEach(field => markFieldInvalid(field, false));
}

function showFormError(errorDiv, message) {
  if (!errorDiv) return;
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
}

function setupValidationClear(form) {
  form?.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => markFieldInvalid(field, false));
    field.addEventListener('change', () => markFieldInvalid(field, false));
  });
}

function setupDigitsOnly(field) {
  if (!field) return;
  field.addEventListener('input', () => {
    const digits = phoneDigits(field.value);
    if (field.value !== digits) field.value = digits;
  });
}

function validatePersonName(field) {
  const value = cleanText(field?.value);
  if (value.length < 3) return 'Completá tu nombre completo.';
  if (/\d/.test(value)) return 'El nombre no debería contener números.';
  return '';
}

function validatePhone(field) {
  const digits = phoneDigits(field?.value);
  if (digits.length < 8) return 'Ingresá un WhatsApp válido con código de área.';
  if (digits.length > 15) return 'El WhatsApp parece demasiado largo.';
  return '';
}

function validateMaxLength(field, label, maxLength) {
  const value = cleanText(field?.value);
  if (value.length > maxLength) return `${label} no puede superar ${maxLength} caracteres.`;
  return '';
}

function validateOrderForm({ nameInput, phoneInput, addressInput, notesInput, isDelivery, errorDiv }) {
  const checks = [
    [nameInput, validatePersonName(nameInput)],
    [phoneInput, validatePhone(phoneInput)],
    [notesInput, validateMaxLength(notesInput, 'Las notas', 300)]
  ];

  if (isDelivery) {
    const address = cleanText(addressInput?.value);
    checks.push([addressInput, address.length < 6 ? 'Ingresá una dirección de entrega válida.' : '']);
  }

  const failed = checks.find(([, message]) => message);
  checks.forEach(([field, message]) => markFieldInvalid(field, Boolean(message)));

  if (failed) {
    showFormError(errorDiv, failed[1]);
    failed[0]?.focus();
    return false;
  }

  return true;
}

function validateContactForm({ nameInput, phoneInput, messageInput, errorDiv }) {
  const message = cleanText(messageInput?.value);
  const checks = [
    [nameInput, validatePersonName(nameInput)],
    [phoneInput, validatePhone(phoneInput)],
    [messageInput, message.length < 10 ? 'Contanos un poco más en el mensaje.' : validateMaxLength(messageInput, 'El mensaje', 500)]
  ];
  const failed = checks.find(([, error]) => error);
  checks.forEach(([field, error]) => markFieldInvalid(field, Boolean(error)));

  if (failed) {
    showFormError(errorDiv, failed[1]);
    failed[0]?.focus();
    return false;
  }

  return true;
}


/* ─────────────────────────────────────────────────────────
   MODULE: SHOPPING CART STATE & LOGIC
   ───────────────────────────────────────────────────────── */
let cart = [];
let cartCloseTimer;

// Load cart from localStorage
function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('rollgo_cart');
    if (saved) {
      cart = JSON.parse(saved);
    }
  } catch (e) {
    console.warn('[RollGo] Failed to load cart from localStorage:', e);
  }
  updateCartBadges();
}

// Save cart to localStorage and update UI
function saveCart() {
  try {
    localStorage.setItem('rollgo_cart', JSON.stringify(cart));
  } catch (e) {
    console.warn('[RollGo] Failed to save cart to localStorage:', e);
  }
  updateCartBadges();
  syncCardQtyControls();
  renderCartItems();
}

function setVisualStep(stepNum) {
  const step1 = document.getElementById('cartStep1');
  const step2 = document.getElementById('cartStep2');
  if (stepNum === 1) {
    step1?.classList.remove('hidden');
    step2?.classList.add('hidden');
  } else if (stepNum === 2) {
    step1?.classList.add('hidden');
    step2?.classList.remove('hidden');
  }
}

function getCartTotalQty() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartSummary() {
  const title = document.querySelector('.cart-title');
  const totalQty = getCartTotalQty();

  if (title) {
    title.dataset.count = totalQty > 0 ? `${totalQty}` : '';
  }

  const summaryTubes = document.getElementById('summaryTubes');
  const summaryPieces = document.getElementById('summaryPieces');
  if (summaryTubes) summaryTubes.textContent = `${totalQty} u.`;
  if (summaryPieces) summaryPieces.textContent = `${totalQty * 10} piezas`;
}

// Update cart counter badges & floating button visibility
function updateCartBadges() {
  const totalQty = getCartTotalQty();
  
  const navCartCount = document.getElementById('navCartCount');
  const cartFloatCount = document.getElementById('cartFloatCount');
  const cartFloat = document.getElementById('cartFloat');
  const navCartBtn = document.getElementById('navCartBtn');
  const mobileMenuCartLink = document.getElementById('mobileMenuCartLink');

  if (navCartCount) navCartCount.textContent = totalQty;
  if (cartFloatCount) cartFloatCount.textContent = totalQty;
  updateCartSummary();

  // Show/Hide header cart button based on content
  if (navCartBtn) {
    if (totalQty > 0) {
      navCartBtn.classList.remove('hidden');
    } else {
      navCartBtn.classList.add('hidden');
    }
  }

  // Show/Hide mobile menu cart link based on content
  if (mobileMenuCartLink) {
    if (totalQty > 0) {
      mobileMenuCartLink.classList.remove('hidden');
      mobileMenuCartLink.innerHTML = `Mi Pedido <span style="font-size: 0.85em; opacity: 0.85; margin-left: 0.35em;">(${totalQty})</span>`;
    } else {
      mobileMenuCartLink.classList.add('hidden');
    }
  }

  // Show/Hide floating cart button based on content
  if (cartFloat) {
    if (totalQty > 0) {
      cartFloat.removeAttribute('hidden');
      cartFloat.style.opacity = '1';
      cartFloat.style.pointerEvents = 'auto';
    } else {
      cartFloat.style.opacity = '0';
      cartFloat.style.pointerEvents = 'none';
      setTimeout(() => {
        if (cart.length === 0) cartFloat.setAttribute('hidden', '');
      }, 400);
    }
  }
}

// Mobile History Back Button Handler
let modalHistoryPushed = false;

function pushModalState() {
  if (!modalHistoryPushed) {
    history.pushState({ modalOpen: true }, '');
    modalHistoryPushed = true;
  }
}

function popModalStateIfNeeded() {
  if (modalHistoryPushed) {
    modalHistoryPushed = false;
    if (history.state && history.state.modalOpen) {
      history.back();
    }
  }
}

window.addEventListener('popstate', (e) => {
  modalHistoryPushed = false;

  // Close mobile menu if open
  const mobileMenu = document.getElementById('mobileMenu');
  const hamburger = document.getElementById('hamburger');
  if (mobileMenu && mobileMenu.classList.contains('is-open')) {
    mobileMenu.classList.remove('is-open');
    hamburger?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (typeof lenis !== 'undefined' && lenis) lenis.start();
    setTimeout(() => {
      if (!mobileMenu.classList.contains('is-open')) {
        mobileMenu.setAttribute('hidden', '');
      }
    }, 400);
  }

  // Close cart sidebar if open
  const cartSidebar = document.getElementById('cartSidebar');
  if (cartSidebar && cartSidebar.classList.contains('is-open')) {
    cartSidebar.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!cartSidebar.classList.contains('is-open')) {
        cartSidebar.setAttribute('hidden', '');
      }
    }, 360);
  }
});

// Toggle Cart Sidebar Modal
function toggleCart(openState) {
  const sidebar = document.getElementById('cartSidebar');
  if (!sidebar) return;

  clearTimeout(cartCloseTimer);

  if (openState) {
    sidebar.removeAttribute('hidden');
    requestAnimationFrame(() => sidebar.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    setVisualStep(1); // Always reset to Step 1 on open
    renderCartItems(true);
    pushModalState();
  } else {
    sidebar.classList.remove('is-open');
    document.body.style.overflow = '';
    cartCloseTimer = window.setTimeout(() => {
      if (!sidebar.classList.contains('is-open')) {
        sidebar.setAttribute('hidden', '');
      }
    }, 360);
    popModalStateIfNeeded();
  }
}

// Sync card menu quantities with cart state
function syncCardQtyControls() {
  // Qty controls are no longer shown on the home page grid
}

// Render shopping cart list items
function renderCartItems(animate = false) {
  const container = document.getElementById('cartItems');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartSummaryBox = document.getElementById('cartSummaryBox');
  const btnNextStep = document.getElementById('btnNextStep');

  if (!container) return;

  container.innerHTML = '';

  if (cart.length === 0) {
    cartEmpty?.classList.remove('hidden');
    cartSummaryBox?.classList.add('hidden');
    btnNextStep?.classList.add('hidden');
    setVisualStep(1); // Auto-back to step 1
    updateCartSummary();
    return;
  }

  cartEmpty?.classList.add('hidden');
  cartSummaryBox?.classList.remove('hidden');
  btnNextStep?.classList.remove('hidden');
  updateCartSummary();

  cart.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    if (animate) li.classList.add('cart-item-enter');
    li.dataset.id = item.id;
    li.style.setProperty('--item-index', index);
    li.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-img" onerror="this.src='./images/logo-roll-go.png'" />
      <div class="cart-item-info">
        <h4 class="cart-item-name">${item.nombre}</h4>
        <p class="cart-item-desc">${item.categoria ? CAT_LABEL[item.categoria] || item.categoria : ''} · Tubo de 10 piezas</p>
      </div>
      <div class="cart-item-controls">
        <button class="btn-qty-adjust btn-qty-minus" aria-label="Disminuir cantidad" data-id="${item.id}">-</button>
        <span class="cart-item-qty">${item.qty}</span>
        <button class="btn-qty-adjust btn-qty-plus" aria-label="Aumentar cantidad" data-id="${item.id}">+</button>
      </div>
    `;

    li.querySelector('.btn-qty-minus').addEventListener('click', () => updateCartQty(item.id, -1));
    li.querySelector('.btn-qty-plus').addEventListener('click', () => updateCartQty(item.id, 1));

    container.appendChild(li);
  });
}

function pulseCartItem(productId) {
  const item = document.querySelector(`.cart-item[data-id="${productId}"]`);
  const qty = item?.querySelector('.cart-item-qty');
  if (!item || !qty) return;

  item.classList.remove('cart-item-updated');
  qty.classList.remove('qty-pop');
  void item.offsetWidth;
  item.classList.add('cart-item-updated');
  qty.classList.add('qty-pop');
}

function getCartAnimationTarget() {
  const cartFloat = document.getElementById('cartFloat');
  if (cartFloat && !cartFloat.hasAttribute('hidden') && getComputedStyle(cartFloat).pointerEvents !== 'none') {
    return cartFloat;
  }
  return document.getElementById('navCartBtn');
}

function pulseCartBadges() {
  document.querySelectorAll('.cart-badge-count').forEach(badge => {
    badge.classList.remove('cart-badge-pop');
    void badge.offsetWidth;
    badge.classList.add('cart-badge-pop');
  });

  const target = getCartAnimationTarget();
  if (target) {
    target.classList.remove('cart-target-pop');
    void target.offsetWidth;
    target.classList.add('cart-target-pop');
  }
}

function animateProductToCart(sourceCard) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sourceImg = sourceCard?.querySelector('.card-img-hover') || sourceCard?.querySelector('.card-img-default');
  const target = getCartAnimationTarget();

  if (!sourceImg || !target || reduceMotion) {
    pulseCartBadges();
    return;
  }

  const sourceRect = sourceImg.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const clone = sourceImg.cloneNode(false);
  const size = Math.min(sourceRect.width, sourceRect.height, 118);
  const startX = sourceRect.left + sourceRect.width / 2 - size / 2;
  const startY = sourceRect.top + sourceRect.height / 2 - size / 2;
  const endX = targetRect.left + targetRect.width / 2 - size / 2;
  const endY = targetRect.top + targetRect.height / 2 - size / 2;

  clone.className = 'cart-fly-img';
  clone.removeAttribute('loading');
  clone.style.width = `${size}px`;
  clone.style.height = `${size}px`;
  clone.style.left = `${startX}px`;
  clone.style.top = `${startY}px`;
  document.body.appendChild(clone);

  if (typeof gsap !== 'undefined') {
    gsap.to(clone, {
      x: endX - startX,
      y: endY - startY,
      scale: 0.28,
      rotation: 8,
      opacity: 0.18,
      duration: 0.68,
      ease: 'power3.inOut',
      onComplete: () => {
        clone.remove();
        pulseCartBadges();
      }
    });
    return;
  }

  requestAnimationFrame(() => {
    clone.style.transform = `translate3d(${endX - startX}px, ${endY - startY}px, 0) scale(0.28) rotate(8deg)`;
    clone.style.opacity = '0.18';
  });
  clone.addEventListener('transitionend', () => {
    clone.remove();
    pulseCartBadges();
  }, { once: true });
}

function flashAddButton(button) {
  if (!button) return;
  button.classList.add('btn-card-add-confirmed');
  window.setTimeout(() => {
    button.classList.remove('btn-card-add-confirmed');
  }, 650);
}

// Add/Update cart quantities
function addToCart(product, sourceCard, sourceButton) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      nombre: product.nombre,
      imagen: product.imagen,
      categoria: product.categoria,
      qty: 1
    });
  }
  flashAddButton(sourceButton);
  saveCart();
  pulseCartItem(product.id);
  animateProductToCart(sourceCard);
}

function updateCartQty(productId, delta) {
  const idx = cart.findIndex(item => item.id === productId);
  if (idx === -1) return;

  const willRemove = cart[idx].qty + delta <= 0;
  const renderedItem = document.querySelector(`.cart-item[data-id="${productId}"]`);

  if (willRemove && renderedItem) {
    renderedItem.classList.add('cart-item-removing');
    window.setTimeout(() => {
      const currentIdx = cart.findIndex(item => item.id === productId);
      if (currentIdx === -1) return;
      cart[currentIdx].qty += delta;
      if (cart[currentIdx].qty <= 0) cart.splice(currentIdx, 1);
      saveCart();
      pulseCartBadges();
    }, 170);
    return;
  }

  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) {
    cart.splice(idx, 1);
  }
  saveCart();
  pulseCartItem(productId);
  pulseCartBadges();
}

// Clear whole cart
function clearCart() {
  cart = [];
  saveCart();
}


/* ─────────────────────────────────────────────────────────
   MODULE: RENDER MENU CARD
   ───────────────────────────────────────────────────────── */
function buildCard(product) {
  const article = document.createElement('article');
  article.className = 'menu-card';
  article.dataset.category = product.categoria;

  const badgeClass = product.destacado ? 'card-badge featured' : 'card-badge';
  const badgeLabel = product.destacado
    ? '⭐ Favorito'
    : CAT_LABEL[product.categoria] || product.categoria;

  const tagsHtml = (product.tags || []).map(tag => {
    const isVeggie = product.categoria === 'veggie';
    return `<span class="card-tag${isVeggie ? ' veggie' : ''}">${tag}</span>`;
  }).join('');

  article.innerHTML = `
    <div class="card-img">
      <a href="./product.html?id=${encodeURIComponent(product.id)}">
        <img
          src="${product.imagen}"
          alt="${product.nombre}"
          class="card-img-default"
          loading="lazy"
          width="400"
          height="300"
          onerror="this.src='./images/logo-roll-go.png'"
        />
        ${product.imagenTubo ? `
        <img
          src="${product.imagenTubo}"
          alt="${product.nombre} tubo"
          class="card-img-hover"
          loading="lazy"
          width="400"
          height="300"
          onerror="this.style.display='none'"
        />` : ''}
      </a>
      <span class="${badgeClass}">${badgeLabel}</span>
    </div>
    <div class="card-body">
      <h3 class="card-name"><a href="./product.html?id=${encodeURIComponent(product.id)}">${product.nombre}</a></h3>
      <p class="card-desc">${product.descripcion}</p>
      <span class="card-presentation">📦 Presentación: Tubo de 10 piezas</span>
      <div class="card-tags">${tagsHtml}</div>
    </div>
  `;

  // Card click listener to open details page
  article.addEventListener('click', () => {
    window.location.href = `./product.html?id=${encodeURIComponent(product.id)}`;
  });

  return article;
}

/* Card appear animation */
function animateCardsIn(cards) {
  if (typeof gsap !== 'undefined') {
    gsap.fromTo(cards,
      { y: 32, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out',
        onComplete: () => cards.forEach(c => c.classList.add('is-visible')) }
    );
  } else {
    cards.forEach(c => c.classList.add('is-visible'));
  }
}


/* ─────────────────────────────────────────────────────────
   MODULE: LOAD MENU (fetch + render)
   ───────────────────────────────────────────────────────── */
async function loadMenu() {
  const grid    = document.getElementById('menuGrid');
  const loading = document.getElementById('menuLoading');
  const error   = document.getElementById('menuError');
  if (!grid) return;

  loading?.classList.remove('hidden');
  error?.classList.add('hidden');
  grid.classList.add('hidden');
  grid.innerHTML = '';

  try {
    const products = await fetchJson(DATA_PATHS.menu);

    if (!Array.isArray(products) || !products.length) {
      throw new Error('Menú vacío');
    }

    const cards = products.map(product => {
      const card = buildCard(product);
      grid.appendChild(card);
      return card;
    });

    loading?.classList.add('hidden');
    grid.classList.remove('hidden');

    requestAnimationFrame(() => {
      // Robust native IntersectionObserver for card slide-in reveals
      if (typeof IntersectionObserver !== 'undefined') {
        const cardObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const card = entry.target;
              card.classList.add('is-visible');
              cardObserver.unobserve(card);
            }
          });
        }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

        cards.forEach(card => cardObserver.observe(card));
      } else {
        cards.forEach(card => card.classList.add('is-visible'));
      }

      syncCardQtyControls();
      initTilt(Array.from(grid.querySelectorAll('.menu-card')));

      // Refresh ScrollTrigger to recalculate footer/CTA scroll markers after menu DOM injection
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    });

  } catch (err) {
    console.warn('[RollGo] Menu load error:', err);
    loading?.classList.add('hidden');
    grid.classList.remove('hidden');
  }
}

window.loadMenu = loadMenu;


/* ─────────────────────────────────────────────────────────
   MODULE: FLOATING WA & CART BUTTONS visibility
   ───────────────────────────────────────────────────────── */
function initFloatingWA() {
  const floats = document.querySelector('.floats-container');
  const waFloat = document.getElementById('waFloat');
  if (!floats || !waFloat) return;

  const onScroll = () => {
    const show = window.scrollY > 200;
    waFloat.style.opacity = show ? '1' : '0';
    waFloat.style.pointerEvents = show ? 'auto' : 'none';
  };
  waFloat.style.opacity = '0';
  waFloat.style.transition = 'opacity 0.4s ease';
  window.addEventListener('scroll', onScroll, { passive: true });
}


/* ─────────────────────────────────────────────────────────
   MODULE: ACTIVE NAV LINK
   ───────────────────────────────────────────────────────── */
function initActiveNav() {
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  if (typeof IntersectionObserver === 'undefined') return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        link.removeAttribute('aria-current');
        if (link.getAttribute('href') === `#${entry.target.id}`) {
          link.setAttribute('aria-current', 'page');
        }
      });
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(s => observer.observe(s));
}


/* ─────────────────────────────────────────────────────────
   MODULE: CART SIDEBAR INTERACTIONS & CHECKOUT SUBMIT
   ───────────────────────────────────────────────────────── */
function initCartSidebarUI() {
  const navCartBtn = document.getElementById('navCartBtn');
  const cartFloat = document.getElementById('cartFloat');
  const cartClose = document.getElementById('cartClose');
  const cartBackdrop = document.getElementById('cartBackdrop');
  const cartForm = document.getElementById('cartForm');
  const cartBody = document.querySelector('.cart-body');

  navCartBtn?.addEventListener('click', () => toggleCart(true));
  cartFloat?.addEventListener('click', () => toggleCart(true));
  cartClose?.addEventListener('click', () => toggleCart(false));
  cartBackdrop?.addEventListener('click', () => toggleCart(false));
  cartBody?.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });

  const btnEmptyReturn = document.getElementById('btnEmptyReturn');
  btnEmptyReturn?.addEventListener('click', () => {
    toggleCart(false);
    const menuSec = document.getElementById('menu');
    if (menuSec) {
      if (typeof lenis !== 'undefined' && lenis) {
        lenis.scrollTo(menuSec);
      } else {
        menuSec.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });


  const btnNextStep = document.getElementById('btnNextStep');
  const btnBackToCart = document.getElementById('btnBackToCart');
  btnNextStep?.addEventListener('click', () => setVisualStep(2));
  btnBackToCart?.addEventListener('click', () => setVisualStep(1));

  const methodDelivery = document.getElementById('methodDelivery');
  const methodPickup = document.getElementById('methodPickup');
  const addressGroup = document.getElementById('addressGroup');
  const orderAddressInput = document.getElementById('orderAddress');
  const orderPhoneInput = document.getElementById('orderPhone');
  setupDigitsOnly(orderPhoneInput);

  const updateAddressVisibility = () => {
    if (methodDelivery?.checked) {
      addressGroup?.classList.remove('hidden');
      if (orderAddressInput) orderAddressInput.required = true;
    } else {
      addressGroup?.classList.add('hidden');
      if (orderAddressInput) {
        orderAddressInput.required = false;
        orderAddressInput.value = '';
      }
    }
  };

  methodDelivery?.addEventListener('change', updateAddressVisibility);
  methodPickup?.addEventListener('change', updateAddressVisibility);
  setupValidationClear(cartForm);

  cartForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const errorDiv = document.getElementById('cartFormError');
    const spinner = document.getElementById('orderSpinner');
    const btnSubmit = document.getElementById('btnSubmitOrder');
    const nameInput = document.getElementById('orderName');
    const phoneInput = document.getElementById('orderPhone');
    const notesInput = document.getElementById('orderNotes');

    if (errorDiv) errorDiv.classList.add('hidden');
    clearFormValidation(cartForm);

    if (cart.length === 0) {
      showFormError(errorDiv, 'Agregá al menos un producto antes de confirmar el pedido.');
      return;
    }

    const isDelivery = Boolean(methodDelivery?.checked);
    const isValid = validateOrderForm({
      nameInput,
      phoneInput,
      addressInput: orderAddressInput,
      notesInput,
      isDelivery,
      errorDiv
    });
    if (!isValid) return;

    spinner?.classList.remove('hidden');
    if (btnSubmit) btnSubmit.disabled = true;

    const nombre = cleanText(nameInput?.value);
    const telefono = cleanText(phoneInput?.value);
    const notes = cleanText(notesInput?.value);
    const address = cleanText(orderAddressInput?.value);

    const productos = cart.map(item => item.nombre);
    const cantidades = cart.map(item => item.qty);

    try {
      const whatsappUrl = getWhatsAppUrl(buildOrderMessage({
        nombre,
        telefono,
        productos,
        cantidades,
        notas: notes,
        direccion: isDelivery ? address : `Retiro en el local (${businessConfig.direccion})`
      }));

      window.open(whatsappUrl, '_blank');
      clearCart();
      toggleCart(false);
      cartForm.reset();
      updateAddressVisibility();
    } catch (err) {
      console.error('[RollGo] Order submit error:', err);
      if (errorDiv) {
        errorDiv.textContent = 'No pudimos abrir WhatsApp. Intentá nuevamente.';
        errorDiv.classList.remove('hidden');
      }
    } finally {
      spinner?.classList.add('hidden');
      if (btnSubmit) btnSubmit.disabled = false;
    }
  });
}


/* ─────────────────────────────────────────────────────────
   MODULE: CONTACT FORM SUBMIT
   ───────────────────────────────────────────────────────── */
function initContactFormUI() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;
  setupValidationClear(contactForm);
  setupDigitsOnly(document.getElementById('contactPhone'));

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const errorDiv = document.getElementById('contactFormError');
    const successDiv = document.getElementById('contactFormSuccess');
    const spinner = document.getElementById('contactSpinner');
    const btnSubmit = document.getElementById('btnSubmitContact');
    const nameInput = document.getElementById('contactName');
    const phoneInput = document.getElementById('contactPhone');
    const messageInput = document.getElementById('contactMessage');

    if (errorDiv) errorDiv.classList.add('hidden');
    if (successDiv) successDiv.classList.add('hidden');

    clearFormValidation(contactForm);

    const isValid = validateContactForm({ nameInput, phoneInput, messageInput, errorDiv });
    if (!isValid) return;

    spinner?.classList.remove('hidden');
    if (btnSubmit) btnSubmit.disabled = true;

    const nombre = cleanText(nameInput?.value);
    const telefono = cleanText(phoneInput?.value);
    const mensaje = cleanText(messageInput?.value);

    try {
      const whatsappUrl = getWhatsAppUrl(buildContactMessage({ nombre, telefono, mensaje }));

      if (successDiv) successDiv.classList.remove('hidden');
      contactForm.reset();
      window.open(whatsappUrl, '_blank');
    } catch (err) {
      console.error('[RollGo] Contact submit error:', err);
      if (errorDiv) {
        errorDiv.textContent = 'No pudimos abrir WhatsApp. Intentá nuevamente.';
        errorDiv.classList.remove('hidden');
      }
    } finally {
      spinner?.classList.add('hidden');
      if (btnSubmit) btnSubmit.disabled = false;
    }
  });
}


/* ─────────────────────────────────────────────────────────
   MODULE: INTERACTIVE ANIMATION STEPS (GSAP)
   ───────────────────────────────────────────────────────── */
function initInteractiveSteps() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const section = document.querySelector('.product-demo-section');
  const stage = document.getElementById('productDemoStage');
  const camera = document.getElementById('productDemoCamera');
  const tube = document.getElementById('demoTube');
  const soy = document.getElementById('demoSoy');
  const sushi1 = document.getElementById('demoSushi1');
  const sushi2 = document.getElementById('demoSushi2');
  const sushi3 = document.getElementById('demoSushi3');
  const steps = Array.from(document.querySelectorAll('.product-demo-step'));

  if (!section || !stage || !camera || !tube || !soy || !sushi1 || !sushi2 || !sushi3 || !steps.length) return;

  gsap.set([camera, tube, soy, sushi1, sushi2, sushi3], {
    force3D: true,
    transformStyle: 'preserve-3d',
    willChange: 'transform, opacity, filter'
  });

  gsap.set(camera, { scale: 1, rotateX: 0, rotateY: 0 });
  gsap.set(tube, {
    opacity: 0,
    y: 70,
    scale: 0.9,
    rotateX: 0,
    filter: 'drop-shadow(0 28px 42px rgba(45, 29, 13, 0.13))'
  });
  gsap.set(soy, {
    opacity: 0,
    x: 132,
    y: -70,
    z: 10,
    scale: 0.92,
    rotateZ: 0,
    zIndex: 18,
    filter: 'drop-shadow(0 14px 24px rgba(45, 29, 13, 0.12))'
  });
  gsap.set([sushi1, sushi2, sushi3], {
    opacity: 0,
    y: 220,
    z: -34,
    scale: 0.72,
    rotateX: -2,
    rotateY: 0,
    filter: 'blur(1.2px) drop-shadow(0 10px 18px rgba(45, 29, 13, 0.12))'
  });

  const setActiveStep = (index) => {
    steps.forEach((step, stepIndex) => {
      step.classList.toggle('active', stepIndex === index);
    });
  };

  const tl = gsap.timeline({
    paused: true,
    repeat: -1,
    repeatDelay: 0.75,
    defaults: { ease: 'power3.out' },
    onUpdate: () => {
      const activeIdx = Math.min(4, Math.floor(tl.progress() * 5));
      setActiveStep(activeIdx);
    }
  });

  tl.addLabel('intro')
    .to(tube, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.45,
      ease: 'power3.out'
    }, 'intro')
    .to(soy, {
      opacity: 1,
      scale: 1,
      duration: 1.05,
      ease: 'power3.out'
    }, 'intro+=0.35')

    .addLabel('open')
    .to(soy, {
      x: 164,
      y: -34,
      rotateZ: 7,
      z: 26,
      duration: 1.35,
      ease: 'power2.inOut'
    }, 'open')
    .to(camera, {
      rotateY: -1.4,
      duration: 1.35,
      ease: 'power2.inOut'
    }, 'open')

    .addLabel('serve')
    .to(camera, {
      scale: 1.035,
      rotateY: 0,
      duration: 1.15,
      ease: 'power2.inOut'
    }, 'serve')
    .to(soy, {
      x: 48,
      y: -338,
      rotateZ: -74,
      z: 44,
      zIndex: 22,
      duration: 1.45,
      ease: 'power2.inOut'
    }, 'serve+=0.18')
    .to(soy, {
      x: 132,
      y: -70,
      rotateZ: 0,
      z: 18,
      zIndex: 18,
      duration: 1.25,
      ease: 'power2.inOut'
    }, 'serve+=1.8')

    .addLabel('insert')
    .set(soy, {
      zIndex: 6,
      filter: 'drop-shadow(0 8px 14px rgba(45, 29, 13, 0.08))'
    }, 'insert+=0.35')
    .to(soy, {
      x: -6,
      y: 14,
      scale: 0.96,
      duration: 1.45,
      ease: 'power3.inOut'
    }, 'insert')
    .to(camera, {
      scale: 1.02,
      duration: 1.45,
      ease: 'power2.inOut'
    }, 'insert')

    .addLabel('push')
    .to(soy, {
      y: -34,
      opacity: 0.72,
      duration: 1.15,
      ease: 'power1.inOut'
    }, 'push')
    .to(camera, {
      scale: 1.06,
      rotateX: 1.2,
      duration: 2.25,
      ease: 'sine.inOut'
    }, 'push')
    .to(sushi1, {
      opacity: 1,
      y: -70,
      z: 28,
      scale: 1,
      rotateX: 4,
      filter: 'blur(0px) drop-shadow(0 22px 34px rgba(45, 29, 13, 0.2))',
      duration: 2.15,
      ease: 'power3.out'
    }, 'push+=0.18')
    .to(sushi2, {
      opacity: 0.9,
      y: -8,
      z: 6,
      scale: 0.86,
      rotateX: 3,
      filter: 'blur(0.25px) drop-shadow(0 16px 26px rgba(45, 29, 13, 0.16))',
      duration: 2,
      ease: 'power3.out'
    }, 'push+=0.72')
    .to(sushi3, {
      opacity: 0.78,
      y: 22,
      z: -10,
      scale: 0.78,
      rotateX: 2,
      filter: 'blur(0.45px) drop-shadow(0 12px 22px rgba(45, 29, 13, 0.13))',
      duration: 1.9,
      ease: 'power3.out'
    }, 'push+=1.08')

    .addLabel('enjoy')
    .to(camera, {
      scale: 1,
      rotateX: 0,
      duration: 1.65,
      ease: 'sine.inOut'
    }, 'enjoy')
    .to([sushi1, sushi2, sushi3], {
      rotateY: -2,
      duration: 1.65,
      ease: 'sine.inOut',
      stagger: 0.08
    }, 'enjoy');

  ScrollTrigger.create({
    trigger: section,
    start: 'top 68%',
    end: 'bottom 20%',
    onEnter: () => tl.restart(true),
    onEnterBack: () => tl.restart(true),
    onLeave: () => {
      tl.pause(0);
      setActiveStep(0);
    },
    onLeaveBack: () => {
      tl.pause(0);
      setActiveStep(0);
    }
  });
}


/* ─────────────────────────────────────────────────────────
   BOOT — initialize everything
   ───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  initLenis();
  initNavbar();
  initMobileMenu();
  handleAnchorClicks();
  initActiveNav();

  initHero();
  initInteractiveSteps();
  initScrollReveals();
  initMagneticButtons();

  await loadBusinessConfig();
  loadCartFromStorage();
  initCartSidebarUI();

  initFilters();
  await loadMenu();

  initFloatingWA();
  initContactFormUI();

  console.log('🍣 Roll & Go app initialized');
});
