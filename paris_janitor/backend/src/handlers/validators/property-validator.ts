import Joi from "joi";

export interface CreatePropertyValidation {
  name: string;
  description: string;
  address: string;
  price: number;
  owner_id: number;
  availabilityCalendar: string;
  imageUrl: string;
}

export const createPropertyValidation = Joi.object<CreatePropertyValidation>({
  name: Joi.string().required(),
  description: Joi.string().required(),
  address: Joi.string().required(),
  price: Joi.number().positive().required(),
  owner_id: Joi.number().required(),
  availabilityCalendar: Joi.string().required(),
  imageUrl: Joi.string().uri().required(),
});

export interface UpdatePropertyValidation {
  id: number;
  name?: string;
  description?: string;
  address?: string;
  price?: number;
  owner_id?: number;
  availabilityCalendar?: string;
  imageUrl?: string;
}

export const updatePropertyValidation = Joi.object<UpdatePropertyValidation>({
  id: Joi.number().required(),
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  address: Joi.string().optional(),
  price: Joi.number().positive().optional(),
  owner_id: Joi.number().optional(),
  availabilityCalendar: Joi.string().optional(),
  imageUrl: Joi.string().uri().optional(),
});

export interface DeletePropertyValidation {
  id: number;
}

export const deletePropertyValidation = Joi.object<DeletePropertyValidation>({
  id: Joi.number().required(),
});

export interface ListPropertyValidation {
  limit?: number;
  page?: number;
}

export const listPropertyValidation = Joi.object<ListPropertyValidation>({
  limit: Joi.number().min(1).optional(),
  page: Joi.number().min(1).optional(),
});
