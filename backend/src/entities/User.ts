import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { VacationRequest } from "./VacationRequest";

export enum UserRole {
    REQUESTER = "Requester",
    VALIDATOR = "Validator",
}

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100 })
    name!: string;

    @Column({
        type: "enum",
        enum: UserRole,
    })
    role!: UserRole;

    @OneToMany(() => VacationRequest, (request) => request.user)
    vacationRequests!: VacationRequest[];
}