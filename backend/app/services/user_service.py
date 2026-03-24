"""
User service with business logic for user management and authentication.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.user import UserCreate, UserUpdate
from app.schemas.auth import TokenResponse
from app.schemas.user import UserResponse


class UserService:
    """Service layer for User business logic."""

    def __init__(self, db: AsyncSession):
        self.repository = UserRepository(db)
        self.db = db

    async def authenticate(self, username: str, password: str) -> TokenResponse:
        """Authenticate a user and return a JWT token response."""
        user = await self.repository.get_by_username(username)

        if user is None or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário ou senha inválidos.",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuário inativo. Contate o administrador.",
            )

        token = create_access_token(data={"sub": str(user.id)})
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )

    async def get_all_users(self) -> List[User]:
        """Get all users."""
        return await self.repository.get_all()

    async def get_user(self, user_id: int) -> User:
        """Get a user by ID or raise 404."""
        user = await self.repository.get_by_id(user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Usuário {user_id} não encontrado.",
            )
        return user

    async def create_user(self, data: UserCreate) -> User:
        """Create a new user. Raises 409 if username already exists."""
        if await self.repository.username_exists(data.username):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Username '{data.username}' já está em uso.",
            )

        user = User(
            username=data.username,
            email=data.email,
            full_name=data.full_name,
            hashed_password=hash_password(data.password),
            role=data.role,
            is_active=True,
            must_change_password=True,
        )
        return await self.repository.create(user)

    async def update_user(self, user_id: int, data: UserUpdate) -> User:
        """Update user fields. Only provided (non-None) fields are updated."""
        user = await self.get_user(user_id)

        if data.email is not None:
            user.email = data.email
        if data.full_name is not None:
            user.full_name = data.full_name
        if data.role is not None:
            if (
                user.role == UserRole.ADMIN
                and data.role != UserRole.ADMIN
                and await self.repository.count_active_admins() <= 1
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Não é possível remover o papel de administrador do único admin ativo.",
                )
            user.role = data.role
        if data.is_active is not None:
            user.is_active = data.is_active
        if data.password is not None:
            user.hashed_password = hash_password(data.password)
            user.must_change_password = False

        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def deactivate_user(self, user_id: int) -> User:
        """Deactivate a user account."""
        user = await self.get_user(user_id)
        if (
            user.role == UserRole.ADMIN
            and await self.repository.count_active_admins() <= 1
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível desativar o único administrador ativo.",
            )
        user.is_active = False
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def activate_user(self, user_id: int) -> User:
        """Activate a user account."""
        user = await self.get_user(user_id)
        user.is_active = True
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def change_own_password(
        self, user: User, current_password: str, new_password: str
    ) -> User:
        """Let a user change their own password. Verifies current password first."""
        if not verify_password(current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Senha atual incorreta.",
            )
        user.hashed_password = hash_password(new_password)
        user.must_change_password = False
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def ensure_default_admin(self) -> None:
        """Create the default admin user if no admin exists yet."""
        from app.core.config import settings

        if not await self.repository.admin_exists():
            admin = User(
                username=settings.DEFAULT_ADMIN_USERNAME,
                email=None,
                full_name="Administrador",
                hashed_password=hash_password(settings.DEFAULT_ADMIN_PASSWORD),
                role=UserRole.ADMIN,
                is_active=True,
            )
            await self.repository.create(admin)
            await self.db.commit()
