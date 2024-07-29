import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Property {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    address: string;

    @Column()
    price: number;

    @Column()
    owner_id: number;

    @Column()
    availabilityCalendar: string;

    @Column({ nullable: true })
    imageUrl?: string;

    constructor(
        name: string,
        description: string,
        address: string,
        price: number,
        owner_id: number,
        availabilityCalendar: string,
        imageUrl?: string,
    ) {
        this.name = name;
        this.description = description;
        this.address = address;
        this.price = price;
        this.owner_id = owner_id;
        this.availabilityCalendar = availabilityCalendar;
        this.imageUrl = imageUrl;
    }
}
