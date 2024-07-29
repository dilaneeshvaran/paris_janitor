import express from "express";
import {initUserRoutes } from "./handlers/routes/user-routes";
import { AppDataSource } from "./database/database";


const main = async () => {
  const app = express();
  //const port = process.env.PORT || 8080;
  const port = 3000;

  try {
    await AppDataSource.initialize();
    console.error("well connected to database");
  } catch (error) {
    console.log(error);
    console.error("Cannot contact database");
    process.exit(1);
  }

  
  app.use(express.json());
  
  initUserRoutes(app);
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

main();