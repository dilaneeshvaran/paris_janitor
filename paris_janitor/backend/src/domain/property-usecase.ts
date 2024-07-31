import { DataSource, getRepository } from "typeorm";
import { Property } from "../database/entities/property";
import { Reservation } from "../database/entities/reservation";

export interface ListProperty {
    limit: number;
    page: number;
    verified?: boolean;
}

export interface UpdatePropertyParams {
    id: number;
    name?: string;
    description?: string;
    address?: string;
    price?: number;
    owner_id?: number;
    availabilityCalendar?: string;
    imageUrl?: string;
    verified?: boolean;
}

export class PropertyUsecase {
    constructor(private readonly db: DataSource) {}

    async listProperties(
        listProperty: ListProperty
    ): Promise<{ properties: Property[]; totalCount: number }> {
        const query = this.db.createQueryBuilder(Property, "properties");
        
        query.skip((listProperty.page - 1) * listProperty.limit);
        query.take(listProperty.limit);
    
        const [properties, totalCount] = await query.getManyAndCount();
        return {
            properties,
            totalCount,
        };
    }

    async getPropertyById(propertyId: number): Promise<Property> {
        const query = this.db.createQueryBuilder(Property, "properties");
      
        query.where("properties.id = :id", { id: propertyId });
      
        const property = await query.getOne();
      
        if (!property) {
            throw new Error('Property not found');
        }
      
        return property;
    }

    async getPropertiesByOwnerId(ownerId: number): Promise<Property[]> {
        const query = this.db.createQueryBuilder(Property, "properties");
        
        query.where("properties.owner_id = :ownerId", { ownerId }); 
        
        console.log("Executing query:", query.getSql(), "with parameters:", { ownerId }); 
        
        const properties = await query.getMany();
        
        if (!properties.length) {
            throw new Error('No properties found for this owner');
        }
        
        return properties;
    }

    async getPropertyByReservationId(reservationId: number): Promise<Property | null> {
        const query = this.db.createQueryBuilder(Property, "properties")
            .innerJoin(Reservation, "reservations", "properties.id = reservations.property_id")
            .where("reservations.id = :reservationId", { reservationId });
        
        const property = await query.getOne();
        
        if (!property) {
            throw new Error('No property found for this reservation ID');
        }
        
        return property;
    }

    async updateProperty(
        id: number,
        { name, description, address, price, owner_id, availabilityCalendar, imageUrl }: UpdatePropertyParams
    ): Promise<Property | null> {
        const repo = this.db.getRepository(Property);
        const propertyFound = await repo.findOneBy({ id });
        if (propertyFound === null) return null;
    
        if (name) {
            propertyFound.name = name;
        }
        if (description) {
            propertyFound.description = description;
        }
        if (address) {
            propertyFound.address = address;
        }
        if (price) {
            propertyFound.price = price;
        }
        if (owner_id) {
            propertyFound.owner_id = owner_id;
        }
        if (imageUrl) {
            propertyFound.imageUrl = imageUrl;
        }
        
        const propertyUpdate = await repo.save(propertyFound);
        return propertyUpdate;
    }

    async deleteProperty(id: number): Promise<Property | null> {
        const repo = this.db.getRepository(Property);
        const propertyFound = await repo.findOneBy({ id });
    
        if (!propertyFound) return null;
    
        await repo.remove(propertyFound);
        return propertyFound;
    }
}
