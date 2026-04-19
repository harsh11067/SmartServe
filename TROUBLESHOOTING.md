# 🔧 SmartServe Troubleshooting Guide

## Issue: User Collection is Empty in MongoDB

### Quick Fix - Run This Command:

```bash
cd server
node quick-seed.js
```

This will create a test user: `ravi@ss.com` / `customer123`

### Full Database Seed:

```bash
cd server
node seed.js
```

This creates all demo accounts and data.

---

## Step-by-Step Debugging

### 1. Check MongoDB Connection

```bash
cd server
node test-connection.js
```

**Expected Output:**
```
✅ MongoDB connected successfully

📦 Collections in database:
  - users: 5 documents
  - customers: 2 documents
  - foodstalls: 3 documents
  - menuitems: 6 documents
  - seatingtables: 8 documents
```

**If you see 0 documents**, run the seed script:
```bash
node seed.js
```

### 2. Check Server is Running

```bash
cd server
node index.js
```

**Expected Output:**
```
🚀 Server running on http://127.0.0.1:5000
📊 Database: mongodb://127.0.0.1:27017/smartserve
MongoDB connected successfully
```

### 3. Test Backend API Directly

**Test Health Check:**
```bash
curl http://127.0.0.1:5000/health
```

**Expected:** `{"status":"ok","message":"Server is running"}`

**Test Database Connection:**
```bash
curl http://127.0.0.1:5000/api/test
```

**Expected:** `{"message":"Database connected","userCount":5,"dbName":"smartserve"}`

**Test Login:**
```bash
curl -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ravi@ss.com","password":"customer123"}'
```

**Expected:** `{"token":"eyJ...","role":"customer","stall_id":null}`

**Test Registration:**
```bash
curl -X POST http://127.0.0.1:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@test.com",
    "phone":"1234567890",
    "password":"test123"
  }'
```

**Expected:** `{"token":"eyJ...","role":"customer"}`

### 4. Check Frontend Connection

**Start Frontend:**
```bash
cd client
npm run dev
```

**Open Browser Console (F12):**
1. Go to `http://localhost:5173/login`
2. Open Developer Tools (F12)
3. Go to Network tab
4. Try to login
5. Check the request to `http://127.0.0.1:5000/api/auth/login`

**Look for:**
- Status Code: Should be 200 (success) or 401 (wrong credentials)
- Response: Should have `token` and `role`
- If you see CORS error, check server CORS config

### 5. Check Browser Console for Errors

**Common Errors:**

**Error: "Network Error"**
- Backend server not running
- Wrong baseURL in axios config
- CORS issue

**Fix:**
```javascript
// client/src/api/axios.js
const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api"  // Must match server
});
```

**Error: "Invalid credentials"**
- User doesn't exist in database
- Wrong password
- Run seed script

**Error: "Customer profile not found"**
- Customer collection empty
- Run seed script

---

## Common Issues & Solutions

### Issue 1: "Registration failed"

**Check Server Logs:**
```bash
cd server
node index.js
```

Try to register and watch the terminal output.

**Possible Causes:**
1. **Missing fields** - Check all form fields are filled
2. **Email already exists** - Try different email
3. **Database connection** - Check MongoDB is running
4. **Validation error** - Check server logs for details

**Solution:**
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Restart MongoDB if needed
sudo systemctl restart mongod

# Check server logs when registering
cd server
node index.js
# Then try registration in browser
```

### Issue 2: "Login failed" but user exists

**Verify User Exists:**
```bash
# In MongoDB Compass:
# 1. Connect to mongodb://127.0.0.1:27017
# 2. Open 'smartserve' database
# 3. Open 'users' collection
# 4. Look for your email
```

**Or use mongosh:**
```bash
mongosh
use smartserve
db.users.find({ email: "ravi@ss.com" })
```

**If user exists but login fails:**
1. Password might be wrong
2. JWT_SECRET might be missing
3. Check server logs

**Solution:**
```bash
# Check .env file
cd server
cat .env

# Should have:
# MONGO_URI=mongodb://127.0.0.1:27017/smartserve
# JWT_SECRET=supersecret
# PORT=5000

# If JWT_SECRET is missing, add it and restart server
```

### Issue 3: CORS Error in Browser

**Error Message:**
```
Access to XMLHttpRequest at 'http://127.0.0.1:5000/api/auth/login' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
Server already has CORS configured for both localhost and 127.0.0.1:
```javascript
// server/index.js
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
```

If still having issues, restart the server.

### Issue 4: MongoDB Compass Shows Empty Collections

**Solution:**
```bash
cd server
node seed.js
```

**Then refresh MongoDB Compass:**
1. Click the refresh icon (↻) next to the database name
2. Or disconnect and reconnect

**Verify Data:**
```bash
mongosh
use smartserve
db.users.countDocuments()  // Should return 5
db.customers.countDocuments()  // Should return 2
```

---

## Environment Variables Check

**File: `server/.env`**
```env
MONGO_URI=mongodb://127.0.0.1:27017/smartserve
JWT_SECRET=supersecret
PORT=5000
```

**Verify:**
```bash
cd server
cat .env
```

**If file doesn't exist:**
```bash
cd server
cp .env.example .env
# Then edit .env with the values above
```

---

## Complete Reset (Nuclear Option)

If nothing works, start fresh:

```bash
# 1. Stop all servers
# Press Ctrl+C in all terminal windows

# 2. Clear MongoDB database
mongosh
use smartserve
db.dropDatabase()
exit

# 3. Reinstall dependencies
cd server
rm -rf node_modules package-lock.json
npm install

cd ../client
rm -rf node_modules package-lock.json
npm install

# 4. Seed database
cd ../server
node seed.js

# 5. Start backend
node index.js

# 6. In new terminal, start frontend
cd client
npm run dev

# 7. Test in browser
# Go to http://localhost:5173/login
# Use: ravi@ss.com / customer123
```

---

## Verification Checklist

Run through this checklist:

- [ ] MongoDB is running: `sudo systemctl status mongod`
- [ ] Database has data: `node test-connection.js`
- [ ] Server starts: `node index.js` (no errors)
- [ ] Health check works: `curl http://127.0.0.1:5000/health`
- [ ] Test endpoint works: `curl http://127.0.0.1:5000/api/test`
- [ ] Login API works: `curl -X POST http://127.0.0.1:5000/api/auth/login ...`
- [ ] Frontend starts: `npm run dev` in client folder
- [ ] Browser can reach frontend: `http://localhost:5173`
- [ ] Browser console shows no CORS errors
- [ ] Login form submits without network errors

---

## Getting Help

If you're still stuck, provide these details:

1. **Server logs** (output from `node index.js`)
2. **Browser console errors** (F12 → Console tab)
3. **Network tab** (F12 → Network tab, show failed request)
4. **MongoDB status** (output from `node test-connection.js`)
5. **Environment** (output from `cat server/.env`)

---

## Quick Commands Reference

```bash
# Start MongoDB
sudo systemctl start mongod

# Check MongoDB status
sudo systemctl status mongod

# Seed database
cd server && node seed.js

# Quick seed (just test user)
cd server && node quick-seed.js

# Test connection
cd server && node test-connection.js

# Start backend
cd server && node index.js

# Start frontend
cd client && npm run dev

# Test login API
curl -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ravi@ss.com","password":"customer123"}'
```
