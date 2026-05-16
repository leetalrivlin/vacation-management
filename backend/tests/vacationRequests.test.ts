import request from "supertest";
import { createApp } from "../src/app";
import { initTestDb, closeTestDb, seedUsers } from "./setup";
import { User } from "../src/entities/User";

const app = createApp();
let requester: User;
let otherRequester: User;

beforeAll(async () => {
    await initTestDb();
});

beforeEach(async () => {
    await initTestDb();
    const users = await seedUsers();
    requester = users[0];
    otherRequester = users[1];
});

afterAll(async () => {
    await closeTestDb();
});

describe("POST /api/vacation-requests", () => {
    it("creates a vacation request with required fields", async () => {
        const response = await request(app)
            .post("/api/vacation-requests")
            .send({
                userId: requester.id,
                startDate: "2026-06-01",
                endDate: "2026-06-05",
                reason: "Summer trip",
            });

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            userId: requester.id,
            startDate: "2026-06-01",
            endDate: "2026-06-05",
            reason: "Summer trip",
            status: "Pending",
        });
        expect(response.body.id).toBeDefined();
        expect(response.body.createdAt).toBeDefined();
    });

    it("creates a request without a reason (reason is optional)", async () => {
        const response = await request(app)
            .post("/api/vacation-requests")
            .send({
                userId: requester.id,
                startDate: "2026-06-01",
                endDate: "2026-06-05",
            });

        expect(response.status).toBe(201);
        expect(response.body.reason).toBeNull();
    });

    it("rejects a request with missing startDate", async () => {
        const response = await request(app)
            .post("/api/vacation-requests")
            .send({ userId: requester.id, endDate: "2026-06-05" });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain("startDate");
    });

    it("rejects a request where startDate is after endDate", async () => {
        const response = await request(app)
            .post("/api/vacation-requests")
            .send({
                userId: requester.id,
                startDate: "2026-06-10",
                endDate: "2026-06-05",
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain("startDate must be before");
    });

    it("rejects a request for a non-existent user", async () => {
        const response = await request(app)
            .post("/api/vacation-requests")
            .send({
                userId: 99999,
                startDate: "2026-06-01",
                endDate: "2026-06-05",
            });

        expect(response.status).toBe(404);
        expect(response.body.error).toContain("not found");
    });
});

describe("GET /api/vacation-requests/user/:userId", () => {
    it("returns only the specified user's requests", async () => {
        await request(app).post("/api/vacation-requests").send({
            userId: requester.id,
            startDate: "2026-06-01",
            endDate: "2026-06-05",
        });
        await request(app).post("/api/vacation-requests").send({
            userId: otherRequester.id,
            startDate: "2026-07-01",
            endDate: "2026-07-05",
        });

        const response = await request(app).get(
            `/api/vacation-requests/user/${requester.id}`
        );

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].userId).toBe(requester.id);
    });

    it("returns an empty array when the user has no requests", async () => {
        const response = await request(app).get(
            `/api/vacation-requests/user/${requester.id}`
        );

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });
});

describe("GET /api/vacation-requests", () => {
    beforeEach(async () => {
        await request(app).post("/api/vacation-requests").send({
            userId: requester.id,
            startDate: "2026-06-01",
            endDate: "2026-06-05",
        });
        await request(app).post("/api/vacation-requests").send({
            userId: otherRequester.id,
            startDate: "2026-07-01",
            endDate: "2026-07-05",
        });
    });

    it("returns paginated requests", async () => {
        const response = await request(app).get("/api/vacation-requests");
        expect(response.status).toBe(200);
        expect(response.body.items).toHaveLength(2);
        expect(response.body.total).toBe(2);
        expect(response.body.page).toBe(1);
        expect(response.body.totalPages).toBe(1);
    });

    it("paginates with page and pageSize", async () => {
        const first = await request(app).get(
            "/api/vacation-requests?page=1&pageSize=1"
        );
        expect(first.status).toBe(200);
        expect(first.body.items).toHaveLength(1);
        expect(first.body.total).toBe(2);
        expect(first.body.totalPages).toBe(2);

        const second = await request(app).get(
            "/api/vacation-requests?page=2&pageSize=1"
        );
        expect(second.body.items).toHaveLength(1);
        expect(second.body.items[0].id).not.toBe(first.body.items[0].id);
    });

    it("filters by status", async () => {
        const response = await request(app).get(
            "/api/vacation-requests?status=Pending"
        );
        expect(response.status).toBe(200);
        expect(response.body.items).toHaveLength(2);
        expect(response.body.items.every((r: any) => r.status === "Pending")).toBe(true);
    });

    it("searches by user name, reason, or comments", async () => {
        await request(app).post("/api/vacation-requests").send({
            userId: requester.id,
            startDate: "2026-08-01",
            endDate: "2026-08-05",
            reason: "Wedding anniversary trip",
        });

        const response = await request(app).get(
            "/api/vacation-requests?search=anniversary"
        );
        expect(response.status).toBe(200);
        expect(response.body.items).toHaveLength(1);
        expect(response.body.items[0].reason).toContain("anniversary");
    });

    it("rejects an invalid status filter", async () => {
        const response = await request(app).get(
            "/api/vacation-requests?status=InvalidStatus"
        );
        expect(response.status).toBe(400);
        expect(response.body.error).toContain("Invalid status");
    });

    it("rejects an invalid page parameter", async () => {
        const response = await request(app).get("/api/vacation-requests?page=0");
        expect(response.status).toBe(400);
    });
});

describe("PATCH /api/vacation-requests/:id/approve", () => {
    it("approves a pending request", async () => {
        const created = await request(app).post("/api/vacation-requests").send({
            userId: requester.id,
            startDate: "2026-06-01",
            endDate: "2026-06-05",
        });

        const response = await request(app)
            .patch(`/api/vacation-requests/${created.body.id}/approve`)
            .send({});

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("Approved");
    });

    it("rejects approving an already-approved request", async () => {
        const created = await request(app).post("/api/vacation-requests").send({
            userId: requester.id,
            startDate: "2026-06-01",
            endDate: "2026-06-05",
        });

        await request(app)
            .patch(`/api/vacation-requests/${created.body.id}/approve`)
            .send({});
        const response = await request(app)
            .patch(`/api/vacation-requests/${created.body.id}/approve`)
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toContain("already");
    });

    it("returns 404 for a non-existent request", async () => {
        const response = await request(app)
            .patch("/api/vacation-requests/99999/approve")
            .send({});

        expect(response.status).toBe(404);
    });
});

describe("PATCH /api/vacation-requests/:id/reject", () => {
    it("rejects a pending request with a comment", async () => {
        const created = await request(app).post("/api/vacation-requests").send({
            userId: requester.id,
            startDate: "2026-06-01",
            endDate: "2026-06-05",
        });

        const response = await request(app)
            .patch(`/api/vacation-requests/${created.body.id}/reject`)
            .send({ comments: "Team is short-staffed" });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("Rejected");
        expect(response.body.comments).toBe("Team is short-staffed");
    });

    it("rejects rejection without a comment", async () => {
        const created = await request(app).post("/api/vacation-requests").send({
            userId: requester.id,
            startDate: "2026-06-01",
            endDate: "2026-06-05",
        });

        const response = await request(app)
            .patch(`/api/vacation-requests/${created.body.id}/reject`)
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toContain("comment is required");
    });

    it("rejects rejection with an empty comment", async () => {
        const created = await request(app).post("/api/vacation-requests").send({
            userId: requester.id,
            startDate: "2026-06-01",
            endDate: "2026-06-05",
        });

        const response = await request(app)
            .patch(`/api/vacation-requests/${created.body.id}/reject`)
            .send({ comments: "   " });

        expect(response.status).toBe(400);
    });
});