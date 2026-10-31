import csv
import json

records = []
with open("backend/diabetes_data.csv", "r") as f:
    reader = csv.DictReader(f)
    for row in reader:
        records.append({
            "id": int(row["id"]),
            "pregnancies": int(row["pregnancies"]),
            "glucose": float(row["glucose"]),
            "blood_pressure": float(row["blood_pressure"]),
            "skin_thickness": float(row["skin_thickness"]),
            "insulin": float(row["insulin"]),
            "bmi": float(row["bmi"]),
            "diabetes_pedigree": float(row["diabetes_pedigree"]),
            "age": int(row["age"]),
            "outcome": int(row["outcome"])
        })

ts_content = f"""/**
 * Canonical Diabetes Benchmark Dataset
 * Provenance: National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK)
 * 768 Patient Records, 8 Clinical Predictors, 1 Binary Diagnostic Outcome
 */

export interface PatientRecord {{
  id: number;
  pregnancies: number;
  glucose: number;
  blood_pressure: number;
  skin_thickness: number;
  insulin: number;
  bmi: number;
  diabetes_pedigree: number;
  age: number;
  outcome: 0 | 1;
}}

export const CLINICAL_DATASET: PatientRecord[] = {json.dumps(records, indent=2)};
"""

with open("src/data/clinicalRecords.ts", "w") as f:
    f.write(ts_content)

print(f"Exported {len(records)} records to src/data/clinicalRecords.ts")
