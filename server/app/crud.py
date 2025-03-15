from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import User, Transaction, AIPrediction, Category
from app.schemas import UserCreate, TransactionsCreate
from passlib.context import CryptContext
from app.database import SessionLocal
from app.ai.ai_model import predict_category
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import OneHotEncoder
import joblib
from passlib.context import CryptContext
from datetime import datetime
from fastapi.encoders import jsonable_encoder
import uuid
from sqlalchemy.dialects.postgresql import insert
import pandas as pd

import logging

logger = logging.getLogger(__name__)

# Load the saved scaler (StandardScaler) from the .pkl file
scaler = joblib.load('app/ai/scaler.pkl')
encoder = joblib.load('app/ai/encoder.pkl')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(db: Session, user: UserCreate):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise ValueError("Email already registered")

    # Hash the password
    hashed_password = pwd_context.hash(user.password)

    # Create and save user
    new_user = User(username=user.username, email=user.email, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def save_transactions(db: Session, transactions: list[TransactionsCreate]):

    batch_id = uuid.uuid4()
    insert_statements = []

    for transaction in transactions:
        exists = db.query(Transaction).filter(
            Transaction.user_id == transaction.user_id,
            Transaction.amount == transaction.amount,
            Transaction.merchant == transaction.merchant,
            Transaction.date == transaction.date,
        ).first()

        if exists and exists.batch_id != str(batch_id):
            print("Transaction already exists.")
            continue

        stmt = insert(Transaction).values(
            batch_id=str(batch_id),
            user_id=transaction.user_id,
            amount=transaction.amount,
            merchant=transaction.merchant,
            description=transaction.description,
            date=transaction.date,
        )
        insert_statements.append(stmt)

    for stmt in insert_statements:
        db.execute(stmt)

    db.commit()

    inserted_ids = [t.id for t in db.query(Transaction.id).filter(Transaction.batch_id == batch_id).all()]
    return inserted_ids

def get_mothly_expenses_by_user(db, user, year, month):
    query = db.query(func.extract('year', Transaction.date).label('year'),
                              func.extract('month', Transaction.date).label('month'),
                              func.sum(Transaction.amount).label('total')) \
    .filter(Transaction.user_id == user.id) \
    .filter(Transaction.amount < 0) \
    
    if year:
        query = query.filter(func.extract('year', Transaction.date) == year)
    if month:
        query = query.filter(func.extract('month', Transaction.date) == month)
    
    query = query.group_by('year','month')
    result = query.all()

    result = [{"year": r.year, "month": r.month, "total": r.total} for r in result]
    result = sorted(result, key = lambda expense: (expense["year"], expense['month']), reverse=True)

    return  result if result else 0

def get_monthly_categorized_expenses_by_user(db, user, year, month):
    total_categorized_monthly_expense = db.query(
        Transaction.category_id,
        Category.name.label('category_name'),
        func.sum(Transaction.amount).label('total_expenses')
    ).join(Category, Category.id == Transaction.category_id) \
    .filter(Transaction.user_id == user.id) \
    .filter(func.extract('year', Transaction.date) == year) \
    .filter(func.extract('month', Transaction.date) == month) \
    .filter(Transaction.amount < 0) \
    .group_by(Transaction.category_id, Category.name) \
    .all()

    # Convert the result to a list of dictionaries
    result = [{"category_id": category_id, "category_name": category_name, "total_expenses": total_expenses}
              for category_id, category_name, total_expenses in total_categorized_monthly_expense]


    return jsonable_encoder(result) if result else 0

def get_or_create_category(db, category_name):
    """Fetch or create a category based on AI prediction."""
    category = db.query(Category).filter_by(name=category_name).first()
    
    if not category:
        category = Category(name=category_name)
        db.add(category)
        db.commit()  # Save new category to get ID
        db.refresh(category)  # Ensure we have the latest ID
    
    return category.id

def process_transactions(db, transaction_ids):
    """
    Fetch transactions, predict categories, and update database.
    """

    try:
        for transaction_id in transaction_ids:
            transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()

            if not transaction:
                continue  # Skip if transaction not found
            
            # Prepare AI input features as a pandas DataFrame
            transaction_features = pd.DataFrame({
                "Amount": [transaction.amount],
                "Merchant": [transaction.merchant],
                "day_of_week": [transaction.date.weekday()]
            })

            # Apply the scaling to feature "Amount"
            transaction_features['Amount'] = scaler.transform(transaction_features[['Amount']])

            # Get AI prediction
            predicted_category_index = predict_category(transaction_features)[0][0]
            predicted_category_name = encoder.inverse_transform([predicted_category_index])[0]
            
            # Convert category name to category ID
            predicted_category_id = get_or_create_category(db, predicted_category_name)

            confidence_score = 0.9  # Placeholder, unless AI returns confidence

            # Check if an AI prediction already exists
            existing_prediction = db.query(AIPrediction).filter(AIPrediction.transaction_id == transaction_id).first()

            if not existing_prediction:
                ai_prediction = AIPrediction(
                    transaction_id=transaction_id,
                    predicted_category_id=predicted_category_id,
                    confidence_score=confidence_score
                )
                db.add(ai_prediction)

            # Update the transaction table with the AI-predicted category
            transaction.category_id = predicted_category_id
            db.commit()

    except Exception as e:
        db.rollback()
        logger.error(f"Error processing transactions: {e}")
    finally:
        db.close()
'''
1. Update confidence score to be output of model
'''