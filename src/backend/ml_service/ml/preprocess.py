import re
import pandas as pd
from bs4 import BeautifulSoup
import unicodedata

EMOJI_PATTERN = re.compile("["
    u"\U0001F600-\U0001F64F"  # emoticons
    u"\U0001F300-\U0001F5FF"  # symbols & pictographs
    u"\U0001F680-\U0001F6FF"  # transport & map symbols
    u"\U0001F1E0-\U0001F1FF"  # flags
"]+", flags=re.UNICODE)

def clean_text(text: str) -> str:
    text = BeautifulSoup(text, "lxml").get_text(separator=" ")
    text = unicodedata.normalize("NFKC", text)
    text = EMOJI_PATTERN.sub("", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def basic_dataframe_clean(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["text"] = df["text"].astype(str).apply(clean_text)
    df.drop_duplicates(subset=["text"], inplace=True)
    df = df[df["text"].str.len() > 1]
    return df
