import express, { Request, Response } from "express";
import { authenticateToken, authorizeAll } from '../middlewares/authMiddleware';
import {
    createServiceValidation,
    updateServiceValidation,
    deleteServiceValidation,
    listServiceValidation,
} from "../validators/service-validator";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { AppDataSource } from "../../database/database";
import { ServiceUsecase } from "../../domain/service-usecase";
import { Service } from "../../database/entities/service";

export const initServiceRoutes = (app: express.Express) => {
    app.get("/services", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
        const validation = listServiceValidation.validate(req.query);

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const listServiceReq = validation.value;
        let limit = 20;
        if (listServiceReq.limit) {
            limit = listServiceReq.limit;
        }
        const page = listServiceReq.page ?? 1;

        try {
            const serviceUsecase = new ServiceUsecase(AppDataSource);
            const { services, totalCount } = await serviceUsecase.listServices({
                ...listServiceReq,
                page,
                limit,
            });
            res.status(200).send({ services, totalCount });
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal server error" });
        }
    });

    app.get("/services/:serviceId", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
        const { serviceId } = req.params;

        try {
            const serviceUsecase = new ServiceUsecase(AppDataSource);
            const service = await serviceUsecase.getServiceById(Number(serviceId));

            if (service) {
                res.status(200).send(service);
            } else {
                res.status(404).send({ error: "Service not found" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal server error" });
        }
    });

    app.get("/services/provider/:providerId", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
        const { providerId } = req.params;

        try {
            const serviceUsecase = new ServiceUsecase(AppDataSource);
            const services = await serviceUsecase.getServiceByProviderId(Number(providerId));

            res.status(200).send(services);
        } catch (error) {
            console.error("Error fetching services by provider ID:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    });

    app.get("/services/user/:userId", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
        const { userId } = req.params;
    
        try {
            const serviceUsecase = new ServiceUsecase(AppDataSource);
            const services = await serviceUsecase.getServiceByUserId(Number(userId));
    
            res.status(200).send(services);
        } catch (error) {
            console.error("Error fetching services by user ID:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    });

    app.get("/properties/service/:serviceId", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
        const { serviceId } = req.params;
    
        try {
            const serviceUsecase = new ServiceUsecase(AppDataSource);
            const properties = await serviceUsecase.getPropertyByServiceId(Number(serviceId));
    
            res.status(200).send(properties);
        } catch (error) {
            console.error("Error fetching properties by service ID:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    });

    app.post("/services", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
        const validation = createServiceValidation.validate(req.body);

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const serviceRequest = validation.value;

        try {
            const serviceRepo = AppDataSource.getRepository(Service);
            const serviceCreated = await serviceRepo.save(serviceRequest);
            res.status(201).send(serviceCreated);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal server error" });
        }
    });
    app.patch("/services/:id", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
        const validation = updateServiceValidation.validate({
            id: Number(req.params.id),
            ...req.body,
        });
    
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }
    
        const updateServiceReq = validation.value;
    
        try {
            const serviceUsecase = new ServiceUsecase(AppDataSource);
            const updatedService = await serviceUsecase.updateService(updateServiceReq.id, updateServiceReq);
    
            if (updatedService === null) {
                res.status(404).send({ error: `Service ${updateServiceReq.id} not found` });
                return;
            }
            res.status(200).send(updatedService);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal server error" });
        }
    });
    

    app.delete("/services/:id", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
        const validation = deleteServiceValidation.validate(req.params);

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        try {
            const serviceUsecase = new ServiceUsecase(AppDataSource);
            const deletedService = await serviceUsecase.deleteService(Number(req.params.id));

            if (deletedService) {
                res.status(200).send({
                    message: "Service removed successfully",
                    service: deletedService,
                });
            } else {
                res.status(404).send({ message: "Service not found" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Internal server error" });
        }
    });
};
