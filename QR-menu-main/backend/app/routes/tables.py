from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.utils import bad_request, not_found

router = APIRouter(prefix="/tables", tags=["Tables"])

@router.get("", response_model=List[schemas.TableResponse])
def get_all_tables(db: Session = Depends(get_db)):
    """
    Retrieve all tables with their numbers and QR code links.
    """
    return crud.get_tables(db)


@router.post(
    "",
    response_model=schemas.TableResponse,
    status_code=201,
    summary="Create a new table",
    responses={400: {"model": schemas.ErrorResponse, "description": "Invalid table number or duplicate table"}},
)
def create_new_table(table: schemas.TableCreate, db: Session = Depends(get_db)):
    """Add a new table for digital ordering."""
    try:
        return crud.create_table(db, table=table)
    except ValueError as exc:
        raise bad_request(str(exc))


@router.patch(
    "/{id}",
    response_model=schemas.TableResponse,
    summary="Update table details",
    responses={404: {"model": schemas.ErrorResponse, "description": "Table not found"}},
)
def update_table(id: int, updates: schemas.TableUpdate, db: Session = Depends(get_db)):
    db_table = crud.get_table_by_id(db, table_id=id)
    if not db_table:
        raise not_found("Table", id)
    try:
        return crud.update_table(db, db_table=db_table, updates=updates)
    except ValueError as exc:
        raise bad_request(str(exc))


@router.delete(
    "/{id}",
    status_code=204,
    summary="Deactivate a table",
    responses={404: {"model": schemas.ErrorResponse, "description": "Table not found"}},
)
def deactivate_table(id: int, db: Session = Depends(get_db)):
    db_table = crud.get_table_by_id(db, table_id=id)
    if not db_table:
        raise not_found("Table", id)
    crud.deactivate_table(db, db_table=db_table)
    return None
