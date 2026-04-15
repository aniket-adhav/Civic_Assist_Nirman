from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from ai_text import analyze_text
from ai_image import analyze_image
from ai_moderation import compute_fake_score
import uvicorn

app = FastAPI()

# Allow Node.js to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "AI service running ✅"}

@app.post("/analyze")
async def analyze_complaint(
    description: str = Form(...),
    category: str = Form(...),
    image: UploadFile = File(None)  # optional
):
    # Text analysis
    text_score = analyze_text(description)

    # Image analysis
    if image:
        image_bytes = await image.read()
        import io
        from PIL import Image
        image_file = io.BytesIO(image_bytes)
        image_score = analyze_image(image_file, category=category)
    else:
        image_score = 0.5

    # Final score
    fake_score = compute_fake_score(
        text_score, image_score, category, description
    )

    return {
        "text_score": round(text_score, 4),
        "image_score": round(image_score, 4),
        "fake_score": round(fake_score, 4),
        "is_suspicious": fake_score < 0.5
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)