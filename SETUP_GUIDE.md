# SmartServe Setup & Testing Guide

## ✅ What Was Fixed

### 1. **Register Page** (`client/src/pages/Register.jsx`)
- ✅ Complete registration form with validation
- ✅ Password confirmation check
- ✅ Toast notifications for errors/success
- ✅ Auto-login after registration
- ✅ Proper API integration with `/api/auth/register`

### 2. **Axios Configuration** (`client/src/api/axios.js`)
- ✅ BaseURL: `http://127.0.0.1:5000/api`
- ✅ Request interceptor for JWT token
- ✅ Response interceptor for 401 errors (auto-logout)
- ✅ Proper error handling

### 3. **Server Routes** (`server/index.js`)
- ✅ All routes properly mounted:
  - `/api/auth` - Authentication (login, register)
  - `/api/customers` - Customer profiles
  - `/api/stalls` - Food stalls management
  - `/api/menu` - Menu items management
  - `/api/orders` - Order management
  - `/api/tables` - Table management
  - `/api/payments` - Payment processing

### 4. **Orders Routes** (`server/routes/orders.js`)
- ✅ Added `/api/orders/my` - Get customer's orders
- ✅ Added `/api/orders/stall` - Get kitchen's stall orders
- ✅ Added `/api/orders/all` - Get all orders (admin)
- ✅ Existing `/api/orders` - General orders endpoint
- ✅ POST `/api/orders` - Create new order
- ✅ PATCH `/api/orders/:id/status` - Update order status

## 🔧 Backend Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Environment Variables
File: `server/.env`
```env
MONGO_URI=mongodb://127.0.0.1:27017/smartserve
JWT_SECRET=supersecret
PORT=5000
```

### 3. Seed Database
```bash
cd server
node seed.js
```

**Demo Accounts Created:**
- Admin: `admin@ss.com` / `admin123`
- Kitchen (Grill): `grill@ss.com` / `kitchen123`
- Kitchen (Wok): `wok@ss.com` / `kitchen123`
- Customer 1: `ravi@ss.com` / `customer123`
- Customer 2: `priya@ss.com` / `customer123`

### 4. Start Server
```bash
cd server
npm run dev
# or
node index.js
```

Server should start on: `http://127.0.0.1:5000`

## 🎨 Frontend Setup

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Start Development Server
```bash
cd client
npm run dev
```

Frontend should start on: `http://localhost:5173`

## 🧪 Testing the Connection

### 1. Test Backend Directly (curl)
```bash
# Test login
curl -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ravi@ss.com","password":"customer123"}'

# Expected response:
# {"token":"eyJ...","role":"customer"}
```

### 2. Test Registration
```bash
curl -X POST http://127.0.0.1:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "phone":"1234567890",
    "password":"test123"
  }'
```

### 3. Test Frontend Flow
1. Open browser: `http://localhost:5173`
2. Click "Create Account"
3. Fill registration form
4. Should redirect to customer dashboard after success

### 4. Test Login Flow
1. Go to `http://localhost:5173/login`
2. Use demo account: `ravi@ss.com` / `customer123`
3. Should redirect to `/customer` dashboard

## 📊 MongoDB Compass Check

### Connection String
```
mongodb://127.0.0.1:27017
```

### Database: `smartserve`

### Collections to Check:
1. **users** - Should have 5 users (1 admin, 2 kitchen, 2 customers)
2. **customers** - Should have 2 customer profiles
3. **foodstalls** - Should have 3 stalls (Grill Station, Wok Republic, Brew Lab)
4. **menuitems** - Should have 6 menu items
5. **seatingtables** - Should have 8 tables

## 🐛 Troubleshooting

### Issue: "Login failed" or "Network Error"

**Check 1: Is MongoDB running?**
```bash
sudo systemctl status mongod
# or
mongosh
```

**Check 2: Is backend server running?**
```bash
curl http://127.0.0.1:5000/health
# Should return: {"status":"ok","message":"Server is running"}
```

**Check 3: Check server logs**
```bash
cd server
node index.js
# Look for "Server running on port 5000" and "MongoDB connected"
```

**Check 4: CORS issues?**
- Backend has `cors()` middleware enabled
- Frontend axios baseURL: `http://127.0.0.1:5000/api`
- Make sure both use `127.0.0.1` (not `localhost`)

### Issue: "Customer profile not found"

**Solution:** Run seed script again
```bash
cd server
node seed.js
```

### Issue: MongoDB Compass shows no data

**Check:**
1. Database name is `smartserve` (lowercase)
2. Run seed script: `node seed.js`
3. Refresh Compass
4. Check connection string: `mongodb://127.0.0.1:27017`

## 📝 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new customer
- `POST /api/auth/login` - Login (all roles)

### Customers (Protected)
- `GET /api/customers/me` - Get current customer profile
- `GET /api/customers` - Get all customers (admin only)

### Orders (Protected)
- `GET /api/orders/my` - Get my orders (customer)
- `GET /api/orders/stall` - Get stall orders (kitchen)
- `GET /api/orders/all` - Get all orders (admin)
- `POST /api/orders` - Create order (customer)
- `PATCH /api/orders/:id/status` - Update status (kitchen/admin)

### Stalls (Protected)
- `GET /api/stalls` - Get all stalls
- `POST /api/stalls` - Create stall (admin)
- `PUT /api/stalls/:id` - Update stall (admin)
- `DELETE /api/stalls/:id` - Delete stall (admin)

### Menu (Protected)
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item (admin)
- `PATCH /api/menu/:id/availability` - Toggle availability (kitchen/admin)
- `PUT /api/menu/:id` - Update menu item (admin)
- `DELETE /api/menu/:id` - Delete menu item (admin)

### Tables (Protected)
- `GET /api/tables` - Get all tables
- `POST /api/tables` - Create table (admin)
- `PUT /api/tables/:id` - Update table (admin)
- `DELETE /api/tables/:id` - Delete table (admin)

## ✅ Verification Checklist

- [ ] MongoDB is running
- [ ] Database seeded successfully
- [ ] Backend server running on port 5000
- [ ] Frontend dev server running on port 5173
- [ ] Can register new account
- [ ] Can login with demo accounts
- [ ] Customer dashboard loads
- [ ] Kitchen dashboard loads (use grill@ss.com)
- [ ] Admin dashboard loads (use admin@ss.com)
- [ ] Toast notifications appear
- [ ] MongoDB Compass shows data

## 🚀 Next Steps

1. Complete remaining pages:
   - Menu.jsx (browse and add to cart)
   - Order.jsx (checkout)
   - OrderTracking.jsx (live tracking)
   - Profile.jsx (loyalty points)
   - ManageStalls.jsx (admin CRUD)
   - ManageTables.jsx (admin table management)

2. Add real-time features:
   - WebSocket for live order updates
   - Auto-refresh for kitchen dashboard

3. Add images:
   - Food item images
   - Stall logos
   - User avatars

4. Testing:
   - Complete end-to-end flow
   - Role-based access control
   - Error handling
