from pydantic import BaseModel, Field, EmailStr
from typing import Any

# --- User Schema ---
# This represents the user data we get from a verified Firebase token
class User(BaseModel):
    uid: str
    name: str | None = None
    email: EmailStr
    role: str = "user"


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
