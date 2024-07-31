import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Availability {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    property_id: number;
    
    @Column({ type: 'date' })
    start_date: Date;

    @Column({ type: 'date' })
    end_date: Date;

    @Column()
    reservation_id: number;

    constructor(property_id: number, start_date: Date, end_date: Date, reservation_id: number) {
        this.property_id = property_id;
        this.start_date = start_date;
        this.end_date = end_date;
        this.reservation_id = reservation_id;
    }
}
