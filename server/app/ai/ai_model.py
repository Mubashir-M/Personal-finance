import pandas as pd
import pickle
import os
import catboost

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ai", "CatBoost_model.pkl")

# Load the model with error handling
def load_model():
    try:
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)
    except FileNotFoundError:
        print(f"Model file not found at {MODEL_PATH}")
        return None
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

# Initialize model
model = load_model()

# Prediction function
def predict_category(transaction_features):   
    if model is None:
        raise RuntimeError("Model not loaded. Cannot make predictions.")
    return model.predict(transaction_features)