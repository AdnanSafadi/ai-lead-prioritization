import { Request, Response } from "express";
import { ImportService } from "../services/importService";

export class ImportController {
    static async importLeads(_req: Request, res: Response) {
        try {
            const result = await ImportService.importLeads();
            res.json(result);
        } catch (e: any) {
            res.status(500).json({ error: e.message ?? String(e) });
        }
    }
}
