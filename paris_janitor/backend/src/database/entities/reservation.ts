import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Reservation {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    property_id: number;

    @Column()
    client_id: number;

    @Column()
    traveler_id: number;

    @Column()
    startDate: string;

    @Column()
    endDate: string;

    @Column()
    status: string;

    constructor(
        property_id: number,
        client_id: number,
        traveler_id: number,
        startDate: string,
        endDate: string,
        status: string,
    ) {
        this.property_id = property_id;
        this.client_id = client_id;
        this.traveler_id = traveler_id;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }
}
