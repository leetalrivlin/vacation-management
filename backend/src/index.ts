import "reflect-metadata";
import dotenv from "dotenv";
import { AppDataSource } from "./config/data-source";
import { createApp } from "./app";

dotenv.config();

const PORT = parseInt(process.env.PORT || "3000", 10);
const app = createApp();

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