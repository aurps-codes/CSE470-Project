from fastapi import APIRouter, BackgroundTasks, Depends

from app.controllers.dependencies import get_current_user, get_token
from app.models.user import User
from app.schemas.auth_schema import (
    AuthResponse,
    LoginRequest,
    MessageResponse,
    SignupRequest,
    UserResponse,
    VerifyOtpRequest,
)
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/signup", response_model=MessageResponse, status_code=201)
def signup(data: SignupRequest, background_tasks: BackgroundTasks):
    auth_service.signup(data, background_tasks)
    return {"message": "OTP sent to your email."}


@router.post("/login", response_model=MessageResponse)
def login(data: LoginRequest, background_tasks: BackgroundTasks):
    auth_service.login(data, background_tasks)
    return {"message": "OTP sent to your email."}


@router.post("/verify-otp", response_model=AuthResponse)
def verify_otp(data: VerifyOtpRequest):
    return auth_service.verify_otp(data)


@router.get("/me", response_model=UserResponse)
def me(current_user=Depends(get_current_user)):
    return User.to_public(current_user)


@router.post("/logout", response_model=MessageResponse)
def logout(token: str = Depends(get_token)):
    auth_service.logout(token)
    return {"message": "Logged out."}