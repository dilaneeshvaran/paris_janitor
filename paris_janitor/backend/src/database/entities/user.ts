import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    firstname: string;
    
    @Column()
    lastname: string;

    @Column()
    email: string;

    @Column()
    password: string; // hashed password

    @Column({ default: false })
    subscription_status?: boolean;

    @Column({ default: false })
    vip_status?: boolean;

    @Column()
    role: 'admin' | 'client' | 'guest';

    constructor(
        firstname: string,
        lastname: string,
        email: string,
        password: string,
        role: 'admin' | 'client' | 'guest',
        subscription_status?: boolean,
        vip_status?: boolean,
    ) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
        this.role = role;
        this.subscription_status = subscription_status || false;
        this.vip_status = vip_status || false;
    }
}
