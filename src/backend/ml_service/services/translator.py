from google.cloud import translate_v2 as translate
import os

# --- Configuration ---
# To use this, you need to set up Google Cloud authentication.
# 1. Create a service account in your Google Cloud project.
# 2. Grant it the "Cloud Translation API User" role.
# 3. Download the JSON key for the service account.
# 4. Set the environment variable GOOGLE_APPLICATION_CREDENTIALS to the path of that JSON file.
#    e.g., export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/key.json"

# In a real application, you'd want to manage client instances more carefully.
# For simplicity here, we create a new client on each call if it doesn't exist.
_translate_client = None

def get_translate_client():
    """Initializes and returns a translation client."""
    global _translate_client
    if _translate_client is None:
        try:
            # Check if credentials are set
            if 'GOOGLE_APPLICATION_CREDENTIALS' not in os.environ:
                 print("WARNING: GOOGLE_APPLICATION_CREDENTIALS not set. Translation will be skipped.")
                 return None
            _translate_client = translate.Client()
        except Exception as e:
            print(f"Could not initialize Google Translate client: {e}")
            return None
    return _translate_client


def translate_text(text: str, target_language: str) -> str:
    """
    Translates the given text to the target language using Google Translate API.

    Args:
        text (str): The text to translate.
        target_language (str): The ISO 639-1 code for the target language (e.g., 'en' for English).

    Returns:
        str: The translated text. Returns the original text if translation is skipped or fails.
    """
    client = get_translate_client()
    if not client:
        # Return original text if client can't be initialized (e.g., no credentials)
        return text

    try:
        result = client.translate(text, target_language=target_language)
        translated_text = result['translatedText']
        detected_language = result['detectedSourceLanguage']
        print(f"Translated from '{detected_language}': '{text}' -> '{translated_text}'")
        return translated_text
    except Exception as e:
        print(f"Error during translation: {e}")
        # Fallback to original text in case of API error
        return text

# Example usage (for testing this module directly)
if __name__ == "__main__":
    # To test this, make sure your GOOGLE_APPLICATION_CREDENTIALS env var is set.
    kannada_text = "ಇದು ಒಂದು ಅದ್ಭುತ ಉತ್ಪನ್ನ!" # "This is a wonderful product!"
    hindi_text = "यह एक अद्भुत उत्पाद है!" # "This is a wonderful product!"
    
    print("--- Testing Kannada ---")
    translated_kn = translate_text(kannada_text, 'en')
    print(f"Original: {kannada_text}")
    print(f"Translated: {translated_kn}")

    print("\n--- Testing Hindi ---")
    translated_hi = translate_text(hindi_text, 'en')
    print(f"Original: {hindi_text}")
    print(f"Translated: {translated_hi}")
