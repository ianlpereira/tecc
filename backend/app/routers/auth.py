"""
Auth router: login and current user endpoints.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.auth import LoginRequest, TokenResponse, ChangePasswordRequest
from app.schemas.user import UserResponse
from app.services.user_service import UserService
from app.models.user import User

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate with username + password and receive a JWT token."""
    service = UserService(db)
    return await service.authenticate(body.username, body.password)


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return current_user


@router.post("/change-password", response_model=UserResponse)
async def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Change the current user's own password. Clears must_change_password flag."""
    service = UserService(db)
    user = await service.change_own_password(
        current_user, body.current_password, body.new_password
    )
    await db.commit()
    await db.refresh(user)
    return user
