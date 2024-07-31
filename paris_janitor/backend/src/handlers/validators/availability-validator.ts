import Joi from "joi";

export interface CreateAvailabilityValidation {
    property_id: number;
    start_date: string; // ISO date string
    end_date: string;   // ISO date string
    reservation_id?: number;
}

export const createAvailabilityValidation = Joi.object<CreateAvailabilityValidation>({
    property_id: Joi.number().required(),
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().required(),
    reservation_id: Joi.number().optional(),
});

export interface UpdateAvailabilityValidation {
    id: number;
    property_id?: number;
    start_date?: string; // ISO date string
    end_date?: string;   // ISO date string
}

export const updateAvailabilityValidation = Joi.object<UpdateAvailabilityValidation>({
    id: Joi.number().required(),
    property_id: Joi.number().optional(),
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().optional(),
});

export interface DeleteAvailabilityValidation {
    id: number;
}

export const deleteAvailabilityValidation = Joi.object<DeleteAvailabilityValidation>({
    id: Joi.number().required(),
});

export interface ListAvailabilityValidation {
    limit?: number;
    page?: number;
}

export const listAvailabilityValidation = Joi.object<ListAvailabilityValidation>({
    limit: Joi.number().min(1).optional(),
    page: Joi.number().min(1).optional(),
});
