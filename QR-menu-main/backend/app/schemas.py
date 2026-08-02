from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator
from app.models import OrderStatus

# ==========================================
# Restaurant Setting Schemas
# ==========================================
class RestaurantSettingBase(BaseModel):
    restaurant_name: str = Field(..., min_length=1, max_length=100, examples=["Cafe"])
    address: str = Field(default="", max_length=255, examples=["123, Food Street, Indore, M.P."])
    phone: str = Field(default="", max_length=20, examples=["+91 98765 43210"])
    opening_time: str = Field(default="11:00 AM", max_length=20, examples=["11:00 AM"])
    closing_time: str = Field(default="11:00 PM", max_length=20, examples=["11:00 PM"])
    logo_url: str = Field(default="", max_length=255, examples=["https://example.com/logo.png"])
    currency: str = Field(default="INR", max_length=10, examples=["INR"])
    gst_percentage: float = Field(default=5.0, ge=0.0, le=100.0, examples=[5.0])

class RestaurantSettingResponse(RestaurantSettingBase):
    """Restaurant settings including name, contact, hours, and tax configuration."""
    id: int

    model_config = ConfigDict(from_attributes=True)

class RestaurantSettingUpdate(BaseModel):
    """Partial update for restaurant settings. Only include fields you want to change."""
    restaurant_name: Optional[str] = Field(None, min_length=1, max_length=100, examples=["Sai Kripa Restaurant"])
    address: Optional[str] = Field(None, max_length=255, examples=["123, Food Street, Indore"])
    phone: Optional[str] = Field(None, max_length=20, examples=["+91 98765 43210"])
    opening_time: Optional[str] = Field(None, max_length=20, examples=["11:00 AM"])
    closing_time: Optional[str] = Field(None, max_length=20, examples=["11:00 PM"])
    logo_url: Optional[str] = Field(None, max_length=255)
    currency: Optional[str] = Field(None, max_length=10, examples=["INR"])
    gst_percentage: Optional[float] = Field(None, ge=0.0, le=100.0, examples=[5.0])


# ==========================================
# Table Schemas
# ==========================================
class TableBase(BaseModel):
    table_number: int = Field(..., gt=0, examples=[1])
    capacity: int = Field(default=4, gt=0, examples=[4])
    qr_code: str = Field(default="", max_length=255, examples=["https://restaurant.local/?table=1"])
    is_active: bool = Field(default=True, examples=[True])

class TableResponse(TableBase):
    """A restaurant table with its QR code link."""
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TableCreate(TableBase):
    """Create a new table with a table number and optional QR code."""
    pass


class TableUpdate(BaseModel):
    """Partial update for a table."""
    table_number: Optional[int] = Field(None, gt=0, examples=[12])
    capacity: Optional[int] = Field(None, gt=0, examples=[4])
    qr_code: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = Field(None, examples=[True])


# ==========================================
# Category Schemas
# ==========================================
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, examples=["Chinese"])
    display_order: int = Field(default=0, examples=[3])

class CategoryCreate(CategoryBase):
    """Create a new menu category."""
    pass

class CategoryUpdate(BaseModel):
    """Partial update for a category. Only include fields you want to change."""
    name: Optional[str] = Field(None, min_length=1, max_length=50, examples=["Italian"])
    display_order: Optional[int] = Field(None, examples=[5])

class CategoryResponse(CategoryBase):
    """A menu category."""
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Menu Item Schemas
# ==========================================
class MenuItemBase(BaseModel):
    category_id: int = Field(..., examples=[1])
    name: str = Field(..., min_length=1, max_length=100, examples=["Paneer Butter Masala"])
    description: str = Field(default="", max_length=500, examples=["Rich, creamy paneer in a mildly sweet tomato gravy."])
    price: float = Field(..., gt=0.0, examples=[249.0])
    image_url: str = Field(default="", max_length=255, examples=["https://placehold.co/300x200?text=Paneer"])
    is_available: bool = Field(default=True, examples=[True])
    is_best_seller: bool = Field(default=False, examples=[False])
    is_chef_special: bool = Field(default=False, examples=[False])
    display_order: int = Field(default=0, examples=[1])

class MenuItemCreate(MenuItemBase):
    """Create a new menu item under a category."""
    pass

class MenuItemUpdate(BaseModel):
    """Partial update for a menu item. Only include fields you want to change."""
    category_id: Optional[int] = Field(None, examples=[2])
    name: Optional[str] = Field(None, min_length=1, max_length=100, examples=["Kadhai Paneer"])
    description: Optional[str] = Field(None, max_length=500)
    price: Optional[float] = Field(None, gt=0.0, examples=[259.0])
    image_url: Optional[str] = Field(None, max_length=255)
    is_available: Optional[bool] = Field(None, examples=[True])
    is_best_seller: Optional[bool] = Field(None, examples=[True])
    is_chef_special: Optional[bool] = Field(None, examples=[False])
    display_order: Optional[int] = Field(None, examples=[2])

class MenuItemResponse(MenuItemBase):
    """A menu item with full details."""
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Order Item Schemas
# ==========================================
class OrderItemCreate(BaseModel):
    """A single item within an order."""
    menu_item_id: int = Field(..., examples=[1])
    quantity: int = Field(..., gt=0, examples=[2])
    special_instruction: str = Field(default="", max_length=255, examples=["Less spicy"])

class OrderItemResponse(BaseModel):
    """An order item with the captured price at time of ordering."""
    id: int
    order_id: int
    menu_item_id: int
    quantity: int
    price: float
    special_instruction: str
    menu_item_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def resolve_orm(cls, data):
        """Extract menu_item_name from the SQLAlchemy relationship."""
        if not isinstance(data, dict):
            d = {}
            for field_name in cls.model_fields:
                if hasattr(data, field_name):
                    d[field_name] = getattr(data, field_name)
            if hasattr(data, "menu_item") and data.menu_item:
                d["menu_item_name"] = data.menu_item.name
            return d
        return data


# ==========================================
# Order Schemas
# ==========================================
class OrderCreate(BaseModel):
    """Place a new order. The backend calculates the total from current menu prices."""
    table_number: int = Field(..., gt=0, examples=[5])
    items: List[OrderItemCreate] = Field(..., min_length=1)

    model_config = ConfigDict(json_schema_extra={
        "examples": [{
            "table_number": 5,
            "items": [
                {"menu_item_id": 1, "quantity": 2, "special_instruction": "Less sugar"},
                {"menu_item_id": 5, "quantity": 1, "special_instruction": ""}
            ]
        }]
    })

class OrderResponse(BaseModel):
    """Full order details including items, table info, status, and calculated total."""
    id: int
    table_id: int
    table_number: Optional[int] = None
    status: OrderStatus
    total_amount: float
    prep_time: int = 0
    created_at: datetime
    items: List[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def resolve_orm(cls, data):
        """Extract table_number from the SQLAlchemy relationship."""
        if not isinstance(data, dict):
            d = {}
            for field_name in cls.model_fields:
                if hasattr(data, field_name):
                    d[field_name] = getattr(data, field_name)
            if hasattr(data, "table") and data.table:
                d["table_number"] = data.table.table_number
            return d
        return data

class OrderStatusUpdate(BaseModel):
    """Update the status of an order. Must follow: Pending → Preparing → Ready → Served."""
    status: OrderStatus = Field(..., examples=["Preparing"])


# ==========================================
# Dashboard & Stats Schemas
# ==========================================
class DashboardStatsResponse(BaseModel):
    """Summary statistics for the manager dashboard."""
    orders_today: int = Field(..., examples=[18])
    pending: int = Field(..., examples=[4])
    preparing: int = Field(..., examples=[3])
    ready: int = Field(..., examples=[2])
    served: int = Field(..., examples=[9])
    menu_items: int = Field(..., examples=[26])
    categories: int = Field(..., examples=[11])
    revenue_today: float = Field(..., examples=[2499.0])
    revenue_month: float = Field(..., examples=[58999.0])
    total_tables: int = Field(..., examples=[12])
    active_tables: int = Field(..., examples=[12])
    available_menu_items: int = Field(..., examples=[22])
    unavailable_menu_items: int = Field(..., examples=[4])
    staff_present: int = Field(..., examples=[8])
    staff_absent: int = Field(..., examples=[2])


# ==========================================
# Error Response Schema (for Swagger docs)
# ==========================================
class ErrorResponse(BaseModel):
    """Standard error response returned by the API."""
    detail: str = Field(..., examples=["Menu item with ID 99 not found."])
