# backend/database.py
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_FILE = Path(__file__).resolve().parent / "database.json"

DEFAULT_DATA = {
    "stats": {
        "total_analyses": 248,
        "glaucoma_detected": 72,
        "normal_cases": 176,
        "avg_processing_time": "3.2s",
        "glaucoma_percentage": 28.9,
        "normal_percentage": 71.1,
        "monthly_trend": [
            {"month": "Jan", "total": 28, "glaucoma": 8},
            {"month": "Feb", "total": 35, "glaucoma": 10},
            {"month": "Mar", "total": 42, "glaucoma": 12},
            {"month": "Apr", "total": 38, "glaucoma": 11},
            {"month": "May", "total": 49, "glaucoma": 14},
            {"month": "Jun", "total": 56, "glaucoma": 17}
        ]
    },
    "history": [
        {
            "id": 1,
            "patient_id": "P001",
            "patient_name": "John Doe",
            "age": 58,
            "gender": "Male",
            "eye": "OD (Right Eye)",
            "filename": "P001_retina.jpg",
            "result": "Glaucoma",
            "confidence": 92.4,
            "confidence_formatted": "92.4%",
            "risk_level": "High",
            "cdr": 0.78,
            "vcdr_formatted": "0.78",
            "date_time": "24 Oct 2026 10:32 AM",
            "timestamp": "2026-10-24T10:32:00",
            "image_thumb": "/assets/samples/glaucoma_advanced.jpg",
            "key_findings": [
                "Enlarged optic cup to disc ratio (VCDR = 0.78)",
                "Thinning of neuroretinal rim in superior/inferior poles",
                "Possible optic nerve damage and neural rim loss",
                "Features consistent with glaucoma"
            ],
            "subtitle": "The model predicts a high likelihood of glaucoma."
        },
        {
            "id": 2,
            "patient_id": "P002",
            "patient_name": "Ravi Kumar",
            "age": 45,
            "gender": "Male",
            "eye": "OS (Left Eye)",
            "filename": "P002_retina.jpg",
            "result": "Normal",
            "confidence": 87.6,
            "confidence_formatted": "87.6%",
            "risk_level": "Low",
            "cdr": 0.42,
            "vcdr_formatted": "0.42",
            "date_time": "24 Oct 2026 09:15 AM",
            "timestamp": "2026-10-24T09:15:00",
            "image_thumb": "/assets/samples/normal_retina.jpg",
            "key_findings": [
                "Normal optic cup to disc ratio (VCDR = 0.42 < 0.60)",
                "Intact neuroretinal rim adhering to ISNT pattern",
                "Optic nerve head structure within healthy physiological limits",
                "No evident signs of glaucomatous optic disc damage"
            ],
            "subtitle": "The optic disc and cup parameters appear within normal healthy limits."
        },
        {
            "id": 3,
            "patient_id": "P003",
            "patient_name": "Meena S",
            "age": 62,
            "gender": "Female",
            "eye": "OD (Right Eye)",
            "filename": "P003_retina.jpg",
            "result": "Glaucoma",
            "confidence": 89.1,
            "confidence_formatted": "89.1%",
            "risk_level": "High",
            "cdr": 0.74,
            "vcdr_formatted": "0.74",
            "date_time": "23 Oct 2026 04:21 PM",
            "timestamp": "2026-10-23T16:21:00",
            "image_thumb": "/assets/samples/glaucoma_early.jpg",
            "key_findings": [
                "Enlarged optic cup to disc ratio (VCDR = 0.74)",
                "Moderate neuroretinal rim thinning detected",
                "Deep excavation of the optic cup",
                "Features consistent with glaucoma"
            ],
            "subtitle": "The model predicts a high likelihood of glaucoma."
        },
        {
            "id": 4,
            "patient_id": "P004",
            "patient_name": "Arun N",
            "age": 39,
            "gender": "Male",
            "eye": "OS (Left Eye)",
            "filename": "P004_retina.jpg",
            "result": "Normal",
            "confidence": 91.3,
            "confidence_formatted": "91.3%",
            "risk_level": "Low",
            "cdr": 0.38,
            "vcdr_formatted": "0.38",
            "date_time": "23 Oct 2026 11:08 AM",
            "timestamp": "2026-10-23T11:08:00",
            "image_thumb": "/assets/samples/normal_retina.jpg",
            "key_findings": [
                "Normal cup-to-disc ratio (VCDR = 0.38)",
                "Robust neuroretinal rim preservation",
                "Healthy vascular branching architecture",
                "No glaucomatous neuropathy features"
            ],
            "subtitle": "The optic disc and cup parameters appear within normal healthy limits."
        },
        {
            "id": 5,
            "patient_id": "P005",
            "patient_name": "Priya M",
            "age": 53,
            "gender": "Female",
            "eye": "OD (Right Eye)",
            "filename": "P005_retina.jpg",
            "result": "Glaucoma",
            "confidence": 88.7,
            "confidence_formatted": "88.7%",
            "risk_level": "High",
            "cdr": 0.72,
            "vcdr_formatted": "0.72",
            "date_time": "22 Oct 2026 02:14 PM",
            "timestamp": "2026-10-22T14:14:00",
            "image_thumb": "/assets/samples/sample4.jpg",
            "key_findings": [
                "Elevated cup to disc ratio (VCDR = 0.72)",
                "Inferior rim notch observed",
                "Cup asymmetry and excavation detected",
                "Features consistent with glaucoma"
            ],
            "subtitle": "The model predicts a high likelihood of glaucoma."
        },
        {
            "id": 6,
            "patient_id": "P006",
            "patient_name": "Vikram R",
            "age": 48,
            "gender": "Male",
            "eye": "OD (Right Eye)",
            "filename": "P006_retina.jpg",
            "result": "Normal",
            "confidence": 85.2,
            "confidence_formatted": "85.2%",
            "risk_level": "Low",
            "cdr": 0.45,
            "vcdr_formatted": "0.45",
            "date_time": "21 Oct 2026 05:43 PM",
            "timestamp": "2026-10-21T17:43:00",
            "image_thumb": "/assets/samples/normal_retina.jpg",
            "key_findings": [
                "Normal physiological optic cup (VCDR = 0.45)",
                "Intact rim tissue across all 4 quadrants",
                "Normal pallor distribution",
                "Healthy fundus examination"
            ],
            "subtitle": "The optic disc and cup parameters appear within normal healthy limits."
        },
        {
            "id": 7,
            "patient_id": "P007",
            "patient_name": "Lakshmi K",
            "age": 67,
            "gender": "Female",
            "eye": "OS (Left Eye)",
            "filename": "P007_retina.jpg",
            "result": "Normal",
            "confidence": 90.1,
            "confidence_formatted": "90.1%",
            "risk_level": "Low",
            "cdr": 0.40,
            "vcdr_formatted": "0.40",
            "date_time": "21 Oct 2026 11:26 AM",
            "timestamp": "2026-10-21T11:26:00",
            "image_thumb": "/assets/samples/normal_retina.jpg",
            "key_findings": [
                "Normal optic disc contour (VCDR = 0.40)",
                "Preserved neuroretinal rim",
                "Symmetrical optic cup configuration",
                "Low risk for glaucomatous damage"
            ],
            "subtitle": "The optic disc and cup parameters appear within normal healthy limits."
        },
        {
            "id": 8,
            "patient_id": "P008",
            "patient_name": "Suresh P",
            "age": 71,
            "gender": "Male",
            "eye": "OD (Right Eye)",
            "filename": "P008_retina.jpg",
            "result": "Glaucoma",
            "confidence": 93.0,
            "confidence_formatted": "93.0%",
            "risk_level": "High",
            "cdr": 0.82,
            "vcdr_formatted": "0.82",
            "date_time": "20 Oct 2026 03:19 PM",
            "timestamp": "2026-10-20T15:19:00",
            "image_thumb": "/assets/samples/glaucoma_advanced.jpg",
            "key_findings": [
                "Severe optic cup cupping with VCDR = 0.82",
                "Pronounced neuroretinal rim thinning",
                "Lamina cribrosa exposure visible",
                "High probability of glaucomatous optic neuropathy"
            ],
            "subtitle": "The model predicts a high likelihood of glaucoma."
        }
    ],
    "patients": [
        {"id": "P001", "name": "John Doe", "age": 58, "gender": "Male", "phone": "+1 (555) 234-5678", "last_scan": "24 Oct 2026", "diagnosis": "Glaucoma", "risk": "High", "doctor": "Dr. Raj Kumar"},
        {"id": "P002", "name": "Ravi Kumar", "age": 45, "gender": "Male", "phone": "+91 98765 43210", "last_scan": "24 Oct 2026", "diagnosis": "Normal", "risk": "Low", "doctor": "Dr. Raj Kumar"},
        {"id": "P003", "name": "Meena S", "age": 62, "gender": "Female", "phone": "+91 98450 11223", "last_scan": "23 Oct 2026", "diagnosis": "Glaucoma", "risk": "High", "doctor": "Dr. Raj Kumar"},
        {"id": "P004", "name": "Arun N", "age": 39, "gender": "Male", "phone": "+91 97400 33445", "last_scan": "23 Oct 2026", "diagnosis": "Normal", "risk": "Low", "doctor": "Dr. Raj Kumar"},
        {"id": "P005", "name": "Priya M", "age": 53, "gender": "Female", "phone": "+91 96111 55667", "last_scan": "22 Oct 2026", "diagnosis": "Glaucoma", "risk": "High", "doctor": "Dr. Raj Kumar"},
        {"id": "P006", "name": "Vikram R", "age": 48, "gender": "Male", "phone": "+91 99000 77889", "last_scan": "21 Oct 2026", "diagnosis": "Normal", "risk": "Low", "doctor": "Dr. Raj Kumar"},
        {"id": "P007", "name": "Lakshmi K", "age": 67, "gender": "Female", "phone": "+91 94480 99001", "last_scan": "21 Oct 2026", "diagnosis": "Normal", "risk": "Low", "doctor": "Dr. Raj Kumar"},
        {"id": "P008", "name": "Suresh P", "age": 71, "gender": "Male", "phone": "+91 91234 56780", "last_scan": "20 Oct 2026", "diagnosis": "Glaucoma", "risk": "High", "doctor": "Dr. Raj Kumar"}
    ],
    "settings": {
        "glaucoma_threshold": 0.70,
        "suspect_threshold": 0.60,
        "clinic_name": "Glaucoma AI Vision Institute",
        "physician_name": "Dr. Raj Kumar, MD (Ophthalmology)",
        "device_mode": "CPU (ONNXRuntime FP16)",
        "auto_save_records": True
    }
}

class Database:
    def __init__(self):
        self.load()

    def load(self):
        if not DB_FILE.exists():
            self.data = DEFAULT_DATA.copy()
            self.save()
        else:
            try:
                with open(DB_FILE, "r", encoding="utf-8") as f:
                    self.data = json.load(f)
            except Exception as e:
                print(f"Error loading DB, resetting to defaults: {e}")
                self.data = DEFAULT_DATA.copy()
                self.save()

    def save(self):
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(self.data, f, indent=2)

    def get_stats(self) -> Dict[str, Any]:
        return self.data["stats"]

    def get_history(self, search: Optional[str] = None, filter_result: Optional[str] = None) -> List[Dict[str, Any]]:
        records = self.data["history"]
        if filter_result and filter_result.lower() != "all":
            records = [r for r in records if r["result"].lower() == filter_result.lower()]
        if search:
            q = search.lower().strip()
            records = [
                r for r in records
                if q in r["patient_id"].lower()
                or q in r["patient_name"].lower()
                or q in r["result"].lower()
            ]
        return records

    def get_record_by_id(self, record_id: int) -> Optional[Dict[str, Any]]:
        for r in self.data["history"]:
            if r["id"] == record_id:
                return r
        return None

    def get_patients(self) -> List[Dict[str, Any]]:
        return self.data["patients"]

    def add_patient(self, patient: Dict[str, Any]):
        self.data["patients"].insert(0, patient)
        self.save()

    def add_analysis(self, record: Dict[str, Any]) -> Dict[str, Any]:
        new_id = len(self.data["history"]) + 1
        record["id"] = new_id
        if "timestamp" not in record:
            record["timestamp"] = datetime.now().isoformat()
        if "date_time" not in record:
            record["date_time"] = datetime.now().strftime("%d %b %Y %I:%M %p")
        
        # Insert at the beginning of history
        self.data["history"].insert(0, record)
        
        # Update stats
        stats = self.data["stats"]
        stats["total_analyses"] += 1
        if record["result"].lower() == "glaucoma":
            stats["glaucoma_detected"] += 1
        else:
            stats["normal_cases"] += 1
            
        total = stats["total_analyses"]
        glaucoma = stats["glaucoma_detected"]
        stats["glaucoma_percentage"] = round((glaucoma / total) * 100, 1)
        stats["normal_percentage"] = round(((total - glaucoma) / total) * 100, 1)

        # Check if patient exists, else add/update
        p_id = record.get("patient_id")
        p_name = record.get("patient_name")
        found = False
        for p in self.data["patients"]:
            if p["id"] == p_id:
                p["last_scan"] = record["date_time"]
                p["diagnosis"] = record["result"]
                p["risk"] = record["risk_level"]
                found = True
                break
        if not found and p_id:
            self.data["patients"].append({
                "id": p_id,
                "name": p_name or f"Patient {p_id}",
                "age": record.get("age", 50),
                "gender": record.get("gender", "Unspecified"),
                "phone": "+1 (555) 000-0000",
                "last_scan": record["date_time"],
                "diagnosis": record["result"],
                "risk": record["risk_level"],
                "doctor": "Dr. Raj Kumar"
            })

        self.save()
        return record

    def get_settings(self) -> Dict[str, Any]:
        return self.data.get("settings", DEFAULT_DATA["settings"])

    def update_settings(self, new_settings: Dict[str, Any]):
        self.data["settings"].update(new_settings)
        self.save()

db = Database()
