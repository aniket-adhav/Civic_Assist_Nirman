def compute_fake_score(text_score, image_score, category, description):
    final_score = (0.4 * text_score) + (0.6 * image_score)

    if category.lower() not in description.lower():
        final_score -= 0.05

    if text_score < 0.3 and image_score < 0.3:
        final_score *= 0.5

    if text_score > 0.7 and image_score > 0.7:
        final_score = min(final_score + 0.05, 1.0)

    mismatch = abs(text_score - image_score)
    if mismatch > 0.4:
        final_score -= 0.15

    if image_score < 0.25:
        final_score -= 0.10

    return max(final_score, 0.0)
