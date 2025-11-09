from pydantic import BaseModel, Field, EmailStr
from typing import Any

# --- JWT & User Schemas ---

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class User(BaseModel):
    name: str
    email: EmailStr
    role: str = "user"

class UserInDB(User):
    hashed_password: str

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

# --- Prediction Schemas ---

class RequestMetadata(BaseModel):
    verified: bool = False
    account_age_days: int = 0

class PredictRequest(BaseModel):
    text: str
    lang: str = "en"
    metadata: RequestMetadata | None = None

class PredictResponse(BaseModel):
    label: str
    trust_score: float = Field(..., ge=0, le=1)
    explanation: dict[str, Any]
    meta: dict[str, Any]
