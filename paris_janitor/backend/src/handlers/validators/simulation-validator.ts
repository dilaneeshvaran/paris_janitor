import Joi from "joi";

export interface CreateSimulationValidation {
  address: string;
  typeProperty: string;
  typeLocation: string;
  numberRooms: number;
  capacity: number;
  surface: number;
  email: string;
  fullName: string;
  phoneNumber: string;
}

export const createSimulationValidation = Joi.object<CreateSimulationValidation>({
  address: Joi.string().required(),
  typeProperty: Joi.string().required(),
  typeLocation: Joi.string().required(),
  numberRooms: Joi.number().integer().positive().required(),
  capacity: Joi.number().integer().positive().required(),
  surface: Joi.number().positive().required(),
  email: Joi.string().email().required(),
  fullName: Joi.string().required(),
  phoneNumber: Joi.string().pattern(/^\+33[0-9]{9}$/).required(),
});

export interface UpdateSimulationValidation {
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

export const updateSimulationValidation = Joi.object<UpdateSimulationValidation>({
  id: Joi.number().required(),
  address: Joi.string().optional(),
  typeProperty: Joi.string().optional(),
  typeLocation: Joi.string().optional(),
  numberRooms: Joi.number().integer().positive().optional(),
  capacity: Joi.number().integer().positive().optional(),
  surface: Joi.number().positive().optional(),
  email: Joi.string().email().optional(),
  fullName: Joi.string().optional(),
  phoneNumber: Joi.string().pattern(/^\+33[0-9]{9}$/).required(),
});

export interface DeleteSimulationValidation {
  id: number;
}

export const deleteSimulationValidation = Joi.object<DeleteSimulationValidation>({
  id: Joi.number().required(),
});

export interface ListSimulationValidation {
  limit?: number;
  page?: number;
}

export const listSimulationValidation = Joi.object<ListSimulationValidation>({
  limit: Joi.number().min(1).optional(),
  page: Joi.number().min(1).optional(),
});
