start:
	brew services start postgresql@14
	brew services start redis
	source myenv/bin/activate && export $(grep -v '^#' .env | xargs) && \
	celery -A app.tasks worker --loglevel=info --pool=solo & \
	uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

stop:
	brew services stop postgresql@14
	brew services stop redis
	- pkill -f "celery -A app.tasks worker" || true
	- pkill -f "uvicorn app.main:app" || true