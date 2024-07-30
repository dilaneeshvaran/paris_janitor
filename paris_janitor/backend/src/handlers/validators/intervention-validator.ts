import Joi from "joi";

export interface CreateInterventionValidation {
    property_id: number;
    service_id: number;
    provider_id: number;
    date: string; // ISO date string
    status: string;
}

export const createInterventionValidation = Joi.object<CreateInterventionValidation>({
    property_id: Joi.number().required(),
    service_id: Joi.number().required(),
    provider_id: Joi.number().required(),
    date: Joi.date().iso().required(),
    status: Joi.string().required(),
});

export interface UpdateInterventionValidation {
    id: number;
    property_id?: number;
    service_id?: number;
    provider_id?: number;
    date?: string; // ISO date string
    status?: string;
}

export const updateInterventionValidation = Joi.object<UpdateInterventionValidation>({
    id: Joi.number().required(),
    property_id: Joi.number().optional(),
    service_id: Joi.number().optional(),
    provider_id: Joi.number().optional(),
    date: Joi.date().iso().optional(),
    status: Joi.string().optional(),
});

export interface DeleteInterventionValidation {
    id: number;
}

export const deleteInterventionValidation = Joi.object<DeleteInterventionValidation>({
    id: Joi.number().required(),
});

export interface ListInterventionValidation {
    limit?: number;
    page?: number;
}

export const listInterventionValidation = Joi.object<ListInterventionValidation>({
    limit: Joi.number().min(1).optional(),
    page: Joi.number().min(1).optional(),
});
