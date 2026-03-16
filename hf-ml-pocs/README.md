# Hugging Face Proof Of Concepts

A collection of beginner-friendly ML proof-of-concept projects using the
[Hugging Face `transformers`](https://huggingface.co/docs/transformers) library.

## Projects

| Folder | Model | Task |
|---|---|---|
| [`projects/sentiment-analysis`](projects/sentiment-analysis/) | `distilbert-base-uncased-finetuned-sst-2-english` | Text sentiment classification |
| [`projects/speech-to-text`](projects/speech-to-text/) | `openai/whisper-small` | Audio transcription |

## Quickstart

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd hf-ml-pocs

# 2. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# 3. Install shared dependencies
pip install -r requirements.txt

# 4. Run a project (see each project's README for details)
python projects/sentiment-analysis/infer.py
python projects/speech-to-text/transcribe.py
```

## Repository Structure

```
hf-ml-pocs/
├── requirements.txt                  # Shared dependencies for both projects
├── .gitignore
├── README.md                         # You are here
└── projects/
    ├── sentiment-analysis/
    │   ├── README.md                 # Project-specific docs
    │   ├── infer.py                  # Main inference script
    │   └── data/
    │       └── sample_texts.txt      # Sample inputs
    └── speech-to-text/
        ├── README.md                 # Project-specific docs
        ├── transcribe.py             # Main transcription script
        └── data/
            └── README.md             # Instructions for adding audio files
```

## Prerequisites

- Python 3.9+
- ~2 GB disk space for model weights (downloaded automatically on first run)
- For speech-to-text: `ffmpeg` must be installed system-wide
  - Ubuntu/Debian: `sudo apt install ffmpeg`
  - macOS: `brew install ffmpeg`
  - Windows: [Download from ffmpeg.org](https://ffmpeg.org/download.html)
