from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .config import DB_URL
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
@event.listens_for(engine, "connect")
def _fk(conn, _):
    c = conn.cursor(); c.execute("PRAGMA foreign_keys=ON"); c.close()
SessionLocal = sessionmaker(bind=engine, autoflush=False)
class Base(DeclarativeBase): pass
def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()
