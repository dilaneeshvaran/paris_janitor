import Joi from "joi";

export interface CreateInvoiceValidation {
  amount: number;
  client_id: number;
  date: string;
  service_id?: number;
  reservation_id?: number;
}

export const createInvoiceValidation = Joi.object<CreateInvoiceValidation>({
  amount: Joi.number().positive().required(),
  client_id: Joi.number().required(),
  date: Joi.date().iso().required(),
  service_id: Joi.number().optional(),
  reservation_id: Joi.number().optional(),
});

export interface UpdateInvoiceValidation {
  id: number;
  amount?: number;
  client_id?: number;
  date?: string;
}

export const updateInvoiceValidation = Joi.object<UpdateInvoiceValidation>({
  id: Joi.number().required(),
  amount: Joi.number().positive().optional(),
  client_id: Joi.number().optional(),
  date: Joi.date().iso().optional(),
});

export interface DeleteInvoiceValidation {
  id: number;
}

export const deleteInvoiceValidation = Joi.object<DeleteInvoiceValidation>({
  id: Joi.number().required(),
});

export interface ListInvoiceValidation {
  limit?: number;
  page?: number;
}

export const listInvoiceValidation = Joi.object<ListInvoiceValidation>({
  limit: Joi.number().min(1).optional(),
  page: Joi.number().min(1).optional(),
});
