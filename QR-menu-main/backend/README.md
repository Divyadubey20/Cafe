# QR Restaurant Ordering — Backend API

A clean, lightweight FastAPI backend for a QR-code based restaurant ordering system.

Customers scan a QR code on their table, browse the digital menu, and place orders.  
Managers control the menu, pricing, categories, and order lifecycle — all through the API.

---

## Tech Stack

| Component   | Technology        |
|-------------|-------------------|
| Framework   | FastAPI           |
| Language    | Python 3.12       |
| Database    | SQLite            |
| ORM         | SQLAlchemy 2.0    |
| Validation  | Pydantic v2       |
| Server      | Uvicorn           |

---

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Seed the Database

Populate the database with sample categories, menu items, tables, and restaurant settings:

```bash
python app/seed.py
```

This creates a `restaurant.db` file in the `backend/` directory with:
- 11 categories (Beverages, Chinese, Pasta, Veg Curry, Dal, Rice, Bread, etc.)
- 26 sample dishes with realistic descriptions and prices
- 10 active tables with QR code URLs
- Default restaurant settings (Sai Kripa Restaurant)

### 3. Start the Server

```bash
uvicorn app.main:app --reload
```

The API will be available at **http://127.0.0.1:8000**

### 4. Open the Docs

- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

---

## Database Reset

To reset and re-seed the database from scratch:

```bash
# Delete the existing database
del restaurant.db        # Windows
# rm restaurant.db       # macOS / Linux

# Re-seed
python app/seed.py
```

---

## API Overview

### Utility Endpoints

| Method | Endpoint        | Description               |
|--------|-----------------|---------------------------|
| GET    | `/health`       | Health check              |
| GET    | `/restaurant`   | Restaurant info & settings|
| GET    | `/tables`       | All active tables with QR |

### Public Menu (Customer-facing)

| Method | Endpoint        | Description                        |
|--------|-----------------|------------------------------------|
| GET    | `/categories`   | All categories (sorted)            |
| GET    | `/menu`         | Menu items (with filters)          |
| GET    | `/menu/{id}`    | Single menu item details           |

**Menu filters:**

```
GET /menu?category=Chinese
GET /menu?search=paneer
GET /menu?available=true
```

### Orders (Customer-facing)

| Method | Endpoint              | Description                     |
|--------|-----------------------|---------------------------------|
| POST   | `/orders`             | Place a new order               |
| GET    | `/orders`             | List orders (newest first)      |
| GET    | `/orders/{id}`        | Order details                   |
| PATCH  | `/orders/{id}/status` | Update order status             |

**Order filters:**

```
GET /orders?status=Pending
GET /orders?table=5
GET /orders?today=true
```

**Order status flow:**

```
Pending → Preparing → Ready → Served
```

### Manager Dashboard

| Method | Endpoint                       | Description                    |
|--------|--------------------------------|--------------------------------|
| GET    | `/manager/dashboard`           | Dashboard statistics           |
| GET    | `/manager/settings`            | Get restaurant settings        |
| PATCH  | `/manager/settings`            | Update restaurant settings     |
| GET    | `/manager/categories`          | List categories                |
| POST   | `/manager/categories`          | Create a category              |
| PATCH  | `/manager/categories/{id}`     | Update a category              |
| DELETE | `/manager/categories/{id}`     | Delete a category (+ items)    |
| GET    | `/manager/menu`                | List menu items                |
| POST   | `/manager/menu`                | Add a menu item                |
| PATCH  | `/manager/menu/{id}`           | Update a menu item             |
| DELETE | `/manager/menu/{id}`           | Delete a menu item             |
| GET    | `/manager/orders`              | List orders (with filters)     |
| PATCH  | `/manager/orders/{id}/status`  | Update order status            |

---

## Example: Place an Order

```bash
curl -X POST http://127.0.0.1:8000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "table_number": 5,
    "items": [
      {"menu_item_id": 1, "quantity": 2, "special_instruction": "Less sugar"},
      {"menu_item_id": 5, "quantity": 1, "special_instruction": "Extra hot"}
    ]
  }'
```

**Response:**

```json
{
  "id": 1,
  "table_id": 5,
  "table_number": 5,
  "status": "Pending",
  "total_amount": 189.0,
  "created_at": "2026-07-15T17:59:37",
  "items": [
    {
      "id": 1,
      "menu_item_id": 1,
      "quantity": 2,
      "price": 40.0,
      "special_instruction": "Less sugar",
      "menu_item_name": "Masala Chai"
    },
    {
      "id": 2,
      "menu_item_id": 5,
      "quantity": 1,
      "price": 100.0,
      "special_instruction": "Extra hot",
      "menu_item_name": "Tomato Soup"
    }
  ]
}
```

> The total is calculated server-side: subtotal ₹180 + 5% GST = ₹189.

---

## Example: Update Menu Item Price

```bash
curl -X PATCH http://127.0.0.1:8000/manager/menu/1 \
  -H "Content-Type: application/json" \
  -d '{"price": 45.0}'
```

Only the price is updated — no need to send the entire object.

---

## Project Structure

```
backend/
├── app/
│   ├── routes/
│   │   ├── health.py         # GET /health
│   │   ├── restaurant.py     # GET /restaurant
│   │   ├── tables.py         # GET /tables
│   │   ├── categories.py     # GET /categories
│   │   ├── menu.py           # GET /menu, GET /menu/{id}
│   │   ├── orders.py         # POST/GET/PATCH /orders
│   │   └── manager.py        # Manager CRUD & dashboard
│   │
│   ├── main.py               # FastAPI app entry point
│   ├── database.py           # SQLAlchemy engine & session
│   ├── models.py             # SQLAlchemy ORM models
│   ├── schemas.py            # Pydantic validation schemas
│   ├── crud.py               # Database operations
│   ├── seed.py               # Database seeding script
│   └── utils.py              # Shared helper functions
│
├── restaurant.db              # SQLite database (auto-created)
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

---

## Key Design Decisions

1. **Backend calculates totals** — The frontend sends item IDs and quantities. The backend fetches current prices from the database and computes the total including GST. Frontend totals are never trusted.

2. **Strict status transitions** — Orders follow a fixed workflow: Pending → Preparing → Ready → Served. Skipping steps is rejected with a 400 error.

3. **PATCH for updates** — Manager endpoints use PATCH, not PUT. This allows changing just the price of a dish without resending the entire object.

4. **Table model** — Instead of storing `table_number` directly on orders, a dedicated `Table` model allows future features like VIP tables, QR code generation, and occupancy tracking.

5. **SQLite to PostgreSQL** — The database layer uses SQLAlchemy 2.0 with no SQLite-specific features. To migrate to PostgreSQL, only the `DATABASE_URL` environment variable needs to change.

6. **No authentication** — This is an MVP. Authentication (JWT, OAuth, etc.) can be added later without structural changes.

---

## Future Enhancements

- [ ] Authentication for manager endpoints
- [ ] Image upload (Cloudinary integration)
- [ ] Payment integration
- [ ] Real-time order updates (WebSockets)
- [ ] PostgreSQL migration
- [ ] Table occupancy tracking
- [ ] Order history and analytics
