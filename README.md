# HariyalHub — Complete Full-Stack Project (VS Code Ready)
**Technology Entrepreneurship Project — Sukkur IBA University**
**Team Members:** Hajira Memon, Sumera Suandro, Shehroz Ali

## Folder Structure
1. **`backend/` (Port `5000`)** — Node.js + Express + MongoDB + JWT Auth REST API (Nursery applications, Admin Approve/Reject, Plants/Seeds CRUD, 8% Commission Orders, Sukkur Season Guides).
2. **`frontend-storefront/` (Port `5173`)** — Customer Marketplace & Nursery Partner Portal (Browse & filter plants/seeds, Cash-on-Delivery order form, Sukkur seasonal guides, AI Mali chatbot, Nursery Owner Application form & Vendor Dashboard).
3. **`frontend-admin/` (Port `5174`)** — Separate Super Admin Portal (Approve/Reject nursery applications, promote Featured items, manage Season Guides, update order statuses, track 8% platform commission revenue).

## How to Run in VS Code (3 Terminals)

### Terminal 1: Start Backend API & Seed Data
```bash
cd backend
copy .env.example .env
npm install
npm run seed
npm run dev
```

### Terminal 2: Start Customer & Nursery Owner Website
```bash
cd frontend-storefront
npm install
npm run dev
```
Open: `http://localhost:5173`

### Terminal 3: Start Separate Super Admin Portal
```bash
cd frontend-admin
npm install
npm run dev
```
Open: `http://localhost:5174`

## Default Credentials
- **Super Admin (`http://localhost:5174`)**: `admin@hariyalhub.pk` / `admin123`
- **Approved Nursery Owner (`http://localhost:5173`)**: `bilal@sindhgreen.pk` / `nursery123`
- **Pending Nursery Application (For Admin Testing)**: `usman@rohribotanicals.pk` / `nursery123`
