from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils import not_found, bad_request
from app import crud, schemas, models

router = APIRouter(prefix="/manager", tags=["Manager Dashboard"])


# ==========================================
# Restaurant Settings
# ==========================================
@router.get(
    "/settings",
    response_model=schemas.RestaurantSettingResponse,
    summary="Get restaurant settings",
)
def get_settings(db: Session = Depends(get_db)):
    """Retrieve the current restaurant settings (name, address, hours, GST, currency)."""
    return crud.get_restaurant_settings(db)


@router.patch(
    "/settings",
    response_model=schemas.RestaurantSettingResponse,
    summary="Update restaurant settings",
    description="Partially update restaurant settings. Only include the fields you want to change.",
)
def update_settings(updates: schemas.RestaurantSettingUpdate, db: Session = Depends(get_db)):
    db_settings = crud.get_restaurant_settings(db)
    return crud.update_restaurant_settings(db, db_settings=db_settings, updates=updates)


# ==========================================
# Category Management
# ==========================================
@router.get(
    "/categories",
    response_model=List[schemas.CategoryResponse],
    summary="List all categories",
)
def list_categories(db: Session = Depends(get_db)):
    """List all menu categories for management."""
    return crud.get_categories(db)


@router.post(
    "/categories",
    response_model=schemas.CategoryResponse,
    status_code=201,
    summary="Create a category",
    responses={400: {"model": schemas.ErrorResponse, "description": "Category already exists"}},
)
def create_new_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    """Add a new menu category."""
    db_cat = crud.get_category_by_name(db, name=category.name)
    if db_cat:
        raise bad_request(f"Category with name '{category.name}' already exists.")
    return crud.create_category(db, category=category)


@router.patch(
    "/categories/{id}",
    response_model=schemas.CategoryResponse,
    summary="Update a category",
    responses={404: {"model": schemas.ErrorResponse, "description": "Category not found"}},
)
def update_existing_category(id: int, updates: schemas.CategoryUpdate, db: Session = Depends(get_db)):
    """Rename a category or change its display order."""
    db_cat = crud.get_category_by_id(db, category_id=id)
    if not db_cat:
        raise not_found("Category", id)
    return crud.update_category(db, db_category=db_cat, updates=updates)


@router.delete(
    "/categories/{id}",
    status_code=204,
    summary="Delete a category",
    description="Delete a category and all its menu items (cascade).",
    responses={404: {"model": schemas.ErrorResponse, "description": "Category not found"}},
)
def delete_existing_category(id: int, db: Session = Depends(get_db)):
    db_cat = crud.get_category_by_id(db, category_id=id)
    if not db_cat:
        raise not_found("Category", id)
    crud.delete_category(db, db_category=db_cat)
    return None


# ==========================================
# Menu Management
# ==========================================
@router.get(
    "/menu",
    response_model=List[schemas.MenuItemResponse],
    summary="List menu items (manager)",
)
def list_menu_for_manager(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    available: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    """List all menu items with optional filtering."""
    return crud.get_menu_items(db, category=category, search=search, available=available)


@router.post(
    "/menu",
    response_model=schemas.MenuItemResponse,
    status_code=201,
    summary="Add a menu item",
    responses={400: {"model": schemas.ErrorResponse, "description": "Invalid category ID"}},
)
def create_new_menu_item(item: schemas.MenuItemCreate, db: Session = Depends(get_db)):
    """Add a new dish to the restaurant menu."""
    db_cat = crud.get_category_by_id(db, category_id=item.category_id)
    if not db_cat:
        raise bad_request(f"Category with ID {item.category_id} does not exist.")
    return crud.create_menu_item(db, item=item)


@router.patch(
    "/menu/{id}",
    response_model=schemas.MenuItemResponse,
    summary="Update a menu item",
    description="Partially update a dish — change price, availability, description, etc.",
    responses={
        400: {"model": schemas.ErrorResponse, "description": "Invalid category ID"},
        404: {"model": schemas.ErrorResponse, "description": "Menu item not found"},
    },
)
def update_existing_menu_item(id: int, updates: schemas.MenuItemUpdate, db: Session = Depends(get_db)):
    db_item = crud.get_menu_item(db, item_id=id)
    if not db_item:
        raise not_found("Menu item", id)

    if updates.category_id is not None:
        db_cat = crud.get_category_by_id(db, category_id=updates.category_id)
        if not db_cat:
            raise bad_request(f"Category with ID {updates.category_id} does not exist.")

    return crud.update_menu_item(db, db_item=db_item, updates=updates)


@router.delete(
    "/menu/{id}",
    status_code=204,
    summary="Delete a menu item",
    responses={404: {"model": schemas.ErrorResponse, "description": "Menu item not found"}},
)
def delete_existing_menu_item(id: int, db: Session = Depends(get_db)):
    """Remove a dish from the menu permanently."""
    db_item = crud.get_menu_item(db, item_id=id)
    if not db_item:
        raise not_found("Menu item", id)
    crud.delete_menu_item(db, db_item=db_item)
    return None


# ==========================================
# Order Management
# ==========================================
@router.get(
    "/orders",
    response_model=List[schemas.OrderResponse],
    summary="List orders (manager)",
)
def list_orders_for_manager(
    status: Optional[models.OrderStatus] = Query(None),
    table: Optional[int] = Query(None),
    today: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    """List orders with optional filters for status, table, and date."""
    return crud.get_orders(db, status=status, table_number=table, today=today)


@router.patch(
    "/orders/{id}/status",
    response_model=schemas.OrderResponse,
    summary="Update order status (manager)",
    description="Transition order status. Enforces: Pending → Preparing → Ready → Served.",
    responses={
        400: {"model": schemas.ErrorResponse, "description": "Invalid status transition"},
        404: {"model": schemas.ErrorResponse, "description": "Order not found"},
    },
)
def update_order_status_by_manager(
    id: int,
    status_update: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
):
    db_order = crud.get_order(db, order_id=id)
    if not db_order:
        raise not_found("Order", id)

    try:
        return crud.validate_and_update_order_status(db, db_order=db_order, new_status=status_update.status)
    except ValueError as e:
        raise bad_request(str(e))


# ==========================================
# Dashboard Statistics
# ==========================================
@router.get(
    "/dashboard",
    response_model=schemas.DashboardStatsResponse,
    summary="Dashboard summary",
    description="Returns counts for today's orders, pending/preparing/ready/served, total menu items, and categories.",
)
def get_dashboard_summary(db: Session = Depends(get_db)):
    return crud.get_dashboard_stats(db)
