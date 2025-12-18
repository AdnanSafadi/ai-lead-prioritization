import { Router } from "express";
import { EnrichController } from "../controllers/enrichController";

const router = Router();

router.post("/", EnrichController.enrichLeads);

export default router;
