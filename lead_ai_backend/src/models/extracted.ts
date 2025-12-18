export type Extracted = {
    asking_price: number | null;
    willingness_to_negotiate: "high" | "medium" | "low" | "unclear";
    expected_handover_date: "immediate" | "1-2 weeks" | "2-4 weeks" | "flexible" | "unclear";
    car_condition: "excellent" | "good" | "fair" | "poor" | "unclear";
    number_of_owners: number | null;
    user_sentiment: "positive" | "neutral" | "negative" | "unclear";
    confidence?: Record<string, number>;
    notes?: string;
};
