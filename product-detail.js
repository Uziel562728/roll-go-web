/* ============================================================
   ROLL & GO — product-detail.js
   Maneja la carga asíncrona de detalles, switch foto/video,
   carrito local y checkout de la orden.
   ============================================================ */

'use strict';

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

let currentProduct = null;
let purchaseQty = 1;
let cart = [];
let lenis = null;
let cartCloseTimer;

// Initialize Lenis smooth scroll
function initLenis() {
  if (typeof Lenis === 'undefined') return;
  lenis = new Lenis({
    lerp: 0.085,
    smooth: true,
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// Fetch helper
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

/* ── Cart Operations ───────────────────────────────────────── */
function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('rollgo_cart');
    if (saved) {
      cart = JSON.parse(saved);
    }
  } catch (e) {
    console.warn('[RollGo] Failed to load cart:', e);
  }
  updateCartBadges();
}

function saveCart() {
  try {
    localStorage.setItem('rollgo_cart', JSON.stringify(cart));
  } catch (e) {
    console.warn('[RollGo] Failed to save cart:', e);
  }
  updateCartBadges();
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

function pulseCartBadges() {
  document.querySelectorAll('.cart-badge-count').forEach(badge => {
    badge.classList.remove('cart-badge-pop');
    void badge.offsetWidth;
    badge.classList.add('cart-badge-pop');
  });

  const target = document.getElementById('cartFloat') || document.getElementById('navCartBtn');
  if (target) {
    target.classList.remove('cart-target-pop');
    void target.offsetWidth;
    target.classList.add('cart-target-pop');
  }
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

function addToCart(product, quantityToAdd = 1) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += quantityToAdd;
  } else {
    cart.push({
      id: product.id,
      nombre: product.nombre,
      imagen: product.imagen,
      categoria: product.categoria,
      qty: quantityToAdd
    });
  }
  saveCart();
  pulseCartItem(product.id);
  pulseCartBadges();
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
      <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-img" onerror="this.src='./images/logo-roll-go.webp'" />
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
    window.location.href = './#menu';
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
      cart = [];
      saveCart();
      toggleCart(false);
      cartForm.reset();
      updateAddressVisibility();
    } catch (err) {
      console.error('[RollGo] Order error:', err);
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

/* ── Product Detail Loading ────────────────────────────────── */
async function loadProductDetail() {
  const loading = document.getElementById('detailLoading');
  const error = document.getElementById('detailError');
  const grid = document.getElementById('detailGrid');

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id') || window.location.pathname.split('/').pop();

  if (!productId) {
    loading.classList.add('hidden');
    error.classList.remove('hidden');
    return;
  }

  try {
    const products = await fetchJson(DATA_PATHS.menu);
    const product = Array.isArray(products) ? products.find(item => item.id === productId) : null;
    if (!product) {
      throw new Error('Producto no encontrado.');
    }

    currentProduct = product;

    // Render Data
    document.title = `${currentProduct.nombre} — Detalles — Roll & Go`;
    
    // Image
    // Images
    const detailImg = document.getElementById('detailImg');
    const detailImgSecondary = document.getElementById('detailImgSecondary');
    
    if (detailImg) {
      detailImg.src = currentProduct.imagen;
      detailImg.alt = currentProduct.nombre;
    }
    if (detailImgSecondary && currentProduct.imagenTubo) {
      detailImgSecondary.src = currentProduct.imagenTubo;
      detailImgSecondary.alt = `${currentProduct.nombre} en envase tubo`;
    }

    // Visuals Switcher (Arrows & Frame Click)
    let activePhotoIndex = 0;
    let isAnimating = false;
    const arrowPrev = document.getElementById('arrowPrev');
    const arrowNext = document.getElementById('arrowNext');
    const displayFrame = document.getElementById('visualDisplayFrame');

    function setPhoto(index) {
      if (isAnimating) return; // Evitar clicks concurrentes que dejen fotos en blanco
      isAnimating = true;
      activePhotoIndex = index;

      if (activePhotoIndex === 0) {
        // Mostrar Pieza, ocultar Tubo
        if (typeof gsap !== 'undefined') {
          // Detener animaciones previas para evitar colisiones
          gsap.killTweensOf(detailImg);
          gsap.killTweensOf(detailImgSecondary);

          gsap.to(detailImgSecondary, { opacity: 0, duration: 0.35, onComplete: () => {
            detailImgSecondary.classList.add('hidden');
            isAnimating = false;
          }});
          detailImg.classList.remove('hidden');
          gsap.fromTo(detailImg, { opacity: 0 }, { opacity: 1, duration: 0.35 });
        } else {
          detailImgSecondary.classList.add('hidden');
          detailImg.classList.remove('hidden');
          isAnimating = false;
        }
      } else {
        // Mostrar Tubo, ocultar Pieza
        if (typeof gsap !== 'undefined') {
          // Detener animaciones previas para evitar colisiones
          gsap.killTweensOf(detailImg);
          gsap.killTweensOf(detailImgSecondary);

          gsap.to(detailImg, { opacity: 0, duration: 0.35, onComplete: () => {
            detailImg.classList.add('hidden');
            isAnimating = false;
          }});
          detailImgSecondary.classList.remove('hidden');
          gsap.fromTo(detailImgSecondary, { opacity: 0 }, { opacity: 1, duration: 0.35 });
        } else {
          detailImg.classList.add('hidden');
          detailImgSecondary.classList.remove('hidden');
          isAnimating = false;
        }
      }
    }

    arrowNext?.addEventListener('click', (e) => {
      e.stopPropagation();
      const nextIdx = (activePhotoIndex + 1) % 2;
      setPhoto(nextIdx);
    });

    arrowPrev?.addEventListener('click', (e) => {
      e.stopPropagation();
      const prevIdx = (activePhotoIndex - 1 + 2) % 2;
      setPhoto(prevIdx);
    });

    // Al hacer click en la foto, alternar también de forma directa
    displayFrame?.addEventListener('click', () => {
      const nextIdx = (activePhotoIndex + 1) % 2;
      setPhoto(nextIdx);
    });

    // Title / Description
    document.getElementById('detailName').textContent = currentProduct.nombre;
    document.getElementById('detailCategory').textContent = CAT_LABEL[currentProduct.categoria] || currentProduct.categoria;
    document.getElementById('detailDescLarga').textContent = currentProduct.descripcion;

    // Ingredients tags
    const ingredientsContainer = document.getElementById('detailIngredients');
    ingredientsContainer.innerHTML = '';
    (currentProduct.ingredientes || []).forEach(ing => {
      const li = document.createElement('li');
      li.className = 'detail-ingredient-tag';
      li.textContent = ing;
      ingredientsContainer.appendChild(li);
    });

    // Quantity controls in detail
    const qtyNum = document.getElementById('purchaseQtyNum');
    document.getElementById('btnQtyMinus')?.addEventListener('click', () => {
      if (purchaseQty > 1) {
        purchaseQty--;
        if (qtyNum) qtyNum.textContent = purchaseQty;
      }
    });
    document.getElementById('btnQtyPlus')?.addEventListener('click', () => {
      purchaseQty++;
      if (qtyNum) qtyNum.textContent = purchaseQty;
    });

    // Add to cart click
    document.getElementById('btnAddToOrder')?.addEventListener('click', () => {
      if (currentProduct) {
        addToCart(currentProduct, purchaseQty);
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (!isMobile) {
          toggleCart(true); // Open sidebar to checkout on desktop only
        }
      }
    });

    // Card Tilt details
    if (typeof VanillaTilt !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
      const displayFrame = document.getElementById('visualDisplayFrame');
      if (displayFrame) {
        VanillaTilt.init(displayFrame, {
          max: 8,
          speed: 400,
          perspective: 1000,
          scale: 1.01,
          glare: true,
          'max-glare': 0.1
        });
      }
    }

    // Show content grid
    loading.classList.add('hidden');
    grid.classList.remove('hidden');

  } catch (err) {
    console.error('[RollGo] Failed to load detail page:', err);
    loading.classList.add('hidden');
    error.classList.remove('hidden');
  }
}

/* ── Mobile Menu toggle ────────────────────────────────────── */
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

// Active navbar scroll style
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }
}

/* ── BOOT ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  initLenis();
  initNavbar();
  initMobileMenu();
  loadCartFromStorage();
  initCartSidebarUI();
  await loadBusinessConfig();
  await loadProductDetail();
});
