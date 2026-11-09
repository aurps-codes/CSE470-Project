import secrets
from datetime import datetime, timedelta, timezone

import bcrypt

from app import config
from app.exceptions import AppError
from app.models.session import Session
from app.models.user import User
from app.repositories import session_repository, user_repository
from app.services import otp_service


def _hash_password(password):
    # bcrypt only reads the first 72 bytes of a password
    password_bytes = password.encode("utf-8")[:72]
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")


def _password_matches(password, password_hash):
    password_bytes = password.encode("utf-8")[:72]
    return bcrypt.checkpw(password_bytes, password_hash.encode("utf-8"))


def _create_session(user_document):
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=config.SESSION_MINUTES)
    session = Session(user_document["_id"], token, expires_at)
    session_repository.insert_session(session)
    return token


def signup(data, background_tasks):
    email = data.email.strip().lower()
    existing = user_repository.find_by_email(email)

    if existing is not None and existing["is_verified"]:
        raise AppError("An account with this email already exists.", 409)

    if existing is not None:
        # Signed up before but never verified, so start fresh
        user_repository.delete_by_email(email)

    user = User(data.full_name.strip(), email, _hash_password(data.password), data.role)
    user_repository.insert_user(user)
    otp_service.send_new_otp(email, "signup", background_tasks)


def login(data, background_tasks):
    email = data.email.strip().lower()
    user = user_repository.find_by_email(email)

    # Same message for "no such user" and "wrong password" so attackers can't tell which
    if user is None or not _password_matches(data.password, user["password_hash"]):
        raise AppError("Invalid email or password.", 401)

    if not user["is_verified"]:
        raise AppError("Email not verified. Please sign up again to get a new code.", 403)

    otp_service.send_new_otp(email, "login", background_tasks)


def verify_otp(data):
    email = data.email.strip().lower()
    user = user_repository.find_by_email(email)

    if user is None:
        raise AppError("Invalid request.", 400)

    otp_service.check_otp(email, data.purpose, data.otp)

    if data.purpose == "signup":
        user_repository.mark_verified(email)

    token = _create_session(user)
    return {"token": token, "user": User.to_public(user)}


def get_user_from_token(token):
    session = session_repository.find_by_token(token)

    if session is None:
        raise AppError("Please log in.", 401)

    if session["expires_at"] < datetime.now(timezone.utc):
        session_repository.delete_by_token(token)
        raise AppError("Session expired. Please log in again.", 401)

    user = user_repository.find_by_id(session["user_id"])
    if user is None:
        raise AppError("Please log in.", 401)

    return user


def logout(token):
    session_repository.delete_by_token(token)