def compute_fake_score(text_score, image_score, category, description):
    # Image is now more reliable (CLIP) so give it more weight
    final_score = (0.4 * text_score) + (0.6 * image_score)

    # Penalty if category not mentioned in description
    if category.lower() not in description.lower():
        final_score -= 0.05  # reduced penalty since NLP handles this

    # Both scores very low = almost certainly fake
    if text_score < 0.3 and image_score < 0.3:
        final_score *= 0.5  # extra penalty

    # Both scores high = boost confidence
    if text_score > 0.7 and image_score > 0.7:
        final_score = min(final_score + 0.05, 1.0)

    return max(final_score, 0.0)
