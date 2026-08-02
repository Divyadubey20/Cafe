from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[schemas.CategoryResponse])
def get_all_categories(db: Session = Depends(get_db)):
    """
    Retrieve all food/beverage categories sorted by display order.
    """
    return crud.get_categories(db)
