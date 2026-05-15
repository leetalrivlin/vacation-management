import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { User, UserRole } from "../entities/User";

async function seed() {
    await AppDataSource.initialize();
    const userRepository = AppDataSource.getRepository(User);

    const existingUsers = await userRepository.count();
    if (existingUsers > 0) {
        console.log(`Database already has ${existingUsers} users. Skipping seed.`);
        await AppDataSource.destroy();
        return;
    }

    const users = userRepository.create([
        { name: "Alice (Requester)", role: UserRole.REQUESTER },
        { name: "Bob (Requester)", role: UserRole.REQUESTER },
        { name: "Carol (Validator)", role: UserRole.VALIDATOR },
    ]);

    await userRepository.save(users);
    console.log(`✓ Seeded ${users.length} users`);
    await AppDataSource.destroy();
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});