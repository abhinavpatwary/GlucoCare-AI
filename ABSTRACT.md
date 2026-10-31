# PROJECT ABSTRACT: GLUCOCARE AI
## AI-Based Diabetes Prediction and Preventive Healthcare Intelligence System

**Domain:** Healthcare Informatics / Artificial Intelligence / Applied Machine Learning  
**Project Category:** Academic Minor / Major Engineering Project Exhibition  

### Abstract
Diabetes mellitus continues to escalate as one of the most pervasive chronic metabolic disorders globally, causing severe microvascular and macrovascular complications including nephropathy, retinopathy, and cardiovascular disease when undetected. Early clinical screening and proactive risk stratification can prevent or substantially postpone diabetes onset through targeted lifestyle modifications.

This project introduces **GlucoCare AI**, an end-to-end, production-grade clinical intelligence web application designed to evaluate patient biometric parameters and generate interpretable diabetes risk predictions. The predictive modeling architecture leverages three distinct supervised learning classifiers:
1. **L2-Regularized Logistic Regression**, establishing a calibrated, odds-ratio baseline.
2. **Random Forest Ensembles (100 Decision Trees)**, capturing complex non-linear feature interactions between glycemic status, adiposity, and hereditary burden.
3. **Gradient Boosting Classifier**, sequentially optimizing residual logistic loss for hard-to-classify edge distributions.

The model is trained on the National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK) benchmark dataset consisting of 768 patient observations across 8 clinical variables. Data preprocessing addresses physiologically implausible zero values through median imputation and enforces an 80/20 stratified train-test partition with fixed random seeding to prevent data leakage. On the hold-out test set, the Random Forest model achieves an **Accuracy of 78.6%** and an area under the receiver operating characteristic curve (**ROC-AUC) of 84.1%**.

To overcome the traditional opacity of machine-learning models in clinical contexts, GlucoCare AI incorporates an **Explainable AI (XAI)** attribution layer that decomposes standardized model log-odds into directional, quantified feature contributions. The platform features an interactive **Counterfactual "What-If" Risk Simulator**, an **Epidemiological Dataset Exploration Dashboard** featuring bivariate scatter plots and Pearson correlation heatmaps, an **Interactive Confusion Matrix** with dynamic decision threshold tuning for sensitivity optimization, and an automated **Client-Side PDF Clinical Summary Dossier Generator**. All session predictions respect privacy principles by avoiding persistent Protected Health Information (PHI) storage.
