import { AppDataSource } from "../config/data-source";
import { VacationRequest, RequestStatus } from "../entities/VacationRequest";
import { User } from "../entities/User";
import { NotFoundError, BadRequestError } from "../middleware/errorHandler";

const requestRepo = () => AppDataSource.getRepository(VacationRequest);
const userRepo = () => AppDataSource.getRepository(User);

export interface CreateRequestInput {
    userId: number;
    startDate: string;
    endDate: string;
    reason?: string;
}

export async function createVacationRequest(
    input: CreateRequestInput
): Promise<VacationRequest> {
    const user = await userRepo().findOneBy({ id: input.userId });
    if (!user) {
        throw new NotFoundError(`User with id ${input.userId} not found`);
    }

    const request = requestRepo().create({
        userId: input.userId,
        startDate: input.startDate,
        endDate: input.endDate,
        reason: input.reason,
        status: RequestStatus.PENDING,
    });

    return await requestRepo().save(request);
}

export async function getRequestsByUser(userId: number): Promise<VacationRequest[]> {
    return await requestRepo().find({
        where: { userId },
        order: { createdAt: "DESC" },
    });
}

export interface GetAllRequestsOptions {
    status?: RequestStatus;
    search?: string;
    page: number;
    pageSize: number;
}

export interface PaginatedRequests {
    items: VacationRequest[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export async function getAllRequests(
    options: GetAllRequestsOptions
): Promise<PaginatedRequests> {
    const { status, search, page, pageSize } = options;

    const qb = requestRepo()
        .createQueryBuilder("request")
        .leftJoinAndSelect("request.user", "user")
        .orderBy("request.createdAt", "DESC")
        .skip((page - 1) * pageSize)
        .take(pageSize);

    if (status) {
        qb.andWhere("request.status = :status", { status });
    }

    if (search) {
        const needle = `%${search.toLowerCase()}%`;
        qb.andWhere(
            "(LOWER(user.name) LIKE :needle OR LOWER(request.reason) LIKE :needle OR LOWER(request.comments) LIKE :needle)",
            { needle }
        );
    }

    const [items, total] = await qb.getManyAndCount();
    return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
}

export async function approveRequest(
    id: number,
    comments?: string
): Promise<VacationRequest> {
    const request = await requestRepo().findOneBy({ id });
    if (!request) {
        throw new NotFoundError(`Request with id ${id} not found`);
    }

    if (request.status !== RequestStatus.PENDING) {
        throw new BadRequestError(
            `Cannot approve a request that is already ${request.status}`
        );
    }

    request.status = RequestStatus.APPROVED;
    if (comments) request.comments = comments;

    return await requestRepo().save(request);
}

export async function rejectRequest(
    id: number,
    comments: string
): Promise<VacationRequest> {
    const request = await requestRepo().findOneBy({ id });
    if (!request) {
        throw new NotFoundError(`Request with id ${id} not found`);
    }

    if (request.status !== RequestStatus.PENDING) {
        throw new BadRequestError(
            `Cannot reject a request that is already ${request.status}`
        );
    }

    request.status = RequestStatus.REJECTED;
    request.comments = comments;

    return await requestRepo().save(request);
}