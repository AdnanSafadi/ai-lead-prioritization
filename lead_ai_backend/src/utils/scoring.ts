import { Extracted } from "../models/extracted";

export function computeScore(x: Extracted, callSuccessful: boolean | null, needsRecall: boolean): number {
    // If call not successful → low score
    if (!callSuccessful || needsRecall) return 10;

    let score = 0;

    // Handover (0..30)
    const handoverMap: Record<string, number> = {
        "immediate": 30,
        "1-2 weeks": 24,
        "2-4 weeks": 16,
        "flexible": 12,
        "unclear": 8,
    };
    score += handoverMap[x.expected_handover_date] ?? 8;

    // Condition (0..25)
    const condMap: Record<string, number> = {
        "excellent": 25,
        "good": 20,
        "fair": 12,
        "poor": 5,
        "unclear": 10,
    };
    score += condMap[x.car_condition] ?? 10;

    // Negotiation (0..20)
    const negMap: Record<string, number> = {
        "high": 20,
        "medium": 14,
        "low": 6,
        "unclear": 10,
    };
    score += negMap[x.willingness_to_negotiate] ?? 10;

    // Sentiment (0..10)
    const sentMap: Record<string, number> = {
        "positive": 10,
        "neutral": 7,
        "negative": 3,
        "unclear": 6,
    };
    score += sentMap[x.user_sentiment] ?? 6;

    // Owners (0..10) — fewer owners is usually better
    if (x.number_of_owners == null) score += 6;
    else if (x.number_of_owners <= 1) score += 10;
    else if (x.number_of_owners === 2) score += 8;
    else if (x.number_of_owners === 3) score += 6;
    else score += 4;

    // Completeness bonus (±5)
    const fields = [
        x.asking_price != null,
        x.willingness_to_negotiate !== "unclear",
        x.expected_handover_date !== "unclear",
        x.car_condition !== "unclear",
        x.number_of_owners != null,
        x.user_sentiment !== "unclear",
    ];
    const known = fields.filter(Boolean).length;
    score += known >= 5 ? 5 : known <= 2 ? -3 : 0;

    // Clamp 0..100
    score = Math.max(0, Math.min(100, Math.round(score)));
    return score;
}
