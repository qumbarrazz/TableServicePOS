# Table Service Restaurant POS (Offline-First)

Full stack POS blueprint for table-service restaurants with resilient offline mode and automatic sync.

## 1) Architecture Overview

- **Frontend**: React + TypeScript + Tailwind, IndexedDB (Dexie), service worker, sync engine.
- **Backend**: Node.js + Express + Prisma + PostgreSQL (Supabase/Neon compatible).
- **Realtime**: Socket.IO for kitchen display and order status fan-out.
- **Auth**: JWT with role-based access.
- **Sync strategy**: client queue + batch sync + last-write-wins timestamp conflict flagging.

### Offline-first flow

1. User action writes to UI state + IndexedDB.
2. Action is appended to `syncQueue` locally.
3. If offline, app continues from local DB.
4. When online is restored, `syncNow()` sends queued events to `/api/v1/sync/batch`.
5. Server stores sync logs and conflict flags using timestamps.

---

## 2) Monorepo Folder Structure

```txt
apps/
  backend/
    prisma/
      schema.prisma
    seeds/
      seed.ts
    src/
      app.ts
      server.ts
      config/
        db.ts
        env.ts
      middleware/
        auth.ts
      modules/
        auth/auth.controller.ts
        floors/floor.controller.ts
        tables/table.controller.ts
        orders/order.controller.ts
        payments/payment.controller.ts
        reports/report.controller.ts
        sync/sync.controller.ts
      routes/index.ts
    .env.example
    package.json
    tsconfig.json

  frontend/
    public/
      service-worker.js
    src/
      app/App.tsx
      hooks/useOnlineStatus.ts
      lib/db.ts
      services/
        api.ts
        syncEngine.ts
      store/posStore.ts
      pages/
        LoginPage.tsx
        POSScreen.tsx
        FloorLayoutPage.tsx
        TableOrderPage.tsx
        CartPage.tsx
        PaymentPage.tsx
        KitchenDisplayPage.tsx
        ReportsDashboardPage.tsx
        SettingsPage.tsx
      types/index.ts
      main.tsx
      index.css
    package.json
    tailwind.config.js
    postcss.config.js
    tsconfig.json
    vite.config.ts
```

---

## 3) Database Schema (PostgreSQL via Prisma)

### Core tables included

- `users`
- `roles`
- `floors`
- `tables`
- `orders`
- `order_items`
- `payments`
- `menu_categories`
- `menu_items`
- `modifiers`
- `inventory`
- `sync_logs`

### Highlights

- Enums for `UserRole`, `TableStatus`, `OrderStatus`, `PaymentMethod`.
- Table merge relation (`tables.mergedIntoTableId`).
- `orders` supports hold/cancel reason/split group/tax/tip/discount.
- `order_items.modifiers` stored as JSON for flexible modifier combinations.
- `sync_logs` captures conflict marker and metadata payload.

See: `apps/backend/prisma/schema.prisma`.

---

## 4) REST API Endpoints

Base URL: `http://localhost:4000/api/v1`

### Auth
- `POST /auth/login` -> login and receive JWT.

### Floor & Table Management
- `GET /floors` -> list floors and tables.
- `POST /floors` -> create/update floor.
- `POST /tables` -> create/update table (status + coordinates).
- `POST /tables/merge` -> merge one table into another.

### Orders
- `POST /orders` -> create order with items/modifiers/notes.
- `PATCH /orders/:id/status` -> pending/preparing/ready/served/hold/cancel.
- `POST /orders/transfer` -> transfer order between tables.

### Payments
- `POST /payments` -> cash/card/split/tip.

### Sync Engine
- `POST /sync/batch` -> push queued offline records.

### Reports
- `GET /reports/daily-sales` -> aggregate totals.
- `GET /reports/top-items` -> most sold items.

> All endpoints except login require `Authorization: Bearer <token>`.

---

## 5) Sample Seed Data

Seed file: `apps/backend/seeds/seed.ts`

Creates:
- Roles: ADMIN, MANAGER, WAITER, CASHIER, KITCHEN.
- Users:
  - `admin@pos.local / Password123!`
  - `waiter@pos.local / Password123!`
- Floor: Ground Floor.
- Tables: T1, T2, T3 with varied statuses.
- Menu category + menu items.
- Inventory sample entries.

---

## 6) Setup Instructions

## Prerequisites
- Node.js 20+
- PostgreSQL database (Supabase or Neon free tier works)

### Backend setup

```bash
cd apps/backend
cp .env.example .env
# set DATABASE_URL + JWT_SECRET
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Backend starts on `http://localhost:4000`.

### Frontend setup

```bash
cd apps/frontend
npm install
npm run dev
```

Frontend runs on Vite default port (usually `http://localhost:5173`).

Set `VITE_API_URL` if backend is not on localhost:4000.

---

## 7) Feature Mapping vs Requested Scope

1. **Floor management**: floors/tables/statuses + coordinates for drag-drop persistence.
2. **Order management**: create/update/hold/cancel/transfer + modifier/notes model support.
3. **Menu management**: categories/items/modifiers/variants/stock/price in schema.
4. **Payments**: cash/card/tip/split supported via payment records.
5. **KDS**: realtime events via Socket.IO channels.
6. **Offline mode**: IndexedDB + queue + online listener + service worker.
7. **User roles**: enum roles + role relation + JWT claims.
8. **Reports dashboard**: daily sales and top items endpoints, UI page scaffold.
9. **Inventory module**: inventory table with reorder threshold.
10. **Sync engine**: queue + batch sync + retry hook point + conflict flagging.

---

## 8) Scalability Notes

- Add Redis pub/sub between API instances for Socket.IO horizontal scale.
- Move sync processing to a worker queue (BullMQ/SQS) for heavy write bursts.
- Introduce optimistic locking (`updatedAt` version checks) for stricter conflict policy.
- Add read replicas for report-heavy workloads.
