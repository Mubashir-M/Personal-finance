from app.celery_worker import celery_app
from app.database import SessionLocal
from app.crud import process_transactions

@celery_app.task
def process_transactions_task(transaction_ids):
    """Celery task to process transactions asynchronously."""
    db = SessionLocal()
    try:
        process_transactions(db, transaction_ids)
    finally:
        db.close()
