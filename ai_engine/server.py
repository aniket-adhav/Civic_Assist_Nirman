import sys
import json
import io
import os

os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

from ai_text import analyze_text, classifier  # noqa: triggers model load
from ai_image import analyze_image, model as clip_model  # noqa: triggers model load
from ai_moderation import compute_fake_score

sys.stderr.write("AI models loaded — server ready\n")
sys.stderr.flush()
sys.stdout.write(json.dumps({"status": "ready"}) + "\n")
sys.stdout.flush()

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        payload = json.loads(line)
        description = payload.get("description", "")
        category = payload.get("category", "Other")
        image_path = payload.get("image_path")

        text_score = analyze_text(description)

        if image_path:
            try:
                with open(image_path, "rb") as f:
                    image_file = io.BytesIO(f.read())
                image_score = analyze_image(image_file, category=category)
            except Exception as img_err:
                sys.stderr.write(f"Image read error: {img_err}\n")
                image_score = 0.5
        else:
            image_score = 0.5

        fake_score = compute_fake_score(text_score, image_score, category, description)

        result = {
            "text_score": round(text_score, 4),
            "image_score": round(image_score, 4),
            "fake_score": round(fake_score, 4),
            "is_suspicious": fake_score < 0.5,
        }
    except Exception as e:
        sys.stderr.write(f"Server error: {e}\n")
        result = {
            "error": str(e),
            "text_score": 0.5,
            "image_score": 0.5,
            "fake_score": 0.5,
            "is_suspicious": False,
        }

    sys.stdout.write(json.dumps(result) + "\n")
    sys.stdout.flush()
