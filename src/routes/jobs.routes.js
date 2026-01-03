import { Router } from "express";
import { ejecutarEvaluacion } from "../controllers/jobs.controller.js";

const router = Router();

router.post("/jobs/evaluar", ejecutarEvaluacion);

export default router;
