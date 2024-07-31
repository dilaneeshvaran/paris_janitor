import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Invoice {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    amount: number;
    
    @Column()
    client_id: number;

    @Column()
    date: string;

    @Column({ default: 0 })
    reservation_id: number;

    @Column({ default: 0 })
    service_id: number;
    


    constructor(
        amount: number,
        client_id: number,
        date: string,
        reservation_id: number = 0,
        service_id: number = 0,

    ) {
        this.amount = amount;
        this.client_id = client_id;
        this.date = date;
        this.service_id = service_id;
        this.reservation_id = reservation_id;
    }
}
