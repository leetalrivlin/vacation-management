import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { VacationRequest } from "../entities/VacationRequest";

export const TestDataSource = new DataSource({
    type: "postgres",
    host: process.env.TEST_DB_HOST || "localhost",
    port: parseInt(process.env.TEST_DB_PORT || "5432", 10),
    username: process.env.TEST_DB_USERNAME || "vacation_user",
    password: process.env.TEST_DB_PASSWORD || "vacation_pass",
    database: process.env.TEST_DB_DATABASE || "vacation_management_test",
    synchronize: true,
    dropSchema: true,
    logging: false,
    entities: [User, VacationRequest],
});