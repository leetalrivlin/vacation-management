import { Router } from "express";
import * as controller from "../controllers/vacationRequestController";
import {
    validateVacationRequest,
    validateRejection,
} from "../middleware/validation";

const router = Router();

router.post("/", validateVacationRequest, controller.create);
router.get("/", controller.getAll);
router.get("/user/:userId", controller.getByUser);
router.patch("/:id/approve", controller.approve);
router.patch("/:id/reject", validateRejection, controller.reject);

export default router;