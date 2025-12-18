import { Router } from "express";
import { ImportController } from "../controllers/importController";

const router = Router();

router.post("/", ImportController.importLeads);

export default router;
