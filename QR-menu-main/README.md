# 🥘 QR Dine-In Ordering & Restaurant Management System

A production-ready, mobile-first monorepo application for contactless dine-in ordering. Customers scan a table-specific QR code to browse the menu, pay online via a mock payment gateway, and submit their order directly to the kitchen. Managers handle order preparation lifecycles, menu item pricing, table QR sign printing, and analytics on a unified admin portal.

---

## 🏗️ Project Architecture

```
qr-menu/
├── frontend/             # Next.js 16 Client App (Port 3000)
│   ├── app/              # App Router routes (Customer flow & Manager portal)
│   ├── components/       # UI Components (Framer Motion drawers, search, print signs)
│   ├── store/            # Zustand global state (Cart calculations)
│   └── lib/              # API Fetch handlers (Dynamic network host resolution)
│
├── backend/              # FastAPI Python REST API Server (Port 8000)
│   ├── app/
│   │   ├── routes/       # Endpoint controllers (Menu, Categories, Orders, Manager)
│   │   ├── models.py     # SQLAlchemy DB ORM Entity Definitions
│   │   ├── schemas.py    # Pydantic serialization models
│   │   ├── crud.py       # SQL querying operations
│   │   └── seed.py       # Auto-loader syncing database with frontend JSON arrays
│   └── sqlite.db         # Lightweight database instance
```

---

## ✨ Features

### 📱 Customer Dine-In Flow (Mobile-First)
* **Welcome Screen**: Detects the scanned table parameter (`?table=X`) automatically.
* **Unified Menu Catalog**: Text-only, clean catalog layout featuring real-time inline search, horizontal category filters, veg indicators, rating tags, and quick-add actions.
* **Dish Customization Details**: Slide-up detail overlay drawer with description metadata and special preparation inputs.
* **Cart & Invoice Summary**: Displays itemized totals, tax summaries (5% GST), and notes with no delivery fees (dine-in focused).
* **Mock Payment Gateway**: Slide-up bottom sheet simulating real UPI payment verification (Google Pay, PhonePe, Paytm), credit/debit card processing, or counter settlement options.
* **Order Success Page**: Shows order number, preparation countdowns, payment method receipts, and details of purchased items fetched from the database.

### 💼 Manager Admin Panel
* **Dashboard Analytics**: Shows counts for today's orders, progress states (Pending, Preparing, Ready, Served), menu totals, and real-time revenue stats.
* **Active Orders Queue**: Searchable list to track order queues and transition statuses.
* **Menu Items Console**: List of all dishes with inline pricing edits, bestseller toggles, and availability markers.
* **Category Configuration**: Handles display ordering and naming modifications.
* **Settings Portal**: Modifies restaurant branding info, opening/closing hours, phone contacts, and GST rates.
* **Table & QR Sign Generator**: Lists tables, lets you create new tables, and prints brand-designed table cards with dynamic scan codes.

---

## ⚡ Tech Stack

* **Frontend**: Next.js 16 (App Router + Turbopack), TypeScript, Tailwind CSS v4, Zustand, Framer Motion, Lucide React, shadcn/ui.
* **Backend**: FastAPI (Python 3.10+), SQLAlchemy ORM, SQLite Database, Pydantic v2, Uvicorn.

---

## 🚀 Getting Started

### 1. Start the Backend Server (FastAPI)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Seed the database with the physical menu data:
   ```bash
   python app/seed.py
   ```
5. Run the server:
   ```bash
   python -m uvicorn app.main:app --port 8000 --host 127.0.0.1 --reload
   ```
   * The API Swagger docs will be available at: http://localhost:8000/docs

### 2. Start the Frontend Server (Next.js)
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js dev server:
   ```bash
   npm run dev
   ```
   * Open the app at: http://localhost:3000

---

## 📱 Mobile Device Network Testing

The frontend incorporates a **Dynamic API Host Resolver** inside `frontend/lib/api.ts`. When you open the application on your phone connected to the same local WiFi (e.g. `http://192.168.1.15:3000/?table=5`):
* The browser automatically resolves the API base URL to `http://192.168.1.15:8000`.
* This lets you place orders, process mock payments, and print QR signs directly from physical mobile devices without hardcoding IP addresses.

---

## 🚀 Deploying to Vercel (Frontend)

To deploy the Next.js client on Vercel:

1. Go to the [Vercel Dashboard](https://vercel.com) and click **Add New** -> **Project**.
2. Select your imported GitHub repository **digiQR-menu/QR-menu**.
3. In the **Configure Project** settings, specify the following:
   * **Framework Preset**: Select `Next.js`.
   * **Root Directory**: Click **Edit** and select the `frontend` folder (since the Next.js project is nested inside a monorepo).
   * **Build & Development Settings**: Keep default settings.
4. Under **Environment Variables**, configure:
   * **Key**: `NEXT_PUBLIC_API_URL`
   * **Value**: *Your deployed FastAPI production backend URL* (e.g. `https://qr-menu-api.onrender.com`).
5. Click **Deploy**. Vercel will compile the frontend and output a public URL!
