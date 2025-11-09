from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt
from ..config import settings
from ..schemas import User, UserInDB

# For demo purposes, we'll use an in-memory "database"
# In a real app, this would be a database connection (e.g., SQLAlchemy)
FAKE_USER_DB: dict[str, UserInDB] = {
    "admin@trustlens.com": UserInDB(
        name="Admin User",
        email="admin@trustlens.com",
        role="admin",
        hashed_password="$2b$12$EixZaYVK1e9p3B5YqS93d.6fNq2u.4fJb9n1C.jZ.zY.g3.lB.rO" # "password"
    )
}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def get_user(email: str) -> UserInDB | None:
    if email in FAKE_USER_DB:
        return FAKE_USER_DB[email]
    return None

def create_user(user: UserInDB) -> UserInDB:
    if user.email in FAKE_USER_DB:
        # In a real app, you'd raise a proper exception
        raise ValueError("User with this email already exists")
    FAKE_USER_DB[user.email] = user
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
