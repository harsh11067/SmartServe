export const PROTOTYPE_STORAGE_KEY = "smartserve-prototype-state";

export const defaultPrototypeState = {
  menuItems: [
    {
      id: "m1",
      stall: "Grill Station",
      name: "Smoked Paneer Burger",
      category: "Burgers",
      price: 189,
      available: true,
      prepTime: 12
    },
    {
      id: "m2",
      stall: "Grill Station",
      name: "Peri Peri Fries",
      category: "Sides",
      price: 109,
      available: true,
      prepTime: 8
    },
    {
      id: "m3",
      stall: "Wok Republic",
      name: "Chilli Garlic Noodles",
      category: "Asian",
      price: 169,
      available: true,
      prepTime: 10
    },
    {
      id: "m4",
      stall: "Wok Republic",
      name: "Kung Pao Bowl",
      category: "Asian",
      price: 199,
      available: false,
      prepTime: 14
    },
    {
      id: "m5",
      stall: "Brew Lab",
      name: "Cold Coffee Float",
      category: "Drinks",
      price: 129,
      available: true,
      prepTime: 6
    },
    {
      id: "m6",
      stall: "Brew Lab",
      name: "Hazelnut Shake",
      category: "Drinks",
      price: 149,
      available: true,
      prepTime: 7
    }
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

export function loadPrototypeState() {
  const raw = localStorage.getItem(PROTOTYPE_STORAGE_KEY);

  if (!raw) {
    const initialState = clone(defaultPrototypeState);
    localStorage.setItem(PROTOTYPE_STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }

  try {
    return { ...clone(defaultPrototypeState), ...JSON.parse(raw) };
  } catch (_error) {
    const fallbackState = clone(defaultPrototypeState);
    localStorage.setItem(PROTOTYPE_STORAGE_KEY, JSON.stringify(fallbackState));
    return fallbackState;
  }
}

export function savePrototypeState(state) {
  localStorage.setItem(PROTOTYPE_STORAGE_KEY, JSON.stringify(state));
}

export function resetPrototypeState() {
  const nextState = clone(defaultPrototypeState);
  savePrototypeState(nextState);
  return nextState;
}

export function money(value) {
  return `Rs ${Number(value).toFixed(0)}`;
}

export function statusClass(status) {
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

  return map[status] || "status";
}
