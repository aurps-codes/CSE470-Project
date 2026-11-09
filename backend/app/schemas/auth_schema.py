from typing import Literal
from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=60)
    email: EmailStr
    password: str = Field(min_length=8, max_length=64)
    role: Literal["student", "teacher", "parent"]   # admin cannot self-register


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(pattern=r"^\d{6}$")             # exactly 6 digits
    purpose: Literal["signup", "login"]


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: str


class AuthResponse(BaseModel):
    token: str
    user: UserResponse


class MessageResponse(BaseModel):
    message: str