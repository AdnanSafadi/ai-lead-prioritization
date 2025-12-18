import { Router } from "express";
import importRoutes from "./importRoutes";
import enrichRoutes from "./enrichRoutes";
import { HealthController } from "../controllers/healthController";

const router = Router();

router.get("/health", HealthController.check);
router.use("/import", importRoutes);
router.use("/enrich", enrichRoutes);

export default router;
