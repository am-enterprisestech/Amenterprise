import uuid

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ForbiddenError, NotFoundError, UnauthorizedError
from app.core.security import decode_token
from app.db.session import get_db
from app.models import PortalClient, User, UserRole

bearer = HTTPBearer(auto_error=False)


async def current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    if creds is None:
        raise UnauthorizedError("Missing bearer token")
    payload = decode_token(creds.credentials, "access")
    user = await db.get(User, uuid.UUID(payload["sub"]))
    if user is None or not user.is_active:
        raise UnauthorizedError("User no longer active")
    return user


async def current_role(
    user: User = Depends(current_user), db: AsyncSession = Depends(get_db)
) -> str:
    row = await db.scalar(select(UserRole.role).where(UserRole.user_id == user.id))
    return row or "user"


async def require_admin(role: str = Depends(current_role)) -> str:
    if role != "admin":
        raise ForbiddenError("Admin role required")
    return role


async def current_client(
    user: User = Depends(current_user), db: AsyncSession = Depends(get_db)
) -> PortalClient:
    client = await db.scalar(
        select(PortalClient).where(PortalClient.user_id == user.id)
    )
    if client is None:
        raise NotFoundError("No portal client is linked to this account")
    return client
