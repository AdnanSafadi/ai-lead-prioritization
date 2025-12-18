export function detectCallOutcome(transcript?: string | null, callSuccessful?: boolean | null): string {
    const t = (transcript || "").toLowerCase().trim();
    if (callSuccessful === true) return "success";
    if (!t) return "empty";
    if (t.includes("voicemail") || t.includes("mobilbox") || t.includes("mailbox")) return "voicemail";
    if (t.includes("not available") || t.includes("cannot be reached")) return "no_answer";
    return "unknown";
}
