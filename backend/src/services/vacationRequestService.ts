import { AppDataSource } from "../config/data-source";
import { VacationRequest, RequestStatus } from "../entities/VacationRequest";
import { User } from "../entities/User";
import { NotFoundError, BadRequestError } from "../middleware/errorHandler";

const requestRepository = AppDataSource.getRepository(VacationRequest);
const userRepository = AppDataSource.getRepository(User);

export interface CreateRequestInput {
    userId: number;
    startDate: string;
    endDate: string;
    reason?: string;
}

export async function createVacationRequest(
    input: CreateRequestInput
): Promise<VacationRequest> {
    const user = await userRepository.findOneBy({ id: input.userId });
    if (!user) {
        throw new NotFoundError(`User with id ${input.userId} not found`);
    }

    const request = requestRepository.create({
        userId: input.userId,
        startDate: input.startDate,
        endDate: input.endDate,
        reason: input.reason,
        status: RequestStatus.PENDING,
    });

    return await requestRepository.save(request);
}

export async function getRequestsByUser(userId: number): Promise<VacationRequest[]> {
    return await requestRepository.find({
        where: { userId },
        order: { createdAt: "DESC" },
    });
}

export async function getAllRequests(
    status?: RequestStatus
): Promise<VacationRequest[]> {
    const where = status ? { status } : {};
    return await requestRepository.find({
        where,
        order: { createdAt: "DESC" },
    });
}

export async function approveRequest(
    id: number,
    comments?: string
): Promise<VacationRequest> {
    const request = await requestRepository.findOneBy({ id });
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

    return await requestRepository.save(request);
}

export async function rejectRequest(
    id: number,
    comments: string
): Promise<VacationRequest> {
    const request = await requestRepository.findOneBy({ id });
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

    return await requestRepository.save(request);
}