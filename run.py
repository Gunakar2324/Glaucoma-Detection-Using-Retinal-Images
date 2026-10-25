# run.py - Glaucoma AI Launcher
import sys
import os
from pathlib import Path
import uvicorn

# Ensure utf-8 encoding on windows console
if sys.platform == "win32":
    import codecs
    if sys.stdout.encoding != 'utf-8':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
            sys.stderr.reconfigure(encoding='utf-8')
        except AttributeError:
            pass

if __name__ == "__main__":
    backend_path = Path(__file__).resolve().parent / "backend"
    sys.path.insert(0, str(backend_path))
    
    print("=" * 65)
    print("  Glaucoma AI - Automated Retinal Image Analysis System")
    print("  Running at: http://localhost:8000")
    print("  Model: Multi-Fold U-Net CNN (ONNX FP16)")
    print("=" * 65)
    
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=False, app_dir=str(backend_path))
