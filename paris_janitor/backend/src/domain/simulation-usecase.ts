import { DataSource } from "typeorm";
import { Simulation } from "../database/entities/simulation";

export interface ListSimulation {
    limit: number;
    page: number;
}

export interface UpdateSimulationParams {
    id: number;
    address?: string;
    typeProperty?: string;
    typeLocation?: string;
    numberRooms?: number;
    capacity?: number;
    surface?: number;
    email?: string;
    fullName?: string;
    phoneNumber?: string;
}

export class SimulationUsecase {
    constructor(private readonly db: DataSource) {}

    async listSimulations(
        listSimulation: ListSimulation
    ): Promise<{ simulations: Simulation[]; totalCount: number }> {
        const query = this.db.createQueryBuilder(Simulation, "simulations");

        query.skip((listSimulation.page - 1) * listSimulation.limit);
        query.take(listSimulation.limit);

        const [simulations, totalCount] = await query.getManyAndCount();
        return {
            simulations,
            totalCount,
        };
    }

    async getSimulationById(simulationId: number): Promise<Simulation> {
        const query = this.db.createQueryBuilder(Simulation, "simulations");

        query.where("simulations.id = :id", { id: simulationId });

        const simulation = await query.getOne();

        if (!simulation) {
            throw new Error('Simulation not found');
        }

        return simulation;
    }

    async getSimulationByUserId(userId: number): Promise<Simulation[]> {
        const query = this.db.createQueryBuilder(Simulation, "simulations");

        query.where("simulations.client_id = :id OR simulations.traveler_id = :id", { id: userId });

        const simulations = await query.getMany();

        return simulations;
    }

    async updateSimulation(
        id: number,
        { address, typeProperty, typeLocation, numberRooms, capacity, surface, email, fullName, phoneNumber }: UpdateSimulationParams
    ): Promise<Simulation | null> {
        const repo = this.db.getRepository(Simulation);
        const simulationFound = await repo.findOneBy({ id });
        if (simulationFound === null) return null;

        if (address) {
            simulationFound.address = address;
        }
        if (typeProperty) {
            simulationFound.typeProperty = typeProperty;
        }
        if (typeLocation) {
            simulationFound.typeLocation = typeLocation;
        }
        if (numberRooms) {
            simulationFound.numberRooms = numberRooms;
        }
        if (capacity) {
            simulationFound.capacity = capacity;
        }
        if (surface) {
            simulationFound.surface = surface;
        }
        if (email) {
            simulationFound.email = email;
        }
        if (fullName) {
            simulationFound.fullName = fullName;
        }
        if (phoneNumber) {
            simulationFound.phoneNumber = phoneNumber;
        }

        const simulationUpdate = await repo.save(simulationFound);
        return simulationUpdate;
    }

    async deleteSimulation(id: number): Promise<Simulation | null> {
        const repo = this.db.getRepository(Simulation);
        const simulationFound = await repo.findOneBy({ id });

        if (!simulationFound) return null;

        await repo.remove(simulationFound);
        return simulationFound;
    }
}
