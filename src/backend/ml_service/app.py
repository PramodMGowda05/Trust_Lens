from fastapi import FastAPI
from .routers import predict, feedback, auth
from .config import settings
import os

app = FastAPI(
    title="TrustLens ML Service",
    description="Backend service for fake review detection models.",
    version="0.1.0",
)

# Ensure the models directory exists
os.makedirs(settings.MODELS_DIR, exist_ok=True)

# Include routers
app.include_router(auth.router, tags=["Authentication"])
app.include_router(predict.router, prefix="/api/v1", tags=["Prediction"])
app.include_router(feedback.router, prefix="/api/v1", tags=["Feedback"])

@app.get("/")
def read_root():
    return {"message": f"Welcome to the TrustLens ML Service API running in {settings.ENV} mode."}

# Allow direct call for running with uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001, log_level="info")
