import express, { Request, Response } from "express";
import { authenticateToken, authorizeAdmin,authorizeAll } from '../middlewares/authMiddleware';
import {
  createReservationValidation,
  updateReservationValidation,
  deleteReservationValidation,
  listReservationValidation,
} from "../validators/reservation-validator";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { AppDataSource } from "../../database/database";
import { ReservationUsecase } from "../../domain/reservation-usecase";
import { Reservation } from "../../database/entities/reservation";

export const initReservationRoutes = (app: express.Express) => {
  app.get("/reservations", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
    const validation = listReservationValidation.validate(req.query);

    if (validation.error) {
      res.status(400).send(generateValidationErrorMessage(validation.error.details));
      return;
    }

    const listReservationReq = validation.value;
    let limit = 20;
    if (listReservationReq.limit) {
      limit = listReservationReq.limit;
    }
    const page = listReservationReq.page ?? 1;

    try {
      const reservationUsecase = new ReservationUsecase(AppDataSource);
      const { reservations, totalCount } = await reservationUsecase.listReservations({
        ...listReservationReq,
        page,
        limit,
      });
      res.status(200).send({ reservations, totalCount });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.get("/reservations/:reservationId", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
    const { reservationId } = req.params;

    try {
      const reservationUsecase = new ReservationUsecase(AppDataSource);
      const reservation = await reservationUsecase.getReservationById(Number(reservationId));

      if (reservation) {
        res.status(200).send(reservation);
      } else {
        res.status(404).send({ error: "Reservation not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.post("/reservations", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
    const validation = createReservationValidation.validate(req.body);

    if (validation.error) {
      res.status(400).send(generateValidationErrorMessage(validation.error.details));
      return;
    }

    const reservationRequest = validation.value;

    try {
      const reservationRepo = AppDataSource.getRepository(Reservation);
      const reservationCreated = await reservationRepo.save(reservationRequest);
      res.status(201).send(reservationCreated);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.patch("/reservations/:id", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
    const validation = updateReservationValidation.validate({
      ...req.params,
      ...req.body,
    });

    if (validation.error) {
      res.status(400).send(generateValidationErrorMessage(validation.error.details));
      return;
    }

    const updateReservationReq = validation.value;

    try {
      const reservationUsecase = new ReservationUsecase(AppDataSource);
      const updatedReservation = await reservationUsecase.updateReservation(updateReservationReq.id, {
        ...updateReservationReq,
      });

      if (updatedReservation === null) {
        res.status(404).send({ error: `Reservation ${updateReservationReq.id} not found` });
        return;
      }
      res.status(200).send(updatedReservation);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.delete("/reservations/:id", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
    const validation = deleteReservationValidation.validate(req.params);

    if (validation.error) {
      res.status(400).send(generateValidationErrorMessage(validation.error.details));
      return;
    }

    try {
      const reservationUsecase = new ReservationUsecase(AppDataSource);
      const deletedReservation = await reservationUsecase.deleteReservation(Number(req.params.id));

      if (deletedReservation) {
        res.status(200).send({
          message: "Reservation removed successfully",
          reservation: deletedReservation,
        });
      } else {
        res.status(404).send({ message: "Reservation not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Internal server error" });
    }
  });
};
