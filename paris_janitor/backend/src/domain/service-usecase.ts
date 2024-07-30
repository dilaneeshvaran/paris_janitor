import { DataSource } from "typeorm";
import { Service } from "../database/entities/service";
import { Property } from "../database/entities/property";

export interface ListService {
    limit: number;
    page: number;
}

export interface UpdateServiceParams {
    id: number;
    description?: string;
    price?: number;
    provider_id?: number;
    reservation_id?: number;
    service_type?: string;
    status?: "pending" | "completed"| "accepted" | "cancelled";
}

export class ServiceUsecase {
    constructor(private readonly db: DataSource) {}

    async listServices(
        listService: ListService
    ): Promise<{ services: Service[]; totalCount: number }> {
        const query = this.db.createQueryBuilder(Service, "services");
        
        query.skip((listService.page - 1) * listService.limit);
        query.take(listService.limit);
    
        const [services, totalCount] = await query.getManyAndCount();
        return {
            services,
            totalCount,
        };
    }

    async getServiceById(serviceId: number): Promise<Service> {
        const query = this.db.createQueryBuilder(Service, "services");
      
        query.where("services.id = :id", { id: serviceId });
      
        const service = await query.getOne();
      
        if (!service) {
            throw new Error('Service not found');
        }
      
        return service;
    }

    async getServiceByProviderId(providerId: number): Promise<Service[]> {
        const query = this.db.createQueryBuilder(Service, "services");
    
        query.where("services.provider_id = :id", { id: providerId });
    
        const services = await query.getMany();
    
        return services;
    }

    async getServiceByUserId(userId: number): Promise<Service[]> {
        const query = this.db.createQueryBuilder(Service, "services")
            .innerJoin("reservation", "reservation", "services.reservation_id = reservation.id")
            .where("reservation.client_id = :id", { id: userId });
    
        const services = await query.getMany();
    
        return services;
    }

    async getPropertyByServiceId(serviceId: number): Promise<Property[]> {
        const query = this.db.createQueryBuilder(Property, "property")
            .innerJoin("reservation", "reservation", "property.id = reservation.property_id")
            .innerJoin("service", "service", "reservation.id = service.reservation_id")
            .where("service.id = :id", { id: serviceId });
    
        const properties = await query.getMany();
    
        return properties;
    }

    async getServiceByPropertyId(propertyId: number): Promise<Service[]> {
        const query = this.db.createQueryBuilder(Service, "service")
            .innerJoin("reservation", "reservation", "service.reservation_id = reservation.id")
            .innerJoin("property", "property", "reservation.property_id = property.id")
            .where("property.id = :id", { id: propertyId });
    
        const services = await query.getMany();
    
        return services;
    }

    async updateService(
        id: number,
        { description, price, provider_id, service_type, reservation_id,status }: UpdateServiceParams
    ): Promise<Service | null> {
        const repo = this.db.getRepository(Service);
        const serviceFound = await repo.findOneBy({ id });
        if (serviceFound === null) return null;
    
        if (description !== undefined) {
            serviceFound.description = description;
        }
        if (price !== undefined) {
            serviceFound.price = price;
        }
        if (provider_id !== undefined) {
            serviceFound.provider_id = provider_id;
        }
        if(service_type !== undefined) {
            serviceFound.service_type = service_type;
        }
        if(reservation_id !== undefined) {
            serviceFound.reservation_id = reservation_id;
        }
        if(status !== undefined) {
            serviceFound.status = status;
        }
    
        
        const serviceUpdate = await repo.save(serviceFound);
        return serviceUpdate;
    }

    

    async deleteService(id: number): Promise<Service | null> {
        const repo = this.db.getRepository(Service);
        const serviceFound = await repo.findOneBy({ id });
    
        if (!serviceFound) return null;
    
        await repo.remove(serviceFound);
        return serviceFound;
    }
}
