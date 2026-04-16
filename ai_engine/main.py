import sys
import json
import io

from ai_text import analyze_text
from ai_image import analyze_image
from ai_moderation import compute_fake_score


def main():
    try:
        input_data = json.loads(sys.argv[1])

        description = input_data.get("description", "")
        category = input_data.get("category", "Other")
        image_path = input_data.get("image_path")

        text_score = analyze_text(description)

        if image_path:
            with open(image_path, "rb") as f:
                image_file = io.BytesIO(f.read())
                image_score = analyze_image(image_file, category=category)
        else:
            image_score = 0.5

        fake_score = compute_fake_score(
            text_score, image_score, category, description
        )

        result = {
            "text_score": round(text_score, 4),
            "image_score": round(image_score, 4),
            "fake_score": round(fake_score, 4),
            "is_suspicious": fake_score < 0.5
        }

        sys.stdout.write(json.dumps(result) + "\n")
        sys.stdout.flush()

    except Exception as e:
        error_result = {
            "error": str(e),
            "text_score": 0.5,
            "image_score": 0.5,
            "fake_score": 0.5,
            "is_suspicious": False
        }
        sys.stdout.write(json.dumps(error_result) + "\n")
        sys.stdout.flush()
        print(f"AI engine exception: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
