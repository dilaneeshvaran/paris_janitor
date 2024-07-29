import Joi from "joi";

export interface UserValidation {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: 'admin' | 'client' | 'guest';
}

export const userValidation = Joi.object<UserValidation>({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  role: Joi.string().valid('client', 'guest').required(),
});

export interface AuthUserValidation {
  email: string;
  password: string;
}

export const authUserValidation = Joi.object<AuthUserValidation>({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

export interface DeleteUserValidation {
  id: number;
}

export const deleteUserValidation = Joi.object<DeleteUserValidation>({
  id: Joi.number().required(),
});

export interface UpdateUserValidation {
  id: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'client' | 'guest';
}

export const updateUserValidation = Joi.object<UpdateUserValidation>({
  id: Joi.number().required(),
  firstname: Joi.string().optional(),
  lastname: Joi.string().optional(),
  email: Joi.string().optional(),
  password: Joi.string().optional(),
  role: Joi.string().valid('admin', 'client', 'guest').optional(),
});

export interface ListValidation {
  page?: number;
  limit?: number;
}

export const listValidation = Joi.object<ListValidation>({
  page: Joi.number().min(1).optional(),
  limit: Joi.number().min(1).optional(),
});