import { DataSource } from "typeorm";
import { Availability } from "../database/entities/availability";
import { Between } from "typeorm";

export interface ListAvailability {
    limit: number;
    page: number;
}

export interface UpdateAvailabilityParams {
    id: number;
    property_id?: number;
    start_date?: string;
    end_date?: string;
}

export class AvailabilityUsecase {
    constructor(private readonly db: DataSource) {}

    async listAvailability(
        listAvailability: ListAvailability
    ): Promise<{ availability: Availability[]; totalCount: number }> {
        const query = this.db.createQueryBuilder(Availability, "availability");
        
        query.skip((listAvailability.page - 1) * listAvailability.limit);
        query.take(listAvailability.limit);
    
        const [availability, totalCount] = await query.getManyAndCount();
        return {
            availability,
            totalCount,
        };
    }

    async getAvailabilityById(availabilityId: number): Promise<Availability> {
        const query = this.db.createQueryBuilder(Availability, "availability");
      
        query.where("availability.id = :id", { id: availabilityId });
      
        const availability = await query.getOne();
      
        if (!availability) {
            throw new Error('Availability not found');
        }
      
        return availability;
    }

    async getAvailabilityByPropertyId(propertyId: number): Promise<Availability[]> {
        try {
            const query = this.db.createQueryBuilder(Availability, "availability")
                .where("availability.property_id = :property_id", { property_id: propertyId });
    
            const availabilities = await query.getMany();
    
            if (!availabilities.length) {
                console.warn(`No availabilities found for property ID: ${propertyId}`);
            }
    
            return availabilities;
        } catch (error) {
            console.error("Error in getAvailabilityByPropertyId:", error);
            throw error;
        }
    }
    

    async isPropertyAvailable(propertyId: number, startDate: Date, endDate: Date): Promise<boolean> {
        try {
            const unavailableDates = await this.getAvailabilityByPropertyId(propertyId);
    
            for (const unavailable of unavailableDates) {
                if (
                    (startDate <= unavailable.end_date && endDate >= unavailable.start_date)
                ) {
                    return false;
                }
            }
    
            return true;
        } catch (error) {
            console.error("Error in isPropertyAvailable:", error);
            throw error;
        }
    }
    

    async updateAvailability(
        id: number,
        { property_id, start_date, end_date }: UpdateAvailabilityParams
    ): Promise<Availability | null> {
        const repo = this.db.getRepository(Availability);
        const availabilityFound = await repo.findOneBy({ id });
        if (availabilityFound === null) return null;
    
        if (property_id !== undefined) {
            availabilityFound.property_id = property_id;
        }
        if (start_date !== undefined) {
            availabilityFound.start_date = new Date(start_date);
        }
        if (end_date !== undefined) {
            availabilityFound.end_date = new Date(end_date);
        }
        
        const availabilityUpdate = await repo.save(availabilityFound);
        return availabilityUpdate;
    }

    async deleteAvailability(id: number): Promise<Availability | null> {
        const repo = this.db.getRepository(Availability);
        const availabilityFound = await repo.findOneBy({ id });
    
        if (!availabilityFound) return null;
    
        await repo.remove(availabilityFound);
        return availabilityFound;
    }
}
