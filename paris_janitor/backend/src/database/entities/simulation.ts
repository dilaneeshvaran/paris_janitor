import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Simulation {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    address!: string;
    
    @Column({ type: 'varchar', length: 100 })
    typeProperty!: string;

    @Column({ type: 'varchar', length: 100 })
    typeLocation!: string;

    @Column({ type: 'int' })
    numberRooms!: number;

    @Column({ type: 'int' })
    capacity!: number;

    @Column({ type: 'float' })
    surface!: number;

    @Column({ type: 'varchar', length: 255 })
    email!: string;

    @Column({ type: 'varchar', length: 255 })
    fullName!: string;

    @Column({ type: 'varchar', length: 20 })
    phoneNumber!: string;

    constructor(
        address?: string,
        typeProperty?: string,
        typeLocation?: string,
        numberRooms?: number,
        capacity?: number,
        surface?: number,
        email?: string,
        fullName?: string,
        phoneNumber?: string,
    ) {
        if (address) this.address = address;
        if (typeProperty) this.typeProperty = typeProperty;
        if (typeLocation) this.typeLocation = typeLocation;
        if (numberRooms) this.numberRooms = numberRooms;
        if (capacity) this.capacity = capacity;
        if (surface) this.surface = surface;
        if (email) this.email = email;
        if (fullName) this.fullName = fullName;
        if (phoneNumber) this.phoneNumber = phoneNumber;
    }
}
