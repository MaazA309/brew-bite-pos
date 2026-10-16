const MENU = [
  { id: 1,  name: "Espresso",          category: "Coffee",   price: 250, icon: "☕" },
  { id: 2,  name: "Cappuccino",        category: "Coffee",   price: 350, icon: "☕" },
  { id: 3,  name: "Latte",             category: "Coffee",   price: 350, icon: "🥛" },
  { id: 4,  name: "Iced Coffee",       category: "Coffee",   price: 400, icon: "🥤" },
  { id: 5,  name: "Milk Tea",          category: "Tea",      price: 150, icon: "🫖" },
  { id: 6,  name: "Green Tea",         category: "Tea",      price: 180, icon: "🍵" },
  { id: 7,  name: "Masala Chai",       category: "Tea",      price: 200, icon: "🫖" },
  { id: 8,  name: "Chicken Burger",    category: "Food",     price: 450, icon: "🍔" },
  { id: 9,  name: "Club Sandwich",     category: "Food",     price: 400, icon: "🥪" },
  { id: 10, name: "French Fries",      category: "Food",     price: 250, icon: "🍟" },
  { id: 11, name: "Chicken Wrap",      category: "Food",     price: 350, icon: "🌯" },
  { id: 12, name: "Chocolate Brownie", category: "Desserts", price: 200, icon: "🍫" },
  { id: 13, name: "Chocolate Cake",    category: "Desserts", price: 300, icon: "🍰" },
  { id: 14, name: "Cookies",           category: "Desserts", price: 120, icon: "🍪" },
  { id: 15, name: "Croissant",         category: "Desserts", price: 220, icon: "🥐" },
  { id: 16, name: "Egg",               category: "Food",     price: 100, icon: "🥚"},
  { id: 17, name: "Mocha",           category: "Coffee",   price: 380, icon: "☕" },
  { id: 18, name: "Pizza Slice",     category: "Food",     price: 500, icon: "🍕" },
  { id: 19, name: "Chicken Nuggets", category: "Food",     price: 300, icon: "🍗" },
  { id: 20, name: "Cheesecake",      category: "Desserts", price: 350, icon: "🍰" }
];

const ORDERS_KEY  = "bb_orders";
const COUNTER_KEY = "bb_order_counter";
const TAX_KEY     = "bb_tax_percent";

let cart = [];
let currentCategory = "All";
let orders = loadOrders();
let taxPercent = loadTaxPercent();
let searchText = "";

function $(id) {
  return document.getElementById(id);
}

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    return false;
  }
}

function loadOrders() {
  try {
    const saved = JSON.parse(readStorage(ORDERS_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function saveOrders() {
  const ok = writeStorage(ORDERS_KEY, JSON.stringify(orders));
  if (!ok) {
    alert("Warning: the order could not be saved in this browser.");
  }
}

function loadTaxPercent() {
  const saved = parseFloat(readStorage(TAX_KEY));
  if (!isNaN(saved) && saved >= 0 && saved <= 100) {
    return saved;
  }
  return 5;
}

function createOrderNumber() {
  const lastNumber = parseInt(readStorage(COUNTER_KEY), 10) || 0;
  const next = Math.max(lastNumber, orders.length) + 1;
  writeStorage(COUNTER_KEY, String(next));
  return "BB-" + String(next).padStart(4, "0");
}

function formatMoney(amount) {
  return "Rs. " + amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function formatDateOnly(isoString) {
  return new Date(isoString).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

function formatTimeOnly(isoString) {
  return new Date(isoString).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit"
  });
}

function findProduct(id) {
  return MENU.find(function (product) { return product.id === id; });
}

function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getCustomerName(order) {
  return order.customerName || "Walk-in Customer";
}

function showView(viewName) {
  document.querySelectorAll(".view").forEach(function (section) {
    section.classList.toggle("active", section.id === viewName);
  });
  document.querySelectorAll(".nav-btn").forEach(function (btn) {
    btn.classList.toggle("active", btn.dataset.view === viewName);
  });

  if (viewName === "dashboard") renderDashboard();
  if (viewName === "history") renderHistory();
  window.scrollTo(0, 0);
}

function renderMenu() {
  const text = searchText.trim().toLowerCase();

  const items = MENU.filter(function (product) {
    const matchesCategory = currentCategory === "All" || product.category === currentCategory;
    const matchesSearch = text === "" ||
      product.name.toLowerCase().includes(text) ||
      product.category.toLowerCase().includes(text);
    return matchesCategory && matchesSearch;
  });

  if (items.length === 0) {
    $("product-grid").innerHTML = '<p class="no-results">No items found. Try a different search.</p>';
    return;
  }

  $("product-grid").innerHTML = items.map(function (product) {
    return '<button class="product-card" data-id="' + product.id + '">' +
             '<span class="icon">' + product.icon + '</span>' +
             '<span class="name">' + product.name + '</span>' +
             '<span class="price">Rs. ' + product.price + '</span>' +
           '</button>';
  }).join("");
}

function addToCart(id) {
  const existing = cart.find(function (item) { return item.id === id; });
  if (existing) {
    if (existing.qty < 99) existing.qty += 1;
  } else {
    cart.push({ id: id, qty: 1 });
  }
  setMessage("", "");
  renderCart();
}

function changeQuantity(id, change) {
  const item = cart.find(function (cartItem) { return cartItem.id === id; });
  if (!item) return;

  item.qty += change;
  if (item.qty > 99) item.qty = 99;
  if (item.qty <= 0) removeFromCart(id);
  else renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(function (item) { return item.id !== id; });
  renderCart();
}

function clearCart() {
  cart = [];
  $("cash-received").value = "";
  setMessage("", "");
  renderCart();
}

function calculateTotals() {
  let subtotal = 0;
  cart.forEach(function (item) {
    subtotal += findProduct(item.id).price * item.qty;
  });

  const taxPaisa = Math.round(subtotal * taxPercent);
  const totalPaisa = subtotal * 100 + taxPaisa;

  return {
    subtotal: subtotal,
    tax: taxPaisa / 100,
    total: totalPaisa / 100
  };
}

function updateChange() {
  const payment = document.querySelector('input[name="payment"]:checked').value;
  const isCash = payment === "Cash";
  $("cash-row").classList.toggle("hidden", !isCash);
  $("change-row").classList.toggle("hidden", !isCash);

  const text = $("cash-received").value.trim();
  const received = Number(text);
  const total = calculateTotals().total;

  let change = 0;
  if (cart.length > 0 && text !== "" && !isNaN(received) &&
      Math.round(received * 100) >= Math.round(total * 100)) {
    change = Math.round((received - total) * 100) / 100;
  }
  $("change-due").textContent = formatMoney(change);
}

function renderCart() {
  if (cart.length === 0) {
    $("cart-items").innerHTML = '<p class="cart-empty">Your cart is empty.<br>Tap a menu item to add it.</p>';
  } else {
    $("cart-items").innerHTML = cart.map(function (item) {
      const product = findProduct(item.id);
      return '<div class="cart-row">' +
               '<div class="cart-info"><strong>' + product.name + '</strong>' +
               '<span>Rs. ' + product.price + ' each</span></div>' +
               '<div class="qty-controls">' +
                 '<button data-action="dec" data-id="' + product.id + '" aria-label="Decrease quantity">−</button>' +
                 '<span>' + item.qty + '</span>' +
                 '<button data-action="inc" data-id="' + product.id + '" aria-label="Increase quantity">+</button>' +
               '</div>' +
               '<div class="cart-line">' + formatMoney(product.price * item.qty) + '</div>' +
               '<button class="remove-btn" data-action="remove" data-id="' + product.id + '" title="Remove item">✕</button>' +
             '</div>';
    }).join("");
  }

  const totals = calculateTotals();
  $("cart-subtotal").textContent = formatMoney(totals.subtotal);
  $("cart-tax").textContent = formatMoney(totals.tax);
  $("cart-total").textContent = formatMoney(totals.total);
  $("cart-tax-label").textContent = taxPercent;

  updateChange();
}

function setMessage(text, type) {
  const box = $("cart-message");
  box.textContent = text;
  box.className = "message " + type;
}

function completeOrder() {
  if (cart.length === 0) {
    setMessage("The cart is empty. Add at least one item first.", "error");
    return;
  }

  const totals = calculateTotals();
  const payment = document.querySelector('input[name="payment"]:checked').value;
  const customerName = $("customer-name").value.trim() || "Walk-in Customer";

  let cashReceived = null;
  let change = null;
  if (payment === "Cash") {
    const text = $("cash-received").value.trim();
    cashReceived = text === "" ? totals.total : Number(text);
    if (isNaN(cashReceived) || Math.round(cashReceived * 100) < Math.round(totals.total * 100)) {
      setMessage("Cash received is less than the total.", "error");
      return;
    }
    change = Math.round((cashReceived - totals.total) * 100) / 100;
  }

  let itemCount = 0;
  const items = cart.map(function (cartItem) {
    const product = findProduct(cartItem.id);
    itemCount += cartItem.qty;
    return {
      name: product.name,
      price: product.price,
      qty: cartItem.qty,
      lineTotal: product.price * cartItem.qty
    };
  });

  const order = {
    orderNo: createOrderNumber(),
    customerName: customerName,
    date: new Date().toISOString(),
    items: items,
    itemCount: itemCount,
    subtotal: totals.subtotal,
    taxPercent: taxPercent,
    tax: totals.tax,
    total: totals.total,
    payment: payment,
    cashReceived: cashReceived,
    change: change
  };

  orders.push(order);
  saveOrders();

  cart = [];
  $("cash-received").value = "";
  $("customer-name").value = "";
  setMessage("", "");
  renderCart();
  renderDashboard();
  showReceipt(order);
}

function buildReceiptHTML(order) {
  const rows = order.items.map(function (item) {
    return '<tr>' +
             '<td>' + item.name + '</td>' +
             '<td class="num">' + item.qty + '</td>' +
             '<td class="num">' + formatMoney(item.price) + '</td>' +
             '<td class="num">' + formatMoney(item.lineTotal) + '</td>' +
           '</tr>';
  }).join("");

  let cashRows = "";
  if (order.payment === "Cash" && typeof order.cashReceived === "number") {
    cashRows = '<p><span>Cash received</span><span>' + formatMoney(order.cashReceived) + '</span></p>' +
               '<p><span>Change</span><span>' + formatMoney(order.change) + '</span></p>';
  }

  return '<div class="receipt">' +
           '<div class="receipt-header">' +
             '<h2>Brew &amp; Bite Café</h2>' +
             '<p>Sales Receipt</p>' +
           '</div>' +
           '<div class="receipt-info">' +
             '<p><span>Receipt No:</span><strong>' + order.orderNo + '</strong></p>' +
             '<p><span>Customer:</span><span>' + escapeHTML(getCustomerName(order)) + '</span></p>' +
             '<p><span>Date:</span><span>' + formatDateOnly(order.date) + '</span></p>' +
             '<p><span>Time:</span><span>' + formatTimeOnly(order.date) + '</span></p>' +
             '<p><span>Payment:</span><span>' + order.payment + '</span></p>' +
           '</div>' +
           '<table>' +
             '<thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Total</th></tr></thead>' +
             '<tbody>' + rows + '</tbody>' +
           '</table>' +
           '<div class="receipt-totals">' +
             '<p><span>Subtotal</span><span>' + formatMoney(order.subtotal) + '</span></p>' +
             '<p><span>Tax (' + order.taxPercent + '%)</span><span>' + formatMoney(order.tax) + '</span></p>' +
             '<p class="grand"><span>TOTAL</span><span>' + formatMoney(order.total) + '</span></p>' +
             cashRows +
           '</div>' +
           '<div class="receipt-footer">' +
             '<p>Thank you for visiting Brew &amp; Bite Café!</p>' +
             '<p>We hope to see you again.</p>' +
           '</div>' +
         '</div>';
}

function showReceipt(order) {
  $("receipt-content").innerHTML = buildReceiptHTML(order);
  $("receipt-modal").classList.remove("hidden");
}

function closeReceipt() {
  $("receipt-modal").classList.add("hidden");
}

function renderDashboard() {
  let totalSales = 0;
  let totalItems = 0;
  let todaySales = 0;
  const soldCounts = {};
  const todayString = new Date().toDateString();

  orders.forEach(function (order) {
    totalSales += order.total;
    totalItems += order.itemCount;

    if (new Date(order.date).toDateString() === todayString) {
      todaySales += order.total;
    }

    order.items.forEach(function (item) {
      soldCounts[item.name] = (soldCounts[item.name] || 0) + item.qty;
    });
  });

  $("stat-sales").textContent = formatMoney(Math.round(totalSales * 100) / 100);
  $("stat-today").textContent = formatMoney(Math.round(todaySales * 100) / 100);
  $("stat-orders").textContent = orders.length;
  $("stat-items").textContent = totalItems;

  const medals = ["🥇", "🥈", "🥉"];
  const top = Object.keys(soldCounts)
    .map(function (name) { return { name: name, qty: soldCounts[name] }; })
    .sort(function (a, b) { return b.qty - a.qty; })
    .slice(0, 3);

  $("top-empty").classList.toggle("hidden", top.length > 0);
  $("top-list").innerHTML = top.map(function (item, index) {
    return '<li><span>' + medals[index] + ' ' + item.name + '</span><strong>' + item.qty + ' sold</strong></li>';
  }).join("");

  const recent = orders.slice(-5).reverse();
  $("recent-empty").classList.toggle("hidden", recent.length > 0);
  $("recent-table").classList.toggle("hidden", recent.length === 0);

  $("recent-body").innerHTML = recent.map(function (order) {
    return '<tr>' +
             '<td>' + order.orderNo + '</td>' +
             '<td>' + escapeHTML(getCustomerName(order)) + '</td>' +
             '<td>' + formatDate(order.date) + '</td>' +
             '<td>' + order.itemCount + '</td>' +
             '<td>' + order.payment + '</td>' +
             '<td class="num">' + formatMoney(order.total) + '</td>' +
           '</tr>';
  }).join("");
}

function renderHistory() {
  const text = $("history-search").value.trim().toLowerCase();

  const list = orders.slice().reverse().filter(function (order) {
    return order.orderNo.toLowerCase().includes(text) ||
           getCustomerName(order).toLowerCase().includes(text) ||
           order.payment.toLowerCase().includes(text);
  });

  $("history-empty").textContent = orders.length === 0 ? "No saved orders yet." : "No orders match your search.";
  $("history-empty").classList.toggle("hidden", list.length > 0);
  $("history-table").classList.toggle("hidden", list.length === 0);

  $("history-body").innerHTML = list.map(function (order) {
    return '<tr>' +
             '<td>' + order.orderNo + '</td>' +
             '<td>' + escapeHTML(getCustomerName(order)) + '</td>' +
             '<td>' + formatDate(order.date) + '</td>' +
             '<td>' + order.itemCount + '</td>' +
             '<td>' + order.payment + '</td>' +
             '<td class="num">' + formatMoney(order.total) + '</td>' +
             '<td><button class="btn btn-outline btn-small" data-order="' + order.orderNo + '">View / Print</button></td>' +
           '</tr>';
  }).join("");
}

function clearHistory() {
  if (orders.length === 0) {
    alert("There is no history to clear.");
    return;
  }
  if (confirm("Delete ALL saved orders? This cannot be undone.")) {
    orders = [];
    saveOrders();
    writeStorage(COUNTER_KEY, "0");
    renderHistory();
    renderDashboard();
  }
}

document.querySelectorAll("[data-view]").forEach(function (element) {
  element.addEventListener("click", function () {
    showView(element.dataset.view);
  });
});

document.querySelectorAll(".filter-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    currentCategory = btn.dataset.category;
    document.querySelectorAll(".filter-btn").forEach(function (b) {
      b.classList.toggle("active", b === btn);
    });
    renderMenu();
  });
});

$("search-input").addEventListener("input", function () {
  searchText = $("search-input").value;
  renderMenu();
});
$("search-btn").addEventListener("click", function () {
  searchText = $("search-input").value;
  renderMenu();
});
$("search-clear-btn").addEventListener("click", function () {
  $("search-input").value = "";
  searchText = "";
  renderMenu();
  $("search-input").focus();
});

$("product-grid").addEventListener("click", function (event) {
  const card = event.target.closest(".product-card");
  if (card) addToCart(Number(card.dataset.id));
});

$("cart-items").addEventListener("click", function (event) {
  const btn = event.target.closest("button[data-action]");
  if (!btn) return;
  const id = Number(btn.dataset.id);

  if (btn.dataset.action === "inc") changeQuantity(id, 1);
  if (btn.dataset.action === "dec") changeQuantity(id, -1);
  if (btn.dataset.action === "remove") removeFromCart(id);
});

$("tax-rate").addEventListener("input", function () {
  const text = $("tax-rate").value.trim();
  const value = Number(text);
  if (text !== "" && !isNaN(value) && value >= 0 && value <= 100) {
    taxPercent = value;
    writeStorage(TAX_KEY, String(taxPercent));
    setMessage("", "");
    renderCart();
  }
});

$("tax-rate").addEventListener("change", function () {
  const text = $("tax-rate").value.trim();
  const value = Number(text);
  if (text === "" || isNaN(value) || value < 0 || value > 100) {
    setMessage("Tax must be a number between 0 and 100.", "error");
    $("tax-rate").value = taxPercent;
  }
});

$("cash-received").addEventListener("input", updateChange);
document.querySelectorAll('input[name="payment"]').forEach(function (radio) {
  radio.addEventListener("change", updateChange);
});

$("clear-cart-btn").addEventListener("click", clearCart);
$("complete-order-btn").addEventListener("click", completeOrder);

$("print-btn").addEventListener("click", function () { window.print(); });
$("close-receipt-btn").addEventListener("click", closeReceipt);

$("receipt-modal").addEventListener("click", function (event) {
  if (event.target === $("receipt-modal")) closeReceipt();
});
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") closeReceipt();
});

$("history-body").addEventListener("click", function (event) {
  const btn = event.target.closest("button[data-order]");
  if (!btn) return;
  const order = orders.find(function (o) { return o.orderNo === btn.dataset.order; });
  if (order) showReceipt(order);
});

$("history-search").addEventListener("input", renderHistory);

$("clear-history-btn").addEventListener("click", clearHistory);

$("tax-rate").value = taxPercent;
renderMenu();
renderCart();
renderDashboard();
