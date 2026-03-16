"""
Speech-to-Text POC
Model : openai/whisper-small
Task  : Automatic speech recognition (ASR) — audio file → text transcript

Usage
-----
# Transcribe an audio file:
    python projects/speech-to-text/transcribe.py --audio data/sample.wav

# Optional: force transcription language (default: auto-detect):
    python projects/speech-to-text/transcribe.py --audio data/sample.wav --language english

Prerequisites
-------------
* ffmpeg installed system-wide (required for audio decoding)
* Python packages from requirements.txt (transformers, torchaudio, soundfile, librosa)
"""

import argparse
from pathlib import Path

from transformers import pipeline


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MODEL_NAME = "openai/whisper-small"
SUPPORTED_EXTENSIONS = {".wav", ".mp3", ".flac", ".ogg", ".m4a"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def build_pipeline(language: str | None = None):
    """Load the ASR pipeline (model is cached after first run).

    Args:
        language: Optional BCP-47 language code to force (e.g. 'english').
                  Pass None for automatic language detection.
    """
    print(f"Loading model: {MODEL_NAME}")
    generate_kwargs = {}
    if language:
        generate_kwargs["language"] = language

    return pipeline(
        "automatic-speech-recognition",
        model=MODEL_NAME,
        generate_kwargs=generate_kwargs,
    )


def transcribe(asr_pipeline, audio_path: Path) -> str:
    """Run Whisper on an audio file and return the transcript string."""
    if not audio_path.exists():
        raise FileNotFoundError(
            f"Audio file not found: {audio_path}\n"
            "Place a .wav / .mp3 / .flac file in data/ and pass its path with --audio."
        )
    if audio_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported format '{audio_path.suffix}'. "
            f"Supported: {', '.join(SUPPORTED_EXTENSIONS)}"
        )

    print(f"Transcribing: {audio_path}")
    result = asr_pipeline(str(audio_path))
    return result["text"].strip()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="HF speech-to-text POC (Whisper)")
    parser.add_argument(
        "--audio",
        type=Path,
        required=True,
        help="Path to the audio file to transcribe (.wav, .mp3, .flac, ...)",
    )
    parser.add_argument(
        "--language",
        type=str,
        default=None,
        help="Force a specific language (e.g. 'english'). Default: auto-detect.",
    )
    args = parser.parse_args()

    asr = build_pipeline(language=args.language)
    transcript = transcribe(asr, args.audio)

    print("-" * 60)
    print("Transcript:")
    print(transcript)


if __name__ == "__main__":
    main()
