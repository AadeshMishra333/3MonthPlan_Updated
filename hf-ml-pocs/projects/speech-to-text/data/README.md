# Audio Data

Audio files are **git-ignored** and must be sourced locally.

## How to add a sample audio file

1. Drop a short audio file (`.wav`, `.mp3`, or `.flac`) into this folder.
2. Name it anything — for example `sample.wav`.
3. Run the transcription script:
   ```bash
   python projects/speech-to-text/transcribe.py --audio projects/speech-to-text/data/sample.wav
   ```

## Free sources for test audio

| Source | URL | Notes |
|---|---|---|
| Common Voice | https://commonvoice.mozilla.org | Open-source, many languages |
| LibriSpeech | https://www.openslr.org/12 | English read speech |
| FreeSound | https://freesound.org | Various quality levels |

**Tip:** Keep test clips short (< 30 seconds) so Whisper-small runs quickly on CPU.
