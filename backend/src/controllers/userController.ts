import { Request, Response, NextFunction } from "express";
import * as service from "../services/userService";

export async function getAll(req: Request, res: Response, next: NextFunction) {
    try {
        const users = await service.getAllUsers();
        res.json(users);
    } catch (err) {
        next(err);
    }
}