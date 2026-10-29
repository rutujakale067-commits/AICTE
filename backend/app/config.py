"""Central configuration (environment-driven; no real secrets are hard-coded)."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = Path(os.getenv("VERIFYAI_UPLOAD_DIR", BASE_DIR / "uploads"))
REPORT_DIR = Path(os.getenv("VERIFYAI_REPORT_DIR", BASE_DIR / "reports"))
DB_URL = os.getenv("VERIFYAI_DB_URL", f"sqlite:///{BASE_DIR / 'verifyai.db'}")
# DEMO ONLY: set a long random value via the environment for anything beyond a local demo.
SECRET_KEY = os.getenv("VERIFYAI_SECRET", "demo-only-secret-change-me-0123456789abcdef")
TOKEN_TTL_MINUTES = int(os.getenv("VERIFYAI_TOKEN_TTL_MIN", "480"))
LINK_TTL_SECONDS = 300            # signed evidence / download links
MAX_UPLOAD_MB = int(os.getenv("VERIFYAI_MAX_UPLOAD_MB", "10"))
OCR_ENABLED = os.getenv("VERIFYAI_OCR", "1") == "1"
MIN_TEXT_CHARS = 40               # below this, a page's text layer is treated as unusable
HANDBOOK_VERSION = "AICTE Approval Process Handbook 2024-2027"
CORS_ORIGINS = os.getenv("VERIFYAI_CORS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
# Optional LLM (OpenAI-compatible chat-completions URL). Not required; rule-based explanations are the default.
LLM_URL = os.getenv("VERIFYAI_LLM_URL", "")
LLM_KEY = os.getenv("VERIFYAI_LLM_KEY", "")
LLM_MODEL = os.getenv("VERIFYAI_LLM_MODEL", "")
for _d in (UPLOAD_DIR, REPORT_DIR):
    _d.mkdir(parents=True, exist_ok=True)

# --- settings used by the VerifyAI engine/API modules (appended; existing values above untouched) ---
import secrets as _secrets
MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024
DEMO_NOTICE = "SIH Demonstration Prototype - Not an Official AICTE Service"
def _jwt_secret():
    if os.getenv("VERIFYAI_SECRET"): return os.environ["VERIFYAI_SECRET"]
    f = BASE_DIR / ".jwt_secret"          # generated locally on first run; keep out of version control
    if not f.exists(): f.write_text(_secrets.token_hex(32))
    return f.read_text().strip()
JWT_SECRET = _jwt_secret()
