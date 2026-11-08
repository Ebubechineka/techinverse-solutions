/* ============================================================================
 * Techinverse Solutions — local cart engine
 * ----------------------------------------------------------------------------
 * The original site is a Laravel + Livewire application. Its "Add to Cart"
 * buttons are `wire:click="addToCart(...)"`, which Livewire turns into a POST
 * to /livewire/update. This mirror is a static copy: there is no PHP server,
 * so that POST has nowhere to go and the cart never saved anything.
 *
 * This file replaces that server round-trip with a browser-side cart stored in
 * localStorage. It keeps the original markup, classes and button labels, and
 * only supplies the behaviour the server used to provide.
 *
 * Requires assets/tis-catalog.js (window.TIS_CATALOG) to be loaded first.
 *
 * Public API:  window.TISCart
 *   .add(id, qty)      .remove(id)      .setQty(id, qty)
 *   .get()             .count()         .subtotal()
 *   .clear()           .onChange(fn)
 * ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'tis_cart_v1';
  var MAX_QTY = 99;

  /* ---------------------------------------------------------------- storage */

  function read() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (l) {
        return l && typeof l.id === 'string' && l.qty > 0;
      });
    } catch (e) {
      return [];
    }
  }

  function write(lines) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch (e) {
      /* private mode / quota — cart stays in memory for this page view */
    }
    emit();
  }

  /* ------------------------------------------------------------------ events */

  var listeners = [];

  function emit() {
    var lines = read();
    var detail = { lines: lines, count: countOf(lines), subtotal: subtotalOf(lines) };
    listeners.forEach(function (fn) {
      try { fn(detail); } catch (e) { /* a bad listener must not break the cart */ }
    });
    // Mirror the original app's event name so any existing listener still fires.
    try {
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: [detail] }));
    } catch (e) { /* older browsers */ }
  }

  function countOf(lines) {
    return lines.reduce(function (n, l) { return n + l.qty; }, 0);
  }

  function subtotalOf(lines) {
    return lines.reduce(function (n, l) { return n + (l.price || 0) * l.qty; }, 0);
  }

  /* -------------------------------------------------------------- public API */

  function add(id, qty, meta) {
    qty = Math.max(1, Math.min(MAX_QTY, parseInt(qty, 10) || 1));
    var lines = read();
    var found = null;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].id === id) { found = lines[i]; break; }
    }
    if (found) {
      found.qty = Math.min(MAX_QTY, found.qty + qty);
    } else {
      var p = meta || lookup(id) || {};
      lines.push({
        id: id,
        name: p.name || 'Product',
        price: p.price || 0,
        image: p.image || '',
        slug: p.slug || '',
        category: p.category || '',
        qty: qty
      });
    }
    write(lines);
    return countOf(lines);
  }

  function remove(id) {
    write(read().filter(function (l) { return l.id !== id; }));
  }

  function setQty(id, qty) {
    qty = parseInt(qty, 10) || 0;
    var lines = read();
    if (qty <= 0) {
      write(lines.filter(function (l) { return l.id !== id; }));
      return;
    }
    lines.forEach(function (l) {
      if (l.id === id) l.qty = Math.min(MAX_QTY, qty);
    });
    write(lines);
  }

  function clear() { write([]); }

  function onChange(fn) {
    listeners.push(fn);
    try {
      var lines = read();
      fn({ lines: lines, count: countOf(lines), subtotal: subtotalOf(lines) });
    } catch (e) { /* ignore */ }
  }

  /* ------------------------------------------------------- product catalogue */

  var CATALOG = window.TIS_CATALOG || [];

  function lookup(id) {
    for (var i = 0; i < CATALOG.length; i++) {
      if (CATALOG[i].id === id || CATALOG[i].uuid === id || CATALOG[i].slug === id) {
        return CATALOG[i];
      }
    }
    return null;
  }

  /* ------------------------------------------------------------ formatting */

  function money(n) {
    return '\u20A6' + Number(n || 0).toLocaleString('en-NG', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  }

  /* --------------------------------------------------------- badge rendering */

  /**
   * The original header renders the count through a Livewire cart-count
   * component that always ships as `count: 0`. We insert a real badge element
   * next to the cart icon so the number is visible, using the site's own
   * green accent.
   */
  function installBadges() {
    var links = document.querySelectorAll('a[href$="cart.html"]');
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      if (link.querySelector('.cart-count-badge')) continue;
      var badge = document.createElement('span');
      badge.className = 'cart-count-badge';
      badge.setAttribute('aria-live', 'polite');
      badge.style.cssText = [
        'position:absolute', 'top:-6px', 'right:-8px',
        'min-width:18px', 'height:18px', 'padding:0 5px',
        'border-radius:9999px', 'background:#16a34a', 'color:#fff',
        'font-size:11px', 'font-weight:700', 'line-height:18px',
        'text-align:center', 'display:none', 'align-items:center',
        'justify-content:center', 'box-shadow:0 1px 2px rgba(0,0,0,.2)',
        'pointer-events:none', 'z-index:5'
      ].join(';');
      if (getComputedStyle(link).position === 'static') {
        link.style.position = 'relative';
      }
      link.appendChild(badge);
    }
    paintBadges();
  }

  function paintBadges() {
    var n = countOf(read());
    var badges = document.querySelectorAll('.cart-count-badge');
    for (var i = 0; i < badges.length; i++) {
      badges[i].textContent = n > 0 ? String(n) : '';
      badges[i].style.display = n > 0 ? 'flex' : 'none';
    }
  }

  /* ------------------------------------------------------------- toast */

  function toast(message) {
    var el = document.getElementById('tis-cart-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'tis-cart-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.style.cssText = [
        'position:fixed', 'left:50%', 'bottom:24px', 'transform:translateX(-50%) translateY(12px)',
        'background:#111827', 'color:#fff', 'padding:12px 18px', 'border-radius:8px',
        'font-size:14px', 'font-weight:500', 'box-shadow:0 8px 24px rgba(0,0,0,.25)',
        'opacity:0', 'transition:opacity .18s ease, transform .18s ease',
        'z-index:9999', 'max-width:calc(100vw - 32px)', 'text-align:center'
      ].join(';');
      document.body.appendChild(el);
    }
    el.textContent = message;
    requestAnimationFrame(function () {
      el.style.opacity = '1';
      el.style.transform = 'translateX(-50%) translateY(0)';
    });
    clearTimeout(el._t);
    el._t = setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(12px)';
    }, 2200);
  }

  /* ------------------------------------------- product page: Add to Cart */

  /**
   * Reads the product identity from the page's own JSON-LD block, so the
   * engine never has to hard-code a second copy of the catalogue.
   */
  function productFromPage() {
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      var node = null;
      try {
        var data = JSON.parse(scripts[i].textContent);
        node = Array.isArray(data) ? data[0] : data;
      } catch (e) { continue; }
      if (!node || node['@type'] !== 'Product') continue;

      var path = location.pathname.split('/').pop().replace(/\.html$/, '');
      var offer = node.offers || {};
      if (Array.isArray(offer)) offer = offer[0] || {};
      return {
        id: path,
        slug: path,
        name: (node.name || '').trim(),
        price: parseFloat(offer.price) || 0,
        image: (node.image || '').replace(/^\.\.\//, ''),
        category: '',
        inStock: String(offer.availability || '').indexOf('OutOfStock') === -1
      };
    }
    return null;
  }

  function wireProductPage() {
    var product = productFromPage();
    if (!product) return;

    // Quantity stepper (was Livewire increase/decreaseQuantity)
    var qtyEl = document.querySelector('[aria-label="Current quantity"]');
    var qty = 1;

    function setQtyDisplay(v) {
      qty = Math.max(1, Math.min(MAX_QTY, v));
      if (qtyEl) qtyEl.textContent = String(qty);
    }

    var dec = document.querySelector('[aria-label="Decrease quantity"]');
    var inc = document.querySelector('[aria-label="Increase quantity"]');
    if (dec) dec.addEventListener('click', function (e) { e.preventDefault(); setQtyDisplay(qty - 1); });
    if (inc) inc.addEventListener('click', function (e) { e.preventDefault(); setQtyDisplay(qty + 1); });

    // The Add to Cart button
    var buttons = document.querySelectorAll('[wire\\:click*="addToCart"]');
    for (var i = 0; i < buttons.length; i++) {
      (function (btn) {
        if (btn.dataset.tisWired) return;
        btn.dataset.tisWired = '1';
        btn.removeAttribute('wire:click.prevent');
        btn.removeAttribute('wire:click');
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          add(product.id, qty, product);
          toast(product.name + ' added to cart');
          setQtyDisplay(1);
        });
      })(buttons[i]);
    }
  }

  /* ------------------------------------- listing page: Add to Cart buttons */

  function wireListingPage() {
    var buttons = document.querySelectorAll('[wire\\:click*="addToCart"]');
    for (var i = 0; i < buttons.length; i++) {
      (function (btn) {
        if (btn.dataset.tisWired) return;
        var attr = btn.getAttribute('wire:click') || btn.getAttribute('wire:click.prevent') || '';
        var m = attr.match(/addToCart\('([^']+)'\)/);
        if (!m) return;
        var product = lookup(m[1]);
        if (!product) return;

        btn.dataset.tisWired = '1';
        btn.removeAttribute('wire:click.prevent');
        btn.removeAttribute('wire:click');
        btn.removeAttribute('wire:loading.attr');
        btn.removeAttribute('wire:target');

        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          add(product.id, 1, product);
          toast(product.name + ' added to cart');
        });
      })(buttons[i]);
    }
  }

  /* ------------------------------------------------------- cart page render */

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderCartPage() {
    var root = document.getElementById('tis-cart-root');
    if (!root) return;

    var lines = read();
    var emptyBlock = document.getElementById('tis-cart-empty');

    if (!lines.length) {
      root.innerHTML = '';
      if (emptyBlock) emptyBlock.style.display = '';
      return;
    }
    if (emptyBlock) emptyBlock.style.display = 'none';

    var rows = lines.map(function (l) {
      var href = l.slug ? 'products/' + l.slug + '.html' : '#';
      var img = l.image
        ? '<img src="' + escapeHtml(l.image) + '" alt="' + escapeHtml(l.name) + '" class="w-20 h-20 object-cover rounded-md border border-gray-200" loading="lazy">'
        : '<div class="w-20 h-20 rounded-md bg-gray-100 border border-gray-200"></div>';
      return '' +
        '<div class="flex gap-4 py-4 border-b border-gray-200 last:border-0" data-line="' + escapeHtml(l.id) + '">' +
          '<a href="' + href + '" class="shrink-0">' + img + '</a>' +
          '<div class="flex-1 min-w-0">' +
            '<a href="' + href + '" class="block font-medium text-gray-900 hover:text-green-600 line-clamp-2">' + escapeHtml(l.name) + '</a>' +
            '<p class="text-sm text-gray-500 mt-1">' + money(l.price) + ' each</p>' +
            '<div class="flex items-center gap-3 mt-3">' +
              '<div class="flex items-center border border-gray-300 rounded-md">' +
                '<button type="button" data-act="dec" aria-label="Decrease quantity of ' + escapeHtml(l.name) + '" class="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-l-md">\u2212</button>' +
                '<span class="px-3 py-1 text-sm font-medium text-gray-900 min-w-[2.5rem] text-center" aria-live="polite">' + l.qty + '</span>' +
                '<button type="button" data-act="inc" aria-label="Increase quantity of ' + escapeHtml(l.name) + '" class="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-r-md">+</button>' +
              '</div>' +
              '<button type="button" data-act="remove" class="text-sm text-red-600 hover:text-red-700 font-medium">Remove</button>' +
            '</div>' +
          '</div>' +
          '<div class="text-right shrink-0">' +
            '<p class="font-bold text-gray-900">' + money(l.price * l.qty) + '</p>' +
          '</div>' +
        '</div>';
    }).join('');

    var sub = subtotalOf(lines);
    var n = countOf(lines);

    root.innerHTML = '' +
      '<div class="grid lg:grid-cols-3 gap-6">' +
        '<div class="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">' +
          '<div class="flex items-center justify-between mb-2">' +
            '<h1 class="text-2xl font-medium text-gray-900">Your Cart</h1>' +
            '<span class="text-sm text-gray-500">' + n + ' item' + (n === 1 ? '' : 's') + '</span>' +
          '</div>' +
          rows +
          '<div class="flex justify-between items-center pt-4">' +
            '<a href="products.html" class="text-sm font-medium text-green-600 hover:text-green-700">\u2190 Continue shopping</a>' +
            '<button type="button" id="tis-cart-clear" class="text-sm text-gray-500 hover:text-red-600 font-medium">Clear cart</button>' +
          '</div>' +
        '</div>' +
        '<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit lg:sticky lg:top-24">' +
          '<h2 class="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>' +
          '<div class="flex justify-between text-sm text-gray-600 mb-2"><span>Subtotal</span><span>' + money(sub) + '</span></div>' +
          '<div class="flex justify-between text-sm text-gray-600 mb-4"><span>Shipping</span><span>Calculated at checkout</span></div>' +
          '<div class="border-t border-gray-200 pt-4 flex justify-between font-bold text-gray-900 text-lg"><span>Total</span><span>' + money(sub) + '</span></div>' +
          '<a href="login.html" class="mt-6 block w-full text-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium">Proceed to Checkout</a>' +
          '<p class="text-xs text-gray-500 mt-3 text-center">You will be asked to sign in to complete your order.</p>' +
        '</div>' +
      '</div>';
  }

  /**
   * One delegated listener on the mount point, installed once. Re-rendering
   * replaces root's children, so the listener is bound to the container and
   * survives every repaint without piling up duplicates.
   */
  function wireCartPageEvents() {
    var root = document.getElementById('tis-cart-root');
    if (!root || root.dataset.tisWired) return;
    root.dataset.tisWired = '1';

    root.addEventListener('click', function (e) {
      var clearBtn = e.target.closest('#tis-cart-clear');
      if (clearBtn) {
        if (window.confirm('Remove all items from your cart?')) {
          clear();
          toast('Cart cleared');
        }
        return;
      }

      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var line = btn.closest('[data-line]');
      if (!line) return;

      var id = line.getAttribute('data-line');
      var act = btn.getAttribute('data-act');
      var current = 0;
      read().forEach(function (l) { if (l.id === id) current = l.qty; });

      if (act === 'inc') setQty(id, current + 1);
      else if (act === 'dec') setQty(id, current - 1);
      else if (act === 'remove') { remove(id); toast('Item removed'); }
    });
  }

  /* ------------------------------------------------------------------- boot */

  function repaint() {
    paintBadges();
    renderCartPage();
  }

  function boot() {
    installBadges();
    wireProductPage();
    wireListingPage();
    wireCartPageEvents();
    renderCartPage();

    onChange(repaint);

    // Keep multiple tabs in sync.
    window.addEventListener('storage', function (e) {
      if (e.key === STORAGE_KEY) repaint();
    });
  }

  window.TISCart = {
    add: add, remove: remove, setQty: setQty, clear: clear,
    get: read, count: function () { return countOf(read()); },
    subtotal: function () { return subtotalOf(read()); },
    onChange: onChange, money: money, lookup: lookup
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
