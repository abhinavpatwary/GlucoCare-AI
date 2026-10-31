"""
GlucoCare AI — Model Training & Evaluation Pipeline
Academic Project Submission Script
Trains Logistic Regression, Random Forest, and Gradient Boosting on diabetes_data.csv
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve, precision_recall_curve
)
import pickle

def main():
    print("=" * 60)
    print("GlucoCare AI — Machine Learning Pipeline Execution")
    print("=" * 60)

    csv_path = os.path.join(os.path.dirname(__file__), "diabetes_data.csv")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}")

    df = pd.read_csv(csv_path)
    print(f"Loaded dataset: {df.shape[0]} records, {df.shape[1]} columns")

    feature_cols = [
        "pregnancies", "glucose", "blood_pressure", "skin_thickness",
        "insulin", "bmi", "diabetes_pedigree", "age"
    ]
    target_col = "outcome"

    X = df[feature_cols]
    y = df[target_col]

    # Preprocessing: Stratified 80/20 train/test split with fixed random seed 42
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Training set: {len(X_train)} samples | Test set: {len(X_test)} samples")

    # Fit standard scaler on train set only to prevent data leakage
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Initialize Classifiers
    models = {
        "logistic_regression": LogisticRegression(
            C=1.0, max_iter=1000, random_state=42, solver="lbfgs"
        ),
        "random_forest": RandomForestClassifier(
            n_estimators=100, max_depth=5, min_samples_split=4, random_state=42
        ),
        "gradient_boosting": GradientBoostingClassifier(
            n_estimators=80, learning_rate=0.1, max_depth=3, random_state=42
        )
    }

    results = {}
    fitted_models = {}

    for name, clf in models.items():
        print(f"\nTraining {name}...")
        clf.fit(X_train_scaled, y_train)
        fitted_models[name] = clf

        # Test set evaluation
        y_pred = clf.predict(X_test_scaled)
        y_prob = clf.predict_proba(X_test_scaled)[:, 1]

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_prob)
        cm = confusion_matrix(y_test, y_pred)

        fpr, tpr, _ = roc_curve(y_test, y_prob)

        print(f"Accuracy:  {acc:.4f}")
        print(f"Precision: {prec:.4f}")
        print(f"Recall:    {rec:.4f}")
        print(f"F1-Score:  {f1:.4f}")
        print(f"ROC-AUC:   {auc:.4f}")
        print(f"Confusion Matrix:\n{cm}")

        results[name] = {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(auc), 4),
            "confusion_matrix": {
                "true_negative": int(cm[0, 0]),
                "false_positive": int(cm[0, 1]),
                "false_negative": int(cm[1, 0]),
                "true_positive": int(cm[1, 1])
            }
        }

    # Save models & scaler bundle
    artifacts_dir = os.path.join(os.path.dirname(__file__), "artifacts")
    os.makedirs(artifacts_dir, exist_ok=True)

    with open(os.path.join(artifacts_dir, "models.pkl"), "wb") as f:
        pickle.dump({"models": fitted_models, "scaler": scaler}, f)

    with open(os.path.join(artifacts_dir, "evaluation_metrics.json"), "w") as f:
        json.dump(results, f, indent=2)

    print("\nSaved artifacts to backend/artifacts/")
    print("=" * 60)
    print("Pipeline training completed successfully.")
    print("=" * 60)

if __name__ == "__main__":
    main()
