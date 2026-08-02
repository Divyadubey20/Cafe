from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils import not_found
from app import crud, schemas

router = APIRouter(prefix="/menu", tags=["Menu"])


@router.get(
    "",
    response_model=List[schemas.MenuItemResponse],
    summary="Browse menu items",
    description="Retrieve menu items with optional filters for category name, search keyword, and availability.",
)
def get_menu(
    category: Optional[str] = Query(None, description="Filter by category name (e.g. 'Chinese')"),
    search: Optional[str] = Query(None, description="Search in item name or description (e.g. 'paneer')"),
    available: Optional[bool] = Query(None, description="Filter by availability (true/false)"),
    db: Session = Depends(get_db),
):
    return crud.get_menu_items(db, category=category, search=search, available=available)


@router.get(
    "/{id}",
    response_model=schemas.MenuItemResponse,
    summary="Get menu item details",
    responses={404: {"model": schemas.ErrorResponse, "description": "Menu item not found"}},
)
def get_menu_item_detail(id: int, db: Session = Depends(get_db)):
    """Retrieve details for a single menu item by its ID."""
    db_item = crud.get_menu_item(db, item_id=id)
    if not db_item:
        raise not_found("Menu item", id)
    return db_item
