import express, { Request, Response } from "express";
import { authenticateToken, authorizeAll } from '../middlewares/authMiddleware';
import {
    createProviderValidation,
    updateProviderValidation,
    deleteProviderValidation,
    listProviderValidation,
} from "../validators/provider-validator";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { AppDataSource } from "../../database/database";
import { ProviderUsecase } from "../../domain/provider-usecase";
import { Provider } from "../../database/entities/provider";

export const initProviderRoutes = (app: express.Express) => {
    app.get("/providers", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
        const validation = listProviderValidation.validate(req.query);

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const listProviderReq = validation.value;
        let limit = 20;
        if (listProviderReq.limit) {
            limit = listProviderReq.limit;
        }
        const page = listProviderReq.page ?? 1;

        try {
            const providerUsecase = new ProviderUsecase(AppDataSource);
            const { providers, totalCount } = await providerUsecase.listProviders({
                ...listProviderReq,
                page,
                limit,
            });
            res.status(200).send({ providers, totalCount });
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal server error" });
        }
    });

    app.get("/providers/:providerId", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
        const { providerId } = req.params;

        try {
            const providerUsecase = new ProviderUsecase(AppDataSource);
            const provider = await providerUsecase.getProviderById(Number(providerId));

            if (provider) {
                res.status(200).send(provider);
            } else {
                res.status(404).send({ error: "Provider not found" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal server error" });
        }
    });

    app.post("/providers", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
        const validation = createProviderValidation.validate(req.body);

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const providerRequest = validation.value;

        try {
            const providerRepo = AppDataSource.getRepository(Provider);
            const providerCreated = await providerRepo.save(providerRequest);
            res.status(201).send(providerCreated);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal server error" });
        }
    });

    app.patch("/providers/:id", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
        const validation = updateProviderValidation.validate({
            id: Number(req.params.id),
            ...req.body,
        });

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const updateProviderReq = validation.value;

        try {
            const providerUsecase = new ProviderUsecase(AppDataSource);
            const updatedProvider = await providerUsecase.updateProvider(updateProviderReq.id, updateProviderReq);

            if (updatedProvider === null) {
                res.status(404).send({ error: `Provider ${updateProviderReq.id} not found` });
                return;
            }
            res.status(200).send(updatedProvider);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal server error" });
        }
    });

    app.delete("/providers/:id", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
        const validation = deleteProviderValidation.validate(req.params);

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        try {
            const providerUsecase = new ProviderUsecase(AppDataSource);
            const deletedProvider = await providerUsecase.deleteProvider(Number(req.params.id));

            if (deletedProvider) {
                res.status(200).send({
                    message: "Provider removed successfully",
                    provider: deletedProvider,
                });
            } else {
                res.status(404).send({ message: "Provider not found" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Internal server error" });
        }
    });
};