import Joi from "joi";

export interface CreateReservationValidation {
  property_id: number;
  client_id: number;
  traveler_id: number;
  startDate: string;
  endDate: string;
  status: string;
}

export const createReservationValidation = Joi.object<CreateReservationValidation>({
  property_id: Joi.number().required(),
  client_id: Joi.number().required(),
  traveler_id: Joi.number().required(),
  startDate: Joi.string().isoDate().required(),
  endDate: Joi.string().isoDate().required(),
  status: Joi.string().required(),
});

export interface UpdateReservationValidation {
  id: number;
  property_id?: number;
  client_id?: number;
  traveler_id?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export const updateReservationValidation = Joi.object<UpdateReservationValidation>({
  id: Joi.number().required(),
  property_id: Joi.number().optional(),
  client_id: Joi.number().optional(),
  traveler_id: Joi.number().optional(),
  startDate: Joi.string().isoDate().optional(),
  endDate: Joi.string().isoDate().optional(),
  status: Joi.string().optional(),
});

export interface DeleteReservationValidation {
  id: number;
}

export const deleteReservationValidation = Joi.object<DeleteReservationValidation>({
  id: Joi.number().required(),
});

export interface ListReservationValidation {
  limit?: number;
  page?: number;
}

export const listReservationValidation = Joi.object<ListReservationValidation>({
  limit: Joi.number().min(1).optional(),
  page: Joi.number().min(1).optional(),
});
