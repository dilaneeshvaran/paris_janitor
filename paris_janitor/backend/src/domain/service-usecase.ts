import { DataSource } from "typeorm";
import { Service } from "../database/entities/service";

export interface ListService {
    limit: number;
    page: number;
}

export interface UpdateServiceParams {
    id: number;
    description?: string;
    price?: number;
    provider_id?: number;
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

    async updateService(
        id: number,
        { description, price, provider_id }: UpdateServiceParams
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
