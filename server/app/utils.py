from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.models import User
from app.database import SessionLocal
from app.schemas import UserResponse

from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from typing import Union
from dotenv import load_dotenv
import os

load_dotenv()

COLUMN_MAPPING = {
    "Kirjauspäivä" : "datetime",
    "Nimi" : "description",
    "Otsikko" : "Merchant",
    "Määrä" : "Amount"
}

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")

# Initialize password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> str:
    return pwd_context.verify(plain_password, hashed_password)

# Create access token with expiry time
def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=60)

    to_encode.update({"user_id": data["user_id"], "exp": expire, "username": data["username"]})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Decode the JWT token
def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise Exception("Token is invalid or expired")

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
    # Fetch the first user from the database (for testing purposes), update it to fetch correct user
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="No user found in database")
    
    return {"id": user.id, "username": user.username}

def verify_token(token: str) -> UserResponse:
    try:
        # Decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        return UserResponse(id = user_id, username = payload["username"], email=payload["sub"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Token verification failed")
    