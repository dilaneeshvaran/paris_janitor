import { DataSource, getRepository } from "typeorm";
import { Invoice } from "../database/entities/invoice";
import { Reservation } from "../database/entities/reservation";
import { Property } from "../database/entities/property";
import { MoreThan } from 'typeorm';

export interface ListInvoice {
    limit: number;
    page: number;
}

export interface UpdateInvoiceParams {
    id: number;
    amount?: number;
    client_id?: number;
    date?: string;
    service_id?: number;
    reservation_id?: number;
}

export class InvoiceUsecase {
    constructor(private readonly db: DataSource) {}

    async listInvoices(
        listInvoice: ListInvoice
    ): Promise<{ invoices: Invoice[]; totalCount: number }> {
        const query = this.db.createQueryBuilder(Invoice, "invoices");
        
        query.skip((listInvoice.page - 1) * listInvoice.limit);
        query.take(listInvoice.limit);
    
        const [invoices, totalCount] = await query.getManyAndCount();
        return {
            invoices,
            totalCount,
        };
    }

    async getInvoiceById(invoiceId: number): Promise<Invoice> {
        const query = this.db.createQueryBuilder(Invoice, "invoices");
      
        query.where("invoices.id = :id", { id: invoiceId });
      
        const invoice = await query.getOne();
      
        if (!invoice) {
            throw new Error('Invoice not found');
        }
      
        return invoice;
    }

    async getVipInvoices(): Promise<Invoice[]> {
        const query = this.db.createQueryBuilder(Invoice, "invoices");

        query.where("invoices.pay_vip = true");

        const invoices = await query.getMany();

        return invoices;
    }



    async getInvoiceByUserId(clientId: number): Promise<Invoice[]> {
        const query = this.db.createQueryBuilder(Invoice, "invoices");
        
        query.where("invoices.client_id = :clientId", { clientId });
        
        const invoices = await query.getMany();
        
        if (invoices.length === 0) {
            throw new Error('No invoices found for this user');
        }
        
        return invoices;
    }

    async getInvoiceByReservationId(reservationId: number): Promise<Invoice[]> {
        const query = this.db.createQueryBuilder(Invoice, "invoices");
        
        query.where("invoices.reservation_id = :reservationId", { reservationId });
        
        const invoices = await query.getMany();
        
        if (invoices.length === 0) {
            throw new Error('No invoices found for this reservation');
        }
        
        return invoices;
    }

    async getInvoiceByOwnerId(ownerId: number): Promise<Invoice[]> {
        const query = this.db.createQueryBuilder(Invoice, "invoices")
            .innerJoin(Reservation, "reservations", "invoices.reservation_id = reservations.id")
            .innerJoin(Property, "properties", "reservations.property_id = properties.id")
            .where("properties.owner_id = :ownerId", { ownerId });
    
        const invoices = await query.getMany();
    
        if (invoices.length === 0) {
            throw new Error('No invoices found for this owner');
        }
    
        return invoices;
    }

    async hasUserPaidVip(clientId: number): Promise<boolean> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
        const query = this.db.createQueryBuilder('invoice', 'invoices')
            .where('invoices.client_id = :clientId', { clientId })
            .andWhere('invoices.pay_vip = :payVip', { payVip: true })
            .andWhere('invoices.date > :thirtyDaysAgo', { thirtyDaysAgo });
    
        const invoices = await query.getMany();
    
        return invoices.length > 0;
    }

    async updateInvoice(
        id: number,
        { amount, client_id, date, service_id, reservation_id }: UpdateInvoiceParams
    ): Promise<Invoice | null> {
        const repo = this.db.getRepository(Invoice);
        const invoiceFound = await repo.findOneBy({ id });
        if (invoiceFound === null) return null;
    
        if (amount !== undefined) {
            invoiceFound.amount = amount; 
        }
        if (client_id !== undefined) {
            invoiceFound.client_id = client_id;
        }
        if (date !== undefined) {
            invoiceFound.date = date;
        }
        if (service_id !== undefined) {
            invoiceFound.service_id = service_id;
        }
        if (reservation_id !== undefined) {
            invoiceFound.reservation_id = reservation_id;
        }
        
        const invoiceUpdate = await repo.save(invoiceFound);
        return invoiceUpdate;
    }

    async deleteInvoice(id: number): Promise<Invoice | null> {
        const repo = this.db.getRepository(Invoice);
        const invoiceFound = await repo.findOneBy({ id });
    
        if (!invoiceFound) return null;
    
        await repo.remove(invoiceFound);
        return invoiceFound;
    }
}
