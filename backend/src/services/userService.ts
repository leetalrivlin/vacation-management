import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";

const userRepository = AppDataSource.getRepository(User);

export async function getAllUsers(): Promise<User[]> {
    return await userRepository.find({ order: { id: "ASC" } });
}