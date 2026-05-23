import whisper

# Load model 1 lần
model = whisper.load_model("base")

def transcribe_audio(wav_path: str) -> str:
    result = model.transcribe(wav_path)
    return result["text"]
