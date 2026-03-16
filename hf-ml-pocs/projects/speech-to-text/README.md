# Speech-to-Text — `openai/whisper-small`

Transcribes speech from audio files to text using Whisper via the
Hugging Face `transformers` pipeline.

**Model card:** [openai/whisper-small](https://huggingface.co/openai/whisper-small)

## Prerequisites

`ffmpeg` must be installed on your system (Whisper needs it to decode audio):

```bash
# Ubuntu / Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg
```

## Quickstart

```bash
# Transcribe the bundled sample (add a WAV/MP3 file to data/ first – see below)
python projects/speech-to-text/transcribe.py --audio projects/speech-to-text/data/sample.wav
```

## Add your own audio

Drop any `.wav`, `.mp3`, or `.flac` file into `data/` (audio files are
git-ignored) and point the script at it:

```bash
python projects/speech-to-text/transcribe.py --audio path/to/your_audio.mp3
```

## Expected output

```
Loading model: openai/whisper-small
Transcribing: data/sample.wav
------------------------------------------------------------
Transcript:
Hello, this is a quick test of the Whisper speech-to-text model.
```

## How it works

1. `transformers.pipeline("automatic-speech-recognition")` loads Whisper.
2. The audio file is decoded and resampled to 16 kHz by `librosa` / `soundfile`.
3. Whisper's encoder converts mel-spectrogram features to embeddings.
4. A decoder auto-regressively generates the transcript tokens.
5. The pipeline returns the final text string.

## File structure

```
speech-to-text/
├── README.md          # This file
├── transcribe.py      # Transcription script
└── data/
    └── README.md      # Instructions for adding audio files
```
