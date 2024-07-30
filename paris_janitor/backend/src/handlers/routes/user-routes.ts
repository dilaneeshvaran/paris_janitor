import express, { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { authenticateToken, authorizeAdmin,authorizeAdminOrOwner } from '../middlewares/authMiddleware';

import {
  userValidation,
updateUserValidation,
deleteUserValidation,listValidation,authUserValidation
} from "../validators/user-validator";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { AppDataSource } from "../../database/database";
import { User } from "../../database/entities/user";
import { UserUsecase } from "../../domain/user-usecase";
import { RequestWithUser } from "../../types/request-with-user";

export let tokenRevocationList: string[] = [];

export const initUserRoutes = (app: express.Express) => {
  app.get("/health", (req: Request, res: Response) => {
    res.send({ message: "hello world" });
  });

  app.get("/users",authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
    const validation = listValidation.validate(req.query);

    if (validation.error) {
      res
        .status(400)
        .send(generateValidationErrorMessage(validation.error.details));
      return;
    }

    const listUserReq = validation.value;
    let limit = 20;
    if (listUserReq.limit) {
      limit = listUserReq.limit;
    }
    const page = listUserReq.page ?? 1;

    try {
      const userUsecase = new UserUsecase(AppDataSource);
      const listUser = await userUsecase.listUser({
        ...listUserReq,
        page,
        limit,
      });
      res.status(200).send(listUser);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.get("/users/:userId",authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
    const { userId } = req.params;
  
    try {
      const userUsecase = new UserUsecase(AppDataSource);
      const user = await userUsecase.getUserById(Number(userId));
  
      if (user) {
        res.status(200).send(user);
      } else {
        res.status(404).send({ error: "User not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.get("/users/vip/:userId", authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const userUsecase = new UserUsecase(AppDataSource);
        const isVip = await userUsecase.isUserVip(Number(userId));

        res.status(200).send({ isVip });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Internal server error" });
    }
});

  app.post("/users", async (req: Request, res: Response) => {
    const validation = userValidation.validate(req.body);
  
    if (validation.error) {
      res
        .status(400)
        .send(generateValidationErrorMessage(validation.error.details));
      return;
    }
  
    const userRequest = validation.value;
  
    const userUsecase = new UserUsecase(AppDataSource);
  
    const isEmailExists = await userUsecase.isEmailExists(userRequest.email);
    if (isEmailExists) {
      res.status(400).send({ message: "Email already in use" });
      return;
    }
  
    userRequest.password = await userUsecase.hashPassword(userRequest.password);
  
    const userRepo = AppDataSource.getRepository(User);
  
    try {
      const userCreated = await userRepo.save(userRequest);
      res.status(201).send(userCreated);
    } catch (error) {
      res.status(500).send({ error: "Internal error" });
    }
  });

app.patch("/users/:id",authenticateToken, async (req: Request, res: Response) => {
    const validation = updateUserValidation.validate({
      ...req.params,
      ...req.body,
    });
  
    if (validation.error) {
      res
        .status(400)
        .send(generateValidationErrorMessage(validation.error.details));
      return;
    }
  
    const updateUserReq = validation.value;
  
    try {
      const userUsecase = new UserUsecase(AppDataSource);
      const updatedUser = await userUsecase.updateUser(updateUserReq.id, {
        ...updateUserReq,
      });
      if (updatedUser === null) {
        res.status(404).send({
          error: `User ${updateUserReq.id} not found`,
        });
        return;
      }
      res.status(200).send(updatedUser);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal error" });
    }
  });

  app.patch("/users/:id/vip", authenticateToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { vip_status } = req.body;

    if (typeof vip_status !== 'boolean') {
        res.status(400).send({ error: "Invalid VIP status value" });
        return;
    }

    try {
        const userUsecase = new UserUsecase(AppDataSource);
        const user = await userUsecase.getUserById(Number(id));

        if (user === null) {
            res.status(404).send({ error: `User ${id} not found` });
            return;
        }

        user.vip_status = vip_status;
        const updatedUser = await userUsecase.updateUser(user.id, user);

        res.status(200).send(updatedUser);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Internal server error" });
    }
});

  app.patch("/users/:id/role", authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    const userUsecase = new UserUsecase(AppDataSource);
    const updatedUser = await userUsecase.changeUserRole(Number(id), role);

    if (updatedUser) {
        res.status(200).send(updatedUser);
    } else {
        res.status(404).send({ error: "User not found" });
    }
});

  app.delete("/users/:id",authenticateToken, authorizeAdminOrOwner, async (req: Request, res: Response) => {
    const validation = deleteUserValidation.validate(req.params);
  
    if (validation.error) {
      res
        .status(400)
        .send(generateValidationErrorMessage(validation.error.details));
      return;
    }
  
    try {
      const userUsecase = new UserUsecase(AppDataSource);
      const deletedUser = await userUsecase.deleteUser(Number(req.params.id));
  
      if (deletedUser) {
        res.status(200).send({
          message: "User removed successfully",
          user: deletedUser,
        });
      } else {
        res.status(404).send({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).send({ message: "Internal server error" });
    }
  });

  app.post("/users/login", async (req: Request, res: Response) => {
    const validation = authUserValidation.validate(req.body);
  
    if (validation.error) {
      res
        .status(400)
        .send(generateValidationErrorMessage(validation.error.details));
      return;
    }
  
    const userRequest = validation.value;
  
    try {
      const userUsecase = new UserUsecase(AppDataSource);
      const user = await userUsecase.getUserByEmail(userRequest.email);
  
      if (user) {
        const isPasswordMatch = await userUsecase.comparePassword(userRequest.password, user.password);
        if (isPasswordMatch) {
          // Generate JWT token when user authed
          const token = jwt.sign({ id: user.id, role: user.role }, 'your_secret_key', { expiresIn: '1h' });
          res.status(200).send({ 
            message: "User authenticated successfully", 
            token, 
            userId: user.id, 
            role: user.role 
          });
        } else {
          res.status(401).send({ message: "Invalid username or password" });
        }
      } else {
        res.status(401).send({ message: "Invalid username or password" });
      }
    } catch (error) {
      res.status(500).send({ error: "Internal error" });
    }
  });

app.post("/users/logout", authenticateToken, async (req: RequestWithUser, res: Response) => {
  if (req.user && req.token) {
    tokenRevocationList.push(req.token);
  }
  res.status(200).send({ message: "User logged out successfully" });
});

};

