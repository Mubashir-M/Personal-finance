from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
import pandas as pd
from app import models
from app.database import engine
from app.models import Base
import app.schemas as schemas
import app.crud as crud
from app.tasks import process_transactions_task
from app.utils import translate_columns, process_and_save_transactions, get_current_user, get_db, verify_password, create_access_token, verify_token
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


#CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2PasswordBearer for handling token-based authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.post("/users/", response_model=schemas.Token)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = crud.create_user(db, user)
        token = create_access_token(data={"user_id": db_user.id, "username": db_user.username, "sub": db_user.email})
        return {"token": token, "token_type":"bearer"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/Transactions")
def get_transactions(request: Request, token: Optional[str] = None, db: Session = Depends(get_db)):
    if token is None:
        token = request.headers.get("Authorization").split(" ")[1]
    user = verify_token(token)
    return crud.get_transactions_by_user(db, user)

@app.put("/transaction/{transaction_id}")
def update_Transaction(request: Request, transaction_id: int, update_request: schemas.UpdateCategoryRequest, token: Optional[str] = None, db: Session = Depends(get_db)):
    if token is None:
        token = request.headers.get("Authorization").split(" ")[1]
    user = verify_token(token)
    return crud.update_transaction(db, user, transaction_id, update_request.category_id)

@app.get("/user", response_model=schemas.UserResponse)
def get_user(request: Request, token: Optional[str] = None, db: Session = Depends(get_db)):
    if token is None:
        token = request.headers.get("Authorization").split(" ")[1]
    user = verify_token(token)
    return crud.get_user_by_id(db, user)

@app.get("/expenses/monthly-total")
def get_monthly_total(request: Request, year: Optional[int] = None,  month: Optional[int] = None, token: Optional[str] = None, db: Session = Depends(get_db)):
    if token is None:
        token = request.headers.get("Authorization").split(" ")[1]
    user = verify_token(token)
    return crud.get_mothly_expenses_by_user(db, user, year, month)

@app.get("/expenses/monthly-categories")
def get_monthly_categories(request: Request, year:int, month:int, token: Optional[str] = None, db: Session = Depends(get_db)):
    if token is None:
        token = request.headers.get("Authorization").split(" ")[1]
    user = verify_token(token)
    return crud.get_monthly_categorized_expenses_by_user(db, user, year, month)

@app.get("/incomes/monthly-total")
def get_monthly_total_income(request: Request, token: Optional[str] = None, db: Session = Depends(get_db)):
    if token is None:
        token = request.headers.get("Authorization").split(" ")[1]
    user = verify_token(token)
    return crud.get_monthly_total_income_by_user(db, user)

@app.get("/incomes")
def get_incomes(request: Request, token: Optional[str] = None, db: Session = Depends(get_db)):
    if token is None:
        token = request.headers.get("Authorization").split(" ")[1]
    user = verify_token(token)
    return crud.get_monthly_incomes_by_user(db, user)

@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db : Session = Depends(get_db)):
    # Retrieve user form database
    db_user = crud.get_user_by_email(db, email=user.email)

    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail = "Incorrect username or password",
        )
    # Generate a JWT token
    token = create_access_token(data={"sub": db_user.email, "user_id": db_user.id, "username": db_user.username})
    return {"token": token, "token_type": "bearer"}

@app.post("/upload/")
def upload_transactions(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    token: Optional[str] = None,
):
    if token is None:
        token = request.headers.get("Authorization").split(" ")[1]
    user = verify_token(token)

    content = file.file.read().decode("utf-8")
    
    try:
        transactions = process_and_save_transactions(content, user.id)
    except ValueError as e:
        return {"error": str(e)}

    # Save to DB
    transaction_ids = crud.save_transactions(db, transactions)

    # Start AI prediction task
    process_transactions_task.delay(transaction_ids)

    return {"message": "Transactions uploaded", "count": len(transactions)}
