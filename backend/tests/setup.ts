import { TestDataSource } from "../src/config/test-data-source";
import { setDataSource } from "../src/config/data-source";
import { User, UserRole } from "../src/entities/User";

export async function initTestDb() {
    if (!TestDataSource.isInitialized) {
        await TestDataSource.initialize();
    } else {
        await TestDataSource.synchronize(true);
    }
    setDataSource(TestDataSource);
}

export async function closeTestDb() {
    if (TestDataSource.isInitialized) {
        await TestDataSource.destroy();
    }
}

export async function seedUsers() {
    const userRepo = TestDataSource.getRepository(User);
    const users = userRepo.create([
        { name: "Test Requester", role: UserRole.REQUESTER },
        { name: "Other Requester", role: UserRole.REQUESTER },
        { name: "Test Validator", role: UserRole.VALIDATOR },
    ]);
    return await userRepo.save(users);
}