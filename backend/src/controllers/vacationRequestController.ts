import { Request, Response, NextFunction } from "express";
import * as service from "../services/vacationRequestService";
import { RequestStatus } from "../entities/VacationRequest";
import { NotFoundError, BadRequestError } from "../middleware/errorHandler";

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const request = await service.createVacationRequest(req.body);
        res.status(201).json(request);
    } catch (err) {
        handleError(err, res, next);
    }
}

export async function getByUser(req: Request, res: Response, next: NextFunction) {
    try {
        const userIdParam = req.params.userId;
        if (typeof userIdParam !== "string") {
            res.status(400).json({ error: "Invalid userId" });
            return;
        }
        const userId = parseInt(userIdParam, 10);
        if (isNaN(userId)) {
            res.status(400).json({ error: "Invalid userId" });
            return;
        }
        const requests = await service.getRequestsByUser(userId);
        res.json(requests);
    } catch (err) {
        handleError(err, res, next);
    }
}

export async function getAll(req: Request, res: Response, next: NextFunction) {
    try {
        const rawStatus = req.query.status;
        let status: RequestStatus | undefined;

        if (rawStatus !== undefined) {
            if (typeof rawStatus !== "string") {
                res.status(400).json({ error: "status must be a single string value" });
                return;
            }
            if (!Object.values(RequestStatus).includes(rawStatus as RequestStatus)) {
                res.status(400).json({
                    error: `Invalid status. Must be one of: ${Object.values(RequestStatus).join(", ")}`,
                });
                return;
            }
            status = rawStatus as RequestStatus;
        }

        const requests = await service.getAllRequests(status);
        res.json(requests);
    } catch (err) {
        handleError(err, res, next);
    }
}

export async function approve(req: Request, res: Response, next: NextFunction) {
    try {
        const idParam = req.params.id;
        if (typeof idParam !== "string") {
            res.status(400).json({ error: "Invalid id" });
            return;
        }
        const id = parseInt(idParam, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid id" });
            return;
        }
        const request = await service.approveRequest(id, req.body.comments);
        res.json(request);
    } catch (err) {
        handleError(err, res, next);
    }
}

export async function reject(req: Request, res: Response, next: NextFunction) {
    try {
        const idParam = req.params.id;
        if (typeof idParam !== "string") {
            res.status(400).json({ error: "Invalid id" });
            return;
        }
        const id = parseInt(idParam, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid id" });
            return;
        }
        const request = await service.rejectRequest(id, req.body.comments);
        res.json(request);
    } catch (err) {
        handleError(err, res, next);
    }
}

function handleError(err: unknown, res: Response, next: NextFunction) {
    if (err instanceof NotFoundError) {
        res.status(404).json({ error: err.message });
    } else if (err instanceof BadRequestError) {
        res.status(400).json({ error: err.message });
    } else {
        next(err);
    }
}