from transformers import pipeline

# Load once at startup
classifier = pipeline(
    "zero-shot-classification",
    model="cross-encoder/nli-MiniLM2-L6-H768"
)

CIVIC_LABELS = [
    "road or pothole complaint",
    "water or sewage complaint", 
    "electricity or power complaint",
    "waste or garbage complaint",
    "civic infrastructure complaint",
    "spam or irrelevant message",
]

NEGATIVE_LABELS = ["spam or irrelevant message"]

def analyze_text(description):
    try:
        # Too short — skip NLP
        if len(description.split()) < 3:
            return 0.1
        
        result = classifier(description, CIVIC_LABELS)
        
        # Sum scores of all civic labels
        civic_score = sum(
            score 
            for label, score in zip(result['labels'], result['scores'])
            if label not in NEGATIVE_LABELS
        )
        
        # Penalty if spam label scores highest
        top_label = result['labels'][0]
        if top_label in NEGATIVE_LABELS:
            civic_score *= 0.3
        
        return min(civic_score, 1.0)

    except Exception as e:
        print(f"Text analysis error: {e}")
        return 0.5