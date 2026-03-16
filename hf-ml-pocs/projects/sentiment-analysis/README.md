# Sentiment Analysis — `distilbert-base-uncased`

Classifies text as **POSITIVE** or **NEGATIVE** using a fine-tuned DistilBERT
model from Hugging Face.

**Model card:** [distilbert-base-uncased-finetuned-sst-2-english](https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english)

## Quickstart

```bash
# From the repo root (dependencies already installed)
python projects/sentiment-analysis/infer.py
```

The script reads lines from `data/sample_texts.txt` and prints the predicted
label and confidence score for each one.

## Run on custom input

Pass text directly with `--text`:

```bash
python projects/sentiment-analysis/infer.py --text "This movie was absolutely fantastic!"
```

## Expected output

```
Input : This movie was absolutely fantastic!
Label : POSITIVE  (confidence: 99.87%)

Input : The service was terrible and I want a refund.
Label : NEGATIVE  (confidence: 99.63%)
```

## How it works

1. `transformers.pipeline("sentiment-analysis")` loads the model on first run
   and caches it in `~/.cache/huggingface/`.
2. The tokenizer converts raw text into token IDs.
3. DistilBERT produces logits; a softmax gives the label probabilities.
4. The pipeline returns the top label and its probability score.

## File structure

```
sentiment-analysis/
├── README.md          # This file
├── infer.py           # Inference script
└── data/
    └── sample_texts.txt   # One sentence per line
```
