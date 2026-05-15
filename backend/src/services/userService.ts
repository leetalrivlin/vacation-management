import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";

const userRepo = () => AppDataSource.getRepository(User);

export async function getAllUsers(): Promise<User[]> {
    return await userRepo().find({ order: { id: "ASC" } });
}