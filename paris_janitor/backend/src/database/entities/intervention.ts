import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Intervention {
    @PrimaryGeneratedColumn()
    id!: number;
    
    @Column()
    service_id: number;

    @Column()
    provider_id: number;

    @Column()
    date: string;

    @Column()
    status: string;

    constructor(
        service_id: number,
        provider_id: number,
        date: string,
        status: string,
    ) {
        this.service_id = service_id;
        this.provider_id = provider_id;
        this.date = date;
        this.status = status;
    }
}
