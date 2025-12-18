import { supabase } from "../config/supabase";
import { extractFromTranscript } from "../enrich";
import { computeScore } from "../utils/scoring";

export class EnrichService {
    static async enrichLeads(limit: number) {
        // fetch leads to enrich
        const { data: leads, error } = await supabase
            .from("leads")
            .select("id, transcript, call_successful, needs_recall")
            .eq("call_successful", true)
            .is("extracted_at", null)
            .limit(limit);

        if (error) throw error;

        let processed = 0;

        for (const lead of leads || []) {
            const transcript = (lead.transcript || "").trim();
            if (!transcript) continue;

            const extracted = await extractFromTranscript(transcript);
            const score = computeScore(extracted, lead.call_successful, lead.needs_recall);

            const { error: upErr } = await supabase
                .from("leads")
                .update({
                    asking_price: extracted.asking_price,
                    willingness_to_negotiate: extracted.willingness_to_negotiate,
                    expected_handover_date: extracted.expected_handover_date,
                    car_condition: extracted.car_condition,
                    number_of_owners: extracted.number_of_owners,
                    user_sentiment: extracted.user_sentiment,
                    extraction_json: extracted,
                    confidence: extracted.confidence ?? null,
                    score,
                    extracted_at: new Date().toISOString(),
                })
                .eq("id", lead.id);

            if (upErr) throw upErr;

            processed += 1;
        }

        return { fetched: leads?.length ?? 0, processed };
    }
}
