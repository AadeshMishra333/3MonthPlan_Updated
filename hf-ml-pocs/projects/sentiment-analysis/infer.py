"""
Sentiment Analysis POC
Model : distilbert-base-uncased-finetuned-sst-2-english
Task  : Binary text classification (POSITIVE / NEGATIVE)

Usage
-----
# Run on bundled sample texts:
    python projects/sentiment-analysis/infer.py

# Run on a single custom sentence:
    python projects/sentiment-analysis/infer.py --text "I loved this film!"
"""

import argparse
from pathlib import Path

from transformers import pipeline


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MODEL_NAME = "distilbert-base-uncased-finetuned-sst-2-english"
SAMPLE_DATA = Path(__file__).parent / "data" / "sample_texts.txt"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def build_pipeline():
    """Load the sentiment-analysis pipeline (model is cached after first run)."""
    print(f"Loading model: {MODEL_NAME}")
    return pipeline("sentiment-analysis", model=MODEL_NAME)


def run_inference(classifier, texts: list[str]) -> None:
    """Run the classifier on a list of texts and pretty-print results."""
    results = classifier(texts)
    print()
    for text, result in zip(texts, results):
        label = result["label"]
        score = result["score"] * 100
        print(f"Input : {text}")
        print(f"Label : {label}  (confidence: {score:.2f}%)")
        print("-" * 60)


def load_sample_texts(path: Path) -> list[str]:
    """Read non-empty lines from the sample text file."""
    lines = [line.strip() for line in path.read_text().splitlines()]
    return [line for line in lines if line and not line.startswith("#")]


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="HF sentiment-analysis POC")
    parser.add_argument(
        "--text",
        type=str,
        default=None,
        help="Single sentence to classify (overrides sample file)",
    )
    args = parser.parse_args()

    classifier = build_pipeline()

    if args.text:
        texts = [args.text]
    else:
        texts = load_sample_texts(SAMPLE_DATA)
        print(f"Running inference on {len(texts)} sample(s) from {SAMPLE_DATA}")

    run_inference(classifier, texts)


if __name__ == "__main__":
    main()
