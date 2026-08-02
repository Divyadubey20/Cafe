import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./restaurant.db")

# check_same_thread is only needed for SQLite to prevent errors when sharing connections across threads
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Dependency generator for database sessions.
    Ensures that database sessions are closed after the request is completed.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
