import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Service {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    description: string;

    @Column()
    service_type: string;
    
    @Column()
    price: number;

    @Column({ default: 0 })
    provider_id: number;

    @Column()
    reservation_id: number;

    @Column({ default: "pending" })
    status: "pending" | "completed" | "accepted" | "cancelled";

    constructor(
        description: string,
        price: number,
        provider_id: number = 0,
        service_type: "cleaning" | "repair" | "accessory" | "baggage",
        reservation_id: number,
        status: "pending" | "completed" | "accepted"| "cancelled" = "pending"
    ) {
        this.description = description;
        this.price = price;
        this.provider_id = provider_id;
        this.service_type = service_type;
        this.reservation_id = reservation_id;
        this.status = status;
    }
}