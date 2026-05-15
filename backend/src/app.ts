import "reflect-metadata";
import express, { Application } from "express";
import cors from "cors";
import vacationRequestRoutes from "./routes/vacationRequestRoutes";
import userRoutes from "./routes/userRoutes";
import { errorHandler } from "./middleware/errorHandler";

export function createApp(): Application {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.get("/health", (req, res) => {
        res.json({ status: "ok", message: "Backend is running" });
    });

    app.use("/api/vacation-requests", vacationRequestRoutes);
    app.use("/api/users", userRoutes);

    app.use(errorHandler);

    return app;
}