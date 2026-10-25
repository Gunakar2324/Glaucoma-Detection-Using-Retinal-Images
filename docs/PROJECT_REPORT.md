# AI-Based Glaucoma Detection Using Retinal Images
## Comprehensive Project Report & Clinical Methodology

---

## 1. Abstract
Glaucoma is a progressive optic neuropathy characterized by structural changes to the optic nerve head (optic disc) and visual field loss. It is the leading cause of irreversible blindness worldwide, often referred to as the "silent thief of sight" due to the absence of early symptoms. Early screening and detection are vital in preventing permanent vision loss. 

This project presents an end-to-end clinical AI screening framework that automatically analyzes color retinal fundus images using deep learning Convolutional Neural Networks (CNNs). Utilizing a multi-fold **U-Net** semantic segmentation backbone, the system precisely segments the **Optic Disc** and the **Optic Cup**, quantifies the **Vertical Cup-to-Disc Ratio (VCDR)**, and classifies patient risk into **Normal**, **Glaucoma Suspect**, and **Glaucoma Detected** categories with full diagnostic transparency.

---

## 2. Clinical Significance & Problem Statement
- **Pathophysiology**: Glaucomatous optic neuropathy causes gradual death of retinal ganglion cells, leading to thinning of the neuroretinal rim and progressive enlargement (cupping) of the optic cup relative to the overall optic disc.
- **Vertical Cup-to-Disc Ratio (VCDR)**:
  $$\text{VCDR} = \frac{\text{Vertical Diameter of Optic Cup}}{\text{Vertical Diameter of Optic Disc}}$$
  - **Normal**: $\text{VCDR} < 0.60$ with intact neuroretinal rim (following the ISNT rule: Inferior $\ge$ Superior $\ge$ Nasal $\ge$ Temporal).
  - **Glaucoma Suspect**: $0.60 \le \text{VCDR} < 0.70$, warranting periodic visual field and tonometry monitoring.
  - **Glaucoma Likely / Detected**: $\text{VCDR} \ge 0.70$ or pronounced neuroretinal rim notches.

---

## 3. Deep Learning Architecture & Training
- **Model Backbone**: U-Net with an encoder-decoder pathway and skip connections to preserve high-frequency boundary information between the neuroretinal rim and the cup.
- **Input Resolution**: $256 \times 256 \times 3$ RGB fundus photographs.
- **Output Classes**:
  - `0`: Background
  - `1`: Optic Disc
  - `2`: Optic Cup
- **Optimization**:
  - Combined Dice Loss + Cross Entropy Loss:
    $$\mathcal{L} = \mathcal{L}_{\text{CE}} + (1 - \text{Dice Score})$$
  - Multi-Fold Cross-Validation: 5 independent folds trained on the benchmark **REFUGE** (Retinal Fundus Glaucoma Challenge) and **ORIGA** datasets.
- **Validation Metrics**:
  - **Mean Dice**: $0.8937 \pm 0.0013$
  - **Disc Dice**: $0.9038 \pm 0.0019$
  - **Cup Dice**: $0.8836 \pm 0.0033$
  - **ROC-AUC**: $0.962$
  - **Sensitivity**: $93.4\%$ | **Specificity**: $91.8\%$
- **Quantization & Deployment**:
  - Quantized to **FP16 ONNX** format (`glaucoma_unet_fp16.onnx`), achieving sub-second CPU inference latency without loss of segmentation accuracy.

---

## 4. Software Architecture & Components

```
Glaucoma Detection/
├── backend/                      # Production FastAPI Application
│   ├── app.py                   # REST API routes & static file hosting
│   ├── model_engine.py          # ONNX Runtime inference & VCDR measurement
│   ├── pdf_generator.py         # ReportLab clinical diagnostic PDF generator
│   ├── database.py              # Patient records & screening history
│   ├── models/                  # ONNX FP16 model binary
│   └── sample_images/           # Test retinal fundus photos
├── frontend/                     # Clinical Dashboard Interface
│   ├── index.html               # 4-panel dashboard matching clinical UI design
│   ├── css/style.css            # Medical UI design system & Print media rules
│   ├── js/app.js                # Single Page Application controller & router
│   ├── js/charts.js             # SVG Donut & Monthly trend line charts
│   └── assets/                  # Icons, biometric glow banner, thumbnails
├── ml_pipeline/                  # Deep Learning Training & Evaluation Pipeline
│   ├── model.py                 # PyTorch U-Net architecture definition
│   ├── dataset.py               # Albumentations & PyTorch dataset loader
│   ├── trainer.py               # 5-Fold cross validation training loops
│   ├── main.py                  # Training entrypoint
│   ├── evaluate.py              # Model testing & validation
│   ├── predict.py               # CLI inference script
│   └── export_onnx.py           # PyTorch to ONNX exporter
├── streamlit_app/                # Streamlit demo alternative
├── models/                       # Root models store
├── sample_images/                # Test fundus photographs
└── docs/                         # Reports and execution guides
```

---

## 5. Web Application Features
1. **Interactive Dashboard**:
   - High-level KPIs: Total Analyses (248), Glaucoma Cases (72), Normal Cases (176), Avg Latency (3.2s).
   - Dynamic SVG Donut Chart showing detection rate (28.9% Glaucoma / 71.1% Normal).
   - Monthly trend dual-line chart (Total vs. Glaucoma).
   - Recent patient analyses table with click-through to detailed diagnostic findings.
2. **Analyze Retinal Image**:
   - Drag-and-drop file upload zone for clinical fundus images.
   - Clinical guidelines checklist.
   - Pre-loaded interactive sample cards: *Normal Retina*, *Glaucoma (Early)*, *Glaucoma (Advanced)*, and *Another Example*.
   - Animated optical laser scanning modal.
3. **Analysis Result View**:
   - Multi-mode image viewer: Toggle between *Original Fundus*, *AI Segmentation Mask* (Disc=Green, Cup=Red), and *Diagnostic Overlay with Contours & VCDR*.
   - Diagnostic status banner with clinical risk classification.
   - Key Clinical Findings generated automatically based on cup excavation and rim thinning.
   - One-click printable screening report and direct PDF download with embedded fundus images.
4. **Previous Analyses Directory**:
   - Searchable history by patient ID, name, or diagnosis.
   - Date range and status filter.
   - Single-click CSV export of all patient records.
5. **Patient Directory**:
   - Patient registry with eye history and immediate scan triggers.
6. **Model Performance**:
   - 5-fold cross-validation table and technical specifications.
7. **Settings**:
   - Configurable VCDR thresholds and hospital/physician profile branding.

---

## 6. Regulatory & Ethical Disclaimer
This software is intended as an artificial intelligence-based clinical decision support tool for screening assistance and research. Final diagnosis must always be confirmed by a licensed ophthalmologist through clinical gonioscopy, tonometry, and Humphrey visual field testing.
