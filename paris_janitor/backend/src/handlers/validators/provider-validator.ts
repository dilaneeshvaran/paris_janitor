import Joi from "joi";

export interface CreateProviderValidation {
    name: string;
    service_type: "cleaning" | "repair" | "accessory" | "baggage";
    contact_info: string;
}

export const createProviderValidation = Joi.object<CreateProviderValidation>({
    name: Joi.string().required(),
    service_type: Joi.string().valid("cleaning", "repair", "accessory", "baggage").required(),
    contact_info: Joi.string().required(),
});

export interface UpdateProviderValidation {
    id: number;
    name?: string;
    service_type?: "cleaning" | "repair" | "accessory" | "baggage";
    contact_info?: string;
}

export const updateProviderValidation = Joi.object<UpdateProviderValidation>({
    id: Joi.number().required(),
    name: Joi.string().optional(),
    service_type: Joi.string().valid("cleaning", "repair", "accessory", "baggage").optional(),
    contact_info: Joi.string().optional(),
});

export interface DeleteProviderValidation {
    id: number;
}

export const deleteProviderValidation = Joi.object<DeleteProviderValidation>({
    id: Joi.number().required(),
});

export interface ListProviderValidation {
    limit?: number;
    page?: number;
}

export const listProviderValidation = Joi.object<ListProviderValidation>({
    limit: Joi.number().min(1).optional(),
    page: Joi.number().min(1).optional(),
});