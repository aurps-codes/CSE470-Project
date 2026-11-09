from fastapi import Depends, Header

from app.exceptions import AppError
from app.services import auth_service


def get_token(authorization: str = Header(default="")):
    # Expected format:  Authorization: Bearer <token>
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0] != "Bearer":
        raise AppError("Please log in.", 401)
    return parts[1]


def get_current_user(token: str = Depends(get_token)):
    return auth_service.get_user_from_token(token)