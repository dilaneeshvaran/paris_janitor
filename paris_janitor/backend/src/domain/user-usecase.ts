import {DataSource} from "typeorm";
import { User } from "../database/entities/user";
import bcrypt from 'bcrypt';

export interface ListUser {
    limit: number;
    page: number;
}

export interface UpdateUserParams {
    id: number;
    firstname?: string;
    lastname?: string;
    email?: string;
    password?: string;
    subscription_status?: boolean;
    vip_status?: boolean;
  }

  export interface ChangeUserRoleParams {
    id: number;
    role?: 'admin' | 'client' | 'guest';
  }

export class UserUsecase {
    constructor(private readonly db: DataSource) {}

    async listUser(
        listUser: ListUser
    ): Promise<{ users: User[]; totalCount: number }> {
        const query = this.db.createQueryBuilder(User, "users");
        
        query.skip((listUser.page - 1) * listUser.limit);
        query.take(listUser.limit);
    
        const [users, totalCount] = await query.getManyAndCount();
        return {
            users,
            totalCount,
        };
    }

    async getUserById(userId: number): Promise<User | null> {
        try {
            const query = this.db.createQueryBuilder(User, "users");
            query.where("users.id = :id", { id: userId });
            const user = await query.getOne();
            if (!user) {
                console.warn(`User not found for ID: ${userId}`);
                return null;
            }
            return user;
        } catch (error) {
            console.error(`Error fetching user by ID: ${userId}`, error);
            return null;
        }
    }

    async isUserVip(userId: number): Promise<boolean> {
        try {
            const user = await this.getUserById(userId);
            if (user === null) {
                return false;
            }
            return user.vip_status === true;
        } catch (error) {
            console.error(`Error checking VIP status for user ID: ${userId}`, error);
            return false;
        }
    }
    

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            const query = this.db.createQueryBuilder(User, "users");
            query.where("users.email = :email", { email });
            const user = await query.getOne();
            if (!user) {
                console.warn(`User not found for email: ${email}`);
                return null;
            }
            return user;
        } catch (error) {
            console.error(`Error fetching user by email: ${email}`, error);
            return null;
        }
    }

    async updateUser(
        id: number,
        { firstname, lastname, email, password, subscription_status, vip_status }: UpdateUserParams
    ): Promise<User | null> {
        const repo = this.db.getRepository(User);
        const userFound = await repo.findOneBy({ id });
        if (userFound === null) return null;
    
        if (email) {
            const emailExists = await this.isEmailExists(email);
            if (emailExists && email !== userFound.email) {
                throw new Error("Email already in use");
            }
            userFound.email = email;
        }
        if (firstname) {
            userFound.firstname = firstname;
        }
        if (lastname) {
            userFound.lastname = lastname;
        }
        if (password) {
            userFound.password = await this.hashPassword(password);
        }
        if (subscription_status !== undefined) {
            userFound.subscription_status = subscription_status;
        }
        if (vip_status !== undefined) {
            userFound.vip_status = vip_status;
        }
        const userUpdate = await repo.save(userFound);
        return userUpdate;
    }

    async deleteUser(id: number): Promise<User | null> {
        const repo = this.db.getRepository(User);
        const userFound = await repo.findOneBy({ id });
    
        if (!userFound) return null;
    
        await repo.remove(userFound);
        return userFound;
    }


    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    }
    
    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        const match = await bcrypt.compare(password, hashedPassword);
        return match;
    }

    async isEmailExists(email: string): Promise<boolean> {
        const repo = this.db.getRepository(User);
        const user = await repo.findOne({ where: { email } });
    
        return !!user;
    }

    async changeUserRole(userId: number, newRole: 'admin' | 'client' | 'guest'): Promise<User | null> {
        const repo = this.db.getRepository(User);
        const user = await repo.findOne({ where: { id: userId } });
    
        if (!user) {
            return null;
        }
    
        user.role = newRole;
        const updatedUser = await repo.save(user);
    
        return updatedUser;
    }
    
}