# EVALUATOR DEMONSTRATION SCRIPT
## GlucoCare AI: 5-Minute Exhibition Walkthrough

Use this script during minor/major project evaluation or laboratory exhibitions to systematically showcase the key capabilities of the application.

---

### Step 1: Landing Dashboard & Context (45 seconds)
1. **Show the Overview page:**
   - Point out the product title: **GlucoCare AI — Preventive Health Intelligence**.
   - Direct attention to the live summary cards:
     - 768 total records from the NIDDK benchmark dataset.
     - Selected baseline model: Random Forest Classifier (100 estimators).
     - Validated performance: **84.1% ROC-AUC** on hold-out test data.
   - Explain the clinical motivation: *"Traditional screening is often invasive and delayed. GlucoCare AI uses 8 accessible biomarkers to assess risk early and explain the underlying factors."*

---

### Step 2: Risk Assessment & Demo Presets (1 minute)
1. **Navigate to the Risk Assessment module:**
   - Show the 4 interactive 1-click presets:
     - *Healthy Adult Profile* (Low Risk)
     - *Pre-Diabetic Impaired Fasting* (Borderline Profile)
     - *Elevated Glycemic Risk* (Elevated Profile)
     - *Metabolic Syndrome Profile* (High Risk)
   - Click the **"Pre-Diabetic Impaired Fasting"** preset.
   - Show how the form inputs auto-populate:
     - Glucose: 118 mg/dL
     - BMI: 28.2 kg/m²
     - Age: 44 years
     - Blood Pressure: 78 mm Hg
   - Point out the field tooltips and clinical normal range indicators.
   - Click the **"Calculate Diabetes Risk Profile"** button.
   - Highlight the animated inference steps (standardizing covariates $\to$ evaluating tree splits $\to$ computing XAI feature attribution).

---

### Step 3: Explainable AI & "What-If" Simulation (1.5 minutes)
1. **Show the Prediction Results Dossier:**
   - Highlight the **Semi-Circular Risk Gauge** showing the statistical score (e.g., ~48% Borderline Risk) and the 95% confidence interval.
   - Point out the responsible medical phrasing (*"The model estimated a borderline risk profile"* rather than making a diagnostic claim).
2. **Explain the SHAP-style Feature Impact Breakdown:**
   - Show the waterfall impact cards.
   - Point out how Glucose (+log-odds) and BMI (+log-odds) increase risk, while Diastolic BP acts as a neutral or stabilizing factor.
3. **Demonstrate the Counterfactual "What-If" Simulator:**
   - Slide the **BMI slider** down from `28.2` to `23.5` (healthy weight).
   - Show the immediate recalculation: Risk drops by ~12 percentage points into the Low Risk tier.
   - Highlight: *"This demonstrates actionable clinical utility: patients can see the quantitative benefit of realistic lifestyle modifications."*

---

### Step 4: PDF Clinical Dossier & Session History (45 seconds)
1. **Click "Download PDF Dossier":**
   - Open the generated PDF file.
   - Show the vector header, patient reference ID, biomarker input table, feature impact table, and prominent amber Medical Disclaimer banner.
2. **Navigate to "Prediction History":**
   - Show that the evaluation was logged in volatile session storage.
   - Select two evaluations and click **"Compare (2 Selected)"** to display the side-by-side comparison modal.

---

### Step 5: Model Evaluation & Threshold Tuning (1 minute)
1. **Navigate to "Model Performance":**
   - Show the benchmark comparison table comparing **Logistic Regression, Random Forest, and Gradient Boosting**.
   - Show the multi-model **ROC Curves** with ROC-AUC scores.
2. **Demonstrate Interactive Threshold Tuning:**
   - Locate the **Decision Threshold Slider** at the bottom.
   - Drag the slider from `0.50` down to `0.35`.
   - Show how Sensitivity/Recall increases, reducing False Negatives from 16 down to 8.
   - Explain: *"In population health screening, missing a diabetic patient (False Negative) is far more dangerous than sending a healthy patient for a confirmatory blood test (False Positive). Hence, clinical screening prioritizes high recall."*

---

### Step 6: Fullscreen Exhibition Deck (30 seconds)
1. Click the **"Exhibition Deck"** button in the top navigation bar.
2. Show the slides summarizing the project architecture, algorithms, and ethical boundaries.
3. Conclude by taking faculty questions from the **Viva Voce** tab in the About section.
