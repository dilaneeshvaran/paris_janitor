import { DataSource } from "typeorm";
import { Reservation } from "../database/entities/reservation";

export interface ListReservation {
    limit: number;
    page: number;
}

export interface UpdateReservationParams {
    id: number;
    property_id?: number;
    client_id?: number;
    traveler_id?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
}

export class ReservationUsecase {
    constructor(private readonly db: DataSource) {}

    async listReservations(
        listReservation: ListReservation
    ): Promise<{ reservations: Reservation[]; totalCount: number }> {
        const query = this.db.createQueryBuilder(Reservation, "reservations");
        
        query.skip((listReservation.page - 1) * listReservation.limit);
        query.take(listReservation.limit);
    
        const [reservations, totalCount] = await query.getManyAndCount();
        return {
            reservations,
            totalCount,
        };
    }

    async getReservationById(reservationId: number): Promise<Reservation> {
        const query = this.db.createQueryBuilder(Reservation, "reservations");
      
        query.where("reservations.id = :id", { id: reservationId });
      
        const reservation = await query.getOne();
      
        if (!reservation) {
            throw new Error('Reservation not found');
        }
      
        return reservation;
    }

    async getReservationByUserId(userId: number): Promise<Reservation[]> {
        const query = this.db.createQueryBuilder(Reservation, "reservations");
    
        query.where("reservations.client_id = :id OR reservations.traveler_id = :id", { id: userId });
    
        const reservations = await query.getMany();
    
        return reservations;
    }

    async getReservationByPropertyId(propertyId: number): Promise<Reservation[]> {
        const query = this.db.createQueryBuilder(Reservation, "reservations")
            .where("reservations.property_id = :id", { id: propertyId });
    
        const reservations = await query.getMany();
    
        return reservations;
    }

    async updateReservation(
        id: number,
        { property_id, client_id, traveler_id, startDate, endDate, status }: UpdateReservationParams
    ): Promise<Reservation | null> {
        const repo = this.db.getRepository(Reservation);
        const reservationFound = await repo.findOneBy({ id });
        if (reservationFound === null) return null;
    
        if (property_id) {
            reservationFound.property_id = property_id;
        }
        if (client_id) {
            reservationFound.client_id = client_id;
        }
        if (traveler_id) {
            reservationFound.traveler_id = traveler_id;
        }
        if (startDate) {
            reservationFound.startDate = startDate;
        }
        if (endDate) {
            reservationFound.endDate = endDate;
        }
        if (status) {
            reservationFound.status = status;
        }
        
        const reservationUpdate = await repo.save(reservationFound);
        return reservationUpdate;
    }

    async deleteReservation(id: number): Promise<Reservation | null> {
        const repo = this.db.getRepository(Reservation);
        const reservationFound = await repo.findOneBy({ id });
    
        if (!reservationFound) return null;
    
        await repo.remove(reservationFound);
        return reservationFound;
    }
}
