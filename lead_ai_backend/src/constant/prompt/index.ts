export const SYSTEM_PROMPT = `You are an Analyst extracting structured lead data from a car seller conversation transcript.
Return ONLY valid JSON, no markdown, no extra text. Use the allowed labels exactly.`;

export const getUserPrompt = (transcript: string) => `Extract these fields from the transcript:
- asking_price: final price mentioned (number, EUR). If none, null.
- willingness_to_negotiate: high | medium | low | unclear
- expected_handover_date: immediate | 1-2 weeks | 2-4 weeks | flexible | unclear
- car_condition: excellent | good | fair | poor | unclear
- number_of_owners: integer or null
- user_sentiment: positive | neutral | negative | unclear

Also include:
- confidence: object with 0..1 for each field (optional but helpful)
- notes: short string (optional)

Transcript:
"""${transcript}"""`;
