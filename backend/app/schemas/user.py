"""
User schemas for request/response validation.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
from app.models.user import UserRole


class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: str = UserRole.USER

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in (UserRole.ADMIN, UserRole.USER):
            raise ValueError(f"role must be '{UserRole.ADMIN}' or '{UserRole.USER}'")
        return v


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in (UserRole.ADMIN, UserRole.USER):
            raise ValueError(f"role must be '{UserRole.ADMIN}' or '{UserRole.USER}'")
        return v


class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: str
    is_active: bool
    must_change_password: bool = False

    model_config = {"from_attributes": True}
