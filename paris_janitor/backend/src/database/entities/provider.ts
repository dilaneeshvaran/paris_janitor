import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Provider {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name: string;
    
    @Column()
    service_type: string;

    @Column()
    contact_info: string;

    constructor(
        name: string,
        service_type: string,
        contact_info: string,
    ) {
        this.name = name;
        this.service_type = service_type;
        this.contact_info = contact_info;
    }
}
