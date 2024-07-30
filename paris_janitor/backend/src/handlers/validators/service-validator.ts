import { stat } from "fs";
import Joi from "joi";

export interface CreateServiceValidation {
    description: string;
    price: number;
    provider_id?: number;
    service_type?: "cleaning" | "repair" | "accessory" | "baggage";
    reservation_id: number;
    status?: "pending" | "completed" | "accepted"| "cancelled";
}

export const createServiceValidation = Joi.object<CreateServiceValidation>({
    description: Joi.string().required(),
    price: Joi.number().required(),
    provider_id: Joi.number().optional(),
    service_type: Joi.string().valid("cleaning", "repair", "accessory", "baggage").optional(),
    reservation_id: Joi.number().required(),
    status: Joi.string().valid("pending", "completed","accepted", "cancelled").optional(),
});

export interface UpdateServiceValidation {
    id: number;
    description?: string;
    price?: number;
    provider_id?: number;
    status?: "pending" | "completed"| "accepted" | "cancelled";
}

export const updateServiceValidation = Joi.object<UpdateServiceValidation>({
    id: Joi.number().required(),
    description: Joi.string().optional(),
    price: Joi.number().optional(),
    provider_id: Joi.number().optional(),
    status: Joi.string().valid("pending", "completed","accepted", "cancelled").optional(),
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
