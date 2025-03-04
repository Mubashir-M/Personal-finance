from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.models import User
from app.database import SessionLocal

COLUMN_MAPPING = {
    "Kirjauspäivä" : "datetime",
    "Nimi" : "description",
    "Otsikko" : "Merchant",
    "Määrä" : "Amount"
}

def translate_columns(df):
    return df.rename(columns=COLUMN_MAPPING)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(db: Session = Depends(get_db)):
    # Fetch the first user from the database (for testing purposes)
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="No user found in database")
    
    return {"id": user.id, "username": user.username}