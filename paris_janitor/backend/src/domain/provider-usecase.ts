import { DataSource } from "typeorm";
import { Provider } from "../database/entities/provider";

export interface ListProvider {
    limit: number;
    page: number;
}

export interface UpdateProviderParams {
    id: number;
    name?: string;
    service_type?: string;
    contact_info?: string;
}

export class ProviderUsecase {
    constructor(private readonly db: DataSource) {}

    async listProviders(
        listProvider: ListProvider
    ): Promise<{ providers: Provider[]; totalCount: number }> {
        const query = this.db.createQueryBuilder(Provider, "providers");
        
        query.skip((listProvider.page - 1) * listProvider.limit);
        query.take(listProvider.limit);
    
        const [providers, totalCount] = await query.getManyAndCount();
        return {
            providers,
            totalCount,
        };
    }

    async getProviderById(providerId: number): Promise<Provider> {
        const query = this.db.createQueryBuilder(Provider, "providers");
      
        query.where("providers.id = :id", { id: providerId });
      
        const provider = await query.getOne();
      
        if (!provider) {
            throw new Error('Provider not found');
        }
      
        return provider;
    }

    async updateProvider(
        id: number,
        { name, service_type, contact_info }: UpdateProviderParams
    ): Promise<Provider | null> {
        const repo = this.db.getRepository(Provider);
        const providerFound = await repo.findOneBy({ id });
        if (providerFound === null) return null;
    
        if (name !== undefined) {
            providerFound.name = name;
        }
        if (service_type !== undefined) {
            providerFound.service_type = service_type;
        }
        if (contact_info !== undefined) {
            providerFound.contact_info = contact_info;
        }
    
        const providerUpdate = await repo.save(providerFound);
        return providerUpdate;
    }

    async deleteProvider(id: number): Promise<Provider | null> {
        const repo = this.db.getRepository(Provider);
        const providerFound = await repo.findOneBy({ id });
    
        if (!providerFound) return null;
    
        await repo.remove(providerFound);
        return providerFound;
    }
}