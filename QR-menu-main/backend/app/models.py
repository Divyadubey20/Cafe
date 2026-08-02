from datetime import datetime
from enum import Enum
from typing import List, Optional
from sqlalchemy import ForeignKey, String, Integer, Float, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.database import Base

class OrderStatus(str, Enum):
    PENDING = "Pending"
    PREPARING = "Preparing"
    READY = "Ready"
    SERVED = "Served"

class RestaurantSetting(Base):
    __tablename__ = "restaurant_settings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    restaurant_name: Mapped[str] = mapped_column(String(100), default="Cafe")
    address: Mapped[str] = mapped_column(String(255), default="")
    phone: Mapped[str] = mapped_column(String(20), default="")
    opening_time: Mapped[str] = mapped_column(String(20), default="09:00 AM")  # Simple string representation for ease of edit
    closing_time: Mapped[str] = mapped_column(String(20), default="10:00 PM")
    logo_url: Mapped[str] = mapped_column(String(255), default="")
    currency: Mapped[str] = mapped_column(String(10), default="INR")
    gst_percentage: Mapped[float] = mapped_column(Float, default=5.0)

class Table(Base):
    __tablename__ = "tables"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    table_number: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    capacity: Mapped[int] = mapped_column(Integer, default=4)
    qr_code: Mapped[str] = mapped_column(String(255), default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationship to orders
    orders: Mapped[List["Order"]] = relationship(back_populates="table")

class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationship to menu items
    menu_items: Mapped[List["MenuItem"]] = relationship(
        back_populates="category",
        cascade="all, delete-orphan"
    )

class MenuItem(Base):
    __tablename__ = "menu_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    category_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("categories.id", ondelete="CASCADE"),
        nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), index=True)
    description: Mapped[str] = mapped_column(String(500), default="")
    price: Mapped[float] = mapped_column(Float)
    image_url: Mapped[str] = mapped_column(String(255), default="")
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    is_best_seller: Mapped[bool] = mapped_column(Boolean, default=False)
    is_chef_special: Mapped[bool] = mapped_column(Boolean, default=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationships
    category: Mapped["Category"] = relationship(back_populates="menu_items")
    order_items: Mapped[List["OrderItem"]] = relationship(back_populates="menu_item")

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    table_id: Mapped[int] = mapped_column(Integer, ForeignKey("tables.id"), nullable=False)
    status: Mapped[OrderStatus] = mapped_column(SQLEnum(OrderStatus), default=OrderStatus.PENDING)
    total_amount: Mapped[float] = mapped_column(Float, default=0.0)
    prep_time: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    table: Mapped["Table"] = relationship(back_populates="orders")
    items: Mapped[List["OrderItem"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan"
    )

class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_item_id: Mapped[int] = mapped_column(Integer, ForeignKey("menu_items.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    price: Mapped[float] = mapped_column(Float)  # Captured price at time of order
    special_instruction: Mapped[str] = mapped_column(String(255), default="")

    # Relationships
    order: Mapped["Order"] = relationship(back_populates="items")
    menu_item: Mapped["MenuItem"] = relationship(back_populates="order_items")
