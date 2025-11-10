from functools import lru_cache
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from firebase_admin import auth, credentials
import firebase_admin

from .ml.model import ModelBundle
from .schemas import User
from .config import settings

# --- Firebase Initialization ---
# This should only run once.
if not firebase_admin._apps:
    # In a production environment, you might use credentials.ApplicationDefault()
    # which relies on the GOOGLE_APPLICATION_CREDENTIALS env var.
    # For simplicity in local dev, we check for the env var. If not set, app will fail to start.
    # This is a reasonable trade-off for a demo app.
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") # tokenUrl is not used by our app, but required by FastAPI

@lru_cache(maxsize=1)
def get_model_bundle() -> ModelBundle:
    """
    Dependency injection for the model bundle.
    Using lru_cache ensures the model is loaded only once.
    """
    return ModelBundle.load()


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    """
    Dependency that verifies the Firebase ID token and returns the user data.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        decoded_token = auth.verify_id_token(token)
        # You can customize what you want in your user object
        # The 'name' might not be available if not set in Firebase Auth
        user = User(
            email=decoded_token.get("email"),
            name=decoded_token.get("name", decoded_token.get("email")), # Fallback to email for name
            uid=decoded_token.get("uid"),
            role=decoded_token.get("role", "user") # Custom claim for role
        )
        return user
    except Exception as e:
        # This catches expired tokens, invalid tokens, etc.
        print(f"Firebase auth error: {e}")
        raise credentials_exception


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
):
    # In a real app, you might check a 'disabled' flag in your own DB
    # For Firebase, you can check the 'disabled' property on the user record
    # but that requires another SDK call. We'll keep it simple here.
    return current_user
