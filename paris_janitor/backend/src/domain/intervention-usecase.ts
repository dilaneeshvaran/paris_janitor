import { DataSource } from "typeorm";
import { Intervention } from "../database/entities/intervention";

export interface ListIntervention {
    limit: number;
    page: number;
}

export interface UpdateInterventionParams {
    id: number;
    property_id?: number;
    service_id?: number;
    provider_id?: number;
    date?: string;
    status?: string;
}

export class InterventionUsecase {
    constructor(private readonly db: DataSource) {}

    async listInterventions(
        listIntervention: ListIntervention
    ): Promise<{ interventions: Intervention[]; totalCount: number }> {
        const query = this.db.createQueryBuilder(Intervention, "interventions");

        query.skip((listIntervention.page - 1) * listIntervention.limit);
        query.take(listIntervention.limit);

        const [interventions, totalCount] = await query.getManyAndCount();
        return {
            interventions,
            totalCount,
        };
    }

    async getInterventionById(interventionId: number): Promise<Intervention> {
        const query = this.db.createQueryBuilder(Intervention, "interventions");

        query.where("interventions.id = :id", { id: interventionId });

        const intervention = await query.getOne();

        if (!intervention) {
            throw new Error('Intervention not found');
        }

        return intervention;
    }

    async updateIntervention(
        id: number,
        { property_id, service_id, provider_id, date, status }: UpdateInterventionParams
    ): Promise<Intervention | null> {
        const repo = this.db.getRepository(Intervention);
        const interventionFound = await repo.findOneBy({ id });
        if (interventionFound === null) return null;

        if (property_id !== undefined) {
            interventionFound.property_id = property_id;
        }
        if (service_id !== undefined) {
            interventionFound.service_id = service_id;
        }
        if (provider_id !== undefined) {
            interventionFound.provider_id = provider_id;
        }
        if (date !== undefined) {
            interventionFound.date = date;
        }
        if (status !== undefined) {
            interventionFound.status = status;
        }

        const interventionUpdate = await repo.save(interventionFound);
        return interventionUpdate;
    }

    async deleteIntervention(id: number): Promise<Intervention | null> {
        const repo = this.db.getRepository(Intervention);
        const interventionFound = await repo.findOneBy({ id });

        if (!interventionFound) return null;

        await repo.remove(interventionFound);
        return interventionFound;
    }
}
