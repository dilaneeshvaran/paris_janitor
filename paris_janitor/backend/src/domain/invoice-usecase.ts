import { DataSource } from "typeorm";
import { Invoice } from "../database/entities/invoice";

export interface ListInvoice {
    limit: number;
    page: number;
}

export interface UpdateInvoiceParams {
    id: number;
    amount?: number;
    client_id?: number;
    date?: string;
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

    async updateInvoice(
        id: number,
        { amount, client_id, date }: UpdateInvoiceParams
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
