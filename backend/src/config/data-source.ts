import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "../entities/User";
import { VacationRequest } from "../entities/VacationRequest";

dotenv.config();

export let AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true,
    logging: false,
    entities: [User, VacationRequest],
    migrations: [],
    subscribers: [],
});

export function setDataSource(ds: DataSource) {
    AppDataSource = ds;
}