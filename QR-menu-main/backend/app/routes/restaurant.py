from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas

router = APIRouter(prefix="/restaurant", tags=["Restaurant"])

@router.get("", response_model=schemas.RestaurantSettingResponse)
def get_restaurant_info(db: Session = Depends(get_db)):
    """
    Retrieve restaurant settings such as name, address, opening/closing times, currency, and GST rate.
    """
    return crud.get_restaurant_settings(db)
