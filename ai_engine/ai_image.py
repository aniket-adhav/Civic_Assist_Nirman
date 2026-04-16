import sys
import clip
import torch
from PIL import Image

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
        "a photo of waterlogging on road",
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
        "a photo of waste and litter on ground",
        "a photo of garbage not collected",
        "a photo of dirty littered area with trash",
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
    "a nature landscape photo",
    "a random irrelevant image",
    "a fake or unrelated image",
    "a screenshot or meme",
    "a traffic signal or traffic light",
    "a vehicle or car photo",
    "an indoor photo",
    "a sky or cloud photo",
    "a person or crowd photo",
    "an animal photo",
    "a building exterior photo",
    "a map or diagram",
]


def analyze_image(image_file, category="Other"):
    try:
        image = Image.open(image_file).convert("RGB")
        image.load()
        image_input = preprocess(image).unsqueeze(0).to(device)

        positive_prompts = CATEGORY_PROMPTS.get(category, CATEGORY_PROMPTS["Other"])
        all_prompts = positive_prompts + NEGATIVE_PROMPTS

        text_tokens = clip.tokenize(all_prompts).to(device)

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

        final_score = positive_score / (positive_score + negative_score + 1e-6)

        return min(final_score, 1.0)

    except Exception as e:
        print(f"Image analysis error: {e}", file=sys.stderr)
        return 0.3
