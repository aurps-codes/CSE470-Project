import hashlib
import secrets
import smtplib
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage

import bcrypt

from app import config
from app.exceptions import AppError
from app.models import otp as otp_model
from app.models import session as session_model
from app.models import user as user_model
from app.models.otp import OTP
from app.models.session import Session
from app.models.user import User


# Helper functions used by the controller functions further down

def _hash_password(password):
    # bcrypt only reads the first 72 bytes of a password
    password_bytes = password.encode("utf-8")[:72]
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")


def _password_matches(password, password_hash):
    password_bytes = password.encode("utf-8")[:72]
    return bcrypt.checkpw(password_bytes, password_hash.encode("utf-8"))


def _hash_otp(otp_code):
    return hashlib.sha256(otp_code.encode("utf-8")).hexdigest()


def _send_otp_email(to_email, otp_code, purpose):
    # Development mode: no SMTP details, so print the OTP in the terminal
    if config.SMTP_USER == "" or config.SMTP_PASSWORD == "":
        print(f"[DEV] OTP for {to_email} ({purpose}): {otp_code}")
        return

    message = EmailMessage()
    message["Subject"] = "Your TutorNest verification code"
    message["From"] = config.SMTP_USER
    message["To"] = to_email
    message.set_content(
        f"Your TutorNest OTP is {otp_code}.\n"
        f"It is valid for {config.OTP_MINUTES} minutes. Do not share it with anyone."
    )

    try:
        with smtplib.SMTP_SSL(config.SMTP_HOST, config.SMTP_PORT) as server:
            server.login(config.SMTP_USER, config.SMTP_PASSWORD)
            server.send_message(message)
    except Exception as error:
        # This runs in the background, so the user can't see this error
        print("Could not send email:", error)


def _send_new_otp(email, purpose, background_tasks):
    # secrets is made for security; random is not
    otp_code = str(secrets.randbelow(1000000)).zfill(6)   # e.g. "004281"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=config.OTP_MINUTES)

    otp = OTP(email, purpose, _hash_otp(otp_code), expires_at)
    otp_model.save_otp(otp)

    # Sending email is slow, so do it after the response is returned
    background_tasks.add_task(_send_otp_email, email, otp_code, purpose)


def _check_otp(email, purpose, otp_code):
    record = otp_model.find_otp(email, purpose)
    now = datetime.now(timezone.utc)

    if record is None or record["expires_at"] < now:
        raise AppError("OTP expired or not found. Please go back and try again.", 400)

    if record["attempts"] >= config.OTP_MAX_ATTEMPTS:
        otp_model.delete_otp(email, purpose)
        raise AppError("Too many wrong attempts. Please go back and try again.", 429)

    if record["otp_hash"] != _hash_otp(otp_code):
        otp_model.increase_attempts(email, purpose)
        raise AppError("Incorrect OTP.", 400)

    # Correct: delete it so it can only be used once
    otp_model.delete_otp(email, purpose)


def _create_session(user_document):
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=config.SESSION_MINUTES)
    session = Session(user_document["_id"], token, expires_at)
    session_model.insert_session(session)
    return token


# Controller functions, called by the routes

def signup(data, background_tasks):
    email = data.email.strip().lower()
    existing = user_model.find_by_email(email)

    if existing is not None and existing["is_verified"]:
        raise AppError("An account with this email already exists.", 409)

    if existing is not None:
        # Signed up before but never verified, so start fresh
        user_model.delete_by_email(email)

    user = User(data.full_name.strip(), email, _hash_password(data.password), data.role)
    user_model.insert_user(user)
    _send_new_otp(email, "signup", background_tasks)
    return {"message": "OTP sent to your email."}


def login(data, background_tasks):
    email = data.email.strip().lower()
    user = user_model.find_by_email(email)

    # Same message for "no such user" and "wrong password" so attackers can't tell which
    if user is None or not _password_matches(data.password, user["password_hash"]):
        raise AppError("Invalid email or password.", 401)

    if not user["is_verified"]:
        raise AppError("Email not verified. Please sign up again to get a new code.", 403)

    _send_new_otp(email, "login", background_tasks)
    return {"message": "OTP sent to your email."}


def verify_otp(data):
    email = data.email.strip().lower()
    user = user_model.find_by_email(email)

    if user is None:
        raise AppError("Invalid request.", 400)

    _check_otp(email, data.purpose, data.otp)

    if data.purpose == "signup":
        user_model.mark_verified(email)

    token = _create_session(user)
    return {"token": token, "user": User.to_public(user)}


def get_user_from_token(token):
    session = session_model.find_by_token(token)

    if session is None:
        raise AppError("Please log in.", 401)

    if session["expires_at"] < datetime.now(timezone.utc):
        session_model.delete_by_token(token)
        raise AppError("Session expired. Please log in again.", 401)

    user = user_model.find_by_id(session["user_id"])
    if user is None:
        raise AppError("Please log in.", 401)

    return user


def get_profile(user_document):
    return User.to_public(user_document)


def logout(token):
    session_model.delete_by_token(token)
    return {"message": "Logged out."}