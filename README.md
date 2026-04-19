# SmartServe

SmartServe is a food court management system with three roles:

- `customer` for browsing menu items, placing orders, and tracking history
- `kitchen` for stall-specific order handling and availability toggles
- `admin` for stall, table, and system-wide operations

## Repository Layout

```text
client/   React + Vite frontend
server/   Node.js + Express + MongoDB backend
```

## Current State

- `landing.html`, `customer.html`, `kitchen.html`, and `admin.html` now work as a connected static prototype.
- Shared demo state lives in `prototype.js` using `localStorage`, so orders and status changes carry across roles.
- `client/` and `server/` have been scaffolded to match the execution plan and keep the workspace structure coherent.

## Key Architecture Decisions

- One shared frontend with role-aware routing and navigation
- JWT-based authentication with `protect` and `authorise` middleware
- `User` owns authentication, while `Customer` stores customer-specific profile data
- `OrderItem.stall_id` supports efficient kitchen-side filtering for multi-stall orders

## Next Build Steps

1. Install dependencies in `client/` and `server/`.
2. Create `server/.env` from `server/.env.example`.
3. Implement backend controllers and validation.
4. Build the frontend pages in the priority order from `SmartServe_Plan_v2.md`.
