from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import pandas as pd
from app import models
from app.database import engine
from app.models import Base
import app.schemas as schemas
import app.crud as crud
from app.tasks import process_transactions_task
import io
from app.utils import translate_columns, get_current_user, get_db, verify_password, create_access_token
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


#CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        token = create_access_token(data={"sub": db_user.email})
        return {"token": token, "token_type":"bearer"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

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
    token = create_access_token(data={"sub": db_user.email})
    return {"token": token, "token_type": "bearer"}

@app.post("/upload/")
def upload_transactions(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    content = file.file.read().decode("utf-8")
    df = pd.read_csv(io.StringIO(content), sep=";")

    #Rename columns
    df = translate_columns(df)

    # Ensure required columns exist
    required_columns = ["datetime", "Merchant", "description", "Amount"]
    for col in required_columns:
        if col not in df.columns:
            return {"error": f"Missing required column: {col}"}


    # Convert 'datetime' to actual datetime and extract day_of_week
    df["datetime"] = pd.to_datetime(df["datetime"], errors="coerce")
    df["day_of_week"] = df["datetime"].dt.day_name()

    # Convert 'Amount' column to float, replacing commas with dots
    df["Amount"] = df["Amount"].astype(str).str.replace(",", ".").astype(float)
    df["description"] = df["description"].fillna("No description")



    # Convert CSV data to list of TransactionsCreate objects
    transactions = [
        schemas.TransactionsCreate(
            amount=row["Amount"],
            merchant=row["Merchant"],
            description=row["description"],
            date=row["datetime"],
            user_id=current_user["id"],
        )
        for _, row in df.iterrows()
    ]

    # Save to DB
    transaction_ids = crud.save_transactions(db, transactions)

    # Start AI prediction task
    process_transactions_task.delay(transaction_ids)

    return {"message": "Transactions uploaded", "count": len(transactions)}
