import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Service {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    description: string;
    
    @Column()
    price: number;

    @Column()
    provider_id: number;

    constructor(
        description: string,
        price: number,
        provider_id: number,
    ) {
        this.description = description;
        this.price = price;
        this.provider_id = provider_id;
    }
}
