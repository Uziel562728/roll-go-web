/* ============================================================
   ROLL & GO — app.js v3 (Completo)
   Modular · GSAP + ScrollTrigger · Lenis · VanillaTilt · SplitType
   ============================================================ */

'use strict';

/* ── Constants ───────────────────────────────────────────── */
const API_BASE  = '';   // same origin (Express serves at /)
const WA_URL    = 'https://wa.me/541151816111?text=Hola%20quiero%20hacer%20un%20pedido%20de%20Roll%20%26%20Go';
const CAT_LABEL = { clasico: 'Clásico', panizado: 'Panizado', veggie: 'Veggie' };


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
  if (!hamburger || !mobileMenu) return;

  const open  = () => {
    mobileMenu.removeAttribute('hidden');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  };
  const close = () => {
    mobileMenu.setAttribute('hidden', '');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  };
  const toggle = () => mobileMenu.hasAttribute('hidden') ? open() : close();

  hamburger.addEventListener('click', toggle);
  if (closeBtn) closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', close));
}


/* ─────────────────────────────────────────────────────────
   MODULE: HERO ANIMATIONS (GSAP + SplitType)
───────────────────────────────────────────────────────── */
function initHero() {
  if (typeof gsap === 'undefined') {
    // CSS fallback — just show everything
    document.querySelectorAll('#heroEyebrow,#heroLogoWrapper,#heroLogoImg,#heroSub,#heroStats,#heroCta,#heroVisual')
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
  gsap.set('#heroVisual',  { scale: 0.98, opacity: 0, filter: "blur(10px)" });

  // Timeline Sequence
  tl.to('#heroLogoImg', { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.4, ease: "power4.out" })
    .to('#heroVisual', { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.6, ease: "power3.out" }, '-=1.0')
    .to('#heroEyebrow', { y: 0, opacity: 1, duration: 0.6 }, '-=1.2')
    .to('#heroSub',     { y: 0, opacity: 1, duration: 0.6 }, '-=1.0')
    .to('#heroStats',   { y: 0, opacity: 1, duration: 0.6 }, '-=0.8')
    .to('#heroCta',     { y: 0, opacity: 1, duration: 0.6 }, '-=0.6');
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

  // Parallax on hero product image
  const heroImg = document.getElementById('heroImg');
  if (heroImg) {
    gsap.to(heroImg, {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });
  }
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

    // Mobile: subtle float animation
    if (!supportsHover) {
      cards.forEach((card, i) => {
        if (typeof gsap !== 'undefined') {
          gsap.to(card, {
            y: -5,
            duration: 1.8 + (i * 0.15),
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            delay: i * 0.2,
          });
        }
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
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error ${res.status}: ${endpoint}`);
  }
  return res.json();
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

function getCartTotalQty() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartSummary() {
  const title = document.querySelector('.cart-title');
  const totalQty = getCartTotalQty();

  if (title) {
    title.dataset.count = totalQty > 0 ? `${totalQty}` : '';
  }
}

// Update cart counter badges & floating button visibility
function updateCartBadges() {
  const totalQty = getCartTotalQty();
  
  const navCartCount = document.getElementById('navCartCount');
  const cartFloatCount = document.getElementById('cartFloatCount');
  const cartFloat = document.getElementById('cartFloat');

  if (navCartCount) navCartCount.textContent = totalQty;
  if (cartFloatCount) cartFloatCount.textContent = totalQty;
  updateCartSummary();

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

// Toggle Cart Sidebar Modal
function toggleCart(openState) {
  const sidebar = document.getElementById('cartSidebar');
  if (!sidebar) return;

  clearTimeout(cartCloseTimer);

  if (openState) {
    sidebar.removeAttribute('hidden');
    requestAnimationFrame(() => sidebar.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    renderCartItems(true);
  } else {
    sidebar.classList.remove('is-open');
    document.body.style.overflow = '';
    cartCloseTimer = window.setTimeout(() => {
      if (!sidebar.classList.contains('is-open')) {
        sidebar.setAttribute('hidden', '');
      }
    }, 360);
  }
}

// Sync card menu quantities with cart state
function syncCardQtyControls() {
  document.querySelectorAll('.menu-card').forEach(card => {
    const productId = card.querySelector('.card-add-container')?.dataset.productId;
    if (!productId) return;

    const cartItem = cart.find(item => item.id === productId);
    const addBtn = card.querySelector('.btn-qty-add-trigger');
    const qtyControl = card.querySelector('.card-qty-control');
    const qtyNum = card.querySelector('.card-qty-num');

    if (cartItem) {
      if (addBtn) addBtn.classList.add('hidden');
      if (qtyControl) qtyControl.classList.remove('hidden');
      if (qtyNum) qtyNum.textContent = cartItem.qty;
    } else {
      if (addBtn) addBtn.classList.remove('hidden');
      if (qtyControl) qtyControl.classList.add('hidden');
    }
  });
}

// Render shopping cart list items
function renderCartItems(animate = false) {
  const container = document.getElementById('cartItems');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartForm = document.getElementById('cartForm');

  if (!container) return;

  container.innerHTML = '';

  if (cart.length === 0) {
    cartEmpty?.classList.remove('hidden');
    cartForm?.classList.add('hidden');
    updateCartSummary();
    return;
  }

  cartEmpty?.classList.add('hidden');
  cartForm?.classList.remove('hidden');
  updateCartSummary();

  cart.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    if (animate) li.classList.add('cart-item-enter');
    li.dataset.id = item.id;
    li.style.setProperty('--item-index', index);
    li.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-img" onerror="this.src='/images/roll-go-producto.jpg'" />
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
      <a href="/producto/${product.id}">
        <img
          src="${product.imagen}"
          alt="${product.nombre}"
          class="card-img-default"
          loading="lazy"
          width="400"
          height="300"
          onerror="this.src='/images/roll-go-producto.jpg'"
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
      <h3 class="card-name"><a href="/producto/${product.id}">${product.nombre}</a></h3>
      <p class="card-desc">${product.descripcion}</p>
      <span class="card-presentation">📦 Presentación: Tubo de 10 piezas</span>
      <div class="card-tags">${tagsHtml}</div>
      
      <div class="card-add-container" data-product-id="${product.id}">
        <button class="btn-card-add btn-qty-add-trigger">Agregar al pedido</button>
        <div class="card-qty-control hidden">
          <button class="btn-card-qty btn-card-qty-minus" aria-label="Quitar uno">-</button>
          <span class="card-qty-num">1</span>
          <button class="btn-card-qty btn-card-qty-plus" aria-label="Agregar uno">+</button>
        </div>
      </div>
    </div>
  `;

  // Card-wide click listener to open details page (skipping cart interactions)
  article.addEventListener('click', (e) => {
    if (e.target.closest('.card-add-container') || e.target.closest('.btn-qty-add-trigger') || e.target.closest('.card-qty-control')) {
      return;
    }
    window.location.href = `/producto/${product.id}`;
  });

  article.querySelector('.btn-qty-add-trigger').addEventListener('click', (e) => {
    e.stopPropagation();
    addToCart(product, article, e.currentTarget);
  });
  
  article.querySelector('.btn-card-qty-minus').addEventListener('click', (e) => {
    e.stopPropagation();
    updateCartQty(product.id, -1);
  });
  article.querySelector('.btn-card-qty-plus').addEventListener('click', (e) => {
    e.stopPropagation();
    updateCartQty(product.id, 1);
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
    const data = await apiFetch('/api/menu');

    if (!data.success || !data.products?.length) {
      throw new Error('Menú vacío');
    }

    const cards = data.products.map(product => {
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
    console.error('[RollGo] Menu load error:', err);
    loading?.classList.add('hidden');
    error?.classList.remove('hidden');
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

  const ctaWaBtn = document.getElementById('ctaWaBtn');
  ctaWaBtn?.addEventListener('click', () => toggleCart(true));

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
      const res = await apiFetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          telefono,
          productos,
          cantidades,
          notes: notes,
          direccion: isDelivery ? address : 'Retiro en el local (Terrada 592)'
        })
      });

      if (res.success && res.whatsappUrl) {
        window.open(res.whatsappUrl, '_blank');
        clearCart();
        toggleCart(false);
        cartForm.reset();
        updateAddressVisibility();
      } else {
        throw new Error(res.error || 'Error al procesar la orden.');
      }
    } catch (err) {
      console.error('[RollGo] Order submit error:', err);
      if (errorDiv) {
        errorDiv.textContent = err.message || 'Error al enviar el pedido.';
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
      const res = await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, telefono, mensaje })
      });

      if (res.success && res.whatsappUrl) {
        if (successDiv) successDiv.classList.remove('hidden');
        contactForm.reset();
        window.open(res.whatsappUrl, '_blank');
      } else {
        throw new Error(res.error || 'Error al enviar la consulta.');
      }
    } catch (err) {
      console.error('[RollGo] Contact submit error:', err);
      if (errorDiv) {
        errorDiv.textContent = err.message || 'Error al enviar la consulta.';
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
      x: 6,
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
      x: -36,
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

  loadCartFromStorage();
  initCartSidebarUI();

  initFilters();
  await loadMenu();

  initFloatingWA();
  initContactFormUI();

  console.log('🍣 Roll & Go app initialized');
});
