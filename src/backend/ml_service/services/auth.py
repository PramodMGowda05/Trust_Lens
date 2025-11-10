from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt
from ..config import settings
from ..schemas import User, UserInDB
import hashlib

# For demo purposes, we'll use an in-memory "database"
# In a real app, this would be a database connection (e.g., SQLAlchemy)
FAKE_USER_DB: dict[str, UserInDB] = {
    "admin@trustlens.com": UserInDB(
        name="Admin User",
        email="admin@trustlens.com",
        role="admin",
        # This is the SHA-256 hash of "password", then passed to bcrypt
        hashed_password="$2b$12$EixZaYVK1e9p3B5YqS93d.6fNq2u.4fJb9n1C.jZ.zY.g3.lB.rO"
    )
}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Pre-hash the plain password with SHA-256 before verification,
    # to match the process used during hashing.
    hashed_input = hashlib.sha256(plain_password.encode('utf-8')).hexdigest()
    return pwd_context.verify(hashed_input, hashed_password)

def get_password_hash(password: str) -> str:
    # Bcrypt has a maximum password length of 72 bytes.
    # To securely handle longer passwords, we first hash the password with a fast
    # algorithm (SHA-256) and then pass the hex digest to bcrypt.
    hashed_input = hashlib.sha256(password.encode('utf-8')).hexdigest()
    return pwd_context.hash(hashed_input)

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
