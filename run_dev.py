"""
Unified Development Runner for Explainable Customer Churn Intelligence Engine.
Launches both Flask Backend (Port 5000) and React Vite Frontend (Port 3000) concurrently with unified logging.
"""

import sys
import os
import subprocess
import time
from pathlib import Path

# Force UTF-8 on Windows consoles
if sys.platform.startswith("win"):
    os.system("chcp 65001 > nul 2>&1")
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")

ROOT_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = ROOT_DIR / "frontend"
BACKEND_SCRIPT = ROOT_DIR / "backend" / "app.py"

def check_backend_dependencies():
    print("[1/3] Checking Backend Python modules...")
    required_modules = ["flask", "flask_cors", "pandas", "numpy", "joblib"]
    missing = []
    for mod in required_modules:
        try:
            __import__(mod)
        except ImportError:
            missing.append(mod)

    if missing:
        print(f"[WARN] Missing Python modules: {', '.join(missing)}")
        print("       Installing missing dependencies via pip...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", *missing])
        print("[OK] All required Python modules installed successfully.")
    else:
        print(f"[OK] All backend modules available: {', '.join(required_modules)}")

def check_frontend_dependencies():
    print("[2/3] Checking Frontend node_modules...")
    node_modules = FRONTEND_DIR / "node_modules"
    if not node_modules.exists():
        print("[WARN] Frontend node_modules not found. Running npm install...")
        subprocess.check_call("npm install", shell=True, cwd=str(FRONTEND_DIR))
        print("[OK] Frontend dependencies installed.")
    else:
        print("[OK] Frontend node_modules present.")

def run_services():
    print("[3/3] Launching Backend and Frontend services...")
    processes = []

    try:
        # Launch Backend
        backend_env = os.environ.copy()
        backend_env["PYTHONUNBUFFERED"] = "1"
        backend_proc = subprocess.Popen(
            [sys.executable, str(BACKEND_SCRIPT)],
            cwd=str(ROOT_DIR),
            env=backend_env
        )
        processes.append(("Backend", backend_proc))
        print("[LAUNCH] Backend API started at http://127.0.0.1:5000")

        time.sleep(2)

        # Launch Frontend (Vite)
        frontend_proc = subprocess.Popen(
            "npm run dev",
            shell=True,
            cwd=str(FRONTEND_DIR)
        )
        processes.append(("Frontend", frontend_proc))
        print("[LAUNCH] Frontend Dev Server started at http://localhost:3000")
        print("\n" + "="*70)
        print("  Explainable Customer Churn Intelligence Engine is LIVE!")
        print("  * Frontend UI : http://localhost:3000")
        print("  * Backend API : http://127.0.0.1:5000/api/health")
        print("  Press Ctrl+C to shut down all services.")
        print("="*70 + "\n")

        # Keep alive and monitor
        while True:
            for name, proc in processes:
                poll = proc.poll()
                if poll is not None:
                    print(f"[EXIT] {name} process exited with code {poll}")
                    return poll
            time.sleep(1)

    except KeyboardInterrupt:
        print("\nStopping all services...")
    finally:
        for name, proc in processes:
            try:
                proc.terminate()
                proc.wait(timeout=3)
            except Exception:
                proc.kill()
        print("All services stopped.")

if __name__ == "__main__":
    check_backend_dependencies()
    check_frontend_dependencies()
    run_services()
