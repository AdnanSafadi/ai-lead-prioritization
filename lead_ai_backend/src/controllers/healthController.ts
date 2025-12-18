import { Request, Response } from "express";

export class HealthController {
    static check(_req: Request, res: Response) {
        res.json({ ok: true });
    }
}
