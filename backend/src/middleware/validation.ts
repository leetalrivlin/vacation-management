import { Request, Response, NextFunction } from "express";

export function validateVacationRequest(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const { userId, startDate, endDate } = req.body;

    if (!userId || typeof userId !== "number") {
        res.status(400).json({ error: "userId is required and must be a number" });
        return;
    }

    if (!startDate || !endDate) {
        res.status(400).json({ error: "startDate and endDate are required" });
        return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
        return;
    }

    if (start > end) {
        res.status(400).json({ error: "startDate must be before or equal to endDate" });
        return;
    }

    next();
}

export function validateRejection(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const { comments } = req.body;

    if (!comments || typeof comments !== "string" || comments.trim().length === 0) {
        res.status(400).json({ error: "A comment is required when rejecting a request" });
        return;
    }

    next();
}