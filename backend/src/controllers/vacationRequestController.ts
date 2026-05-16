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

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

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

        const rawSearch = req.query.search;
        let search: string | undefined;
        if (rawSearch !== undefined) {
            if (typeof rawSearch !== "string") {
                res.status(400).json({ error: "search must be a single string value" });
                return;
            }
            const trimmed = rawSearch.trim();
            if (trimmed) search = trimmed;
        }

        const page = parsePositiveInt(req.query.page, 1);
        if (page === null) {
            res.status(400).json({ error: "page must be a positive integer" });
            return;
        }

        const pageSize = parsePositiveInt(req.query.pageSize, DEFAULT_PAGE_SIZE);
        if (pageSize === null || pageSize > MAX_PAGE_SIZE) {
            res.status(400).json({
                error: `pageSize must be a positive integer up to ${MAX_PAGE_SIZE}`,
            });
            return;
        }

        const result = await service.getAllRequests({ status, search, page, pageSize });
        res.json(result);
    } catch (err) {
        handleError(err, res, next);
    }
}

function parsePositiveInt(value: unknown, fallback: number): number | null {
    if (value === undefined) return fallback;
    if (typeof value !== "string") return null;
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 1 || String(n) !== value) return null;
    return n;
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