import express, { Request, Response } from "express";
import { authenticateToken, authorizeAdmin,authorizeAdminOrOwner ,authorizeAll} from '../middlewares/authMiddleware';
import {
  createPropertyValidation,
  updatePropertyValidation,
  deletePropertyValidation,
  listPropertyValidation,
} from "../validators/property-validator";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { AppDataSource } from "../../database/database";
import { PropertyUsecase } from "../../domain/property-usecase";
import { Property } from "../../database/entities/property";

export const initPropertyRoutes = (app: express.Express) => {
  app.get("/properties", authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
    const validation = listPropertyValidation.validate(req.query);

    if (validation.error) {
      res.status(400).send(generateValidationErrorMessage(validation.error.details));
      return;
    }

    const listPropertyReq = validation.value;
    let limit = 20;
    if (listPropertyReq.limit) {
      limit = listPropertyReq.limit;
    }
    const page = listPropertyReq.page ?? 1;

    try {
      const propertyUsecase = new PropertyUsecase(AppDataSource);
      const { properties, totalCount } = await propertyUsecase.listProperties({
        ...listPropertyReq,
        page,
        limit,
      });
      res.status(200).send({ properties, totalCount });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.get("/properties/verified", async (req: Request, res: Response) => {
    const validation = listPropertyValidation.validate(req.query);

    if (validation.error) {
        res.status(400).send(generateValidationErrorMessage(validation.error.details));
        return;
    }

    const listPropertyReq = validation.value;
    let limit = 20;
    if (listPropertyReq.limit) {
        limit = listPropertyReq.limit;
    }
    const page = listPropertyReq.page ?? 1;

    try {
        const propertyUsecase = new PropertyUsecase(AppDataSource);
        const { properties, totalCount } = await propertyUsecase.listProperties({
            ...listPropertyReq,
            page,
            limit,
            verified: true,
        });

        const verifiedProperties = properties.filter(property => property.verified === true);

        res.status(200).send({ properties: verifiedProperties, totalCount: verifiedProperties.length });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Internal server error" });
    }
});

app.get("/properties/owner/:ownerId", authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
  const { ownerId } = req.params;

  try {
      const propertyUsecase = new PropertyUsecase(AppDataSource);
      const properties = await propertyUsecase.getPropertiesByOwnerId(Number(ownerId));

      if (properties.length) {
          res.status(200).send(properties);
      } else {
          res.status(404).send({ error: "No properties found for this owner" });
      }
  } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" });
  }
});

  app.get("/properties/:propertyId", authenticateToken, authorizeAll, async (req: Request, res: Response) => {
    const { propertyId } = req.params;

    try {
      const propertyUsecase = new PropertyUsecase(AppDataSource);
      const property = await propertyUsecase.getPropertyById(Number(propertyId));

      if (property) {
        res.status(200).send(property);
      } else {
        res.status(404).send({ error: "Property not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.get(
    "/properties/reservation/:reservationId",
    authenticateToken,
    authorizeAll,
    async (req: Request, res: Response) => {
      const { reservationId } = req.params;
  
      try {
        const propertyUsecase = new PropertyUsecase(AppDataSource); 
        const property = await propertyUsecase.getPropertyByReservationId(Number(reservationId));
  
        if (property) {
          res.status(200).send(property);
        } else {
          res.status(404).send({ error: "Property not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Internal server error" });
      }
    }
  );

  app.post("/properties", authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
    const validation = createPropertyValidation.validate(req.body);
  
    if (validation.error) {
      res.status(400).send(generateValidationErrorMessage(validation.error.details));
      return;
    }
  
    const propertyRequest = validation.value;
  
    // Set default values
    propertyRequest.verified = false;
  
    try {
      const propertyRepo = AppDataSource.getRepository(Property);
      const propertyCreated = await propertyRepo.save(propertyRequest);
      res.status(201).send(propertyCreated);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.patch("/properties/:id", authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
    const validation = updatePropertyValidation.validate({
      ...req.params,
      ...req.body,
    });

    if (validation.error) {
      res.status(400).send(generateValidationErrorMessage(validation.error.details));
      return;
    }

    const updatePropertyReq = validation.value;

    try {
      const propertyUsecase = new PropertyUsecase(AppDataSource);
      const updatedProperty = await propertyUsecase.updateProperty(updatePropertyReq.id, {
        ...updatePropertyReq,
      });

      if (updatedProperty === null) {
        res.status(404).send({ error: `Property ${updatePropertyReq.id} not found` });
        return;
      }
      res.status(200).send(updatedProperty);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.delete("/properties/:id", authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
    const validation = deletePropertyValidation.validate(req.params);

    if (validation.error) {
      res.status(400).send(generateValidationErrorMessage(validation.error.details));
      return;
    }

    try {
      const propertyUsecase = new PropertyUsecase(AppDataSource);
      const deletedProperty = await propertyUsecase.deleteProperty(Number(req.params.id));

      if (deletedProperty) {
        res.status(200).send({
          message: "Property removed successfully",
          property: deletedProperty,
        });
      } else {
        res.status(404).send({ message: "Property not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Internal server error" });
    }
  });
};
    