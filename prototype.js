(function () {
  const STORAGE_KEY = "smartserve-prototype-state";
  const SESSION_KEY = "smartserve-prototype-session";

  const defaults = {
    menuItems: [
      { id: "m1", stall: "Grill Station", name: "Smoked Paneer Burger", category: "Burgers", price: 189, available: true, prepTime: 12 },
      { id: "m2", stall: "Grill Station", name: "Peri Peri Fries", category: "Sides", price: 109, available: true, prepTime: 8 },
      { id: "m3", stall: "Wok Republic", name: "Chilli Garlic Noodles", category: "Asian", price: 169, available: true, prepTime: 10 },
      { id: "m4", stall: "Wok Republic", name: "Kung Pao Bowl", category: "Asian", price: 199, available: false, prepTime: 14 },
      { id: "m5", stall: "Brew Lab", name: "Cold Coffee Float", category: "Drinks", price: 129, available: true, prepTime: 6 },
      { id: "m6", stall: "Brew Lab", name: "Hazelnut Shake", category: "Drinks", price: 149, available: true, prepTime: 7 }
    ],
    tables: [
      { id: "T1", seats: 2, status: "free" },
      { id: "T2", seats: 4, status: "occupied" },
      { id: "T3", seats: 4, status: "free" },
      { id: "T4", seats: 6, status: "occupied" },
      { id: "T5", seats: 2, status: "free" },
      { id: "T6", seats: 8, status: "maintenance" },
      { id: "T7", seats: 4, status: "free" },
      { id: "T8", seats: 6, status: "occupied" }
    ],
    orders: [
      {
        id: "ORD-204",
        customer: "Aarav",
        table: "T2",
        status: "preparing",
        stall: "Grill Station",
        items: [
          { name: "Smoked Paneer Burger", qty: 2, price: 189 },
          { name: "Peri Peri Fries", qty: 1, price: 109 }
        ],
        createdAt: "12:05",
        eta: "8 min",
        total: 487
      },
      {
        id: "ORD-205",
        customer: "Mira",
        table: "Pickup",
        status: "pending",
        stall: "Wok Republic",
        items: [{ name: "Chilli Garlic Noodles", qty: 1, price: 169 }],
        createdAt: "12:11",
        eta: "12 min",
        total: 169
      }
    ],
    loyaltyPoints: 160,
    currentCustomer: "Aarav",
    cart: []
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      return clone(defaults);
    }

    try {
      return { ...clone(defaults), ...JSON.parse(raw) };
    } catch (error) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      return clone(defaults);
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadSession() {
    return localStorage.getItem(SESSION_KEY) || "customer";
  }

  function saveSession(role) {
    localStorage.setItem(SESSION_KEY, role);
  }

  function money(value) {
    return "Rs " + value.toFixed(0);
  }

  function badge(status) {
    const map = {
      pending: "status status-pending",
      preparing: "status status-preparing",
      ready: "status status-ready",
      free: "status status-ready",
      occupied: "status status-pending",
      maintenance: "status status-maintenance",
      available: "status status-available",
      unavailable: "status status-unavailable"
    };

    return `<span class="${map[status] || "status"}">${status}</span>`;
  }

  function baseShell({ title, subtitle, role, content, actions = "" }) {
    return `
      <div class="shell">
        <header class="topbar">
          <div class="brand">
            <strong>SmartServe</strong>
            <span>${subtitle}</span>
          </div>
          <nav class="role-links">
            <a class="role-link ${role === "landing" ? "active" : ""}" href="landing.html">Landing</a>
            <a class="role-link ${role === "customer" ? "active" : ""}" href="customer.html">Customer</a>
            <a class="role-link ${role === "kitchen" ? "active" : ""}" href="kitchen.html">Kitchen</a>
            <a class="role-link ${role === "admin" ? "active" : ""}" href="admin.html">Admin</a>
          </nav>
          <div class="actions">${actions}</div>
        </header>
        <main>
          ${title ? `<section class="panel" style="margin-bottom:24px;"><p class="eyebrow">Project Flow</p><h1 class="section-title">${title}</h1></section>` : ""}
          ${content}
        </main>
      </div>
    `;
  }

  function renderLanding(state) {
    return baseShell({
      title: "Landing → Login → Role Dashboard",
      subtitle: "Food court management system aligned to the project plan",
      role: "landing",
      actions: `
        <button class="secondary-btn" data-action="reset-demo">Reset demo</button>
        <button class="primary-btn" data-role-nav="customer">Open prototype</button>
      `,
      content: `
        <section class="hero">
          <article class="hero-card">
            <p class="eyebrow">DBMS Mini Project</p>
            <h2 class="hero-title">One system for customers, kitchens, and admins.</h2>
            <p class="hero-copy">
              This prototype follows the README and execution plan: shared role flow, menu ordering, kitchen-side status updates,
              and admin-level operational visibility. Use the role launch buttons to enter the same demo state from different perspectives.
            </p>
            <div class="cta-row" style="margin-top:18px;">
              <button class="primary-btn" data-role-nav="customer">Continue as customer</button>
              <button class="secondary-btn" data-role-nav="kitchen">Continue as kitchen</button>
              <button class="secondary-btn" data-role-nav="admin">Continue as admin</button>
            </div>
            <div class="hero-grid">
              <div class="metric">
                <div class="meta">Active orders</div>
                <div class="metric-value">${state.orders.length}</div>
              </div>
              <div class="metric">
                <div class="meta">Open tables</div>
                <div class="metric-value">${state.tables.filter((table) => table.status === "free").length}</div>
              </div>
              <div class="metric">
                <div class="meta">Kitchen-visible items</div>
                <div class="metric-value">${state.menuItems.length}</div>
              </div>
              <div class="metric">
                <div class="meta">Customer loyalty points</div>
                <div class="metric-value">${state.loyaltyPoints}</div>
              </div>
            </div>
          </article>
          <aside class="panel stack">
            <div class="notice">
              The static pages are now connected by shared local storage. Orders placed in the customer view appear in kitchen and admin.
            </div>
            <div>
              <p class="eyebrow">Prepared Structure</p>
              <ul>
                <li>Root workspaces kept for client/ and server/.</li>
                <li>Frontend folders added for context, components, pages, and API.</li>
                <li>Backend folders scaffolded for models, routes, middleware, and config.</li>
              </ul>
            </div>
            <div>
              <p class="eyebrow">Role Rules</p>
              <ul>
                <li>Customer can browse menu, choose a table, and place an order.</li>
                <li>Kitchen sees incoming orders and changes status from pending to ready.</li>
                <li>Admin gets all-order visibility, table control, and stall availability.</li>
              </ul>
            </div>
          </aside>
        </section>
        <section class="role-grid">
          <article class="role-card">
            <p class="eyebrow">Customer</p>
            <h3>Menu and tracking</h3>
            <p>Browse active items, add them to cart, select a table, and see live updates once the kitchen changes status.</p>
            <button class="primary-btn" data-role-nav="customer">Open customer flow</button>
          </article>
          <article class="role-card">
            <p class="eyebrow">Kitchen</p>
            <h3>Prep queue and availability</h3>
            <p>Operate a stall-focused dashboard with order progression and one-click item availability toggles.</p>
            <button class="primary-btn" data-role-nav="kitchen">Open kitchen flow</button>
          </article>
          <article class="role-card">
            <p class="eyebrow">Admin</p>
            <h3>Operations control</h3>
            <p>Review system-wide demand, order backlog, stall health, and seating utilization from one screen.</p>
            <button class="primary-btn" data-role-nav="admin">Open admin flow</button>
          </article>
        </section>
      `
    });
  }

  function renderCustomer(state) {
    const cartTotal = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const currentOrder = state.orders
      .filter((order) => order.customer === state.currentCustomer)
      .sort((left, right) => right.id.localeCompare(left.id))[0];

    return baseShell({
      title: "Customer Dashboard",
      subtitle: "Browse menu, place an order, and track it",
      role: "customer",
      actions: `
        <button class="secondary-btn" data-role-nav="landing">Back to landing</button>
        <button class="primary-btn" data-role-nav="kitchen">View kitchen impact</button>
      `,
      content: `
        <section class="metrics-grid" style="margin-bottom:18px;">
          <div class="metric"><div class="meta">Loyalty points</div><div class="metric-value">${state.loyaltyPoints}</div></div>
          <div class="metric"><div class="meta">Cart value</div><div class="metric-value">${money(cartTotal)}</div></div>
          <div class="metric"><div class="meta">Active order</div><div class="metric-value">${currentOrder ? currentOrder.id : "None"}</div></div>
        </section>
        <section class="order-grid">
          <div class="stack">
            <article class="panel">
              <div class="toolbar">
                <div>
                  <p class="eyebrow">Menu</p>
                  <h2 class="section-title">Available food stalls</h2>
                </div>
                <div class="nav-links">
                  <span class="chip active">All</span>
                  <span class="chip">Burgers</span>
                  <span class="chip">Asian</span>
                  <span class="chip">Drinks</span>
                </div>
              </div>
              <div class="menu-grid" style="margin-top:18px;">
                ${state.menuItems
                  .map((item) => {
                    const status = item.available ? "available" : "unavailable";
                    return `
                      <article class="menu-card">
                        <div class="row">
                          <div>
                            <h3>${item.name}</h3>
                            <p>${item.stall} • ${item.category}</p>
                          </div>
                          ${badge(status)}
                        </div>
                        <p>Average prep ${item.prepTime} min</p>
                        <div class="card-footer">
                          <span class="price-pill">${money(item.price)}</span>
                          <button class="${item.available ? "primary-btn" : "secondary-btn"}" ${item.available ? "" : "disabled"} data-action="add-to-cart" data-item-id="${item.id}">
                            ${item.available ? "Add to cart" : "Unavailable"}
                          </button>
                        </div>
                      </article>
                    `;
                  })
                  .join("")}
              </div>
            </article>
            <article class="panel">
              <p class="eyebrow">Order history</p>
              <h2 class="section-title">Recent customer orders</h2>
              <div class="list" style="margin-top:16px;">
                ${state.orders
                  .filter((order) => order.customer === state.currentCustomer)
                  .slice()
                  .reverse()
                  .map((order) => `
                    <div class="list-item">
                      <div class="row">
                        <strong>${order.id}</strong>
                        ${badge(order.status)}
                      </div>
                      <p>${order.items.map((item) => `${item.qty}x ${item.name}`).join(", ")}</p>
                      <p>Table: ${order.table} • Stall: ${order.stall} • ETA: ${order.eta}</p>
                    </div>
                  `)
                  .join("") || '<div class="list-item">No orders yet. Place one from the cart.</div>'}
              </div>
            </article>
          </div>
          <aside class="stack">
            <article class="panel">
              <p class="eyebrow">Cart and checkout</p>
              <h2 class="section-title">Place an order</h2>
              <div class="list" style="margin:16px 0;">
                ${
                  state.cart.length
                    ? state.cart
                        .map(
                          (item) => `
                            <div class="list-item">
                              <div class="row">
                                <strong>${item.name}</strong>
                                <span class="qty-pill">${item.qty}x</span>
                              </div>
                              <p>${item.stall}</p>
                              <div class="card-footer">
                                <span>${money(item.price * item.qty)}</span>
                                <button class="ghost-btn" data-action="remove-from-cart" data-item-id="${item.id}">Remove</button>
                              </div>
                            </div>
                          `
                        )
                        .join("")
                    : '<div class="list-item">Your cart is empty.</div>'
                }
              </div>
              <div class="field">
                <label for="tableSelect">Select table</label>
                <select id="tableSelect">
                  <option value="">Choose a table</option>
                  ${state.tables
                    .filter((table) => table.status === "free")
                    .map((table) => `<option value="${table.id}">${table.id} • ${table.seats} seats</option>`)
                    .join("")}
                  <option value="Pickup">Pickup</option>
                </select>
              </div>
              <div class="footer-row" style="margin-top:16px;">
                <span class="price-pill">Total ${money(cartTotal)}</span>
                <button class="primary-btn" data-action="place-order">Confirm order</button>
              </div>
              <p class="footer-note">Orders are written to local demo state so the kitchen and admin pages update immediately.</p>
            </article>
            <article class="panel">
              <p class="eyebrow">Live tracking</p>
              <h2 class="section-title">${currentOrder ? currentOrder.id : "No active order"}</h2>
              ${
                currentOrder
                  ? `
                    <div class="timeline">
                      <div class="list-item" style="margin-top:16px;">
                        <div class="row">
                          <strong>Status</strong>
                          ${badge(currentOrder.status)}
                        </div>
                        <p>${currentOrder.status === "ready" ? "Collect from the stall or wait for service." : "Kitchen updates this in real time."}</p>
                        <p>Stall: ${currentOrder.stall} • Table: ${currentOrder.table}</p>
                      </div>
                    </div>
                  `
                  : `<p>No active order to track yet.</p>`
              }
            </article>
          </aside>
        </section>
      `
    });
  }

  function renderKitchen(state) {
    const kitchenOrders = state.orders.filter((order) => order.stall === "Grill Station");
    const availableCount = state.menuItems.filter((item) => item.stall === "Grill Station" && item.available).length;

    return baseShell({
      title: "Kitchen Dashboard",
      subtitle: "Incoming orders for the assigned stall",
      role: "kitchen",
      actions: `
        <button class="secondary-btn" data-role-nav="customer">Open customer view</button>
        <button class="primary-btn" data-role-nav="admin">Open admin view</button>
      `,
      content: `
        <section class="summary-grid" style="margin-bottom:18px;">
          <div class="summary-card"><div class="meta">Orders in queue</div><div class="metric-value">${kitchenOrders.length}</div></div>
          <div class="summary-card"><div class="meta">Preparing now</div><div class="metric-value">${kitchenOrders.filter((order) => order.status === "preparing").length}</div></div>
          <div class="summary-card"><div class="meta">Items available</div><div class="metric-value">${availableCount}</div></div>
        </section>
        <section class="split">
          <article class="panel">
            <p class="eyebrow">Prep queue</p>
            <h2 class="section-title">Orders for Grill Station</h2>
            <div class="stack" style="margin-top:16px;">
              ${kitchenOrders
                .map((order) => `
                  <article class="order-card">
                    <div class="row">
                      <div>
                        <h3>${order.id}</h3>
                        <p>${order.customer} • ${order.table} • ${order.createdAt}</p>
                      </div>
                      ${badge(order.status)}
                    </div>
                    <p>${order.items.map((item) => `${item.qty}x ${item.name}`).join(", ")}</p>
                    <div class="footer-row">
                      <span class="price-pill">ETA ${order.eta}</span>
                      <button class="primary-btn" data-action="advance-order" data-order-id="${order.id}">
                        ${order.status === "pending" ? "Start preparing" : order.status === "preparing" ? "Mark ready" : "Already ready"}
                      </button>
                    </div>
                  </article>
                `)
                .join("") || '<div class="list-item">No orders are assigned to this stall.</div>'}
            </div>
          </article>
          <aside class="stack">
            <article class="panel">
              <p class="eyebrow">Availability control</p>
              <h2 class="section-title">Menu item toggles</h2>
              <div class="list" style="margin-top:16px;">
                ${state.menuItems
                  .filter((item) => item.stall === "Grill Station")
                  .map((item) => `
                    <div class="list-item">
                      <div class="row">
                        <div>
                          <strong>${item.name}</strong>
                          <p>${money(item.price)} • ${item.prepTime} min</p>
                        </div>
                        ${badge(item.available ? "available" : "unavailable")}
                      </div>
                      <button class="secondary-btn" data-action="toggle-item" data-item-id="${item.id}">
                        ${item.available ? "Set unavailable" : "Set available"}
                      </button>
                    </div>
                  `)
                  .join("")}
              </div>
            </article>
            <article class="panel">
              <p class="eyebrow">How it connects</p>
              <ul>
                <li>Customer orders placed for Grill Station show up in this queue.</li>
                <li>Marking an order ready updates the customer tracking card and the admin dashboard.</li>
                <li>Disabling an item removes ordering access in the customer page.</li>
              </ul>
            </article>
          </aside>
        </section>
      `
    });
  }

  function renderAdmin(state) {
    const freeTables = state.tables.filter((table) => table.status === "free").length;

    return baseShell({
      title: "Admin Dashboard",
      subtitle: "System-wide operations and control",
      role: "admin",
      actions: `
        <button class="secondary-btn" data-role-nav="landing">Back to landing</button>
        <button class="primary-btn" data-action="reset-demo">Reset demo</button>
      `,
      content: `
        <section class="summary-grid" style="margin-bottom:18px;">
          <div class="summary-card"><div class="meta">Orders today</div><div class="metric-value">${state.orders.length}</div></div>
          <div class="summary-card"><div class="meta">Tables free</div><div class="metric-value">${freeTables}</div></div>
          <div class="summary-card"><div class="meta">Active stalls</div><div class="metric-value">${new Set(state.menuItems.map((item) => item.stall)).size}</div></div>
        </section>
        <section class="split">
          <div class="stack">
            <article class="table">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Stall</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.orders
                    .slice()
                    .reverse()
                    .map((order) => `
                      <tr>
                        <td>${order.id}<div class="meta">${order.createdAt} • ${order.table}</div></td>
                        <td>${order.customer}</td>
                        <td>${order.stall}</td>
                        <td>${badge(order.status)}</td>
                        <td>${money(order.total)}</td>
                      </tr>
                    `)
                    .join("")}
                </tbody>
              </table>
            </article>
            <article class="panel">
              <p class="eyebrow">Stall health</p>
              <h2 class="section-title">Menu availability snapshot</h2>
              <div class="list" style="margin-top:16px;">
                ${Array.from(new Set(state.menuItems.map((item) => item.stall)))
                  .map((stall) => {
                    const items = state.menuItems.filter((item) => item.stall === stall);
                    const down = items.filter((item) => !item.available).length;
                    return `
                      <div class="list-item">
                        <div class="row">
                          <strong>${stall}</strong>
                          ${badge(down ? "unavailable" : "available")}
                        </div>
                        <p>${items.length - down}/${items.length} items available</p>
                      </div>
                    `;
                  })
                  .join("")}
              </div>
            </article>
          </div>
          <aside class="stack">
            <article class="panel">
              <p class="eyebrow">Table management</p>
              <h2 class="section-title">Seating board</h2>
              <div class="tables-grid" style="margin-top:16px;">
                ${state.tables
                  .map((table) => `
                    <div class="list-item">
                      <div class="row">
                        <strong>${table.id}</strong>
                        ${badge(table.status)}
                      </div>
                      <p>${table.seats} seats</p>
                      <select data-action="update-table" data-table-id="${table.id}">
                        <option value="free" ${table.status === "free" ? "selected" : ""}>free</option>
                        <option value="occupied" ${table.status === "occupied" ? "selected" : ""}>occupied</option>
                        <option value="maintenance" ${table.status === "maintenance" ? "selected" : ""}>maintenance</option>
                      </select>
                    </div>
                  `)
                  .join("")}
              </div>
            </article>
            <article class="panel">
              <p class="eyebrow">Architecture fit</p>
              <ul>
                <li>This page represents the plan's admin dashboard, stall management, and table management views.</li>
                <li>The same order objects power customer tracking and kitchen prep flow.</li>
                <li>The scaffolded client/server folders now match the README direction for the full-stack build.</li>
              </ul>
            </article>
          </aside>
        </section>
      `
    });
  }

  function navigateRole(role) {
    saveSession(role);
    const file = role === "landing" ? "landing.html" : role + ".html";
    window.location.href = file;
  }

  function addToCart(state, itemId) {
    const item = state.menuItems.find((entry) => entry.id === itemId && entry.available);
    if (!item) {
      return;
    }

    const existing = state.cart.find((entry) => entry.id === itemId);
    if (existing) {
      existing.qty += 1;
    } else {
      state.cart.push({ id: item.id, name: item.name, price: item.price, stall: item.stall, qty: 1 });
    }

    saveState(state);
  }

  function removeFromCart(state, itemId) {
    state.cart = state.cart.filter((entry) => entry.id !== itemId);
    saveState(state);
  }

  function placeOrder(state) {
    const tableSelect = document.getElementById("tableSelect");
    const table = tableSelect ? tableSelect.value : "";

    if (!state.cart.length || !table) {
      window.alert("Add items and choose a table first.");
      return;
    }

    const primaryStall = state.cart[0].stall;
    const total = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const nextNumber = 206 + state.orders.length;

    state.orders.push({
      id: `ORD-${nextNumber}`,
      customer: state.currentCustomer,
      table,
      status: "pending",
      stall: primaryStall,
      items: state.cart.map((item) => ({ name: item.name, qty: item.qty, price: item.price })),
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      eta: "15 min",
      total
    });

    state.loyaltyPoints += Math.round(total / 20);
    state.cart = [];

    const selectedTable = state.tables.find((entry) => entry.id === table);
    if (selectedTable) {
      selectedTable.status = "occupied";
    }

    saveState(state);
    renderCurrentPage();
  }

  function advanceOrder(state, orderId) {
    const order = state.orders.find((entry) => entry.id === orderId);
    if (!order || order.status === "ready") {
      return;
    }

    order.status = order.status === "pending" ? "preparing" : "ready";
    order.eta = order.status === "ready" ? "Ready now" : "6 min";
    saveState(state);
  }

  function toggleItem(state, itemId) {
    const item = state.menuItems.find((entry) => entry.id === itemId);
    if (!item) {
      return;
    }

    item.available = !item.available;
    saveState(state);
  }

  function updateTable(state, tableId, status) {
    const table = state.tables.find((entry) => entry.id === tableId);
    if (!table) {
      return;
    }

    table.status = status;
    saveState(state);
  }

  function renderCurrentPage() {
    const app = document.getElementById("app");
    const page = document.body.dataset.page;
    const state = loadState();
    const role = loadSession();

    if (page !== "landing" && role !== page) {
      saveSession(page);
    }

    const html =
      page === "landing"
        ? renderLanding(state)
        : page === "customer"
          ? renderCustomer(state)
          : page === "kitchen"
            ? renderKitchen(state)
            : renderAdmin(state);

    app.innerHTML = html;
  }

  document.addEventListener("click", (event) => {
    const roleTarget = event.target.closest("[data-role-nav]");
    if (roleTarget) {
      navigateRole(roleTarget.dataset.roleNav);
      return;
    }

    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) {
      return;
    }

    const action = actionTarget.dataset.action;
    const state = loadState();

    if (action === "reset-demo") {
      saveState(clone(defaults));
      renderCurrentPage();
      return;
    }

    if (action === "add-to-cart") {
      addToCart(state, actionTarget.dataset.itemId);
    }

    if (action === "remove-from-cart") {
      removeFromCart(state, actionTarget.dataset.itemId);
    }

    if (action === "place-order") {
      placeOrder(state);
      return;
    }

    if (action === "advance-order") {
      advanceOrder(state, actionTarget.dataset.orderId);
    }

    if (action === "toggle-item") {
      toggleItem(state, actionTarget.dataset.itemId);
    }

    renderCurrentPage();
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (target.matches("[data-action='update-table']")) {
      const state = loadState();
      updateTable(state, target.dataset.tableId, target.value);
      renderCurrentPage();
    }
  });

  renderCurrentPage();
})();
