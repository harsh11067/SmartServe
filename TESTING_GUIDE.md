# SmartServe Testing Guide

## 🚀 Quick Start

### 1. Start the Backend Server
```bash
cd server
node index.js
```
Server runs on: `http://127.0.0.1:5000`

### 2. Seed the Database (First Time Only)
```bash
cd server
node seed.js
```

### 3. Start the Frontend
```bash
cd client
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## 👥 Test Accounts

### Admin Account
- **Email:** admin@ss.com
- **Password:** admin123
- **Access:** Full system control

### Kitchen Accounts
- **Grill Station:**
  - Email: grill@ss.com
  - Password: kitchen123
  
- **Wok Republic:**
  - Email: wok@ss.com
  - Password: kitchen123

### Customer Accounts
- **Customer 1:**
  - Email: ravi@ss.com
  - Password: customer123
  
- **Customer 2:**
  - Email: priya@ss.com
  - Password: customer123

---

## 🧪 Test Scenarios

### Scenario 1: Customer Order Flow (Complete E2E)

1. **Landing Page**
   - Visit `http://localhost:5173`
   - Verify glass navigation bar appears
   - Verify hero section with gradient text
   - Verify 6 feature cards display
   - Click "Get Started" button

2. **Login**
   - Enter: ravi@ss.com / customer123
   - Click "Sign In"
   - Should redirect to Customer Dashboard

3. **Customer Dashboard**
   - Verify stats cards show (Active Orders, Total Spent, Loyalty Points)
   - Verify "Quick Actions" section
   - Click "Browse Menu" button

4. **Menu Page**
   - Verify menu items load from all stalls
   - Click "Grill Station" filter button
   - Verify only Grill Station items show
   - Click "Add to Cart" on 2-3 items
   - Verify cart counter updates
   - Click "View Cart" button

5. **Order Page (NEW)**
   - Verify cart items display correctly
   - Test quantity controls (+/- buttons)
   - Test remove item button (🗑️)
   - Select a table from dropdown
   - Verify order summary shows:
     - Subtotal
     - Tax (5%)
     - Total amount
   - Click "Place Order"
   - Should redirect to Order Tracking

6. **Order Tracking**
   - Verify order appears in "Active Orders"
   - Verify progress stepper shows current status
   - Status should be "pending"
   - Wait 10 seconds for auto-refresh

7. **Profile Page (NEW)**
   - Click "Profile" in sidebar
   - Verify profile header with avatar
   - Verify loyalty points display
   - Verify order history table shows recent order
   - Verify stats (Orders Completed, Total Spent)

---

### Scenario 2: Kitchen Order Management

1. **Login as Kitchen**
   - Email: grill@ss.com
   - Password: kitchen123

2. **Kitchen Dashboard**
   - Verify "Incoming Orders" section
   - Should see order from Scenario 1 (if it contains Grill Station items)
   - Verify "Menu Availability" section shows only Grill Station items
   - Click "Start Preparing" on an order
   - Verify status changes to "preparing"
   - Click "Mark Ready"
   - Verify status changes to "ready"

3. **Menu Availability**
   - Toggle a menu item to "Unavailable"
   - Verify status badge changes
   - Toggle back to "Available"

4. **Real-time Updates**
   - Keep dashboard open
   - Wait 10 seconds
   - Should auto-refresh with latest data

---

### Scenario 3: Admin Management

1. **Login as Admin**
   - Email: admin@ss.com
   - Password: admin123

2. **Admin Dashboard**
   - Verify system stats (Total Orders, Active Tables, Food Stalls, Revenue)
   - Verify "Recent Orders" table
   - Verify "Stall Health" section

3. **Manage Tables**
   - Click "Manage Tables" in sidebar
   - Click "Add New Table"
   - Fill form:
     - Table Number: 99
     - Seating Capacity: 4
     - Status: available
   - Click "Add Table"
   - Verify new table appears in grid
   - Click "Edit" on the new table
   - Change status to "booked"
   - Click "Update Table"
   - Verify border color changes (green → orange)
   - Click "Delete" on the table
   - Confirm deletion
   - Verify table removed

4. **Manage Stalls**
   - Click "Manage Stalls" in sidebar
   - Click "Add New Stall"
   - Fill form:
     - Stall Name: Test Stall
     - Cuisine Type: Test Cuisine
     - Status: Active
   - Click "Add Stall"
   - Verify new stall appears in table
   - Click "View Menu" on the new stall
   - Click "Add Menu Item"
   - Fill form:
     - Item Name: Test Item
     - Category: Main Course
     - Price: 150
     - Prep Time: 15
   - Click "Add Item"
   - Verify item appears in menu table
   - Click "Edit" on the item
   - Change price to 200
   - Click "Update Item"
   - Click "Delete" on the item
   - Confirm deletion

---

## ✅ Feature Checklist

### Landing Page
- [ ] Glass navigation bar with backdrop blur
- [ ] Hero section with gradient text
- [ ] 6 feature cards with icons
- [ ] Hover effects on feature cards
- [ ] Footer with copyright
- [ ] Login/Sign Up buttons work

### Authentication
- [ ] Login form validation
- [ ] Register form validation
- [ ] Toast notifications on success/error
- [ ] Redirect to role-based dashboard
- [ ] Logout functionality

### Customer Dashboard
- [ ] Stats cards display correctly
- [ ] Active orders section
- [ ] Quick actions buttons work
- [ ] Sidebar navigation

### Menu Page
- [ ] All menu items load
- [ ] Stall filter buttons work
- [ ] Add to cart functionality
- [ ] Cart counter updates
- [ ] Floating cart summary
- [ ] Menu cards have hover effects

### Order Page (NEW)
- [ ] Cart items display
- [ ] Quantity controls work (+/-)
- [ ] Remove item works
- [ ] Table selection dropdown
- [ ] Order summary calculates correctly
- [ ] Place order button works
- [ ] Loading state during checkout
- [ ] Empty cart state
- [ ] Redirects to tracking after order

### Order Tracking
- [ ] Active orders display
- [ ] Progress stepper shows status
- [ ] Past orders section
- [ ] Real-time polling (10s interval)
- [ ] Status badges colored correctly

### Profile Page (NEW)
- [ ] Profile header with cover photo
- [ ] Avatar with first letter
- [ ] Loyalty points display
- [ ] Stats cards (points, orders, spent)
- [ ] Account information section
- [ ] Loyalty rewards card
- [ ] Order history table
- [ ] Empty state for no orders
- [ ] View details button works

### Kitchen Dashboard
- [ ] Stats cards (Pending, Preparing, Available Items)
- [ ] Incoming orders display
- [ ] Only stall's orders show
- [ ] Start Preparing button works
- [ ] Mark Ready button works
- [ ] Menu availability section
- [ ] Only stall's menu items show
- [ ] Toggle availability works
- [ ] Real-time polling (10s interval)

### Admin Dashboard
- [ ] System stats display
- [ ] Recent orders table
- [ ] Stall health cards
- [ ] Navigation to manage pages

### Manage Tables
- [ ] Table grid displays
- [ ] Add table form works
- [ ] Edit table works
- [ ] Delete table works
- [ ] Status colors correct (green/orange/gray)
- [ ] Hover effects on cards

### Manage Stalls
- [ ] Stalls table displays
- [ ] Add stall form works
- [ ] Edit stall works
- [ ] Delete stall works
- [ ] View menu modal works
- [ ] Add menu item works
- [ ] Edit menu item works
- [ ] Delete menu item works

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to load kitchen data"
**Solution:** Make sure you're logged in as a kitchen user (grill@ss.com or wok@ss.com) and the user has a stall_id in the JWT token.

### Issue: Cart is empty after refresh
**Solution:** This is expected. Cart is stored in localStorage and should persist. If not, check browser console for errors.

### Issue: Orders not showing in Kitchen Dashboard
**Solution:** 
1. Make sure the order contains items from that kitchen's stall
2. Check that order status is "pending" or "preparing"
3. Wait 10 seconds for auto-refresh

### Issue: Menu items not showing
**Solution:**
1. Run `node seed.js` to populate database
2. Check that stalls are marked as `is_active: true`
3. Check that menu items are marked as `is_available: true`

### Issue: Cannot place order
**Solution:**
1. Make sure you selected a table
2. Make sure cart has items
3. Check browser console for API errors
4. Verify backend is running on port 5000

---

## 📊 Expected Data After Seeding

### Stalls (2)
1. Grill Station (Indian, North Indian)
2. Wok Republic (Chinese, Asian)

### Menu Items (8)
- Grill Station: Paneer Tikka, Chicken Biryani, Dal Makhani, Naan
- Wok Republic: Veg Fried Rice, Chicken Manchurian, Hakka Noodles, Spring Rolls

### Tables (5)
- Table 1-5 with varying capacities (2-6 seats)
- All initially "available"

### Users (5)
- 1 Admin
- 2 Kitchen users (linked to stalls)
- 2 Customers

---

## 🎯 Success Criteria

A successful test means:
1. ✅ All pages load without errors
2. ✅ Navigation works between pages
3. ✅ API calls succeed (check Network tab)
4. ✅ Toast notifications appear on actions
5. ✅ Data persists after refresh (except cart)
6. ✅ Role-based access control works
7. ✅ Dark theme displays correctly
8. ✅ Hover effects and animations work
9. ✅ Forms validate input
10. ✅ Loading states show during async operations

---

## 📝 Bug Reporting Template

If you find a bug, report it with:

```
**Page:** [Page name]
**User Role:** [admin/kitchen/customer]
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Console Errors:**
[Any errors from browser console]

**Screenshots:**
[If applicable]
```

---

## 🚀 Ready to Test!

Start with Scenario 1 (Customer Order Flow) to test the complete end-to-end experience. This will verify all the newly created pages (Order and Profile) work correctly.

Good luck! 🎉
