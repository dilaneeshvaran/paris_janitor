import Joi from "joi";

export interface CreateServiceValidation {
    description: string;
    price: number;
    provider_id: number;
}

export const createServiceValidation = Joi.object<CreateServiceValidation>({
    description: Joi.string().required(),
    price: Joi.number().required(),
    provider_id: Joi.number().required(),
});

export interface UpdateServiceValidation {
    id: number;
    description?: string;
    price?: number;
    provider_id?: number;
}

export const updateServiceValidation = Joi.object<UpdateServiceValidation>({
    id: Joi.number().required(),
    description: Joi.string().optional(),
    price: Joi.number().optional(),
    provider_id: Joi.number().optional(),
});

export interface DeleteServiceValidation {
    id: number;
}

export const deleteServiceValidation = Joi.object<DeleteServiceValidation>({
    id: Joi.number().required(),
});

export interface ListServiceValidation {
    limit?: number;
    page?: number;
}

export const listServiceValidation = Joi.object<ListServiceValidation>({
    limit: Joi.number().min(1).optional(),
    page: Joi.number().min(1).optional(),
});
