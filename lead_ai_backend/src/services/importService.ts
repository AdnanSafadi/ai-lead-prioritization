import path from "path";
import xlsx from "xlsx";
import { supabase } from "../config/supabase";
import { detectCallOutcome } from "../utils/helpers";

export class ImportService {
    static async importLeads() {
        const filePath = path.join(process.cwd(), "data", "call_transcripts.xlsx");
        const wb = xlsx.readFile(filePath);
        const sheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];

        const rows = xlsx.utils.sheet_to_json<Record<string, any>>(sheet, { defval: null, range: 1 });

        // Map Excel columns -> DB columns
        const payload = rows.map((r) => {
            const external_id = r["ID"]?.toString() ?? null;
            const call_successful = typeof r["Call successful"] === "boolean" ? r["Call successful"] : null;

            const transcript = r["Transcript"] ?? null;

            const call_outcome = detectCallOutcome(transcript, call_successful);
            const needs_recall = call_successful === false || call_outcome !== "success";

            return {
                external_id,
                first_name: r["Name"] ?? null,
                last_name: r["Last Name"] ?? null,
                make: r["Make"] ?? null,
                model: r["Modell"] ?? null,
                year: r["Year"] ?? null,
                mileage: r["Mileage"] ?? null,
                price_estimation: r["Price estimation"] ?? null,
                status: r["Status"] ?? null,
                call_successful,
                call_outcome,
                needs_recall,
                transcript,
            };
        });

        // Filter out rows without external_id (recommended)
        const filtered = payload.filter((p) => p.external_id);

        const { data, error } = await supabase
            .from("leads")
            .upsert(filtered, { onConflict: "external_id" })
            .select("id, external_id");

        if (error) throw error;

        return {
            imported: filtered.length,
            upserted: data?.length ?? 0,
        };
    }
}
