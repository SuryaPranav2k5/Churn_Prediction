import sys
from pathlib import Path

# Add repository root and Server directory to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
SERVER_DIR = ROOT_DIR / "Server"

for p in [str(ROOT_DIR), str(SERVER_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from app import create_app

# Vercel Python Serverless entrypoint
app = create_app()
