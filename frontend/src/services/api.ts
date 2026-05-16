import axios from "axios";
import type {
    User,
    VacationRequest,
    CreateVacationRequestInput,
    RequestStatus,
    PaginatedResult,
    GetAllRequestsParams,
} from "../types";

const api = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: { "Content-Type": "application/json" },
});

export const userApi = {
    getAll: async (): Promise<User[]> => {
        const response = await api.get<User[]>("/users");
        return response.data;
    },
};

export const vacationRequestApi = {
    create: async (input: CreateVacationRequestInput): Promise<VacationRequest> => {
        const response = await api.post<VacationRequest>("/vacation-requests", input);
        return response.data;
    },

    getByUser: async (userId: number): Promise<VacationRequest[]> => {
        const response = await api.get<VacationRequest[]>(
            `/vacation-requests/user/${userId}`
        );
        return response.data;
    },

    getAll: async (
        params: GetAllRequestsParams = {}
    ): Promise<PaginatedResult<VacationRequest>> => {
        const response = await api.get<PaginatedResult<VacationRequest>>(
            "/vacation-requests",
            { params }
        );
        return response.data;
    },

    approve: async (id: number, comments?: string): Promise<VacationRequest> => {
        const response = await api.patch<VacationRequest>(
            `/vacation-requests/${id}/approve`,
            { comments }
        );
        return response.data;
    },

    reject: async (id: number, comments: string): Promise<VacationRequest> => {
        const response = await api.patch<VacationRequest>(
            `/vacation-requests/${id}/reject`,
            { comments }
        );
        return response.data;
    },
};