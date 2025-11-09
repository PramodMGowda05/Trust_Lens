import pandas as pd
import numpy as np

def build_behavioral_features(df: pd.DataFrame) -> pd.DataFrame:
    out = pd.DataFrame(index=df.index)
    out["verified"] = df.get("verified", False).astype(float)
    out["account_age_days"] = df.get("account_age_days", 0).astype(float)
    out["text_len"] = df["text"].str.len().astype(float)
    out["word_count"] = df["text"].str.split().str.len().astype(float)
    return out

def build_temporal_features(df: pd.DataFrame) -> pd.DataFrame:
    # Placeholder: user can extend with burst detection, inter-arrival stats, etc.
    out = pd.DataFrame(index=df.index)
    return out

def assemble_feature_matrix(text_embeds: np.ndarray, behavior: pd.DataFrame, temporal: pd.DataFrame) -> np.ndarray:
    other = pd.concat([behavior, temporal], axis=1).fillna(0.0).to_numpy(dtype=float)
    if text_embeds is None or text_embeds.size == 0:
        return other
    return np.hstack([text_embeds, other])
