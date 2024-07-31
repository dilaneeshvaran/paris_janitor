import express, { Request, Response } from "express";
import { authenticateToken, authorizeAll } from "../middlewares/authMiddleware";
import {
  createSimulationValidation,
  updateSimulationValidation,
  deleteSimulationValidation,
  listSimulationValidation,
} from "../validators/simulation-validator";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { AppDataSource } from "../../database/database";
import { Simulation } from "../../database/entities/simulation";
import { SimulationUsecase } from "../../domain/simulation-usecase";

export const initSimulationRoutes = (app: express.Express) => {
  app.get("/simulations", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
    const validation = listSimulationValidation.validate(req.query);

    if (validation.error) {
      res.status(400).send(generateValidationErrorMessage(validation.error.details));
      return;
    }

    const listSimulationReq = validation.value;
    let limit = 20;
    if (listSimulationReq.limit) {
      limit = listSimulationReq.limit;
    }
    const page = listSimulationReq.page ?? 1;

    try {
      const simulationUsecase = new SimulationUsecase(AppDataSource);
      const { simulations, totalCount } = await simulationUsecase.listSimulations({
        ...listSimulationReq,
        page,
        limit,
      });
      res.status(200).send({ simulations, totalCount });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.get("/simulations/:simulationId", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
    const { simulationId } = req.params;

    try {
      const simulationUsecase = new SimulationUsecase(AppDataSource);
      const simulation = await simulationUsecase.getSimulationById(Number(simulationId));

      if (simulation) {
        res.status(200).send(simulation);
      } else {
        res.status(404).send({ error: "Simulation not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.post("/simulations", async (req: Request, res: Response) => {
    const validation = createSimulationValidation.validate(req.body);

    if (validation.error) {
      res.status(400).send(generateValidationErrorMessage(validation.error.details));
      return;
    }

    const simulationRequest = validation.value;

    try {
      const simulationRepo = AppDataSource.getRepository(Simulation);
      const simulationCreated = await simulationRepo.save(simulationRequest);
      res.status(201).send(simulationCreated);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.patch("/simulations/:id", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
    const validation = updateSimulationValidation.validate({
      ...req.params,
      ...req.body,
    });

    if (validation.error) {
      res.status(400).send(generateValidationErrorMessage(validation.error.details));
      return;
    }

    const updateSimulationReq = validation.value;

    try {
      const simulationUsecase = new SimulationUsecase(AppDataSource);
      const updatedSimulation = await simulationUsecase.updateSimulation(updateSimulationReq.id, {
        ...updateSimulationReq,
      });

      if (updatedSimulation === null) {
        res.status(404).send({ error: `Simulation ${updateSimulationReq.id} not found` });
        return;
      }
      res.status(200).send(updatedSimulation);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.delete("/simulations/:id", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
    const validation = deleteSimulationValidation.validate(req.params);

    if (validation.error) {
      res.status(400).send(generateValidationErrorMessage(validation.error.details));
      return;
    }

    try {
      const simulationUsecase = new SimulationUsecase(AppDataSource);
      const deletedSimulation = await simulationUsecase.deleteSimulation(Number(req.params.id));

      if (deletedSimulation) {
        res.status(200).send({
          message: "Simulation removed successfully",
          simulation: deletedSimulation,
        });
      } else {
        res.status(404).send({ message: "Simulation not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Internal server error" });
    }
  });
};
