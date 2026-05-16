export const UserRole = {
    REQUESTER: "Requester",
    VALIDATOR: "Validator",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const RequestStatus = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
} as const;
export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

export interface User {
    id: number;
    name: string;
    role: UserRole;
}

export interface VacationRequest {
    id: number;
    userId: number;
    user?: User;
    startDate: string;
    endDate: string;
    reason?: string;
    status: RequestStatus;
    comments?: string;
    createdAt: string;
}

export interface CreateVacationRequestInput {
    userId: number;
    startDate: string;
    endDate: string;
    reason?: string;
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface GetAllRequestsParams {
    status?: RequestStatus;
    search?: string;
    page?: number;
    pageSize?: number;
}