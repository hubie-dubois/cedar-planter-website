// No network: exercise order calculations, submission branches and deferred map loading.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');
function setup({ observer = true } = {}) {
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) elements.set(id, { value: '', textContent: '', dataset: {},
      classList: { add() {} }, addEventListener() {}, setAttribute() {}, replaceChildren() {} });
    return elements.get(id);
  }
  const state = { quantity: '1', method: 'pickup', requests: [], redirects: [], appended: [], storage: new Map(), ok: true, valid: true };
  const form = element('order-form');
  form.action = 'https://example.invalid/orders';
  form.elements = {};
  form.querySelectorAll = () => [];
  form.querySelector = selector => ({ value: selector.includes('quantity') ? state.quantity : state.method });
  form.reportValidity = () => state.valid;
  element('unit-price').dataset.priceCents = '9500';
  const window = {
    localStorage: { getItem: k => state.storage.get(k) ?? null, setItem: (k,v) => state.storage.set(k,v), removeItem: k => state.storage.delete(k) },
    setTimeout, clearTimeout, alert: () => state.alerted = true,
    location: { assign: url => state.redirects.push(url), reload: () => state.reloaded = true }
  };
  const ctx = { window, document: { getElementById: element, createElement: () => ({}), head: { append: el => state.appended.push(el) } },
    console: { warn() {}, error() {} }, Intl, Date, AbortController, FormData: class {},
    fetch: async (...args) => { state.requests.push(args); return { ok: state.ok, status: state.ok ? 200 : 500 }; }
  };
  if (observer) {
    ctx.IntersectionObserver = class { constructor(fn) { state.intersect = fn; } observe() {} disconnect() { state.disconnected = true; } };
    window.IntersectionObserver = ctx.IntersectionObserver;
  }
  vm.createContext(ctx); vm.runInContext(source,ctx);
  return { state, element, ctx };
}
(async () => {
  const { state, element, ctx } = setup();
  assert.equal(state.appended.length, 0, 'Map must not download on initial load');
  const links = new Set();
  for (const method of ['pickup','delivery']) for (let quantity = 1; quantity <= 4; quantity++) {
    state.method = method; state.quantity = String(quantity); ctx.updateFulfillmentFields();
    assert.equal(element('estimated-total').textContent, `$${95*quantity+(method==='delivery'?10:0)}`);
    assert.equal(element('delivery-address').required, method === 'delivery');
    assert.equal(element('delivery-fields').hidden, method !== 'delivery');
    const link = element('stripe-link-field').value;
    assert.match(link, /^https:\/\/buy\.stripe\.com\//); links.add(link);
  }
  assert.equal(links.size,8);
  state.quantity='5plus'; ctx.updateTotal();
  assert.equal(element('stripe-link-field').value,'');
  assert.match(element('checkout-note').textContent,/confirm order details/);
  state.quantity='1'; state.method='pickup'; state.ok=false;
  await ctx.submitOrderAndRedirect({ preventDefault() {} });
  assert.equal(state.redirects.length,0);
  assert.match(element('form-status').textContent,/problem submitting/);
  assert.equal(element('submit-button').disabled,false);
  assert.ok(state.storage.size);
  state.ok=true;
  await ctx.submitOrderAndRedirect({ preventDefault() {} });
  assert.equal(state.redirects.length,1);
  assert.equal(state.redirects[0],element('stripe-link-field').value);
  state.quantity='5plus';
  await ctx.submitOrderAndRedirect({ preventDefault() {} });
  assert.equal(state.redirects.length,1,'Custom orders must not redirect to standard payment');
  assert.ok(state.alerted && state.reloaded);
  state.intersect([{isIntersecting:true}]);
  assert.ok(state.disconnected);
  assert.equal(state.appended[0].rel,'stylesheet');
  state.appended[0].onload();
  assert.match(state.appended[1].src,/leaflet/);
  state.appended[1].onerror();
  assert.match(element('delivery-map').textContent,/Map unavailable/);
  assert.equal(setup({observer:false}).state.appended.length,1);
  console.log('PASS all 8 price/payment selections, delivery requirements, custom orders, submission success/failure, deferred map and failure fallback. No real orders submitted.');
})().catch(error => { console.error(error); process.exitCode=1; });
