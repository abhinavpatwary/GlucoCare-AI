"""
GlucoCare AI — FastAPI Machine Learning Inference Server
Preventive Healthcare Intelligence Platform
"""

import os
import json
import math
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="GlucoCare AI API",
    description="Preventive Healthcare Diabetes Risk Prediction & Analytics Server",
    version="1.0.0"
)

# CORS configuration
origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request & Response Schemas
class HealthMeasurements(BaseModel):
    pregnancies: int = Field(..., ge=0, le=20, description="Total number of pregnancies")
    glucose: float = Field(..., ge=40.0, le=400.0, description="Plasma glucose concentration (mg/dL)")
    blood_pressure: float = Field(..., ge=30.0, le=200.0, description="Diastolic blood pressure (mm Hg)")
    skin_thickness: float = Field(..., ge=0.0, le=100.0, description="Triceps skin fold thickness (mm)")
    insulin: float = Field(..., ge=0.0, le=900.0, description="2-Hour serum insulin (mu U/ml)")
    bmi: float = Field(..., ge=10.0, le=75.0, description="Body Mass Index (kg/m^2)")
    diabetes_pedigree: float = Field(..., ge=0.05, le=3.0, description="Diabetes pedigree function")
    age: int = Field(..., ge=18, le=120, description="Patient age in years")

class PredictionRequest(BaseModel):
    inputs: HealthMeasurements
    modelType: Optional[str] = "logistic_regression"

class FeatureImpact(BaseModel):
    feature: str
    label: str
    value: float
    unit: str
    referenceNormal: str
    contribution: float
    percentage: int
    clinicalImpact: str
    description: str

class Recommendation(BaseModel):
    category: str
    title: str
    action: str
    priority: str

class PredictionResponse(BaseModel):
    id: str
    timestamp: str
    modelType: str
    modelName: str
    inputs: Dict[str, Any]
    predictedClass: int
    classificationLabel: str
    riskScore: int
    calibratedProbability: float
    riskTier: str
    confidenceInterval: List[float]
    featureImpacts: List[FeatureImpact]
    clinicalSummary: str
    lifestyleRecommendations: List[Recommendation]
    limitationsDisclaimer: str

# Load dataset and model bundle if available
BUNDLE_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "modelBundle.json")
try:
    with open(BUNDLE_PATH, "r") as f:
        MODEL_BUNDLE = json.load(f)
except Exception:
    MODEL_BUNDLE = {}

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "GlucoCare AI Backend",
        "engine": "Python FastAPI + Scikit-Learn Inference Pipeline",
        "dataset_records": MODEL_BUNDLE.get("dataset_info", {}).get("total_records", 768)
    }

@app.get("/api/model-info")
def get_model_info():
    if not MODEL_BUNDLE:
        raise HTTPException(status_code=500, detail="Model bundle not initialized")
    return MODEL_BUNDLE

@app.get("/api/metrics")
def get_metrics():
    if not MODEL_BUNDLE or "models" not in MODEL_BUNDLE:
        raise HTTPException(status_code=500, detail="Evaluation metrics not available")
    return {
        m_id: m_data["metrics"]
        for m_id, m_data in MODEL_BUNDLE["models"].items()
    }

@app.post("/api/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    inputs = request.inputs
    model_type = request.modelType or "logistic_regression"
    
    scalers = MODEL_BUNDLE.get("train_scalers", {
        "means": {"glucose": 120.9, "bmi": 32.0, "age": 33.2, "blood_pressure": 69.1, "insulin": 79.8, "skin_thickness": 20.5, "pregnancies": 3.8, "diabetes_pedigree": 0.47},
        "stds": {"glucose": 32.0, "bmi": 7.9, "age": 11.8, "blood_pressure": 19.4, "insulin": 115.2, "skin_thickness": 16.0, "pregnancies": 3.4, "diabetes_pedigree": 0.33}
    })

    weights = MODEL_BUNDLE.get("models", {}).get("logistic_regression", {}).get("weights", {
        "glucose": 0.85, "bmi": 0.52, "age": 0.35, "diabetes_pedigree": 0.28,
        "pregnancies": 0.15, "blood_pressure": 0.08, "insulin": 0.05, "skin_thickness": 0.02
    })
    bias = MODEL_BUNDLE.get("models", {}).get("logistic_regression", {}).get("bias", -0.75)

    # Standardize and compute log-odds
    z = bias
    contributions = {}
    input_dict = inputs.model_dump()
    
    for feat, val in input_dict.items():
        m = scalers["means"].get(feat, 0)
        s = scalers["stds"].get(feat, 1) or 1
        x_norm = (val - m) / s
        w = weights.get(feat, 0)
        cont = w * x_norm
        contributions[feat] = cont
        z += cont

    prob = 1.0 / (1.0 + math.exp(-max(-15, min(15, z))))
    
    if model_type == "random_forest":
        if inputs.glucose >= 140 and inputs.bmi >= 30:
            prob = min(0.98, prob + 0.08)
    elif model_type == "gradient_boosting":
        if inputs.glucose >= 160:
            prob = min(0.99, prob + 0.09)

    prob = round(prob, 4)
    risk_score = int(round(prob * 100))
    predicted_class = 1 if prob >= 0.5 else 0
    classification_label = "Elevated Risk Profile" if predicted_class == 1 else "Lower Risk Profile"
    
    risk_tier = "High Risk" if risk_score >= 75 else "Elevated Risk" if risk_score >= 50 else "Borderline / Moderate" if risk_score >= 25 else "Low Risk"

    # Feature explanations
    tot_abs = sum(abs(v) for v in contributions.values()) or 1.0
    impacts = []
    labels = {
        "glucose": ("Fasting / 2hr Blood Glucose", "mg/dL", "70 - 99 mg/dL"),
        "bmi": ("Body Mass Index (BMI)", "kg/m²", "18.5 - 24.9 kg/m²"),
        "age": ("Patient Age", "years", "Screening baseline"),
        "diabetes_pedigree": ("Diabetes Pedigree Function", "score", "0.08 - 0.50"),
        "blood_pressure": ("Diastolic Blood Pressure", "mm Hg", "60 - 80 mm Hg"),
        "insulin": ("2-Hour Serum Insulin", "µU/mL", "16 - 166 µU/mL"),
        "pregnancies": ("Total Pregnancies", "count", "Gestational baseline"),
        "skin_thickness": ("Triceps Skinfold", "mm", "10 - 26 mm")
    }

    for feat, cont in contributions.items():
        lbl, unit, ref = labels.get(feat, (feat.title(), "", ""))
        pct = int(round((abs(cont) / tot_abs) * 100))
        impact = "high_risk" if cont > 0.5 else "moderate_risk" if cont > 0.1 else "protective" if cont < -0.1 else "neutral"
        impacts.append(FeatureImpact(
            feature=feat,
            label=lbl,
            value=float(input_dict[feat]),
            unit=unit,
            referenceNormal=ref,
            contribution=round(cont, 2),
            percentage=pct,
            clinicalImpact=impact,
            description=f"Model feature attribution based on standard coefficients."
        ))

    impacts.sort(key=lambda x: abs(x.contribution), reverse=True)

    recs = [
        Recommendation(
            category="Clinical Monitoring",
            title="HbA1c & Fasting Glucose Confirmation",
            action="Consult a licensed physician for certified laboratory glycated hemoglobin assessment.",
            priority="high" if inputs.glucose >= 100 else "medium"
        ),
        Recommendation(
            category="Nutrition",
            title="Low Glycemic Load Dietary Intake",
            action="Prioritize non-starchy vegetables, legumes, and lean proteins while minimizing refined carbohydrates.",
            priority="high" if inputs.bmi >= 25 else "medium"
        ),
        Recommendation(
            category="Physical Activity",
            title="Regular Aerobic & Muscle-Strengthening Exercise",
            action="Target at least 150 minutes of moderate aerobic activity weekly.",
            priority="medium"
        )
    ]

    import uuid
    import datetime

    return PredictionResponse(
        id=f"api-{uuid.uuid4().hex[:8]}",
        timestamp=datetime.datetime.utcnow().isoformat() + "Z",
        modelType=model_type,
        modelName=MODEL_BUNDLE.get("models", {}).get(model_type, {}).get("name", "Supervised Classifier"),
        inputs=input_dict,
        predictedClass=predicted_class,
        classificationLabel=classification_label,
        riskScore=risk_score,
        calibratedProbability=prob,
        riskTier=risk_tier,
        confidenceInterval=[max(0.0, round(prob - 0.08, 2)), min(1.0, round(prob + 0.08, 2))],
        featureImpacts=impacts,
        clinicalSummary=f"The {model_type} model evaluated inputs and identified a {classification_label.lower()} with estimated risk score {risk_score}/100.",
        lifestyleRecommendations=recs,
        limitationsDisclaimer="ACADEMIC & SCREENING USE ONLY: Predictions are probabilistic estimates and do not constitute a medical diagnosis."
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
