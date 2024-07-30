import express, { Request, Response } from "express";
import { authenticateToken, authorizeAdmin,authorizeAdminOrOwner } from '../middlewares/authMiddleware';
import {
  createInvoiceValidation,
  updateInvoiceValidation,
  deleteInvoiceValidation,
  listInvoiceValidation,
} from "../validators/invoice-validator";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { AppDataSource } from "../../database/database";
import { InvoiceUsecase } from "../../domain/invoice-usecase";
import { Invoice } from "../../database/entities/invoice";

export const initInvoiceRoutes = (app: express.Express) => {
  app.get("/invoices", authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
    const validation = listInvoiceValidation.validate(req.query);

    if (validation.error) {
      res.status(400).send(generateValidationErrorMessage(validation.error.details));
      return;
    }

    const listInvoiceReq = validation.value;
    let limit = 20;
    if (listInvoiceReq.limit) {
      limit = listInvoiceReq.limit;
    }
    const page = listInvoiceReq.page ?? 1;

    try {
      const invoiceUsecase = new InvoiceUsecase(AppDataSource);
      const { invoices, totalCount } = await invoiceUsecase.listInvoices({
        ...listInvoiceReq,
        page,
        limit,
      });
      res.status(200).send({ invoices, totalCount });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.get("/invoices/:invoiceId", authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
    const { invoiceId } = req.params;

    try {
      const invoiceUsecase = new InvoiceUsecase(AppDataSource);
      const invoice = await invoiceUsecase.getInvoiceById(Number(invoiceId));

      if (invoice) {
        res.status(200).send(invoice);
      } else {
        res.status(404).send({ error: "Invoice not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.get("/invoices/user/:userId", authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const invoiceUsecase = new InvoiceUsecase(AppDataSource);
        const invoices = await invoiceUsecase.getInvoiceByUserId(Number(userId));

        if (invoices.length > 0) {
            res.status(200).send(invoices);
        } else {
            res.status(404).send({ error: "No invoices found for this user" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Internal server error" });
    }
});

  app.post("/invoices", authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
    const validation = createInvoiceValidation.validate(req.body);

    if (validation.error) {
      res.status(400).send(generateValidationErrorMessage(validation.error.details));
      return;
    }

    const invoiceRequest = validation.value;

    try {
      const invoiceRepo = AppDataSource.getRepository(Invoice);
      const invoiceCreated = await invoiceRepo.save(invoiceRequest);
      res.status(201).send(invoiceCreated);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.patch("/invoices/:id", authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
    const validation = updateInvoiceValidation.validate({
      ...req.params,
      ...req.body,
    });

    if (validation.error) {
      res.status(400).send(generateValidationErrorMessage(validation.error.details));
      return;
    }

    const updateInvoiceReq = validation.value;

    try {
      const invoiceUsecase = new InvoiceUsecase(AppDataSource);
      const updatedInvoice = await invoiceUsecase.updateInvoice(updateInvoiceReq.id, {
        ...updateInvoiceReq,
      });

      if (updatedInvoice === null) {
        res.status(404).send({ error: `Invoice ${updateInvoiceReq.id} not found` });
        return;
      }
      res.status(200).send(updatedInvoice);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.delete("/invoices/:id", authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
    const validation = deleteInvoiceValidation.validate(req.params);

    if (validation.error) {
      res.status(400).send(generateValidationErrorMessage(validation.error.details));
      return;
    }

    try {
      const invoiceUsecase = new InvoiceUsecase(AppDataSource);
      const deletedInvoice = await invoiceUsecase.deleteInvoice(Number(req.params.id));

      if (deletedInvoice) {
        res.status(200).send({
          message: "Invoice removed successfully",
          invoice: deletedInvoice,
        });
      } else {
        res.status(404).send({ message: "Invoice not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Internal server error" });
    }
  });
};
