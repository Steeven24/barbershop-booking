from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.auth import CurrentAdmin
from app.database import DbSession
from app.models import User
from app.schemas.auth import LoginRequest, Token, UserRead
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

# Verifying against a dummy hash keeps response time the same for unknown emails
DUMMY_HASH = hash_password("dummy-password")


@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: DbSession):
    user = db.scalar(select(User).where(User.email == data.email.lower()))
    if (
        user is None
        or not user.is_active
        or not verify_password(data.password, user.hashed_password)
    ):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")
    return Token(access_token=create_access_token(user.id))


@router.get("/me", response_model=UserRead)
def me(admin: CurrentAdmin):
    return admin
