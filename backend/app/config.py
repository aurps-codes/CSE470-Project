import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "tutornest")
SESSION_MINUTES = int(os.getenv("SESSION_MINUTES", "60"))
OTP_MINUTES = int(os.getenv("OTP_MINUTES", "5"))
OTP_MAX_ATTEMPTS = 5
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")