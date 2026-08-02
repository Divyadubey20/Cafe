from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import Base, engine
from app.routes import health, restaurant, tables, categories, menu, orders, manager

# Import models so SQLAlchemy registers them before create_all
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables and auto-seed if empty on startup."""
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed if database is empty (e.g. on new serverless function launches)
    from app.database import SessionLocal
    from app.models import MenuItem
    from app.seed import seed_db
    
    db = SessionLocal()
    try:
        if db.query(MenuItem).count() == 0:
            print("Database is empty. Running auto-seeding...")
            seed_db(db)
            print("Auto-seeding completed successfully!")
    except Exception as e:
        print(f"Error checking/seeding database on startup: {e}")
    finally:
        db.close()
        
    yield


app = FastAPI(
    title="QR Restaurant Ordering API",
    description=(
        "A clean, lightweight backend for a QR-code based restaurant ordering system.\n\n"
        "**Customers** scan a QR code on their table, browse the menu, and place orders.\n\n"
        "**Managers** control the menu, pricing, categories, and order lifecycle.\n\n"
        "---\n\n"
        "### Quick Links\n"
        "- `GET /health` — Health check\n"
        "- `GET /restaurant` — Restaurant info\n"
        "- `GET /categories` — Menu categories\n"
        "- `GET /menu` — Browse menu items\n"
        "- `POST /orders` — Place an order\n"
        "- `GET /manager/dashboard` — Manager dashboard stats\n"
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ==========================================
# Global Exception Handler
# ==========================================
@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    """Catch unhandled ValueErrors and return a clean 400 response."""
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)}
    )


# ==========================================
# CORS Middleware
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# Register Routers
# ==========================================
app.include_router(health.router)
app.include_router(restaurant.router)
app.include_router(tables.router)
app.include_router(categories.router)
app.include_router(menu.router)
app.include_router(orders.router)
app.include_router(manager.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
