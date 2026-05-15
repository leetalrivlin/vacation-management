import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from "typeorm";
import { User } from "./User";

export enum RequestStatus {
    PENDING = "Pending",
    APPROVED = "Approved",
    REJECTED = "Rejected",
}

@Entity("vacation_requests")
export class VacationRequest {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (user) => user.vacationRequests, { eager: true })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ name: "user_id" })
    userId!: number;

    @Column({ name: "start_date", type: "date" })
    startDate!: string;

    @Column({ name: "end_date", type: "date" })
    endDate!: string;

    @Column({ type: "text", nullable: true })
    reason?: string;

    @Column({
        type: "enum",
        enum: RequestStatus,
        default: RequestStatus.PENDING,
    })
    status!: RequestStatus;

    @Column({ type: "text", nullable: true })
    comments?: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;
}