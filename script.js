// =====================================================
//  Brew & Bite Café – POS system (plain JavaScript)
// =====================================================

// ---------- 1. DATA ----------

// The menu. Each product has an id, name, category, price (Rs.) and an emoji icon.
const MENU = [
  { id: 1,  name: "Espresso",        category: "Coffee",   price: 250, icon: "☕" },
  { id: 2,  name: "Cappuccino",      category: "Coffee",   price: 350, icon: "☕" },
  { id: 3,  name: "Latte",           category: "Coffee",   price: 350, icon: "🥛" },
  { id: 4,  name: "Iced Coffee",     category: "Coffee",   price: 400, icon: "🥤" },
  { id: 5,  name: "Milk Tea",        category: "Tea",      price: 150, icon: "🫖" },
  { id: 6,  name: "Green Tea",       category: "Tea",      price: 180, icon: "🍵" },
  { id: 7,  name: "Masala Chai",     category: "Tea",      price: 200, icon: "🫖" },
  { id: 8,  name: "Chicken Burger",  category: "Food",     price: 450, icon: "🍔" },
  { id: 9,  name: "Club Sandwich",   category: "Food",     price: 400, icon: "🥪" },
  { id: 10, name: "French Fries",    category: "Food",     price: 250, icon: "🍟" },
  { id: 11, name: "Chicken Wrap",    category: "Food",     price: 350, icon: "🌯" },
  { id: 12, name: "Chocolate Brownie", category: "Desserts", price: 200, icon: "🍫" },
  { id: 13, name: "Chocolate Cake",  category: "Desserts", price: 300, icon: "🍰" },
  { id: 14, name: "Cookies",         category: "Desserts", price: 120, icon: "🍪" }
];

// Keys used to save data in the browser's localStorage
const ORDERS_KEY  = "bb_orders";
const COUNTER_KEY = "bb_order_counter";
const TAX_KEY     = "bb_tax_percent";

// ---------- 2. STATE (data that changes while the app runs) ----------

let cart = [];                 // items in the cart: { id, qty }
let currentCategory = "All";   // which filter is selected
let orders = loadOrders();     // all completed orders (loaded from localStorage)
let taxPercent = loadTaxPercent();

// Shortcut for document.getElementById
function $(id) {
  return document.getElementById(id);
}

// ---------- 3. LOCALSTORAGE HELPERS ----------

// Read a value from localStorage (returns null if it fails)
function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

// Write a value to localStorage (returns true if it worked)
function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    return false;
  }
}

// Load saved orders. If nothing is saved (or data is broken), return an empty list.
function loadOrders() {
  try {
    const saved = JSON.parse(readStorage(ORDERS_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

// Save the orders list
function saveOrders() {
  const ok = writeStorage(ORDERS_KEY, JSON.stringify(orders));
  if (!ok) {
    alert("Warning: the order could not be saved in this browser.");
  }
}

// Load the saved tax rate (default is 5%)
function loadTaxPercent() {
  const saved = parseFloat(readStorage(TAX_KEY));
  if (!isNaN(saved) && saved >= 0 && saved <= 100) {
    return saved;
  }
  return 5;
}

// Create the next order number like BB-0001, BB-0002 ...
function createOrderNumber() {
  const lastNumber = parseInt(readStorage(COUNTER_KEY), 10) || 0;
  const next = Math.max(lastNumber, orders.length) + 1;
  writeStorage(COUNTER_KEY, String(next));
  return "BB-" + String(next).padStart(4, "0");
}

// ---------- 4. FORMATTING HELPERS ----------

// Format a number as Pakistani Rupees, e.g. 1234.5 -> "Rs. 1,234.50"
function formatMoney(amount) {
  return "Rs. " + amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Format a saved date string for display
function formatDate(isoString) {
  return new Date(isoString).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

// Find a product in the menu by its id
function findProduct(id) {
  return MENU.find(function (product) { return product.id === id; });
}

// ---------- 5. NAVIGATION ----------

// Show one section (dashboard / order / history) and hide the others
function showView(viewName) {
  document.querySelectorAll(".view").forEach(function (section) {
    section.classList.toggle("active", section.id === viewName);
  });
  document.querySelectorAll(".nav-btn").forEach(function (btn) {
    btn.classList.toggle("active", btn.dataset.view === viewName);
  });

  // Refresh the data of the page we are opening
  if (viewName === "dashboard") renderDashboard();
  if (viewName === "history") renderHistory();
  window.scrollTo(0, 0);
}

// ---------- 6. MENU ----------

// Draw the product cards for the selected category
function renderMenu() {
  const items = MENU.filter(function (product) {
    return currentCategory === "All" || product.category === currentCategory;
  });

  $("product-grid").innerHTML = items.map(function (product) {
    return '<button class="product-card" data-id="' + product.id + '">' +
             '<span class="icon">' + product.icon + '</span>' +
             '<span class="name">' + product.name + '</span>' +
             '<span class="price">Rs. ' + product.price + '</span>' +
           '</button>';
  }).join("");
}

// ---------- 7. CART ----------

// Add a product to the cart (or increase its quantity if already there)
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

// Increase (+1) or decrease (-1) the quantity. Quantity 0 removes the item.
function changeQuantity(id, change) {
  const item = cart.find(function (cartItem) { return cartItem.id === id; });
  if (!item) return;

  item.qty += change;
  if (item.qty > 99) item.qty = 99;
  if (item.qty <= 0) removeFromCart(id);
  else renderCart();
}

// Remove an item completely
function removeFromCart(id) {
  cart = cart.filter(function (item) { return item.id !== id; });
  renderCart();
}

// Empty the cart
function clearCart() {
  cart = [];
  setMessage("", "");
  renderCart();
}

// Work out subtotal, tax and total.
// Tax is calculated in paisa (1 Rs. = 100 paisa) and rounded, so there are no floating-point errors.
function calculateTotals() {
  let subtotal = 0;
  cart.forEach(function (item) {
    subtotal += findProduct(item.id).price * item.qty;
  });

  const taxPaisa = Math.round(subtotal * taxPercent);   // subtotal * (percent / 100) * 100 paisa
  const totalPaisa = subtotal * 100 + taxPaisa;

  return {
    subtotal: subtotal,
    tax: taxPaisa / 100,
    total: totalPaisa / 100
  };
}

// Redraw the cart and its totals
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
}

// Show a message under the cart. type is "error", "success" or "".
function setMessage(text, type) {
  const box = $("cart-message");
  box.textContent = text;
  box.className = "message " + type;
}

// ---------- 8. CHECKOUT ----------

// Finish the order: validate, save, show the receipt
function completeOrder() {
  // Validation: an empty cart cannot be checked out
  if (cart.length === 0) {
    setMessage("The cart is empty. Add at least one item first.", "error");
    return;
  }

  const totals = calculateTotals();
  const payment = document.querySelector('input[name="payment"]:checked').value;

  // Copy item details into the order, so later menu changes don't affect old receipts
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
    date: new Date().toISOString(),
    items: items,
    itemCount: itemCount,
    subtotal: totals.subtotal,
    taxPercent: taxPercent,
    tax: totals.tax,
    total: totals.total,
    payment: payment
  };

  orders.push(order);
  saveOrders();

  // Reset the cart for the next customer, then show the receipt
  cart = [];
  setMessage("", "");
  renderCart();
  renderDashboard();
  showReceipt(order);
}

// ---------- 9. RECEIPT ----------

// Build the receipt HTML for an order
function buildReceiptHTML(order) {
  const rows = order.items.map(function (item) {
    return '<tr>' +
             '<td>' + item.name + '</td>' +
             '<td class="num">' + item.qty + '</td>' +
             '<td class="num">' + formatMoney(item.price) + '</td>' +
             '<td class="num">' + formatMoney(item.lineTotal) + '</td>' +
           '</tr>';
  }).join("");

  return '<div class="receipt">' +
           '<div class="receipt-header">' +
             '<h2>Brew &amp; Bite Café</h2>' +
             '<p>Sales Receipt</p>' +
           '</div>' +
           '<div class="receipt-info">' +
             '<p><span>Receipt No:</span><strong>' + order.orderNo + '</strong></p>' +
             '<p><span>Date:</span><span>' + formatDate(order.date) + '</span></p>' +
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
           '</div>' +
           '<div class="receipt-footer">' +
             '<p>Thank you for visiting Brew &amp; Bite Café!</p>' +
             '<p>We hope to see you again.</p>' +
           '</div>' +
         '</div>';
}

// Open the receipt window
function showReceipt(order) {
  $("receipt-content").innerHTML = buildReceiptHTML(order);
  $("receipt-modal").classList.remove("hidden");
}

// Close the receipt window
function closeReceipt() {
  $("receipt-modal").classList.add("hidden");
}

// ---------- 10. DASHBOARD ----------

function renderDashboard() {
  let totalSales = 0;
  let totalItems = 0;
  orders.forEach(function (order) {
    totalSales += order.total;
    totalItems += order.itemCount;
  });

  $("stat-sales").textContent = formatMoney(Math.round(totalSales * 100) / 100);
  $("stat-orders").textContent = orders.length;
  $("stat-items").textContent = totalItems;

  // Show the 5 most recent orders (newest first)
  const recent = orders.slice(-5).reverse();
  $("recent-empty").classList.toggle("hidden", recent.length > 0);
  $("recent-table").classList.toggle("hidden", recent.length === 0);

  $("recent-body").innerHTML = recent.map(function (order) {
    return '<tr>' +
             '<td>' + order.orderNo + '</td>' +
             '<td>' + formatDate(order.date) + '</td>' +
             '<td>' + order.itemCount + '</td>' +
             '<td>' + order.payment + '</td>' +
             '<td class="num">' + formatMoney(order.total) + '</td>' +
           '</tr>';
  }).join("");
}

// ---------- 11. SALES HISTORY ----------

function renderHistory() {
  const list = orders.slice().reverse();   // newest first
  $("history-empty").classList.toggle("hidden", list.length > 0);
  $("history-table").classList.toggle("hidden", list.length === 0);

  $("history-body").innerHTML = list.map(function (order) {
    return '<tr>' +
             '<td>' + order.orderNo + '</td>' +
             '<td>' + formatDate(order.date) + '</td>' +
             '<td>' + order.itemCount + '</td>' +
             '<td>' + order.payment + '</td>' +
             '<td class="num">' + formatMoney(order.total) + '</td>' +
             '<td><button class="btn btn-outline btn-small" data-order="' + order.orderNo + '">View / Print</button></td>' +
           '</tr>';
  }).join("");
}

// Delete all saved orders (asks for confirmation first)
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

// ---------- 12. EVENT LISTENERS (connect buttons to functions) ----------

// Any element with data-view switches the page (sidebar buttons + "New Order" button)
document.querySelectorAll("[data-view]").forEach(function (element) {
  element.addEventListener("click", function () {
    showView(element.dataset.view);
  });
});

// Category filters
document.querySelectorAll(".filter-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    currentCategory = btn.dataset.category;
    document.querySelectorAll(".filter-btn").forEach(function (b) {
      b.classList.toggle("active", b === btn);
    });
    renderMenu();
  });
});

// Clicking a product card adds it to the cart
$("product-grid").addEventListener("click", function (event) {
  const card = event.target.closest(".product-card");
  if (card) addToCart(Number(card.dataset.id));
});

// +, - and remove buttons inside the cart
$("cart-items").addEventListener("click", function (event) {
  const btn = event.target.closest("button[data-action]");
  if (!btn) return;
  const id = Number(btn.dataset.id);

  if (btn.dataset.action === "inc") changeQuantity(id, 1);
  if (btn.dataset.action === "dec") changeQuantity(id, -1);
  if (btn.dataset.action === "remove") removeFromCart(id);
});

// Tax rate input: update live when valid, fix it when the user leaves the field if invalid
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
    $("tax-rate").value = taxPercent;   // put the last valid value back
  }
});

$("clear-cart-btn").addEventListener("click", clearCart);
$("complete-order-btn").addEventListener("click", completeOrder);

// Receipt window buttons
$("print-btn").addEventListener("click", function () { window.print(); });
$("close-receipt-btn").addEventListener("click", closeReceipt);

// Click on the dark background or press Escape to close the receipt
$("receipt-modal").addEventListener("click", function (event) {
  if (event.target === $("receipt-modal")) closeReceipt();
});
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") closeReceipt();
});

// Sales history: "View / Print" opens the saved receipt again
$("history-body").addEventListener("click", function (event) {
  const btn = event.target.closest("button[data-order]");
  if (!btn) return;
  const order = orders.find(function (o) { return o.orderNo === btn.dataset.order; });
  if (order) showReceipt(order);
});

$("clear-history-btn").addEventListener("click", clearHistory);

// ---------- 13. START THE APP ----------
$("tax-rate").value = taxPercent;
renderMenu();
renderCart();
renderDashboard();