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

    

    @Column({ default: false })
    pay_vip: boolean;
    
    @Column({ default: 0 })
    service_id: number;

    constructor(
        amount: number,
        client_id: number,
        date: string,
        reservation_id: number = 0,
        pay_vip: boolean = false,
        service_id: number = 0,

    ) {
        this.amount = amount;
        this.client_id = client_id;
        this.date = date;
        this.reservation_id = reservation_id;
        this.pay_vip = pay_vip;
        this.service_id = service_id;


    }
}
