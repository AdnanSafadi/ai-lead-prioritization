import { Request, Response } from "express";
import { EnrichService } from "../services/enrichService";

export class EnrichController {
    static async enrichLeads(req: Request, res: Response) {
        try {
            const limit = Number(req.query.limit || 10);
            const result = await EnrichService.enrichLeads(limit);
            res.json(result);
        } catch (e: any) {
            res.status(500).json({ error: e.message ?? String(e) });
        }
    }
}
