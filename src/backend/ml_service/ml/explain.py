from __future__ import annotations
import numpy as np
import shap

def explain_kernel(model_predict_fn, x_row: np.ndarray, background: np.ndarray | None = None, nsamples: int = 100):
    # KernelExplainer with small background sample for speed
    if background is None:
        background = np.repeat(x_row[np.newaxis, :], 5, axis=0)
    explainer = shap.KernelExplainer(model_predict_fn, background)
    shap_values = explainer.shap_values(x_row, nsamples=nsamples)
    # Return top-k absolute contributions
    vals = shap_values if isinstance(shap_values, np.ndarray) else shap_values[0]
    idx = np.argsort(np.abs(vals))[::-1][:10]
    return {"indices": idx.tolist(), "values": np.array(vals)[idx].tolist()}
