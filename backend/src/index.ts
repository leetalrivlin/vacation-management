import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/data-source";
import vacationRequestRoutes from "./routes/vacationRequestRoutes";
import userRoutes from "./routes/userRoutes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Backend is running" });
});

app.use("/api/vacation-requests", vacationRequestRoutes);
app.use("/api/users", userRoutes);

app.use(errorHandler);

AppDataSource.initialize()
    .then(() => {
        console.log("✓ Database connection established");
        app.listen(PORT, () => {
            console.log(`✓ Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("✗ Database connection failed:", error);
        process.exit(1);
    });