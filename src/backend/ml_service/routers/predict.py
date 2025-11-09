from fastapi import APIRouter, Depends
from ..schemas import PredictRequest, PredictResponse, User
from ..deps import get_model_bundle, get_current_active_user
from ..services.inference import predict_with_explain

router = APIRouter()

@router.post("/predict", response_model=PredictResponse)
def predict(
    req: PredictRequest, 
    bundle = Depends(get_model_bundle),
    current_user: User = Depends(get_current_active_user)
):
    label, trust, details = predict_with_explain(
        bundle, 
        req.text, 
        req.metadata.model_dump() if req.metadata else {},
        req.lang
    )
    return PredictResponse(
        label=label,
        trust_score=trust,
        explanation=details,
        meta={"lang": req.lang}
    )
