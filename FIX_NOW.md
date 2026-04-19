# 🚨 QUICK FIX - Run These Commands

## Your Issue: User collection is empty in MongoDB

## Solution: Run these 3 commands

### 1. Check System Status
```bash
cd server
node check-all.js
```

This will tell you exactly what's wrong.

---

### 2. If Database is Empty - Seed It
```bash
cd server
node seed.js
```

**This creates:**
- 5 users (1 admin, 2 kitchen, 2 customers)
- 2 customer profiles
- 3 food stalls
- 6 menu items
- 8 tables

**Demo Accounts:**
- Customer: `ravi@ss.com` / `customer123`
- Kitchen: `grill@ss.com` / `kitchen123`
- Admin: `admin@ss.com` / `admin123`

---

### 3. Start Server
```bash
cd server
node index.js
```

**You should see:**
```
🚀 Server running on http://127.0.0.1:5000
📊 Database: mongodb://127.0.0.1:27017/smartserve
MongoDB connected successfully
```

---

### 4. Start Frontend (New Terminal)
```bash
cd client
npm run dev
```

---

### 5. Test in Browser

1. Go to: `http://localhost:5173/login`
2. Login with: `ravi@ss.com` / `customer123`
3. Should redirect to customer dashboard

---

## If Still Not Working

### Check MongoDB is Running
```bash
sudo systemctl status mongod
```

**If not running:**
```bash
sudo systemctl start mongod
```

### Check .env File
```bash
cd server
cat .env
```

**Should contain:**
```
MONGO_URI=mongodb://127.0.0.1:27017/smartserve
JWT_SECRET=supersecret
PORT=5000
```

**If file doesn't exist:**
```bash
cd server
echo "MONGO_URI=mongodb://127.0.0.1:27017/smartserve" > .env
echo "JWT_SECRET=supersecret" >> .env
echo "PORT=5000" >> .env
```

---

## Test Backend API Directly

```bash
# Test health
curl http://127.0.0.1:5000/health

# Test database
curl http://127.0.0.1:5000/api/test

# Test login
curl -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ravi@ss.com","password":"customer123"}'
```

**Expected:** You should get a token back

---

## Watch Server Logs

When you start the server with `node index.js`, you'll see detailed logs:

**When you try to login:**
```
🔐 Login attempt: ravi@ss.com
✅ User found: 69e3efb75d5e1acb6d64ff98 Role: customer
✅ Password verified
✅ Login successful for: ravi@ss.com
```

**When you try to register:**
```
📝 Registration attempt: test@test.com
✅ User created: 69e3efb75d5e1acb6d64ff99
✅ Customer profile created
✅ Registration successful for: test@test.com
```

**If you see errors, they'll show up here!**

---

## MongoDB Compass

1. Connect to: `mongodb://127.0.0.1:27017`
2. Open database: `smartserve`
3. Check `users` collection - should have 5 documents
4. Check `customers` collection - should have 2 documents

**If empty, run:** `node seed.js`

---

## Complete Reset (If Nothing Works)

```bash
# 1. Drop database
mongosh
use smartserve
db.dropDatabase()
exit

# 2. Seed fresh data
cd server
node seed.js

# 3. Check everything
node check-all.js

# 4. Start server
node index.js
```

---

## Summary

**The problem:** Your MongoDB User collection is empty (0 documents)

**The fix:** Run `node seed.js` to populate the database

**Then:** Start server with `node index.js` and test login

**Login with:** `ravi@ss.com` / `customer123`
