import express, { Request, Response } from "express";
import { authenticateToken, authorizeAdmin ,authorizeAdminOrOwner} from '../middlewares/authMiddleware';
import {
    createAvailabilityValidation,
    updateAvailabilityValidation,
    deleteAvailabilityValidation,
    listAvailabilityValidation,
} from "../validators/availability-validator";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { AppDataSource } from "../../database/database";
import { AvailabilityUsecase } from "../../domain/availability-usecase";
import { Availability } from "../../database/entities/availability";

export const initAvailabilityRoutes = (app: express.Express) => {
    app.get("/availability", authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
        const validation = listAvailabilityValidation.validate(req.query);

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const listAvailabilityReq = validation.value;
        let limit = 20;
        if (listAvailabilityReq.limit) {
            limit = listAvailabilityReq.limit;
        }
        const page = listAvailabilityReq.page ?? 1;

        try {
            const availabilityUsecase = new AvailabilityUsecase(AppDataSource);
            const { availability, totalCount } = await availabilityUsecase.listAvailability({
                ...listAvailabilityReq,
                page,
                limit,
            });
            res.status(200).send({ availability, totalCount });
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal server error" });
        }
    });

    app.get("/availability/:availabilityId", authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
        const { availabilityId } = req.params;

        try {
            const availabilityUsecase = new AvailabilityUsecase(AppDataSource);
            const availability = await availabilityUsecase.getAvailabilityById(Number(availabilityId));

            if (availability) {
                res.status(200).send(availability);
            } else {
                res.status(404).send({ error: "Availability not found" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal server error" });
        }
    });

    app.get("/availability/property/:propertyId", authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
        const { propertyId } = req.params;
    
        try {
            const availabilityUsecase = new AvailabilityUsecase(AppDataSource);
            const availabilities = await availabilityUsecase.getAvailabilityByPropertyId(Number(propertyId));
    
            res.status(200).send(availabilities);
        } catch (error) {
            console.error("Error fetching availability by property ID:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    });
    
    

    app.post("/availability", authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
        const validation = createAvailabilityValidation.validate(req.body);

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const availabilityRequest = validation.value;

        try {
            const availabilityRepo = AppDataSource.getRepository(Availability);
            const availabilityCreated = await availabilityRepo.save(availabilityRequest);
            res.status(201).send(availabilityCreated);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal server error" });
        }
    });

    app.patch("/availability/:id", authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
        const validation = updateAvailabilityValidation.validate({
            ...req.params,
            ...req.body,
        });

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const updateAvailabilityReq = validation.value;

        try {
            const availabilityUsecase = new AvailabilityUsecase(AppDataSource);
            const updatedAvailability = await availabilityUsecase.updateAvailability(updateAvailabilityReq.id, {
                ...updateAvailabilityReq,
            });

            if (updatedAvailability === null) {
                res.status(404).send({ error: `Availability ${updateAvailabilityReq.id} not found` });
                return;
            }
            res.status(200).send(updatedAvailability);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal server error" });
        }
    });

    app.delete("/availability/:id", authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
        const validation = deleteAvailabilityValidation.validate(req.params);

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        try {
            const availabilityUsecase = new AvailabilityUsecase(AppDataSource);
            const deletedAvailability = await availabilityUsecase.deleteAvailability(Number(req.params.id));

            if (deletedAvailability) {
                res.status(200).send({
                    message: "Availability removed successfully",
                    availability: deletedAvailability,
                });
            } else {
                res.status(404).send({ message: "Availability not found" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Internal server error" });
        }
    });
};
