import express, { Request, Response } from "express";
import { authenticateToken, authorizeAll } from '../middlewares/authMiddleware';
import {
    createInterventionValidation,
    updateInterventionValidation,
    deleteInterventionValidation,
    listInterventionValidation,
} from "../validators/intervention-validator";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { AppDataSource } from "../../database/database";
import { InterventionUsecase } from "../../domain/intervention-usecase";
import { Intervention } from "../../database/entities/intervention";

export const initInterventionRoutes = (app: express.Express) => {
    app.get("/interventions", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
        const validation = listInterventionValidation.validate(req.query);

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const listInterventionReq = validation.value;
        let limit = 20;
        if (listInterventionReq.limit) {
            limit = listInterventionReq.limit;
        }
        const page = listInterventionReq.page ?? 1;

        try {
            const interventionUsecase = new InterventionUsecase(AppDataSource);
            const { interventions, totalCount } = await interventionUsecase.listInterventions({
                ...listInterventionReq,
                page,
                limit,
            });
            res.status(200).send({ interventions, totalCount });
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal server error" });
        }
    });

    app.get("/interventions/:id", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
        const { id } = req.params;

        try {
            const interventionUsecase = new InterventionUsecase(AppDataSource);
            const intervention = await interventionUsecase.getInterventionById(Number(id));

            if (intervention) {
                res.status(200).send(intervention);
            } else {
                res.status(404).send({ error: "Intervention not found" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal server error" });
        }
    });

    app.post("/interventions", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
        const validation = createInterventionValidation.validate(req.body);

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const interventionRequest = validation.value;

        try {
            const interventionRepo = AppDataSource.getRepository(Intervention);
            const interventionCreated = await interventionRepo.save(interventionRequest);
            res.status(201).send(interventionCreated);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal server error" });
        }
    });

    app.patch("/interventions/:id", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
        const validation = updateInterventionValidation.validate({
            id: Number(req.params.id),
            ...req.body,
        });

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const updateInterventionReq = validation.value;

        try {
            const interventionUsecase = new InterventionUsecase(AppDataSource);
            const updatedIntervention = await interventionUsecase.updateIntervention(updateInterventionReq.id, updateInterventionReq);

            if (updatedIntervention === null) {
                res.status(404).send({ error: `Intervention ${updateInterventionReq.id} not found` });
                return;
            }
            res.status(200).send(updatedIntervention);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal server error" });
        }
    });

    app.delete("/interventions/:id", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
        const validation = deleteInterventionValidation.validate(req.params);

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        try {
            const interventionUsecase = new InterventionUsecase(AppDataSource);
            const deletedIntervention = await interventionUsecase.deleteIntervention(Number(req.params.id));

            if (deletedIntervention) {
                res.status(200).send({
                    message: "Intervention removed successfully",
                    intervention: deletedIntervention,
                });
            } else {
                res.status(404).send({ message: "Intervention not found" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Internal server error" });
        }
    });
};
