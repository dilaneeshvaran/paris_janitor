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

    constructor(
        amount: number,
        client_id: number,
        date: string,
    ) {
        this.amount = amount;
        this.client_id = client_id;
        this.date = date;
    }
}
