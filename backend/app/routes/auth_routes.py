from fastapi import APIRouter, BackgroundTasks, Depends

from app.controllers import auth_controller
from app.controllers.dependencies import get_current_user, get_token
from app.schemas.auth_schema import (
    AuthResponse,
    LoginRequest,
    MessageResponse,
    SignupRequest,
    UserResponse,
    VerifyOtpRequest,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/signup", response_model=MessageResponse, status_code=201)
def signup(data: SignupRequest, background_tasks: BackgroundTasks):
    return auth_controller.signup(data, background_tasks)


@router.post("/login", response_model=MessageResponse)
def login(data: LoginRequest, background_tasks: BackgroundTasks):
    return auth_controller.login(data, background_tasks)


@router.post("/verify-otp", response_model=AuthResponse)
def verify_otp(data: VerifyOtpRequest):
    return auth_controller.verify_otp(data)


@router.get("/me", response_model=UserResponse)
def me(current_user=Depends(get_current_user)):
    return auth_controller.get_profile(current_user)


@router.post("/logout", response_model=MessageResponse)
def logout(token: str = Depends(get_token)):
    return auth_controller.logout(token)