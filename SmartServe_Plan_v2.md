# SmartServe — Full-Stack Execution Plan v2
**DBMS Mini Project | Food Court Management System**
*Tech Stack: React + Vite · Node.js + Express · MongoDB + Mongoose · JWT · Figma · Spline*

---

## What Changed from v1

- Auth is now **core**, not optional — email + password + role on login
- **3 roles:** `admin`, `kitchen`, `customer` — stored in DB, enforced on backend
- **Soft separation** — one shared UI, navbar and page access conditionally rendered by role
- `User` model added — replaces the old bare `Customer` model for auth; Customer data hangs off it
- Frontend page list restructured around the role flow: **Landing → Login → Role Dashboard**
- New `AuthContext` pattern added for React — single source of truth for logged-in user + role
- `protect` + `authorise` middleware added to Express — every sensitive route is gated

---

## Tech Stack (Final)

| Layer | Tool | Why |
|---|---|---|
| Frontend UI | React + Vite | Fast dev server, component-based |
| 3D / Ambient | Spline | One hero scene on Landing, embed via `@splinetool/react-spline` |
| Design source | Figma | Prototype all screens before coding |
| Backend | Node.js + Express | You know JS, clean REST API |
| Database | MongoDB + Mongoose | Comfortable, `ref`+`populate()` = JOIN equivalent |
| Auth | JWT + bcryptjs | Stateless tokens, role stored in payload |
| API testing | Thunder Client (VS Code) | Test protected routes with Bearer tokens |

---

## Role Permission Matrix

| Feature | customer | kitchen | admin |
|---|:---:|:---:|:---:|
| View Landing page | ✓ | ✓ | ✓ |
| Browse menu & stalls | ✓ | ✓ | ✓ |
| Select table & place order | ✓ | — | ✓ |
| Track own order status | ✓ | — | ✓ |
| View loyalty points + order history | ✓ | — | ✓ |
| See own stall's incoming orders | — | ✓ | ✓ |
| Update order status (preparing→ready) | — | ✓ | ✓ |
| Toggle menu item availability | — | ✓ | ✓ |
| Full stall + menu CRUD | — | — | ✓ |
| Manage all tables | — | — | ✓ |
| View all orders across stalls | — | — | ✓ |

> **Evaluator talking point:** "Role is a field in the User collection. The backend middleware reads `req.user.role` from the decoded JWT and rejects requests that don't match — this is application-level access control built on top of the database schema."

---

## Project Structure (Updated)

```
smartserve/
├── client/                        ← React + Vite
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx    ← Global user + role state
│   │   ├── components/
│   │   │   ├── Navbar.jsx         ← Role-aware nav links
│   │   │   ├── ProtectedRoute.jsx ← Redirects if wrong role
│   │   │   ├── StallCard.jsx
│   │   │   ├── MenuGrid.jsx
│   │   │   ├── OrderPanel.jsx
│   │   │   ├── TableGrid.jsx
│   │   │   └── PaymentModal.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx        ← Spline hero + "Get Started" → Login
│   │   │   ├── Login.jsx          ← Email + password + role selector
│   │   │   ├── Register.jsx       ← New customer signup (role=customer default)
│   │   │   │
│   │   │   ├── CustomerDashboard.jsx  ← /dashboard (customer)
│   │   │   ├── Menu.jsx               ← Browse stalls + add to cart
│   │   │   ├── Order.jsx              ← Cart review + table select + confirm
│   │   │   ├── OrderTracking.jsx      ← Live order status for customer
│   │   │   ├── Profile.jsx            ← Loyalty points + order history
│   │   │   │
│   │   │   ├── KitchenDashboard.jsx   ← /kitchen (kitchen role)
│   │   │   │                              incoming orders for this stall
│   │   │   │
│   │   │   ├── AdminDashboard.jsx     ← /admin (admin role)
│   │   │   ├── ManageStalls.jsx       ← Full CRUD for stalls + menu items
│   │   │   └── ManageTables.jsx       ← Table status board + updates
│   │   ├── api/
│   │   │   └── axios.js           ← Axios instance, auto-attaches JWT
│   │   ├── App.jsx                ← Routes + ProtectedRoute wrappers
│   │   └── main.jsx
│   └── vite.config.js
│
├── server/
│   ├── models/
│   │   ├── User.js            ← NEW — email, password (hashed), role, ref to Customer
│   │   ├── Customer.js        ← name, phone, loyalty_points, user_id ref
│   │   ├── FoodStall.js       ← stall_name, cuisine_type, is_active, managed_by (user_id)
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   ├── Payment.js
│   │   └── SeatingTable.js
│   ├── routes/
│   │   ├── auth.js            ← POST /register, POST /login
│   │   ├── customers.js
│   │   ├── stalls.js
│   │   ├── menu.js
│   │   ├── orders.js
│   │   ├── tables.js
│   │   └── payments.js
│   ├── middleware/
│   │   ├── protect.js         ← Verifies JWT, sets req.user
│   │   ├── authorise.js       ← Checks req.user.role against allowed roles
│   │   └── errorHandler.js
│   ├── config/
│   │   └── db.js
│   ├── seed.js
│   ├── .env
│   └── index.js
│
└── README.md
```

---

## Phase 0 — Auth Architecture Decision (Read First)

### How the User Model works

```js
// models/User.js
const UserSchema = new mongoose.Schema({
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },       // bcrypt hash
  role:       { type: String, enum: ['admin', 'kitchen', 'customer'], required: true },
  stall_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'FoodStall' },
  // ↑ only set for kitchen role — links kitchen staff to their stall
  created_at: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', UserSchema);
```

```js
// models/Customer.js  (extended from v1)
const CustomerSchema = new mongoose.Schema({
  user_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:           { type: String, required: true },
  phone:          { type: String },
  loyalty_points: { type: Number, default: 0 },
  created_at:     { type: Date, default: Date.now }
});
```

> `User` handles auth. `Customer` handles food-court-specific data. Kitchen staff and Admin only have a `User` record — no `Customer` record needed.

### JWT Flow

```
Login → POST /api/auth/login
  → server verifies password with bcrypt
  → signs JWT: { id, role, stall_id } with JWT_SECRET
  → returns token + user object

Frontend stores token in localStorage
  → axios.js attaches it as Authorization: Bearer <token> on every request

Protected route hit
  → protect.js decodes token, sets req.user
  → authorise.js checks req.user.role — 403 if not allowed
```

---

## Phase 1 — Design in Figma (Day 1–2)

Design **9 screens** in Figma. Group them by role flow so the evaluator can follow the prototype.

### Flow 1: Public (anyone)
1. **Landing** — Spline 3D hero, tagline, two CTAs: "Sign In" + "Sign Up"
2. **Login** — Email field, password field, role dropdown (customer / kitchen / admin), submit
3. **Register** — Name, email, phone, password — role defaults to customer

### Flow 2: Customer
4. **Customer Dashboard** — Greeting, active order status card (if any), loyalty points badge, quick links
5. **Menu + Order** — Stall filter chips, item cards with "Add" button, sliding cart panel, table selector, confirm order
6. **Profile** — Loyalty points, past orders list with statuses

### Flow 3: Kitchen
7. **Kitchen Dashboard** — Card grid of incoming orders for this stall only, each with status pill + "Mark Ready" button, toggle switches for item availability

### Flow 4: Admin
8. **Admin Dashboard** — Stats strip (orders today, tables free, active stalls) + quick-action buttons
9. **Manage Stalls / Tables** — Data tables with inline edit, add row, delete — show full CRUD

**Figma tip:** Link screens with prototype arrows to make it a clickable flow. The Login screen's role dropdown should route to three different dashboards — evaluators love seeing this.

### Spline (Day 2)
- Keep the scene minimal: a floating food tray or a stylised top-down food court floor
- Export scene URL, embed on Landing only
- Add `style={{ pointerEvents: 'none' }}` so it never blocks clicks

---

## Phase 2 — Backend (Day 2–4)

### Step 1: Initialize + Install
```bash
mkdir server && cd server
npm init -y
npm install express mongoose dotenv cors morgan bcryptjs jsonwebtoken
npm install -D nodemon
```

`package.json`:
```json
"scripts": { "dev": "nodemon index.js" }
```

### Step 2: Auth Routes

```js
// routes/auth.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User     = require('../models/User');
const Customer = require('../models/Customer');

// Register (customer only from public form)
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hash, role: 'customer' });
  await Customer.create({ user_id: user._id, name, phone });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, role: user.role });
});

// Login (all roles)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign(
    { id: user._id, role: user.role, stall_id: user.stall_id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token, role: user.role, stall_id: user.stall_id });
});

module.exports = router;
```

### Step 3: Middleware

```js
// middleware/protect.js
const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid' });
  }
};
```

```js
// middleware/authorise.js
// Usage: router.get('/path', protect, authorise('admin', 'kitchen'), handler)
module.exports = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: 'Access denied' });
  next();
};
```

### Step 4: All Mongoose Models

Build all 8 models. Key ones with role-relevant logic:

```js
// models/FoodStall.js — add managed_by so kitchen staff links to their stall
const FoodStallSchema = new mongoose.Schema({
  stall_name:   { type: String, required: true },
  cuisine_type: String,
  location:     String,
  owner_name:   String,
  is_active:    { type: Boolean, default: true },
  managed_by:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // kitchen user
});
```

```js
// models/Order.js — unchanged from v1, status enum enforced
const OrderSchema = new mongoose.Schema({
  customer_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  table_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'SeatingTable', required: true },
  order_date:   { type: Date, default: Date.now, required: true },
  status:       { type: String, enum: ['pending','preparing','ready','delivered','cancelled'], default: 'pending' },
  total_amount: { type: Number, default: 0 }
});
```

### Step 5: REST API Routes (Full List with Role Gates)

| Method | Endpoint | Allowed Roles | DB Action |
|---|---|---|---|
| POST | /api/auth/register | public | Insert User + Customer |
| POST | /api/auth/login | public | Find + compare + sign JWT |
| GET | /api/stalls | all | Find all active stalls |
| POST | /api/stalls | admin | Insert stall |
| PUT | /api/stalls/:id | admin | Update stall |
| DELETE | /api/stalls/:id | admin | Delete stall |
| GET | /api/menu?stall_id=X | all | Filter menu by stall |
| POST | /api/menu | admin | Insert menu item |
| PATCH | /api/menu/:id/availability | admin, kitchen | Toggle is_available |
| GET | /api/tables | all | Find all tables |
| PATCH | /api/tables/:id/status | admin | Update table status |
| POST | /api/orders | customer | Insert order + order items |
| GET | /api/orders/my | customer | Orders for logged-in customer |
| GET | /api/orders/stall | kitchen | Orders for this stall (from JWT stall_id) |
| GET | /api/orders/all | admin | All orders across stalls |
| PATCH | /api/orders/:id/status | kitchen, admin | Update order status |
| POST | /api/payments | customer | Insert payment |
| GET | /api/customers/me | customer | Profile + loyalty points |

Example — kitchen-only route:
```js
// routes/orders.js
const protect    = require('../middleware/protect');
const authorise  = require('../middleware/authorise');

// Kitchen sees only their stall's orders — stall_id comes from JWT
router.get('/stall', protect, authorise('kitchen', 'admin'), async (req, res) => {
  const items = await OrderItem.find({ stall_id: req.user.stall_id })
    .populate({ path: 'order_id', match: { status: { $in: ['pending','preparing'] } } });
  res.json(items.filter(i => i.order_id)); // remove nulls from populate match
});
```

### Step 6: index.js Entry Point

```js
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/stalls',    require('./routes/stalls'));
app.use('/api/menu',      require('./routes/menu'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/tables',    require('./routes/tables'));
app.use('/api/payments',  require('./routes/payments'));
app.use('/api/customers', require('./routes/customers'));

app.listen(5000, () => console.log('Server on :5000'));
```

`.env`:
```
MONGO_URI=mongodb://localhost:27017/smartserve
JWT_SECRET=smartserve_super_secret_key_2026
PORT=5000
```

---

## Phase 3 — Frontend (Day 4–7)

### Step 1: Initialize
```bash
npm create vite@latest client -- --template react
cd client
npm install axios react-router-dom @splinetool/react-spline
```

### Step 2: AuthContext — Single Source of Truth

```jsx
// src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('role');
    return token ? { token, role } : null;
  });

  const login = (token, role, stall_id) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setUser({ token, role, stall_id });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Step 3: Axios — Auto-attach JWT

```js
// src/api/axios.js
import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:5000/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### Step 4: ProtectedRoute Component

```jsx
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
}
```

### Step 5: App.jsx Routing

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// pages
import Landing           from './pages/Landing';
import Login             from './pages/Login';
import Register          from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import Menu              from './pages/Menu';
import Order             from './pages/Order';
import OrderTracking     from './pages/OrderTracking';
import Profile           from './pages/Profile';
import KitchenDashboard  from './pages/KitchenDashboard';
import AdminDashboard    from './pages/AdminDashboard';
import ManageStalls      from './pages/ManageStalls';
import ManageTables      from './pages/ManageTables';

function RoleDashboard() {
  const { user } = useAuth();
  if (user?.role === 'admin')   return <Navigate to="/admin" />;
  if (user?.role === 'kitchen') return <Navigate to="/kitchen" />;
  return <Navigate to="/customer" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Role redirect after login */}
          <Route path="/dashboard" element={
            <ProtectedRoute><RoleDashboard /></ProtectedRoute>
          } />

          {/* Customer routes */}
          <Route path="/customer" element={
            <ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>
          } />
          <Route path="/menu"     element={<ProtectedRoute roles={['customer']}><Menu /></ProtectedRoute>} />
          <Route path="/order"    element={<ProtectedRoute roles={['customer']}><Order /></ProtectedRoute>} />
          <Route path="/track"    element={<ProtectedRoute roles={['customer']}><OrderTracking /></ProtectedRoute>} />
          <Route path="/profile"  element={<ProtectedRoute roles={['customer']}><Profile /></ProtectedRoute>} />

          {/* Kitchen routes */}
          <Route path="/kitchen"  element={
            <ProtectedRoute roles={['kitchen', 'admin']}><KitchenDashboard /></ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin"         element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/stalls"  element={<ProtectedRoute roles={['admin']}><ManageStalls /></ProtectedRoute>} />
          <Route path="/admin/tables"  element={<ProtectedRoute roles={['admin']}><ManageTables /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

> Notice `/kitchen` allows `admin` too — admin can always see what kitchen sees. This is soft separation in action.

### Step 6: Role-Aware Navbar

```jsx
// src/components/Navbar.jsx
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav>
      <Link to="/">SmartServe</Link>

      {user?.role === 'customer' && <>
        <Link to="/menu">Menu</Link>
        <Link to="/track">My Order</Link>
        <Link to="/profile">Profile</Link>
      </>}

      {user?.role === 'kitchen' && <>
        <Link to="/kitchen">Orders</Link>
      </>}

      {user?.role === 'admin' && <>
        <Link to="/admin">Dashboard</Link>
        <Link to="/kitchen">Kitchen View</Link>
        <Link to="/admin/stalls">Stalls</Link>
        <Link to="/admin/tables">Tables</Link>
      </>}

      {user && <button onClick={handleLogout}>Logout</button>}
      {!user && <Link to="/login">Login</Link>}
    </nav>
  );
}
```

### Step 7: Build Pages (Priority Order)

Build in this order — each step is independently testable.

**Day 4**
1. `Landing.jsx` — Spline hero, two buttons → `/login` and `/register`
2. `Login.jsx` — Form, POST `/api/auth/login`, call `login()` from AuthContext, redirect to `/dashboard`
3. `Register.jsx` — Form, POST `/api/auth/register`, auto-login on success

**Day 5**
4. `Menu.jsx` — Fetch stalls, filter chips, fetch items on stall select, "Add to Cart" → `cartContext` or `useState`
5. `Order.jsx` — Cart review, table dropdown (GET `/api/tables?status=free`), POST `/api/orders`
6. `OrderTracking.jsx` — GET `/api/orders/my`, show latest order with live status pill

**Day 6**
7. `Profile.jsx` — GET `/api/customers/me`, show loyalty points + past orders table
8. `KitchenDashboard.jsx` — GET `/api/orders/stall`, order cards with "Mark Preparing" + "Mark Ready" PATCH buttons, toggle item availability
9. `CustomerDashboard.jsx` — Greeting card, active order status summary, loyalty points badge, quick-links to Menu + Track

**Day 7**
10. `AdminDashboard.jsx` — Stats strip (total orders, free tables, active stalls — 3 parallel API calls)
11. `ManageStalls.jsx` — Full CRUD table: GET all stalls, add row form, inline edit, delete button
12. `ManageTables.jsx` — Table grid with colour-coded status chips, dropdown to update status per table

---

## Phase 4 — Integration & Polish (Day 8)

- Add `react-hot-toast` for error/success notifications — `npm install react-hot-toast`
- Add loading spinners on all API calls using a `loading` useState
- Write `seed.js` — creates 1 admin user, 2 kitchen users (each linked to a stall), 3 customer users, 3 stalls, 10 menu items, 8 tables

```js
// server/seed.js  (simplified structure)
const users = [
  { email: 'admin@ss.com',   password: hash('admin123'),   role: 'admin' },
  { email: 'dosa@ss.com',    password: hash('kitchen123'),  role: 'kitchen' }, // linked to Dosa Palace stall
  { email: 'wok@ss.com',     password: hash('kitchen123'),  role: 'kitchen' }, // linked to Wok & Roll stall
  { email: 'ravi@ss.com',    password: hash('customer123'), role: 'customer' },
  { email: 'priya@ss.com',   password: hash('customer123'), role: 'customer' },
];
// After inserting users, insert stalls with managed_by = kitchen user _id
// Then insert Customer docs for the 2 customer users
// Then insert menu items, tables
```

---

## Phase 5 — Presentation Prep (Day 9–10)

### Demo Script (Practice This Exact Flow)

```
1. Open Landing page — show Spline hero, point out "this is just the public face"

2. Login as customer (ravi@ss.com)
   → redirected to Customer Dashboard
   → show loyalty points, no active order yet

3. Go to Menu → select Dosa Palace stall → add 2 items → slide to Wok & Roll → add 1 more
   → cart now has items from 2 different stalls

4. Go to Order → review cart, select Table A3, confirm
   → POST fires → show response in browser network tab (order_id returned)

5. Go to Order Tracking → order shows status: "pending"

6. Logout → Login as dosa@ss.com (kitchen)
   → Kitchen Dashboard → order appears for Dosa Palace items only
   → Click "Mark Preparing" → PATCH fires
   → Switch back to customer tab → status updated to "preparing"  ← this is the wow moment

7. Kitchen marks "Ready" → customer sees "ready"

8. Logout → Login as admin@ss.com
   → Admin Dashboard → all orders visible
   → Go to Manage Stalls → add a new stall live → show it in DB via Compass
   → Go to Manage Tables → change A3 from occupied to free
```

### What to Say at Each DB Moment

| Action | What to say |
|---|---|
| Login JWT | "The role is encoded in the token — the backend doesn't hit the DB again to check permissions, it reads the decoded payload" |
| `populate()` on order fetch | "This is the Mongoose equivalent of a SQL JOIN — it resolves the customer_id foreign key reference into the full customer document" |
| Kitchen sees only their stall's orders | "stall_id is in the JWT payload, so the query is automatically scoped — `OrderItem.find({ stall_id: req.user.stall_id })`" |
| PATCH order status (enum validation) | Open Thunder Client, try PATCH with status: "burned" — show 500 validation error. "Mongoose enum enforcement — same as a CHECK constraint in SQL" |
| Snapshot unit_price | "If the stall later changes the price of Masala Dosa, past orders still show the original price — because we store unit_price at order time, not reference it from the menu" |
| stall_id in OrderItem | "One order can span multiple stalls. The stall_id FK on OrderItem is what lets the kitchen dashboard filter — no expensive JOIN through MenuItem needed every time" |

---

## Deliverables Checklist

- [ ] Figma: 9 screens with prototype links between flows
- [ ] Spline scene embedded on Landing
- [ ] 8 Mongoose models (added User model)
- [ ] Auth routes: register + login with JWT
- [ ] `protect` + `authorise` middleware on all sensitive routes
- [ ] REST API: 18+ endpoints with role gates
- [ ] React: AuthContext + ProtectedRoute pattern
- [ ] React: 12 pages across 3 role flows
- [ ] Role-aware Navbar
- [ ] Seed script with 5 users across 3 roles
- [ ] Full demo flow works end-to-end
- [ ] (Bonus) Deploy on Railway (backend) + Vercel (frontend)

---

## Timeline Summary (Updated)

| Day | Task |
|---|---|
| 1 | Figma — all 9 screens + prototype links |
| 2 | Spline scene + User/Customer/FoodStall models + auth routes |
| 3 | Remaining 5 models + all Express routes with role gates |
| 4 | Landing + Login + Register pages (React) — auth flow complete |
| 5 | Menu + Order + OrderTracking pages |
| 6 | Profile + KitchenDashboard + CustomerDashboard |
| 7 | AdminDashboard + ManageStalls + ManageTables |
| 8 | Integration testing + seed script + toast notifications |
| 9 | Full demo dry run — practice the script 2–3 times |
| 10 | Submission + presentation |

---

*SmartServe v2 — Mini Project | React · Node · MongoDB · JWT*
