import clip
import torch
from PIL import Image

# Load CLIP once at startup
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

CATEGORY_PROMPTS = {
    "Road": [
        "a photo of a pothole on road",
        "a photo of damaged road surface",
        "a photo of broken street pavement",
        "a photo of road needing repair",
        "a photo of cracked road",
    ],
    "Water": [
        "a photo of water pipe leaking",
        "a photo of sewage overflow on street",
        "a photo of waterlogging",
        "a photo of broken water pipeline",
        "a photo of water supply problem",
    ],
    "Electricity": [
        "a photo of broken electric pole",
        "a photo of hanging electric wire",
        "a photo of damaged streetlight",
        "a photo of electricity infrastructure problem",
        "a photo of fallen power line",
    ],
    "Waste": [
        "a photo of garbage dump on street",
        "a photo of overflowing dustbin",
        "a photo of waste and litter",
        "a photo of garbage not collected",
        "a photo of dirty littered area",
    ],
    "Other": [
        "a photo of civic infrastructure problem",
        "a photo of public property damage",
        "a photo of community issue needing attention",
    ],
}

NEGATIVE_PROMPTS = [
    "a selfie or personal photo",
    "a food photo",
    "a nature or landscape photo",
    "a random irrelevant image",
    "a fake or unrelated image",
    "a screenshot or meme",
]


def analyze_image(image_file, category="Other"):
    try:
        # Open image
        image = Image.open(image_file).convert("RGB")
        image.load()
        image_input = preprocess(image).unsqueeze(0).to(device)

        # Get prompts for category
        positive_prompts = CATEGORY_PROMPTS.get(
            category,
            CATEGORY_PROMPTS["Other"]
        )
        all_prompts = positive_prompts + NEGATIVE_PROMPTS

        # Tokenize
        text_tokens = clip.tokenize(all_prompts).to(device)

        # Run CLIP
        with torch.no_grad():
            image_features = model.encode_image(image_input)
            text_features = model.encode_text(text_tokens)

            image_features /= image_features.norm(dim=-1, keepdim=True)
            text_features /= text_features.norm(dim=-1, keepdim=True)

            similarity = (100.0 * image_features @ text_features.T).softmax(dim=-1)

        scores = similarity[0].tolist()
        n_positive = len(positive_prompts)

        positive_score = sum(scores[:n_positive]) / n_positive
        negative_score = sum(scores[n_positive:]) / len(NEGATIVE_PROMPTS)

        # Higher score if image matches category
        final_score = positive_score / (positive_score + negative_score + 1e-6)

        return min(final_score, 1.0)

    except Exception as e:
        print(f"Image analysis error: {e}")
        return 0.3
