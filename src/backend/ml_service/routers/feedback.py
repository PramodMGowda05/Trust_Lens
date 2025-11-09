from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class Feedback(BaseModel):
    review: str
    label: str  # optional, like 'fake' or 'genuine'

@router.post("/feedback")
async def submit_feedback(feedback: Feedback):
    # TODO: Save feedback to DB or file
    return {"message": "Feedback received", "data": feedback}
