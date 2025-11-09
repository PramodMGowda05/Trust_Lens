import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import warnings
from loguru import logger

from ml.embeddings import Embedder
from ml.features import build_behavioral_features, build_temporal_features, assemble_feature_matrix
from ml.preprocess import clean_text
from config import settings

# Suppress specific warnings from sklearn
warnings.filterwarnings("ignore", category=UserWarning, module='sklearn.feature_extraction.text')

# Define paths
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODELS_DIR = settings.MODELS_DIR
DATA_PATH = os.path.join(DATA_DIR, "sample_reviews.csv")
EMBEDDER_PATH = os.path.join(MODELS_DIR, "embedder.joblib")
CLF_PATH = os.path.join(MODELS_DIR, "clf.joblib")

def train_model():
    """
    This function loads the sample dataset, trains a text embedder and a classifier,
    evaluates the model, and saves the trained artifacts to the /models directory.
    """
    # --- 1. Load and Prepare Data ---
    logger.info(f"Loading data from {DATA_PATH}...")
    if not os.path.exists(DATA_PATH):
        logger.error(f"Data file not found at {DATA_PATH}. Please ensure it exists.")
        logger.error("You can create a 'sample_reviews.csv' file in the 'src/backend/ml_service/data/' directory.")
        logger.error("The CSV should have two columns: 'text' and 'label' (with values 'genuine' or 'fake').")
        return

    df = pd.read_csv(DATA_PATH)
    logger.info(f"Loaded {len(df)} reviews.")

    # Clean text and create a binary label (1 for 'fake', 0 for 'genuine')
    df["text_clean"] = df["text"].apply(clean_text)
    df["label_encoded"] = df["label"].apply(lambda x: 1 if x == "fake" else 0)

    # Split data into training and testing sets
    X = df[["text_clean", "text"]] # Pass both for feature generation
    y = df["label_encoded"]
    X_train_df, X_test_df, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
    
    logger.info(f"Training data size: {len(X_train_df)}")
    logger.info(f"Testing data size: {len(X_test_df)}")

    # --- 2. Train Text Embedder ---
    logger.info("Training the text embedder (TF-IDF Vectorizer)...")
    embedder = Embedder(backend=settings.EMBEDDINGS_BACKEND)
    # Fit the embedder ONLY on the training data to avoid data leakage
    embedder.fit(X_train_df["text_clean"])
    
    # --- 3. Assemble Feature Matrix ---
    logger.info("Building feature matrices for training and testing...")
    def create_feature_matrix(df, y_df):
        text_embeddings = embedder.transform(df["text_clean"])
        # Create dummy metadata for feature generation
        meta_df = pd.DataFrame({
            "text": df["text"],
            "verified": np.random.choice([True, False], size=len(df)),
            "account_age_days": np.random.randint(1, 1000, size=len(df))
        }, index=df.index)
        
        behavioral_features = build_behavioral_features(meta_df)
        temporal_features = build_temporal_features(meta_df)
        
        feature_matrix = assemble_feature_matrix(text_embeddings, behavioral_features, temporal_features)
        return feature_matrix

    X_train = create_feature_matrix(X_train_df, y_train)
    X_test = create_feature_matrix(X_test_df, y_test)

    # --- 4. Train Classifier ---
    logger.info("Training the classifier (Logistic Regression)...")
    clf = LogisticRegression(random_state=42, max_iter=500, class_weight='balanced')
    clf.fit(X_train, y_train)

    # --- 5. Evaluate Model ---
    logger.info("Evaluating the model...")
    y_pred = clf.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, target_names=["genuine", "fake"])
    cm = confusion_matrix(y_test, y_pred)

    logger.success(f"Model Evaluation Complete!\n")
    print("--- Evaluation Metrics ---")
    print(f"Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(report)
    print("\nConfusion Matrix:")
    print(cm)
    print("--------------------------")

    # --- 6. Save Model Artifacts ---
    logger.info(f"Saving embedder to {EMBEDDER_PATH}")
    joblib.dump(embedder, EMBEDDER_PATH)

    logger.info(f"Saving classifier to {CLF_PATH}")
    joblib.dump(clf, CLF_PATH)

    logger.success("Training complete. Model artifacts have been saved to the 'models' directory.")
    logger.info("You can now start the FastAPI service with 'uvicorn app:app --reload --port 5001'.")

if __name__ == "__main__":
    # Ensure the models directory exists before training
    os.makedirs(MODELS_DIR, exist_ok=True)
    train_model()
