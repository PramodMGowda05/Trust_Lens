import numpy as np
from ..ml.model import ModelBundle
from .translator import translate_text
import pandas as pd
from ..ml.features import build_behavioral_features, build_temporal_features, assemble_feature_matrix

def predict_with_explain(bundle: ModelBundle, text: str, meta: dict, lang: str = "en"):
    """
    Main prediction logic that also orchestrates explanation generation.
    """
    # Step 1: Translate text to English if it's not already
    if lang != "en":
        try:
            text = translate_text(text, target_language='en')
        except Exception as e:
            # If translation fails, proceed with original text but log a warning
            print(f"Warning: Translation failed for lang '{lang}'. Proceeding with original text. Error: {e}")

    # Step 2: Make the core prediction with the (potentially translated) text
    label, trust, details = bundle.predict(text, meta)
    
    # Step 3: Try to generate SHAP explanation, but fail gracefully
    try:
        from ..ml.explain import explain_kernel

        # We need to re-create the feature vector `X` for the explanation
        text_clean = bundle.embedder.transform([text])
        
        # Create a DataFrame with the necessary columns for feature generation
        df_data = {"text": text, **meta}
        # Ensure all expected columns exist, filling missing ones with defaults
        df_data.setdefault("verified", False)
        df_data.setdefault("account_age_days", 0)

        df = pd.DataFrame([df_data])
        
        B = build_behavioral_features(df)
        T = build_temporal_features(df)
        X = assemble_feature_matrix(text_clean, B, T)

        # Wrap the model's predict_proba for the explainer
        def wrapped_predict_proba(x_matrix):
            # The explainer passes a matrix. It should work directly with sklearn models.
            proba = bundle.clf.predict_proba(x_matrix)
            return proba[:, 1] # Probability of 'fake' class

        explanation = explain_kernel(wrapped_predict_proba, X.flatten())
        details.update({"shap": explanation})

    except ImportError as e:
        print(f"WARNING: Could not import 'shap' or its dependencies (e.g., 'torch'). Skipping explanation generation. Error: {e}")
        details.update({"shap": "Explanation generation skipped due to missing dependencies."})
    except Exception as e:
        print(f"WARNING: SHAP explanation generation failed. Error: {e}")
        details.update({"shap": "Explanation generation failed."})


    return label, trust, details
