import sys
import os
import json
from sqlalchemy.orm import Session

# Add the parent directory to sys.path to enable imports when run directly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base, engine, SessionLocal
from app.models import RestaurantSetting, Table, Category, MenuItem

def seed_db(db: Session):
    print("Clearing existing data...")
    db.query(MenuItem).delete()
    db.query(Category).delete()
    db.query(Table).delete()
    db.query(RestaurantSetting).delete()
    db.commit()

    print("Seeding restaurant settings...")
    setting = RestaurantSetting(
        restaurant_name="Cafe",
        address="123, Food Street, Near City Square, Indore, M.P., India",
        phone="+91 98765 43210",
        opening_time="11 AM",
        closing_time="11 PM",
        logo_url="/images/logo.png",
        currency="INR",
        gst_percentage=5.0
    )
    db.add(setting)

    print("Seeding tables (1 to 12)...")
    tables = []
    for i in range(1, 13):
        tables.append(Table(
            table_number=i,
            capacity=4 if i % 2 == 0 else 2,
            qr_code=f"http://localhost:3000/welcome?table={i}",
            is_active=True
        ))
    db.add_all(tables)
    db.commit()

    # Load categories from local backend data folder or fallback to frontend path
    backend_data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
    categories_path = os.path.join(backend_data_dir, "categories.json")
    menu_path = os.path.join(backend_data_dir, "menu.json")

    if not os.path.exists(categories_path):
        frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend")
        categories_path = os.path.join(frontend_dir, "data", "categories.json")
        menu_path = os.path.join(frontend_dir, "data", "menu.json")

    print(f"Reading categories from {categories_path}...")
    with open(categories_path, "r", encoding="utf-8") as f:
        categories_data = json.load(f)

    print(f"Reading menu from {menu_path}...")
    with open(menu_path, "r", encoding="utf-8") as f:
        menu_data = json.load(f)

    # Insert Categories
    category_id_map = {}
    print("Seeding categories...")
    for cat in categories_data:
        db_cat = Category(
            name=cat["name"],
            display_order=cat["displayOrder"]
        )
        db.add(db_cat)
        db.flush() # Get database ID
        category_id_map[cat["id"]] = db_cat.id
        
    db.commit()

    # Insert Menu Items
    print("Seeding menu items...")
    menu_items = []
    for item in menu_data:
        db_cat_id = category_id_map.get(item["categoryId"])
        if not db_cat_id:
            continue
            
        menu_items.append(MenuItem(
            category_id=db_cat_id,
            name=item["name"],
            description=item["description"],
            price=item["price"],
            image_url=item["image"],
            is_available=item["isAvailable"],
            is_best_seller=item["isBestSeller"],
            is_chef_special=item["isChefSpecial"],
            display_order=item.get("displayOrder", 0)
        ))
        
    db.add_all(menu_items)
    db.commit()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()
