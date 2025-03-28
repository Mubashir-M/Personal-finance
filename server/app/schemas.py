from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

#User Schema
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        from_attributes = True

class UpdateCategoryRequest(BaseModel):
    category_id: int

    class Config:
        from_attributes = True

# Transaction Schema
class TransactionsCreate(BaseModel):
    amount: float
    merchant: str
    category: Optional[str] = None
    description: Optional[str] = None
    date: datetime
    user_id: int

    class Config:
        from_attributes = True