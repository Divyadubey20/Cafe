from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils import not_found, bad_request
from app import crud, schemas, models

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post(
    "",
    response_model=schemas.OrderResponse,
    status_code=201,
    summary="Place a new order",
    description=(
        "Create a new order for a table. The backend validates item availability, "
        "fetches current prices from the database, and calculates the total amount including GST. "
        "**Never trust totals sent by the frontend.**"
    ),
    responses={400: {"model": schemas.ErrorResponse, "description": "Invalid table, item, or quantity"}},
)
def place_order(order_data: schemas.OrderCreate, db: Session = Depends(get_db)):
    table = crud.get_table_by_number(db, table_number=order_data.table_number)
    if not table:
        raise bad_request(f"Table number {order_data.table_number} does not exist or is inactive.")

    try:
        return crud.create_order(db, order_data=order_data, table=table)
    except ValueError as e:
        raise bad_request(str(e))


@router.get(
    "",
    response_model=List[schemas.OrderResponse],
    summary="List orders",
    description="List orders sorted by newest first. Supports optional filters.",
)
def list_orders(
    status: Optional[models.OrderStatus] = Query(None, description="Filter by order status"),
    table: Optional[int] = Query(None, description="Filter by table number"),
    today: Optional[bool] = Query(None, description="If true, return only today's orders"),
    db: Session = Depends(get_db),
):
    return crud.get_orders(db, status=status, table_number=table, today=today)


@router.get(
    "/{id}",
    response_model=schemas.OrderResponse,
    summary="Get order details",
    responses={404: {"model": schemas.ErrorResponse, "description": "Order not found"}},
)
def get_order_by_id(id: int, db: Session = Depends(get_db)):
    """Retrieve order details including items, table info, and calculated total."""
    db_order = crud.get_order(db, order_id=id)
    if not db_order:
        raise not_found("Order", id)
    return db_order


@router.patch(
    "/{id}/status",
    response_model=schemas.OrderResponse,
    summary="Update order status",
    description="Transition order status. Allowed flow: Pending → Preparing → Ready → Served.",
    responses={
        400: {"model": schemas.ErrorResponse, "description": "Invalid status transition"},
        404: {"model": schemas.ErrorResponse, "description": "Order not found"},
    },
)
def update_status(id: int, status_update: schemas.OrderStatusUpdate, db: Session = Depends(get_db)):
    db_order = crud.get_order(db, order_id=id)
    if not db_order:
        raise not_found("Order", id)

    try:
        return crud.validate_and_update_order_status(db, db_order=db_order, new_status=status_update.status)
    except ValueError as e:
        raise bad_request(str(e))
