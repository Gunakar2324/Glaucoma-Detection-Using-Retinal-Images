# Glaucoma AI - Execution & Deployment Guide

---

## 1. Running the Web Application (Recommended)

### Method A: One-Click Startup (Windows)
Double-click:
```
start.bat
```
Then open your browser at:
```
http://localhost:8000
```

### Method B: From PowerShell / Terminal
```powershell
cd "e:\Tech Pro\Glaucoma Detection"
py -3.11 run.py
```
*(or `python run.py`)*

---

## 2. Running Standalone CLI Inference
You can run automated inference on any individual retinal image or directory of images without starting the web server:

```powershell
py -3.11 ml_pipeline/predict.py --input sample_images/glaucoma_advanced.jpg --output_dir inference_outputs --device cpu
```

Outputs will be saved in `inference_outputs/`:
- `*_overlay.png`: Fundus image with segmentation contours and VCDR text
- `*_mask_color.png`: RGB mask (Green=Disc, Red=Cup)
- `*_result.json`: VCDR, classification, and risk level metadata

---

## 3. Running Model Training (5-Fold Cross Validation)
To retrain the U-Net model from scratch on the REFUGE/ORIGA dataset:

```powershell
# Train Fold 0
py -3.11 ml_pipeline/main.py --fold_index 0 --device cuda

# Train Fold 1
py -3.11 ml_pipeline/main.py --fold_index 1 --device cuda
```

### Evaluate 5-Fold Results:
```powershell
py -3.11 ml_pipeline/summarize_segmentation_from_models.py
```

### Export to ONNX:
```powershell
py -3.11 ml_pipeline/export_onnx.py
py -3.11 ml_pipeline/convert_to_fp16.py
```

---

## 4. Running the Original Streamlit Demo
If you wish to test the alternate Streamlit demonstration:

```powershell
py -3.11 -m streamlit run streamlit_app/app.py
```
Browser URL: `http://localhost:8501`
