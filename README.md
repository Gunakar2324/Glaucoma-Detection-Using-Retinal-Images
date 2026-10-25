# 👁️ Glaucoma AI - Automated Retinal Image Analysis

An AI-powered clinical screening system for automated glaucoma detection from retinal fundus images using deep learning Convolutional Neural Networks (U-Net).

Based on the research and implementation from [1avishek/glaucoma-screening-cnn](https://github.com/1avishek/glaucoma-screening-cnn.git).

---

## 🌟 Features & Highlights

- **Full U-Net Deep Learning Pipeline**:
  - Semantic segmentation of the **Optic Disc** (Green) and **Optic Cup** (Red).
  - Quantitative measurement of **Vertical Cup-to-Disc Ratio (VCDR)**.
  - Multi-class clinical risk categorization: **Normal** (< 0.60), **Glaucoma Suspect** (0.60 - 0.70), and **Glaucoma Detected** (≥ 0.70).
  - High-resolution visual overlays with contour borders and measurement metrics.
- **Pixel-Perfect Clinical Dashboard UI**:
  - **Dashboard**: Real-time metrics (Total Analyses, Positivity Rate, Processing Latency), recent screenings table, interactive SVG Glaucoma Detection Rate donut chart, and monthly screening trends.
  - **Analyze Retinal Image**: Drag-and-drop fundus image upload zone with pre-loaded clinical sample fundus photographs.
  - **Analysis Result**: High-resolution image viewer with instant switching between *Original Fundus*, *AI Segmentation Mask*, and *Diagnostic Overlay*, paired with detailed clinical findings and risk assessment.
  - **Previous Analyses (History)**: Searchable history directory with multi-parameter filtering (patient ID, diagnosis, date range), detail modal view, and CSV export.
  - **Patient Records**: Patient registry with ocular history and one-click retinal scan initiation.
  - **Model Performance**: Full 5-fold cross-validation metrics (Disc Dice: 0.9038, Cup Dice: 0.8836, Mean Dice: 0.8937, ROC-AUC: 0.962).
  - **Diagnostic Reports**: Standardized ophthalmic screening reports with one-click printable / downloadable PDF documentation.
  - **Settings**: Configurable clinical thresholds and AI runtime options.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure Python 3.10+ is installed on your system.

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Launch the Application
Run the launcher:
```bash
python run.py
```
*(On Windows, you can also double-click `start.bat`)*

Open your browser at:
```
http://localhost:8000
```

---

## 🧠 Model Architecture & Methodology

- **Backbone**: Multi-Fold U-Net CNN Ensemble
- **Input Resolution**: 256 × 256 × 3 RGB
- **Classes**:
  - `0`: Background
  - `1`: Optic Disc
  - `2`: Optic Cup
- **Quantization**: FP16 ONNX Runtime Engine for sub-second CPU inference.
- **Benchmarks**: Trained and evaluated on the **REFUGE** and **ORIGA** multi-center clinical glaucoma datasets.

---

## 📁 Project Structure

```
Glaucoma Detection/
├── backend/
│   ├── app.py                   # FastAPI application serving REST endpoints and frontend
│   ├── model_engine.py          # ONNX Runtime inference, VCDR calculation, mask decoding
│   ├── utils.py                 # Vertical diameter computation and risk classification
│   ├── visualize.py             # Mask coloring and clinical contour overlays
│   ├── database.py              # Patient records, history, and statistics storage
│   ├── models/
│   │   └── glaucoma_unet_fp16.onnx  # Trained U-Net segmentation model
│   └── sample_images/           # Clinical retinal fundus test samples
├── frontend/
│   ├── index.html               # Main single-page application
│   ├── css/
│   │   └── style.css            # Medical UI design system
│   ├── js/
│   │   ├── app.js               # SPA routing, state, upload & print reporting
│   │   └── charts.js            # SVG Donut & Trend charts
│   └── assets/                  # Biometric icons, illustrations, and thumbnails
├── run.py                       # Unified server launcher
├── start.bat                    # Windows one-click start script
├── requirements.txt             # Python dependencies
└── README.md                    # Documentation
```

---

## ⚖️ Clinical Disclaimer
This software is intended as an artificial intelligence-based clinical decision support tool for research and screening assistance. Final diagnosis must always be confirmed by a licensed ophthalmologist using comprehensive clinical evaluation including gonioscopy, tonometry, and visual field testing.
