// =============================================
// cart.js — Cart, checkout & toast logic
// =============================================

let cart = [];
const CART_STORAGE_KEY = 'kentbeats-cart-v1';

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    if (Array.isArray(stored)) {
      cart = stored;
    }
  } catch {
    cart = [];
  }
}

// ─── TOAST ───
let toastTimer;
function showToast(msg) {
  const toast   = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  toastMsg.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── ADD / REMOVE ───
function addToCart(item) {
  if (cart.find(c => c.name === item.name)) {
    showToast(`${item.name} is already in your cart`);
    return;
  }
  cart.push(item);
  saveCart();
  updateCartUI();
  showToast(`${item.name} added to cart! 🎵`);
}

function removeFromCart(name) {
  cart = cart.filter(c => c.name !== name);
  saveCart();
  updateCartUI();
}

function getNumericPrice(price) {
  const numeric = parseFloat(String(price).replace('$', ''));
  return Number.isNaN(numeric) ? 0 : numeric;
}

// ─── UPDATE UI ───
function updateCartUI() {
  const badge       = document.getElementById('cartBadge');
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmpty   = document.getElementById('cartEmpty');
  const cartTotal   = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  // Badge
  badge.style.display = cart.length ? 'flex' : 'none';
  badge.textContent   = cart.length;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '';
    cartItemsEl.appendChild(cartEmpty);
    cartTotal.textContent = 'FREE';
    checkoutBtn.disabled  = true;
    return;
  }

  // Render items
  cartItemsEl.innerHTML = '';
  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-thumb"
        style="background: linear-gradient(135deg, var(--mid), var(--electric))">
        ${item.emoji}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-genre">${item.genre}</div>
      </div>
      <div class="cart-item-price">${item.price}</div>
      <button class="cart-item-remove" data-name="${item.name}">✕</button>`;
    cartItemsEl.appendChild(div);
  });

  // Remove buttons
  document.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.name));
  });

  // Total
  const total = cart.reduce((sum, c) => sum + getNumericPrice(c.price), 0);
  cartTotal.textContent  = total === 0 ? 'FREE' : `$${total}`;
  checkoutBtn.disabled   = false;
}

// ─── OPEN / CLOSE CART ───
const cartFab     = document.getElementById('cartFab');
const cartPanel   = document.getElementById('cartPanel');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose   = document.getElementById('cartClose');

function openCart()  { cartPanel.classList.add('open');    cartOverlay.classList.add('show'); }
function closeCart() { cartPanel.classList.remove('open'); cartOverlay.classList.remove('show'); }

window.openCart = openCart;
window.closeCart = closeCart;

cartFab.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ─── CHECKOUT ───
const checkoutBtn    = document.getElementById('checkoutBtn');
const checkoutModal  = document.getElementById('checkoutModal');
const checkoutCancel = document.getElementById('checkoutCancel');
const checkoutConfirm = document.getElementById('checkoutConfirm');
const checkoutFirstName = document.getElementById('checkoutFirstName');
const checkoutLastName = document.getElementById('checkoutLastName');
const checkoutEmail = document.getElementById('checkoutEmail');

checkoutBtn.addEventListener('click', () => {
  closeCart();

  const summary = document.getElementById('checkoutSummary');
  const total   = cart.reduce((sum, c) => sum + getNumericPrice(c.price), 0);

  let html = `<div class="checkout-summary-title">Download Summary</div>`;
  cart.forEach(c => {
    html += `<div class="checkout-summary-item"><span>${c.name}</span><span>${c.price}</span></div>`;
  });
  html += `<div class="checkout-summary-total"><span>Total</span><span>${total === 0 ? 'FREE' : `$${total}`}</span></div>`;
  summary.innerHTML = html;

  checkoutModal.classList.add('show');
});

checkoutCancel.addEventListener('click', () => {
  checkoutModal.classList.remove('show');
  openCart();
});

checkoutConfirm.addEventListener('click', () => {
  const firstName = checkoutFirstName.value.trim();
  const lastName = checkoutLastName.value.trim();
  const email = checkoutEmail.value.trim();

  if (!firstName || !lastName || !email || !email.includes('@')) {
    showToast('Please complete your name and email before downloading.');
    return;
  }

  cart.forEach(item => {
    if (typeof downloadBeat === 'function') {
      downloadBeat(item.name, { silent: true });
    }
  });

  checkoutModal.classList.remove('show');
  cart = [];
  saveCart();
  checkoutFirstName.value = '';
  checkoutLastName.value = '';
  checkoutEmail.value = '';
  updateCartUI();
  showToast('⬇ Download started! Your free beats are ready.');
});

loadCart();
updateCartUI();
