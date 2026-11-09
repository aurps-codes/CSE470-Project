import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from app import config
from app.exceptions import AppError
from app.models.otp import OTP
from app.repositories import otp_repository
from app.services import email_service


def _hash_otp(otp_code):
    return hashlib.sha256(otp_code.encode("utf-8")).hexdigest()


def send_new_otp(email, purpose, background_tasks):
    # secrets is made for security; random is not
    otp_code = str(secrets.randbelow(1000000)).zfill(6)   # e.g. "004281"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=config.OTP_MINUTES)

    otp = OTP(email, purpose, _hash_otp(otp_code), expires_at)
    otp_repository.save_otp(otp)

    # Sending email is slow, so do it after the response is returned
    background_tasks.add_task(email_service.send_otp_email, email, otp_code, purpose)


def check_otp(email, purpose, otp_code):
    record = otp_repository.find_otp(email, purpose)
    now = datetime.now(timezone.utc)

    if record is None or record["expires_at"] < now:
        raise AppError("OTP expired or not found. Please go back and try again.", 400)

    if record["attempts"] >= config.OTP_MAX_ATTEMPTS:
        otp_repository.delete_otp(email, purpose)
        raise AppError("Too many wrong attempts. Please go back and try again.", 429)

    if record["otp_hash"] != _hash_otp(otp_code):
        otp_repository.increase_attempts(email, purpose)
        raise AppError("Incorrect OTP.", 400)

    # Correct: delete it so it can only be used once
    otp_repository.delete_otp(email, purpose)