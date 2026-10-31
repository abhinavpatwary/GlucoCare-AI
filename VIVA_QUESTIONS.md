# VIVA VOCE DEFENSE & TECHNICAL QUESTIONS
## GlucoCare AI: AI-Based Diabetes Prediction System

This document contains 25 questions and technically rigorous answers commonly asked by university evaluation panels, faculty reviewers, and technical judges during minor/major project defense.

---

### Category 1: Machine Learning Fundamentals & Architecture

#### Q1: What is the primary objective of your system, and how is it framed as an ML problem?
**Answer:** The objective is early, non-invasive risk screening of individuals for Type 2 diabetes based on 8 standardized biomarkers. It is framed as a supervised binary classification task: given a feature vector $\mathbf{x} \in \mathbb{R}^8$, the model maps $\mathbf{x} \to \hat{y} \in \{0, 1\}$ and outputs a calibrated probability $P(Y=1|\mathbf{X}=\mathbf{x})$ denoting the likelihood of elevated diabetic risk.

#### Q2: Why did you compare three distinct algorithms (Logistic Regression, Random Forest, Gradient Boosting)?
**Answer:**
1. **Logistic Regression (L2)** serves as an interpretable linear baseline with direct odds-ratio interpretation: $\log\left(\frac{p}{1-p}\right) = \beta_0 + \sum \beta_i x_i$.
2. **Random Forest** is an ensemble of 100 decorrelated bagging decision trees that mitigates variance and naturally models non-linear interactions (such as the compounding risk of elevated BMI and high blood glucose).
3. **Gradient Boosting** builds trees sequentially to minimize the logistic pseudo-residuals, optimizing sensitivity in boundary cases.
Comparing all three allows us to observe trade-offs between linear interpretability and ensemble predictive power.

#### Q3: Which model performed best and why?
**Answer:** The Random Forest Classifier achieved the superior overall performance with an **ROC-AUC of 0.841** and **Accuracy of 78.6%**, compared to Gradient Boosting (0.833 AUC, 77.3% Acc) and Logistic Regression (0.825 AUC, 77.3% Acc). Random Forest excelled because clinical biomarkers exhibit threshold effects (e.g. glucose exceeding 140 mg/dL triggers a non-linear jump in diabetic risk), which axis-aligned orthogonal decision tree splits capture much more effectively than a single linear hyperplane.

---

### Category 2: Preprocessing, Data Leakage & Feature Engineering

#### Q4: What is data leakage, and how did your pipeline prevent it?
**Answer:** Data leakage occurs when information outside the training dataset is inadvertently used to train the model, resulting in overly optimistic evaluation metrics. We strictly avoided data leakage by performing stratified train-test splitting (80% train / 20% test, seed=42) *before* fitting feature transformations. The mean ($\mu$) and standard deviation ($\sigma$) parameters of the `StandardScaler` were computed exclusively on the 614 training instances, and then applied to transform the 154 hold-out test samples and live inference inputs.

#### Q5: How did you handle missing values in the Pima Indians dataset?
**Answer:** In the raw NIDDK repository, values of 0 for physiological metrics like Glucose, Diastolic BP, Triceps Skinfold Thickness, 2-Hour Serum Insulin, and Body Mass Index are physiologically impossible in living humans (representing missing clinical measurements). We detected these zeroes, marked them as missing, and performed median imputation using the median values derived from the training set.

#### Q6: Why did you use StandardScaler instead of MinMaxScaler?
**Answer:** StandardScaler transforms features to have zero mean and unit variance ($z = \frac{x - \mu}{\sigma}$). It is preferred over Min-Max scaling for biomedical covariates because it does not compress the variance of the data in the presence of legitimate clinical outliers (such as an acute glucose spike of 199 mg/dL or an insulin value of 400 $\mu$U/mL). Furthermore, gradient descent and regularized logistic regression assume normally distributed inputs.

---

### Category 3: Model Evaluation, Metrics & Clinical Calibration

#### Q7: Why is Recall (Sensitivity) often more important than raw Accuracy in healthcare?
**Answer:** In medical screening, the costs of classification errors are asymmetric. A **False Negative (Type II error)** means failing to detect a diabetic or prediabetic individual, causing them to miss early lifestyle interventions and potentially leading to irreversible organ damage. A **False Positive (Type I error)** only results in an inexpensive, non-invasive confirmatory blood test (HbA1c). Thus, maximizing Recall ($\frac{TP}{TP + FN}$) to minimize False Negatives is of paramount clinical importance.

#### Q8: Explain what the ROC Curve and ROC-AUC measure.
**Answer:** The Receiver Operating Characteristic (ROC) curve plots the True Positive Rate (Sensitivity) on the Y-axis against the False Positive Rate ($1 - \text{Specificity}$) on the X-axis across all possible discrimination thresholds from 0.0 to 1.0. The Area Under the Curve (ROC-AUC) represents the probability that the classifier will rank a randomly chosen positive instance higher than a randomly chosen negative instance. Our model's ROC-AUC of 0.841 demonstrates strong discriminative capability regardless of the threshold chosen.

#### Q9: What happens when you adjust the decision threshold from 0.50 to 0.35?
**Answer:** Lowering the decision threshold means the model flags a patient as "Elevated Risk" even with a lower estimated probability. In our interactive Confusion Matrix simulator:
- True Positives increase (e.g. from 38 to 46).
- False Negatives decrease dramatically (e.g. from 16 to 8), elevating Recall to $\approx 85\%$.
- False Positives increase (e.g. from 17 to 32), slightly lowering Precision.
This is the standard trade-off adopted in population-level preventive health screening.

---

### Category 4: Explainable AI (XAI) & Ethical Considerations

#### Q10: How does your Explainable AI (XAI) feature attribution work?
**Answer:** For each patient evaluation, we calculate feature-level contributions to the model's log-odds: $\text{Impact}_i = w_i \cdot \left(\frac{x_i - \mu_i}{\sigma_i}\right)$. Positive values indicate risk-elevating factors (e.g., high glucose or elevated BMI), while negative values indicate protective factors (e.g., healthy BMI or low age). These contributions are displayed in an accessible, color-coded waterfall format alongside normal reference baselines, answering *why* a particular risk tier was assigned.

#### Q11: What is a Counterfactual "What-If" explanation?
**Answer:** Counterfactual explanations answer the question: *"What is the minimal change in input biomarkers that would flip the model's prediction from elevated risk to low risk?"* Our simulator allows users to adjust modifiable covariates (such as reducing BMI by 5 points or decreasing fasting glucose by 25 mg/dL) and instantly observe the recalculated risk score, providing actionable motivational feedback for preventive lifestyle changes.

#### Q12: What are the demographic limitations of the underlying dataset?
**Answer:** The dataset comprises female Pima Indian patients collected by NIDDK. Because this population possesses high genetic predisposition to metabolic disease, the absolute baseline risk cannot be naively generalized to all global populations without localized recalibration or transfer learning. The application explicitly discloses this limitation in the interface and PDF reports.

#### Q13: How does your application protect Patient Health Information (PHI)?
**Answer:** In adherence to privacy-by-design standards (HIPAA/GDPR compliance), the application does not store personally identifiable patient information in databases. Prediction history is maintained strictly in volatile, client-side session storage that is destroyed when the browser session terminates, and clear-history controls are provided.
