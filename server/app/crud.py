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
    new_transactions = [
        Transaction(
            amount=t.amount,
            merchant=t.merchant,
            description = t.description,
            date = t.date,
            user_id = t.user_id,
        )
        for t in transactions
    ]

    db.add_all(new_transactions)
    db.commit()
    for transaction in new_transactions:
        db.refresh(transaction)


    return [t.id for t in new_transactions]

def get_mothly_expenses_by_user(db, user, year, month):
    total_expenses = db.query(func.sum(Transaction.amount).label('total')) \
    .filter(Transaction.user_id == user.id) \
    .filter(func.extract('year', Transaction.date) == year) \
    .filter(func.extract('month', Transaction.date) == month) \
    .filter(Transaction.amount < 0) \
    .scalar()
    return  total_expenses if total_expenses else 0

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
            
            # Prepare AI input features
            transaction_features = {
                "Amount": transaction.amount,
                "Merchant": transaction.merchant,
                "day_of_week": transaction.date.weekday()
            }

            # Handle 'Amount' - Scaling
            # Apply the same scaling transformation that was applied during training
            transaction_features_scaled = transaction_features.copy()
            transaction_features_scaled['Amount'] = scaler.transform([[transaction_features['Amount']]])[0][0]  # Apply scaling

            # 'Merchant' will be passed as a categorical feature to CatBoost
            transaction_features_scaled['Merchant'] = transaction_features['Merchant']  # Just keep it as is

            # Get AI prediction
            predicted_category_index = predict_category(transaction_features_scaled)[0][0]
            predicted_category_name = encoder.inverse_transform([predicted_category_index])[0]
            logger.info(f"Predicted category: {predicted_category_name}")
            
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
1. Refactor code. Move transformation of precition from number to name, to ai_model.py
2. Update confidence score to be output of model
'''